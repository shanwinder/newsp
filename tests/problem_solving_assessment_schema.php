<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$sql = file_get_contents($root . '/database/migrations/2026_07_17_problem_solving_assessment.sql');
$rollbackSql = file_get_contents($root . '/database/migrations/2026_07_17_problem_solving_assessment_rollback.sql');
$config = require $root . '/config/problem_solving_rubric.php';

function problem_schema_check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

problem_schema_check(is_string($sql), 'Migration must be readable');
foreach (['problem_solving_evaluations', 'problem_solving_evaluation_scores', 'problem_solving_evaluation_audit_logs'] as $table) {
    problem_schema_check(str_contains($sql, "CREATE TABLE IF NOT EXISTS {$table}"), "Missing table {$table}");
}
problem_schema_check(str_contains($sql, 'UNIQUE KEY uniq_problem_solving_evaluation'), 'Evaluation uniqueness constraint is required');
problem_schema_check(str_contains($sql, 'CHECK (score BETWEEN 1 AND 4)'), 'Score range constraint is required');
problem_schema_check(str_contains($sql, 'ON DELETE CASCADE'), 'Score and audit rows must cascade on evaluation deletion');
problem_schema_check(str_contains($sql, 'DATETIME(6)'), 'Microsecond timestamps are required for concurrent-edit detection');
problem_schema_check(substr_count($sql, 'FOREIGN KEY') >= 8, 'Context and audit foreign keys are incomplete');
problem_schema_check(is_string($rollbackSql), 'Rollback migration must be readable');
problem_schema_check(
    strpos($rollbackSql, 'problem_solving_evaluation_audit_logs') < strpos($rollbackSql, 'problem_solving_evaluations;'),
    'Rollback must drop dependent tables before evaluations'
);

$activeVersion = $config['active_version'] ?? '';
problem_schema_check($activeVersion === '1.0', 'Initial rubric version must be 1.0');
$rubric = $config['versions'][$activeVersion] ?? [];
problem_schema_check(count($rubric['domains'] ?? []) === 4, 'Rubric must contain four domains');
$itemCount = 0;
foreach ($rubric['domains'] as $domain) {
    problem_schema_check(count($domain['items'] ?? []) === 3, 'Each domain must contain three items');
    problem_schema_check(array_keys($domain['descriptors'] ?? []) === [4, 3, 2, 1], 'Each domain needs descriptors for scores 4–1');
    $itemCount += count($domain['items']);
}
problem_schema_check($itemCount === 12, 'Rubric must contain twelve items');

echo "Problem-solving schema/config tests passed.\n";
