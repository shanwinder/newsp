<?php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$work_id = intval($input['work_id'] ?? 0);
$score = intval($input['score'] ?? 0);
$duration = intval($input['duration'] ?? 0);
$attempts = intval($input['attempts'] ?? 0);
$bug_type = trim($input['bug_type'] ?? '');
$extra_detail = is_array($input['detail'] ?? null) ? $input['detail'] : null;

if ($work_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Missing work_id']);
    exit();
}

$context = session_context();
$user_id = intval($_SESSION['user_id']);

$check = $conn->prepare("
    SELECT id
    FROM student_works
    WHERE id = ?
      AND game_id = 4
      AND status IN ('submitted', 'reviewed')
      AND school_id = ?
      AND classroom_id = ?
      AND learning_session_id = ?
    LIMIT 1
");
$check->bind_param(
    "iiii",
    $work_id,
    $context['school_id'],
    $context['classroom_id'],
    $context['learning_session_id']
);
$check->execute();
if (!$check->get_result()->fetch_assoc()) {
    echo json_encode(['success' => false, 'message' => 'Work not found']);
    exit();
}

$stage_id = 12;
$action = $score > 0 ? 'pass' : 'fail';
$detail = json_encode([
    'source' => 'debug_work_play',
    'work_id' => $work_id,
    'score' => $score,
    'duration' => $duration,
    'attempts' => $attempts,
    'bug_type' => $bug_type,
    'detail' => $extra_detail
], JSON_UNESCAPED_UNICODE);

$stmt = $conn->prepare("
    INSERT INTO game_logs (user_id, stage_id, action, detail, school_id, classroom_id, teacher_id, learning_session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->bind_param(
    "iissiiii",
    $user_id,
    $stage_id,
    $action,
    $detail,
    $context['school_id'],
    $context['classroom_id'],
    $context['teacher_id'],
    $context['learning_session_id']
);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => $conn->error]);
}
?>
