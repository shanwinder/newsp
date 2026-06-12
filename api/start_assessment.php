<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';

require_student_like();
$payload = assessment_read_json();
if (!assessment_verify_csrf($payload['csrf_token'] ?? null)) {
    assessment_json_response(['success' => false, 'message' => 'คำขอหมดอายุ กรุณารีเฟรชหน้า'], 419);
}
if (!assessment_is_individual()) {
    assessment_json_response(['success' => false, 'message' => 'แบบทดสอบก่อนเรียน–หลังเรียนเป็นการวัดผลรายบุคคล กรุณาเข้าสู่ระบบแบบรายบุคคลเพื่อทำแบบทดสอบ'], 403);
}

$type = ($payload['type'] ?? '') === 'posttest' ? 'posttest' : 'pretest';
$context = session_context();
$settings = assessment_settings($conn, $context['learning_session_id']);
$assessmentId = intval($settings[$type . '_assessment_id'] ?? 0);
if (!$settings || $assessmentId <= 0 || ($settings[$type . '_status'] ?? 'locked') !== 'unlocked') {
    assessment_json_response(['success' => false, 'message' => 'แบบทดสอบนี้ยังไม่เปิดให้ทำ'], 403);
}

$conn->begin_transaction();
try {
    $stmt = $conn->prepare("SELECT * FROM assessment_attempts WHERE assessment_id = ? AND user_id = ? AND learning_session_id = ? ORDER BY attempt_no DESC, id DESC FOR UPDATE");
    $userId = intval($_SESSION['user_id']);
    $stmt->bind_param('iii', $assessmentId, $userId, $context['learning_session_id']);
    $stmt->execute();
    $attemptRows = $stmt->get_result();
    $existing = null;
    $maxAttemptNo = 0;
    while ($row = $attemptRows->fetch_assoc()) {
        $maxAttemptNo = max($maxAttemptNo, intval($row['attempt_no']));
        if ($existing === null && $row['status'] !== 'cancelled') {
            $existing = $row;
        }
    }

    if ($existing && $existing['status'] === 'in_progress') {
        $attemptId = intval($existing['id']);
    } elseif ($existing && empty($settings['allow_retake'])) {
        throw new RuntimeException('นักเรียนส่งแบบทดสอบนี้แล้ว ไม่สามารถทำซ้ำได้');
    } else {
        $attemptNo = $maxAttemptNo + 1;
        $assessment = $conn->prepare("SELECT full_score FROM assessments WHERE id = ? AND status = 'active' LIMIT 1");
        $assessment->bind_param('i', $assessmentId);
        $assessment->execute();
        $assessmentRow = $assessment->get_result()->fetch_assoc();
        if (!$assessmentRow) {
            throw new RuntimeException('ไม่พบชุดข้อสอบที่เปิดใช้งาน');
        }

        $insert = $conn->prepare("INSERT INTO assessment_attempts (assessment_id, user_id, school_id, classroom_id, teacher_id, learning_session_id, full_score, attempt_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $fullScore = intval($assessmentRow['full_score']);
        $insert->bind_param('iiiiiiii', $assessmentId, $userId, $context['school_id'], $context['classroom_id'], $context['teacher_id'], $context['learning_session_id'], $fullScore, $attemptNo);
        $insert->execute();
        $attemptId = intval($conn->insert_id);
    }
    $conn->commit();
    assessment_json_response(['success' => true, 'attempt_id' => $attemptId, 'url' => '../pages/assessment_take.php?attempt_id=' . $attemptId]);
} catch (Throwable $e) {
    $conn->rollback();
    assessment_json_response(['success' => false, 'message' => $e->getMessage()], 409);
}
