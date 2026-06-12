<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$context = assessment_teacher_context($conn);
$report = assessment_report_data($conn, $context);
assessment_json_response(['success'=>true,'context'=>['classroom_id'=>$context['classroom_id'],'learning_session_id'=>$context['learning_session_id']],'data'=>$report]);
