<?php
// api/toggle_class.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

if (!is_teacher_or_admin()) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$context = classroom_context($conn);
if (!$context) {
    echo json_encode(['status' => 'error', 'message' => 'No active classroom']);
    exit();
}

// รับค่าที่ส่งมา (active หรือ paused)
$data = json_decode(file_get_contents('php://input'), true);
$new_status = $data['status'] ?? 'active';

$stmt = $conn->prepare("UPDATE learning_sessions SET class_status = ?, updated_at = NOW() WHERE id = ?");
$stmt->bind_param("si", $new_status, $context['learning_session_id']);
$stmt->execute();

echo json_encode(['status' => 'success', 'new_status' => $new_status]);
?>
