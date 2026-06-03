<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

require_teacher_or_admin();
ensure_active_account($conn);

$context = classroom_context($conn, isset($_GET['classroom_id']) ? intval($_GET['classroom_id']) : null);
if (!$context) {
    http_response_code(404);
    exit('No active classroom');
}

$filename = 'scores_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $context['classroom']['join_code']) . '_' . date('Ymd_His') . '.csv';
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="' . $filename . '"');

$out = fopen('php://output', 'w');
fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));

$headers = ['student_id', 'name', 'classroom', 'join_code'];
for ($i = 1; $i <= 12; $i++) {
    $headers[] = 'stage_' . $i;
}
$headers[] = 'total_score';
$headers[] = 'total_duration_seconds';
$headers[] = 'total_attempts';
fputcsv($out, $headers);

$sql = "SELECT u.user_id, u.student_id, u.name
        FROM users u
        WHERE u.role = 'student'
          AND u.school_id = ?
          AND u.classroom_id = ?
          AND u.teacher_id = ?
        ORDER BY u.student_id ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iii", $context['school_id'], $context['classroom_id'], $context['teacher_id']);
$stmt->execute();
$students = $stmt->get_result();

$score_stmt = $conn->prepare("SELECT s.stage_number, s.game_id, p.score, p.duration_seconds, p.attempts
    FROM progress p
    JOIN stages s ON p.stage_id = s.id
    WHERE p.user_id = ? AND p.learning_session_id = ?");

while ($student = $students->fetch_assoc()) {
    $stage_scores = array_fill(1, 12, 0);
    $total_score = 0;
    $total_duration = 0;
    $total_attempts = 0;

    $score_stmt->bind_param("ii", $student['user_id'], $context['learning_session_id']);
    $score_stmt->execute();
    $scores = $score_stmt->get_result();
    while ($score = $scores->fetch_assoc()) {
        $stage_index = ((intval($score['game_id']) - 1) * 3) + intval($score['stage_number']);
        if ($stage_index >= 1 && $stage_index <= 12) {
            $stage_scores[$stage_index] = intval($score['score']);
        }
        $total_score += intval($score['score']);
        $total_duration += intval($score['duration_seconds']);
        $total_attempts += intval($score['attempts']);
    }

    $row = [
        $student['student_id'],
        $student['name'],
        $context['classroom']['classroom_name'],
        $context['classroom']['join_code'],
    ];
    for ($i = 1; $i <= 12; $i++) {
        $row[] = $stage_scores[$i];
    }
    $row[] = $total_score;
    $row[] = $total_duration;
    $row[] = $total_attempts;
    fputcsv($out, $row);
}

fclose($out);
