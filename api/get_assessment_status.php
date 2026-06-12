<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';

require_student_like();
$status = assessment_student_status($conn, intval($_SESSION['user_id']), session_context());

foreach (['pretest', 'posttest'] as $type) {
    if (!empty($status[$type]['attempt'])) {
        unset($status[$type]['attempt']['school_id'], $status[$type]['attempt']['classroom_id'], $status[$type]['attempt']['teacher_id']);
    }
}

assessment_json_response(['success' => true, 'data' => $status]);
