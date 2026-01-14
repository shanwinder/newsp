<?php
// api/toggle_class.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';

// เช็คสิทธิ์ Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

// รับค่าที่ส่งมา (active หรือ paused)
$data = json_decode(file_get_contents('php://input'), true);
$new_status = $data['status'] ?? 'active';

$stmt = $conn->prepare("UPDATE system_settings SET setting_value = ? WHERE setting_key = 'class_status'");
$stmt->bind_param("s", $new_status);
$stmt->execute();

echo json_encode(['status' => 'success', 'new_status' => $new_status]);
?>