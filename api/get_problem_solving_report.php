<?php

session_start();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/problem_solving_assessment.php';

if (!problem_solving_api_account_allowed($conn)) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่มีสิทธิ์ใช้งาน'], 401);
}
$context = problem_solving_teacher_context($conn, isset($_GET['classroom_id']) ? (int) $_GET['classroom_id'] : null);
if (!$context) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่พบห้องเรียนหรือไม่มีสิทธิ์เข้าถึง'], 403);
}
$lessonId = isset($_GET['lesson_id']) && $_GET['lesson_id'] !== '' ? (int) $_GET['lesson_id'] : null;
if ($lessonId !== null && ($lessonId < 1 || $lessonId > 4)) {
    problem_solving_json_response(['success' => false, 'error' => 'บทเรียนไม่ถูกต้อง'], 422);
}
$includeDrafts = ($_GET['include_drafts'] ?? '') === '1';

problem_solving_json_response([
    'success' => true,
    'context' => [
        'school_id' => $context['school_id'],
        'classroom_id' => $context['classroom_id'],
        'learning_session_id' => $context['learning_session_id'],
        'school_name' => $context['classroom']['school_name'],
        'classroom_name' => $context['classroom']['classroom_name'],
        'session_name' => $context['learning_session']['session_name'] ?? '',
    ],
    'report' => problem_solving_report_data($conn, $context, $lessonId, $includeDrafts),
]);
