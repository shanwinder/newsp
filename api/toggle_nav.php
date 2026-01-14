<?php
// api/toggle_nav.php
header('Content-Type: application/json');
require_once '../includes/db.php';

// รับค่า locked หรือ unlocked
$input = json_decode(file_get_contents('php://input'), true);
$status = $input['status'];

$stmt = $conn->prepare("UPDATE system_settings SET setting_value = ? WHERE setting_key = 'navigation_status'");
$stmt->bind_param("s", $status);
$stmt->execute();

echo json_encode(['success' => true]);
?>