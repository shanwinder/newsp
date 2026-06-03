<?php
// api/check_nav_status.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

$learning_session_id = intval($_SESSION['learning_session_id'] ?? 0);

if ($learning_session_id > 0) {
    $stmt = $conn->prepare("SELECT navigation_status, class_status FROM learning_sessions WHERE id = ?");
    $stmt->bind_param("i", $learning_session_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $status = $row['navigation_status'] ?? 'locked';
    $class_status = $row['class_status'] ?? 'active';
} else {
    $sql = "SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'";
    $result = $conn->query($sql);
    $status = ($result->num_rows > 0) ? $result->fetch_assoc()['setting_value'] : 'locked';
    $class_status = 'active';
}

echo json_encode(['status' => $status, 'class_status' => $class_status]);
?>
