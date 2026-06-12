<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';

require_student_like();
$payload = assessment_read_json();
if (!assessment_verify_csrf($payload['csrf_token'] ?? null)) {
    assessment_json_response(['success' => false, 'message' => 'คำขอหมดอายุ'], 419);
}
if (!assessment_is_individual()) {
    assessment_json_response(['success' => false, 'message' => 'ต้องทำแบบทดสอบเป็นรายบุคคล'], 403);
}

$attemptId = intval($payload['attempt_id'] ?? 0);
$questionId = intval($payload['question_id'] ?? 0);
$choice = strtoupper((string) ($payload['selected_choice'] ?? ''));
if ($attemptId <= 0 || $questionId <= 0 || !in_array($choice, ['A', 'B', 'C', 'D'], true)) {
    assessment_json_response(['success' => false, 'message' => 'ข้อมูลคำตอบไม่ถูกต้อง'], 422);
}

$stmt = $conn->prepare("SELECT aa.id FROM assessment_attempts aa JOIN assessment_questions q ON q.assessment_id = aa.assessment_id WHERE aa.id = ? AND aa.user_id = ? AND aa.learning_session_id = ? AND aa.status = 'in_progress' AND q.id = ? AND q.status = 'active' LIMIT 1");
$userId = intval($_SESSION['user_id']);
$sessionId = intval($_SESSION['learning_session_id'] ?? 0);
$stmt->bind_param('iiii', $attemptId, $userId, $sessionId, $questionId);
$stmt->execute();
if (!$stmt->get_result()->fetch_assoc()) {
    assessment_json_response(['success' => false, 'message' => 'ไม่พบการสอบที่กำลังทำ'], 404);
}

$save = $conn->prepare("INSERT INTO assessment_answers (attempt_id, question_id, selected_choice, is_correct, answered_at) VALUES (?, ?, ?, NULL, NOW()) ON DUPLICATE KEY UPDATE selected_choice = VALUES(selected_choice), is_correct = NULL, answered_at = NOW()");
$save->bind_param('iis', $attemptId, $questionId, $choice);
$save->execute();
assessment_json_response(['success' => true, 'saved_at' => date('H:i:s')]);
