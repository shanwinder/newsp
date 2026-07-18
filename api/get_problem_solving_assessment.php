<?php

session_start();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/problem_solving_assessment.php';

if (!problem_solving_api_account_allowed($conn)) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่มีสิทธิ์ใช้งาน'], 401);
}

$classroomId = isset($_GET['classroom_id']) ? (int) $_GET['classroom_id'] : null;
$studentId = (int) ($_GET['student_id'] ?? 0);
$lessonId = (int) ($_GET['lesson_id'] ?? 0);
$lessons = require __DIR__ . '/../config/lessons.php';
$context = problem_solving_teacher_context($conn, $classroomId);

if (!$context) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่พบห้องเรียนหรือไม่มีสิทธิ์เข้าถึง'], 403);
}
if (!isset($lessons[$lessonId])) {
    problem_solving_json_response(['success' => false, 'error' => 'บทเรียนไม่ถูกต้อง'], 422);
}
$student = problem_solving_student_in_context($conn, $studentId, $context);
if (!$student) {
    problem_solving_json_response(['success' => false, 'error' => 'ไม่พบนักเรียนในห้องเรียนนี้'], 403);
}

$version = problem_solving_active_version();
$evaluation = problem_solving_load_evaluation($conn, $studentId, $lessonId, $context, $version);
$scores = $evaluation['scores'] ?? [];
$status = $evaluation['display_status'] ?? 'not_started';

problem_solving_json_response([
    'success' => true,
    'csrf_token' => problem_solving_csrf_token(),
    'context' => [
        'school_id' => $context['school_id'],
        'classroom_id' => $context['classroom_id'],
        'learning_session_id' => $context['learning_session_id'],
        'school_name' => $context['classroom']['school_name'],
        'classroom_name' => $context['classroom']['classroom_name'],
        'session_name' => $context['learning_session']['session_name'] ?? '',
    ],
    'student' => $student,
    'students' => problem_solving_students_with_statuses($conn, $context, $version),
    'lesson' => ['id' => $lessonId] + $lessons[$lessonId],
    'rubric_version' => $version,
    'rubric' => problem_solving_rubric($version),
    'status' => $status,
    'database_status' => $evaluation['status'] ?? null,
    'scores' => $scores,
    'overall_note' => $evaluation['overall_note'] ?? '',
    'updated_at' => $evaluation['updated_at'] ?? null,
    'evaluated_at' => $evaluation['evaluated_at'] ?? null,
    'finalized_at' => $evaluation['finalized_at'] ?? null,
    'evaluator_name' => $evaluation['evaluator_name'] ?? null,
    'calculation' => $evaluation['calculation'] ?? problem_solving_calculate([], $version),
    'evidence' => problem_solving_evidence($conn, $studentId, $lessonId, $context),
]);
