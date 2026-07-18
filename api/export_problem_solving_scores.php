<?php

session_start();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/problem_solving_assessment.php';

if (!problem_solving_api_account_allowed($conn)) {
    http_response_code(401);
    exit('ไม่มีสิทธิ์ใช้งาน');
}
$context = problem_solving_teacher_context($conn, isset($_GET['classroom_id']) ? (int) $_GET['classroom_id'] : null);
if (!$context) {
    http_response_code(403);
    exit('ไม่พบห้องเรียนหรือไม่มีสิทธิ์เข้าถึง');
}
$mode = ($_GET['mode'] ?? 'raw') === 'summary' ? 'summary' : 'raw';
$includeDrafts = ($_GET['include_drafts'] ?? '') === '1';
$version = problem_solving_active_version();
$lessons = require __DIR__ . '/../config/lessons.php';

function problem_solving_export_value(mixed $value): mixed
{
    if (is_string($value) && preg_match('/^[=+\-@]/u', $value)) {
        return "'" . $value;
    }
    return $value;
}

$filename = 'problem_solving_' . $mode . '_classroom_' . $context['classroom_id'] . '_' . date('Ymd_His') . '.csv';
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-store, no-cache, must-revalidate');
echo "\xEF\xBB\xBF";
$output = fopen('php://output', 'wb');

if ($mode === 'raw') {
    $headers = [
        'school_id', 'classroom_id', 'learning_session_id', 'teacher_id', 'evaluator_id',
        'student_user_id', 'student_id', 'student_name', 'lesson_id', 'lesson_title',
        'rubric_version', 'evaluation_status', 'item_key', 'domain_key', 'score',
        'evidence_note', 'overall_note', 'evaluated_at', 'finalized_at',
    ];
    fputcsv($output, $headers);
    $sql = "SELECT e.*, u.student_id, u.name AS student_name,
                   s.item_key, s.domain_key, s.score, s.evidence_note
            FROM problem_solving_evaluations e
            JOIN users u ON u.user_id = e.user_id
            JOIN problem_solving_evaluation_scores s ON s.evaluation_id = e.id
            WHERE e.rubric_version = ?
              AND e.school_id = ? AND e.classroom_id = ? AND e.teacher_id = ? AND e.learning_session_id = ?";
    if (!$includeDrafts) {
        $sql .= " AND e.status = 'final'";
    }
    $sql .= ' ORDER BY u.student_id, e.lesson_id, s.id';
    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        'siiii',
        $version,
        $context['school_id'],
        $context['classroom_id'],
        $context['teacher_id'],
        $context['learning_session_id']
    );
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $values = [
            $row['school_id'], $row['classroom_id'], $row['learning_session_id'], $row['teacher_id'], $row['evaluator_id'],
            $row['user_id'], $row['student_id'], $row['student_name'], $row['lesson_id'], $lessons[(int) $row['lesson_id']]['title'] ?? '',
            $row['rubric_version'], $row['status'], $row['item_key'], $row['domain_key'], $row['score'],
            $row['evidence_note'], $row['overall_note'], $row['evaluated_at'], $row['finalized_at'],
        ];
        fputcsv($output, array_map('problem_solving_export_value', $values));
    }
} else {
    $rubric = problem_solving_rubric($version);
    $domainKeys = array_keys($rubric['domains']);
    $headers = array_merge(
        ['student_id', 'student_name', 'lesson_id', 'rubric_version'],
        array_map(static fn (string $key): string => $key . '_mean', $domainKeys),
        ['overall_score', 'overall_mean', 'skill_level', 'overall_note', 'evaluator_name', 'finalized_at']
    );
    fputcsv($output, $headers);
    $report = problem_solving_report_data($conn, $context, null, $includeDrafts, $version);
    foreach ($report['evaluations'] as $evaluation) {
        $calculation = $evaluation['calculation'];
        $values = [
            $evaluation['student_id'], $evaluation['student_name'], $evaluation['lesson_id'], $evaluation['rubric_version'],
        ];
        foreach ($domainKeys as $domainKey) {
            $mean = $calculation['domains'][$domainKey]['mean'];
            $values[] = $mean === null ? '' : number_format($mean, 2, '.', '');
        }
        $values[] = $calculation['total_score'];
        $values[] = $calculation['overall_mean'] === null ? '' : number_format($calculation['overall_mean'], 2, '.', '');
        $values[] = $calculation['level'];
        $values[] = $evaluation['overall_note'];
        $values[] = $evaluation['evaluator_name'];
        $values[] = $evaluation['finalized_at'];
        fputcsv($output, array_map('problem_solving_export_value', $values));
    }
}

fclose($output);
exit;
