<?php

declare(strict_types=1);

$root = dirname(__DIR__);
require_once $root . '/includes/problem_solving_assessment.php';

function problem_permission_check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$context = ['school_id' => 1, 'classroom_id' => 2, 'teacher_id' => 3, 'learning_session_id' => 4];
problem_permission_check(problem_solving_context_matches($context, $context), 'Matching context must be accepted');
foreach (array_keys($context) as $key) {
    $other = $context;
    $other[$key]++;
    problem_permission_check(!problem_solving_context_matches($other, $context), "Cross-context {$key} must be rejected");
}

$helper = file_get_contents($root . '/includes/problem_solving_assessment.php');
problem_permission_check(is_string($helper), 'Helper must be readable');
foreach (['school_id = ?', 'classroom_id = ?', 'teacher_id = ?', 'learning_session_id = ?'] as $scope) {
    problem_permission_check(str_contains($helper, $scope), "Missing prepared context scope: {$scope}");
}
problem_permission_check(str_contains($helper, "role = 'student' AND status = 'active'"), 'Only active students may be assessed');

$writeApis = ['save_problem_solving_assessment.php', 'unlock_problem_solving_assessment.php'];
foreach ($writeApis as $api) {
    $source = file_get_contents($root . '/api/' . $api);
    problem_permission_check(str_contains($source, 'problem_solving_verify_csrf'), "{$api} must verify CSRF");
    problem_permission_check(str_contains($source, 'problem_solving_student_in_context'), "{$api} must scope the student");
}
$saveSource = file_get_contents($root . '/api/save_problem_solving_assessment.php');
problem_permission_check(str_contains($saveSource, "status'] === 'final'"), 'Final records must be rejected on direct edit');
problem_permission_check(str_contains($saveSource, 'begin_transaction'), 'Evaluation and scores must save in one transaction');
$unlockSource = file_get_contents($root . '/api/unlock_problem_solving_assessment.php');
problem_permission_check(str_contains($unlockSource, 'problem_solving_evaluation_audit_logs'), 'Unlock must write an audit log');

echo "Problem-solving permission/security tests passed.\n";
