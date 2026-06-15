<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$context = survey_teacher_context($conn);
$payload = survey_read_json();
if (!survey_verify_csrf($payload['csrf_token'] ?? null)) survey_json_response(['success'=>false,'message'=>'คำขอหมดอายุ'],419);
$responseId = intval($payload['response_id'] ?? 0);
$stmt = $conn->prepare("DELETE FROM survey_responses WHERE id=? AND classroom_id=? AND learning_session_id=?");
$stmt->bind_param('iii',$responseId,$context['classroom_id'],$context['learning_session_id']);$stmt->execute();
if ($stmt->affected_rows !== 1) survey_json_response(['success'=>false,'message'=>'ไม่พบคำตอบในห้องเรียนนี้'],404);
survey_json_response(['success'=>true]);
