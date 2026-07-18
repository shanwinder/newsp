<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/problem_solving_assessment.php';

function problem_calculation_check(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$scores = [];
$value = 1;
foreach (problem_solving_item_map() as $itemKey => $item) {
    $scores[$itemKey] = ['score' => $value, 'note' => null];
    $value = $value === 4 ? 1 : $value + 1;
}
$calculation = problem_solving_calculate($scores);
problem_calculation_check($calculation['complete'] === true, 'Twelve valid scores must be complete');
problem_calculation_check($calculation['completed_count'] === 12, 'Completed count must follow config item count');
problem_calculation_check(abs($calculation['overall_mean'] - 2.5) < 0.000001, 'Overall mean is incorrect');
problem_calculation_check($calculation['total_score'] === 30, 'Total score is incorrect');
foreach ($calculation['domains'] as $domain) {
    problem_calculation_check($domain['count'] === 3, 'Each domain must use three submitted scores');
}

problem_calculation_check(problem_solving_level(3.26) === 'ดีมาก', '3.26 boundary is incorrect');
problem_calculation_check(problem_solving_level(2.51) === 'ดี', '2.51 boundary is incorrect');
problem_calculation_check(problem_solving_level(1.76) === 'พอใช้', '1.76 boundary is incorrect');
problem_calculation_check(problem_solving_level(1.00) === 'ควรปรับปรุง', '1.00 boundary is incorrect');
problem_calculation_check(abs(problem_solving_standard_deviation([1, 2, 3]) - 1.0) < 0.000001, 'Sample SD formula is incorrect');
problem_calculation_check(problem_solving_standard_deviation([4]) === 0.0, 'SD for one observation must be zero');

$partial = problem_solving_calculate(['understand_goal' => 4, 'unknown_item' => 4, 'plan_reason' => 9]);
problem_calculation_check($partial['completed_count'] === 1, 'Unknown or out-of-range scores must not be calculated');
problem_calculation_check($partial['complete'] === false, 'Partial draft must not be complete');

echo "Problem-solving calculation tests passed.\n";
