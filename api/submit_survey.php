<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
require_student_like();
$payload = survey_read_json();
if (!survey_verify_csrf($payload['csrf_token'] ?? null)) survey_json_response(['success'=>false,'message'=>'คำขอหมดอายุ กรุณารีเฟรชหน้า'],419);
if (!survey_is_individual()) survey_json_response(['success'=>false,'message'=>'กรุณาเข้าสู่ระบบแบบรายบุคคลเพื่อส่งแบบสอบถาม'],403);

$userId = intval($_SESSION['user_id']);
$context = session_context();
$status = survey_student_status($conn, $userId, $context);
if (!$status['available']) survey_json_response(['success'=>false,'message'=>$status['message']],403);
$ratings = is_array($payload['ratings'] ?? null) ? $payload['ratings'] : [];
$textAnswers = is_array($payload['text_answers'] ?? null) ? $payload['text_answers'] : [];
$questions = survey_questions($conn, intval($status['survey_id']));
$questionMap = [];
$missing = [];
foreach ($questions as $question) {
    $questionId = intval($question['id']);
    $questionMap[$questionId] = $question;
    if ($question['question_type'] === 'rating' && !empty($question['required'])) {
        $value = intval($ratings[$questionId] ?? 0);
        if ($value < intval($status['settings']['scale_min']) || $value > intval($status['settings']['scale_max'])) $missing[] = intval($question['question_no']);
    }
}
if ($missing) survey_json_response(['success'=>false,'message'=>'กรุณาตอบคำถามคะแนนให้ครบทุกข้อ (ขาดข้อ '.implode(', ', $missing).')'],422);

$conn->begin_transaction();
try {
    $existingStmt = $conn->prepare("SELECT * FROM survey_responses WHERE survey_id=? AND user_id=? AND learning_session_id=? FOR UPDATE");
    $existingStmt->bind_param('iii', $status['survey_id'], $userId, $context['learning_session_id']);
    $existingStmt->execute();
    $existing = $existingStmt->get_result()->fetch_assoc();
    if ($existing && $existing['status'] === 'submitted' && !$status['allow_edit']) throw new RuntimeException('นักเรียนส่งแบบสอบถามแล้ว ไม่สามารถส่งซ้ำได้');

    if ($existing) {
        $responseId = intval($existing['id']);
        $update = $conn->prepare("UPDATE survey_responses SET school_id=?,classroom_id=?,teacher_id=?,submitted_at=NOW(),status='submitted' WHERE id=?");
        $update->bind_param('iiii', $context['school_id'], $context['classroom_id'], $context['teacher_id'], $responseId);
        $update->execute();
    } else {
        $insert = $conn->prepare("INSERT INTO survey_responses (survey_id,user_id,school_id,classroom_id,teacher_id,learning_session_id,submitted_at,status) VALUES (?,?,?,?,?,?,NOW(),'submitted')");
        $insert->bind_param('iiiiii', $status['survey_id'], $userId, $context['school_id'], $context['classroom_id'], $context['teacher_id'], $context['learning_session_id']);
        $insert->execute();
        $responseId = intval($conn->insert_id);
    }

    $save = $conn->prepare("INSERT INTO survey_answers (response_id,question_id,rating_value,text_answer) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE rating_value=VALUES(rating_value),text_answer=VALUES(text_answer)");
    foreach ($questionMap as $questionId => $question) {
        $rating = null;
        $text = null;
        if ($question['question_type'] === 'rating') $rating = intval($ratings[$questionId]);
        else $text = mb_substr(trim((string) ($textAnswers[$questionId] ?? '')), 0, 3000);
        $save->bind_param('iiis', $responseId, $questionId, $rating, $text);
        $save->execute();
    }
    $conn->commit();
    survey_json_response(['success'=>true,'response_id'=>$responseId,'url'=>'../pages/survey_thankyou.php']);
} catch (Throwable $e) {
    $conn->rollback();
    survey_json_response(['success'=>false,'message'=>$e->getMessage()],409);
}
