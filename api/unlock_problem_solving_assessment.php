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
$version = (string) ($input['rubric_version'] ?? problem_solving_active_version());
if (!$context || !problem_solving_student_in_context($conn, $studentId, $context)) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่มีสิทธิ์เข้าถึงผลประเมินนี้'], 403);
}

try {
    problem_solving_rubric($version);
    $reason = problem_solving_plain_text($input['reason'] ?? null, 5000);
    if ($reason === null) {
        throw new InvalidArgumentException('กรุณาระบุเหตุผลในการเปิดล็อก');
    }
} catch (InvalidArgumentException $error) {
    problem_solving_json_response(['success' => false, 'error' => $error->getMessage()], 422);
}

try {
    $conn->begin_transaction();
    $evaluation = problem_solving_load_evaluation($conn, $studentId, $lessonId, $context, $version, true);
    if (!$evaluation) {
        $conn->rollback();
        problem_solving_json_response(['success' => false, 'error' => 'ไม่พบผลประเมิน'], 404);
    }
    if ($evaluation['status'] !== 'final') {
        $conn->rollback();
        problem_solving_json_response(['success' => false, 'error' => 'ผลประเมินนี้ไม่ได้อยู่ในสถานะยืนยันแล้ว'], 409);
    }
    $lastKnown = $input['last_known_updated_at'] ?? null;
    if (is_string($lastKnown) && $lastKnown !== '' && !hash_equals((string) $evaluation['updated_at'], $lastKnown)) {
        $conn->rollback();
        problem_solving_json_response(['success' => false, 'error' => 'ข้อมูลเปลี่ยนแปลงแล้ว กรุณาโหลดใหม่'], 409);
    }

    $evaluationId = (int) $evaluation['id'];
    $actorId = (int) $_SESSION['user_id'];
    $updateStmt = $conn->prepare(
        "UPDATE problem_solving_evaluations
         SET status = 'draft', finalized_at = NULL, updated_at = NOW(6)
         WHERE id = ? AND school_id = ? AND classroom_id = ? AND teacher_id = ? AND learning_session_id = ?"
    );
    $updateStmt->bind_param(
        'iiiii',
        $evaluationId,
        $context['school_id'],
        $context['classroom_id'],
        $context['teacher_id'],
        $context['learning_session_id']
    );
    $updateStmt->execute();

    $auditStmt = $conn->prepare(
        "INSERT INTO problem_solving_evaluation_audit_logs (evaluation_id, action, actor_id, reason)
         VALUES (?, 'unlock', ?, ?)"
    );
    $auditStmt->bind_param('iis', $evaluationId, $actorId, $reason);
    $auditStmt->execute();
    $conn->commit();

    $updated = problem_solving_load_evaluation($conn, $studentId, $lessonId, $context, $version);
    problem_solving_json_response([
        'success' => true,
        'message' => 'เปิดล็อกผลประเมินแล้ว คะแนนเดิมยังคงอยู่',
        'status' => $updated['display_status'],
        'updated_at' => $updated['updated_at'],
    ]);
} catch (Throwable $error) {
    try {
        $conn->rollback();
    } catch (Throwable) {
    }
    error_log('Problem-solving assessment unlock failed: ' . $error->getMessage());
    problem_solving_json_response(['success' => false, 'error' => 'เปิดล็อกไม่สำเร็จ กรุณาลองใหม่'], 500);
}
