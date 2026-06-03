<?php
// api/toggle_nav.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

if (!is_teacher_or_admin()) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$context = classroom_context($conn);
if (!$context) {
    echo json_encode(['success' => false, 'message' => 'No active classroom']);
    exit();
}

// รับค่า locked หรือ unlocked
$input = json_decode(file_get_contents('php://input'), true);
$status = $input['status'];

$stmt = $conn->prepare("UPDATE learning_sessions SET navigation_status = ?, updated_at = NOW() WHERE id = ?");
$stmt->bind_param("si", $status, $context['learning_session_id']);
$stmt->execute();

echo json_encode(['success' => true]);
?>
