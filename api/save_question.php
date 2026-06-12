<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
assessment_teacher_context($conn);
$payload = assessment_read_json();
if (!assessment_verify_csrf($payload['csrf_token'] ?? null)) assessment_json_response(['success'=>false,'message'=>'คำขอหมดอายุ'],419);
$assessmentId=intval($payload['assessment_id']??0);$questionId=intval($payload['question_id']??0);
$owner=$conn->prepare("SELECT created_by FROM assessments WHERE id=? LIMIT 1");$owner->bind_param('i',$assessmentId);$owner->execute();$ownerRow=$owner->get_result()->fetch_assoc();
if(!$ownerRow || (!is_super_admin() && intval($ownerRow['created_by']??0)!==intval($_SESSION['user_id']))) assessment_json_response(['success'=>false,'message'=>'ชุดข้อสอบกลางหรือชุดของครูท่านอื่นอ่านได้อย่างเดียว กรุณาสร้างเวอร์ชันใหม่'],403);
$used=$conn->prepare("SELECT COUNT(*) total FROM assessment_attempts WHERE assessment_id=?");$used->bind_param('i',$assessmentId);$used->execute();
if(intval($used->get_result()->fetch_assoc()['total'])>0) assessment_json_response(['success'=>false,'message'=>'ชุดนี้มีผู้สอบแล้ว กรุณาสร้างเวอร์ชันใหม่'],409);
$gameId=max(1,min(4,intval($payload['game_id']??1)));$questionNo=intval($payload['question_no']??0);$level=(string)($payload['cognitive_level']??'apply');$correct=strtoupper((string)($payload['correct_choice']??'A'));
if(!in_array($level,['remember','understand','apply','analyze'],true)||!in_array($correct,['A','B','C','D'],true)||$questionNo<1) assessment_json_response(['success'=>false,'message'=>'ข้อมูลข้อสอบไม่ถูกต้อง'],422);
$texts=[];foreach(['question_text','choice_a','choice_b','choice_c','choice_d','explanation'] as $field)$texts[$field]=trim((string)($payload[$field]??''));
if(in_array('',array_slice(array_values($texts),0,5),true)) assessment_json_response(['success'=>false,'message'=>'กรุณากรอกคำถามและตัวเลือกให้ครบ'],422);
try{if($questionId){$stmt=$conn->prepare("UPDATE assessment_questions SET game_id=?,question_no=?,cognitive_level=?,question_text=?,choice_a=?,choice_b=?,choice_c=?,choice_d=?,correct_choice=?,explanation=? WHERE id=? AND assessment_id=?");$stmt->bind_param('iissssssssii',$gameId,$questionNo,$level,$texts['question_text'],$texts['choice_a'],$texts['choice_b'],$texts['choice_c'],$texts['choice_d'],$correct,$texts['explanation'],$questionId,$assessmentId);}else{$stmt=$conn->prepare("INSERT INTO assessment_questions (assessment_id,game_id,question_no,cognitive_level,question_text,choice_a,choice_b,choice_c,choice_d,correct_choice,explanation) VALUES (?,?,?,?,?,?,?,?,?,?,?)");$stmt->bind_param('iiissssssss',$assessmentId,$gameId,$questionNo,$level,$texts['question_text'],$texts['choice_a'],$texts['choice_b'],$texts['choice_c'],$texts['choice_d'],$correct,$texts['explanation']);}$stmt->execute();assessment_json_response(['success'=>true,'question_id'=>$questionId?:$conn->insert_id]);}catch(Throwable $e){assessment_json_response(['success'=>false,'message'=>$e->getMessage()],422);}
