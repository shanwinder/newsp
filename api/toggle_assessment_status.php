<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$context = assessment_teacher_context($conn);
$payload = assessment_read_json();
if (!assessment_verify_csrf($payload['csrf_token'] ?? null)) assessment_json_response(['success'=>false,'message'=>'คำขอหมดอายุ'],419);
$type = ($payload['type'] ?? '') === 'posttest' ? 'posttest' : 'pretest';
$status = ($payload['status'] ?? '') === 'unlocked' ? 'unlocked' : 'locked';
$column = $type . '_status';
$conn->query("INSERT IGNORE INTO assessment_settings (learning_session_id) VALUES (" . intval($context['learning_session_id']) . ")");
$stmt=$conn->prepare("UPDATE assessment_settings SET {$column}=? WHERE learning_session_id=?");
$stmt->bind_param('si',$status,$context['learning_session_id']);$stmt->execute();
assessment_json_response(['success'=>true,'type'=>$type,'status'=>$status]);
