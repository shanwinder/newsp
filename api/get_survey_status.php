<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
require_student_like();
$status = survey_student_status($conn, intval($_SESSION['user_id']), session_context());
if (!empty($status['response'])) unset($status['response']['school_id'], $status['response']['classroom_id'], $status['response']['teacher_id']);
survey_json_response(['success' => true, 'data' => $status]);
