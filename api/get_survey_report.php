<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$context = survey_teacher_context($conn);
$report = survey_report_data($conn, $context);
unset($report['students'], $report['comments']);
survey_json_response(['success'=>true,'data'=>$report]);
