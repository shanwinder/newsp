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
    assessment_json_response(['success' => false, 'message' => 'ต้องทำแบบทดสอบเป็นรายบุคคล'], 403);
}

$attemptId = intval($payload['attempt_id'] ?? 0);
$answers = is_array($payload['answers'] ?? null) ? $payload['answers'] : [];
$userId = intval($_SESSION['user_id']);
$sessionId = intval($_SESSION['learning_session_id'] ?? 0);

$conn->begin_transaction();
try {
    $attemptStmt = $conn->prepare("SELECT aa.*, a.total_questions FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id WHERE aa.id = ? AND aa.user_id = ? AND aa.learning_session_id = ? FOR UPDATE");
    $attemptStmt->bind_param('iii', $attemptId, $userId, $sessionId);
    $attemptStmt->execute();
    $attempt = $attemptStmt->get_result()->fetch_assoc();
    if (!$attempt || $attempt['status'] !== 'in_progress') {
        throw new RuntimeException('ไม่พบการสอบที่กำลังทำ หรือส่งคำตอบไปแล้ว');
    }

    $questionStmt = $conn->prepare("SELECT id, correct_choice FROM assessment_questions WHERE assessment_id = ? AND status = 'active' ORDER BY question_no");
    $questionStmt->bind_param('i', $attempt['assessment_id']);
    $questionStmt->execute();
    $questions = [];
    $questionResult = $questionStmt->get_result();
    while ($question = $questionResult->fetch_assoc()) {
        $questions[intval($question['id'])] = $question['correct_choice'];
    }

    $save = $conn->prepare("INSERT INTO assessment_answers (attempt_id, question_id, selected_choice, is_correct, answered_at) VALUES (?, ?, ?, NULL, NOW()) ON DUPLICATE KEY UPDATE selected_choice = VALUES(selected_choice), answered_at = NOW()");
    foreach ($answers as $questionId => $choice) {
        $questionId = intval($questionId);
        $choice = strtoupper((string) $choice);
        if (isset($questions[$questionId]) && in_array($choice, ['A', 'B', 'C', 'D'], true)) {
            $save->bind_param('iis', $attemptId, $questionId, $choice);
            $save->execute();
        }
    }

    $countStmt = $conn->prepare("SELECT COUNT(*) AS answered FROM assessment_answers ans JOIN assessment_questions q ON q.id = ans.question_id WHERE ans.attempt_id = ? AND q.assessment_id = ? AND q.status = 'active'");
    $countStmt->bind_param('ii', $attemptId, $attempt['assessment_id']);
    $countStmt->execute();
    $answered = intval($countStmt->get_result()->fetch_assoc()['answered']);
    if ($answered !== count($questions)) {
        throw new RuntimeException('กรุณาตอบคำถามให้ครบทุกข้อก่อนส่ง (' . $answered . '/' . count($questions) . ' ข้อ)');
    }

    $grade = $conn->prepare("UPDATE assessment_answers ans JOIN assessment_questions q ON q.id = ans.question_id SET ans.is_correct = (ans.selected_choice = q.correct_choice) WHERE ans.attempt_id = ?");
    $grade->bind_param('i', $attemptId);
    $grade->execute();

    $scoreStmt = $conn->prepare("SELECT SUM(is_correct) AS score FROM assessment_answers WHERE attempt_id = ?");
    $scoreStmt->bind_param('i', $attemptId);
    $scoreStmt->execute();
    $score = intval($scoreStmt->get_result()->fetch_assoc()['score']);
    $fullScore = intval($attempt['full_score']);
    $percent = $fullScore > 0 ? round(($score / $fullScore) * 100, 2) : 0.0;

    $update = $conn->prepare("UPDATE assessment_attempts SET score = ?, percent_score = ?, submitted_at = NOW(), status = 'submitted' WHERE id = ?");
    $update->bind_param('idi', $score, $percent, $attemptId);
    $update->execute();
    $conn->commit();

    assessment_json_response(['success' => true, 'url' => '../pages/assessment_result.php?attempt_id=' . $attemptId]);
} catch (Throwable $e) {
    $conn->rollback();
    assessment_json_response(['success' => false, 'message' => $e->getMessage()], 422);
}
