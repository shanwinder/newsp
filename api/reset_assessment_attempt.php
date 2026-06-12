<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';

$context = assessment_teacher_context($conn);
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !assessment_verify_csrf($_POST['csrf_token'] ?? null)) {
    http_response_code(419);
    exit('คำขอหมดอายุ');
}

$attemptId = intval($_POST['attempt_id'] ?? 0);
$stmt = $conn->prepare("UPDATE assessment_attempts SET status = 'cancelled' WHERE id = ? AND classroom_id = ? AND teacher_id = ? AND learning_session_id = ? AND status IN ('in_progress','submitted')");
$stmt->bind_param('iiii', $attemptId, $context['classroom_id'], $context['teacher_id'], $context['learning_session_id']);
$stmt->execute();

header('Location: ../pages/assessment_report.php?classroom_id=' . $context['classroom_id'] . '&reset=' . ($stmt->affected_rows > 0 ? '1' : '0'));
