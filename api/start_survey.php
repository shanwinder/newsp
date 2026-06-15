<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
require_student_like();
$payload = survey_read_json();
if (!survey_verify_csrf($payload['csrf_token'] ?? null)) survey_json_response(['success'=>false,'message'=>'คำขอหมดอายุ กรุณารีเฟรชหน้า'],419);
$status = survey_student_status($conn, intval($_SESSION['user_id']), session_context());
if (!$status['individual']) survey_json_response(['success'=>false,'message'=>$status['message']],403);
if ($status['submitted'] && !$status['allow_edit']) survey_json_response(['success'=>true,'url'=>'../pages/survey_thankyou.php']);
if (!$status['available']) survey_json_response(['success'=>false,'message'=>$status['message']],403);
survey_json_response(['success'=>true,'url'=>'../pages/survey_take.php']);
