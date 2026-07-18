<?php

session_start();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/problem_solving_assessment.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    problem_solving_json_response(['success' => false, 'error' => 'Method not allowed'], 405);
}
if (!problem_solving_api_account_allowed($conn)) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่มีสิทธิ์ใช้งาน'], 401);
}

$input = problem_solving_json_input();
if (!problem_solving_verify_csrf($input['csrf_token'] ?? null)) {
    problem_solving_json_response(['success' => false, 'error' => 'CSRF token ไม่ถูกต้อง กรุณาโหลดหน้าใหม่'], 419);
}

$context = problem_solving_teacher_context($conn, isset($input['classroom_id']) ? (int) $input['classroom_id'] : null);
$studentId = (int) ($input['student_id'] ?? 0);
$lessonId = (int) ($input['lesson_id'] ?? 0);
$status = (string) ($input['status'] ?? '');
$version = (string) ($input['rubric_version'] ?? '');
$lessons = require __DIR__ . '/../config/lessons.php';

if (!$context) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่พบห้องเรียนหรือไม่มีสิทธิ์เข้าถึง'], 403);
}
if (!problem_solving_student_in_context($conn, $studentId, $context)) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่พบนักเรียนในห้องเรียนนี้'], 403);
}
if (!isset($lessons[$lessonId])) {
    problem_solving_json_response(['success' => false, 'error' => 'บทเรียนไม่ถูกต้อง'], 422);
}
if (!in_array($status, ['draft', 'final'], true)) {
    problem_solving_json_response(['success' => false, 'error' => 'สถานะการบันทึกไม่ถูกต้อง'], 422);
}
if ($version !== problem_solving_active_version()) {
    problem_solving_json_response(['success' => false, 'error' => 'เวอร์ชันแบบประเมินไม่ใช่เวอร์ชันที่เปิดใช้งาน'], 422);
}

$rubric = problem_solving_rubric($version);
$itemMap = problem_solving_item_map($version);
$inputScores = $input['scores'] ?? null;
if (!is_array($inputScores)) {
    problem_solving_json_response(['success' => false, 'error' => 'รูปแบบคะแนนไม่ถูกต้อง'], 422);
}

$scores = [];
try {
    foreach ($inputScores as $itemKey => $entry) {
        if (!is_string($itemKey) || !isset($itemMap[$itemKey]) || !is_array($entry)) {
            throw new InvalidArgumentException('พบรายการประเมินที่ไม่อยู่ในรูบริก');
        }
        $rawScore = $entry['score'] ?? null;
        if (filter_var($rawScore, FILTER_VALIDATE_INT) === false) {
            throw new InvalidArgumentException('คะแนนต้องเป็นจำนวนเต็ม');
        }
        $score = (int) $rawScore;
        if ($score < (int) $rubric['score_min'] || $score > (int) $rubric['score_max']) {
            throw new InvalidArgumentException('คะแนนต้องอยู่ระหว่าง 1–4');
        }
        $scores[$itemKey] = [
            'score' => $score,
            'note' => problem_solving_plain_text($entry['note'] ?? null, 5000),
            'domain_key' => $itemMap[$itemKey]['domain_key'],
        ];
    }
    $overallNote = problem_solving_plain_text($input['overall_note'] ?? null, 10000);
} catch (InvalidArgumentException $error) {
    problem_solving_json_response(['success' => false, 'error' => $error->getMessage()], 422);
}

if ($status === 'final') {
    $missing = array_diff(array_keys($itemMap), array_keys($scores));
    if ($missing !== [] || count($scores) !== count($itemMap)) {
        problem_solving_json_response([
            'success' => false,
            'error' => 'ต้องให้คะแนนครบทุกข้อก่อนยืนยันผล',
            'missing_items' => array_values($missing),
        ], 422);
    }
}

$evaluatorId = (int) $_SESSION['user_id'];
$lastKnownUpdatedAt = $input['last_known_updated_at'] ?? null;

try {
    $conn->begin_transaction();
    $existing = problem_solving_load_evaluation($conn, $studentId, $lessonId, $context, $version, true);
    if ($existing && $existing['status'] === 'final') {
        $conn->rollback();
        problem_solving_json_response(['success' => false, 'error' => 'ผลที่ยืนยันแล้วถูกล็อก กรุณาเปิดล็อกก่อนแก้ไข'], 409);
    }
    if ($existing) {
        if (!is_string($lastKnownUpdatedAt) || !hash_equals((string) $existing['updated_at'], $lastKnownUpdatedAt)) {
            $conn->rollback();
            problem_solving_json_response([
                'success' => false,
                'error' => 'ข้อมูลถูกแก้ไขจากหน้าต่างอื่น กรุณาโหลดข้อมูลล่าสุดก่อนบันทึก',
                'conflict' => true,
            ], 409);
        }
        $evaluationId = (int) $existing['id'];
        $stmt = $conn->prepare(
            "UPDATE problem_solving_evaluations
             SET evaluator_id = ?, status = ?, overall_note = ?,
                 evaluated_at = COALESCE(evaluated_at, NOW(6)),
                 finalized_at = CASE WHEN ? = 'final' THEN NOW(6) ELSE NULL END,
                 updated_at = NOW(6)
             WHERE id = ? AND school_id = ? AND classroom_id = ? AND teacher_id = ? AND learning_session_id = ?"
        );
        $stmt->bind_param(
            'isssiiiii',
            $evaluatorId,
            $status,
            $overallNote,
            $status,
            $evaluationId,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id']
        );
        $stmt->execute();
    } else {
        $stmt = $conn->prepare(
            "INSERT INTO problem_solving_evaluations
             (rubric_version, user_id, lesson_id, school_id, classroom_id, teacher_id,
              learning_session_id, evaluator_id, status, overall_note, evaluated_at, finalized_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(6), CASE WHEN ? = 'final' THEN NOW(6) ELSE NULL END)"
        );
        $stmt->bind_param(
            'siiiiiiisss',
            $version,
            $studentId,
            $lessonId,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id'],
            $evaluatorId,
            $status,
            $overallNote,
            $status
        );
        $stmt->execute();
        $evaluationId = (int) $conn->insert_id;
    }

    $deleteStmt = $conn->prepare('DELETE FROM problem_solving_evaluation_scores WHERE evaluation_id = ?');
    $deleteStmt->bind_param('i', $evaluationId);
    $deleteStmt->execute();

    $scoreStmt = $conn->prepare(
        "INSERT INTO problem_solving_evaluation_scores
         (evaluation_id, item_key, domain_key, score, evidence_note) VALUES (?, ?, ?, ?, ?)"
    );
    foreach ($scores as $itemKey => $entry) {
        $domainKey = $entry['domain_key'];
        $score = $entry['score'];
        $note = $entry['note'];
        $scoreStmt->bind_param('issis', $evaluationId, $itemKey, $domainKey, $score, $note);
        $scoreStmt->execute();
    }
    $conn->commit();

    $evaluation = problem_solving_load_evaluation($conn, $studentId, $lessonId, $context, $version);
    problem_solving_json_response([
        'success' => true,
        'message' => $status === 'final' ? 'ยืนยันผลการประเมินแล้ว' : 'บันทึกฉบับร่างแล้ว',
        'status' => $evaluation['display_status'],
        'database_status' => $evaluation['status'],
        'updated_at' => $evaluation['updated_at'],
        'finalized_at' => $evaluation['finalized_at'],
        'calculation' => $evaluation['calculation'],
    ]);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable) {
    }
    error_log('Problem-solving assessment save failed: ' . $error->getMessage());
    problem_solving_json_response(['success' => false, 'error' => 'บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่'], 500);
}
