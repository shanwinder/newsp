<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$context = survey_teacher_context($conn);
$payload = survey_read_json();
if (!survey_verify_csrf($payload['csrf_token'] ?? null)) survey_json_response(['success'=>false,'message'=>'คำขอหมดอายุ'],419);
$status = in_array($payload['status'] ?? '', ['locked','open','closed'], true) ? $payload['status'] : null;
if (!$status) survey_json_response(['success'=>false,'message'=>'สถานะไม่ถูกต้อง'],422);
$settings = survey_settings($conn, $context['learning_session_id']);
if (!$settings || empty($settings['survey_id'])) survey_json_response(['success'=>false,'message'=>'กรุณาเลือกแบบสอบถามในหน้าตั้งค่าก่อน'],422);
$stmt=$conn->prepare("UPDATE survey_settings SET survey_status=? WHERE learning_session_id=?");$stmt->bind_param('si',$status,$context['learning_session_id']);$stmt->execute();
survey_json_response(['success'=>true,'status'=>$status]);
