<?php
// api/heartbeat.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';

// 1. ถ้า Login อยู่ ให้ถือว่านักเรียน Online -> อัปเดตเวลาล่าสุด
if (isset($_SESSION['user_id'])) {
    $uid = $_SESSION['user_id'];
    $conn->query("UPDATE users SET last_seen = NOW() WHERE id = $uid");
}

// 2. เช็คสถานะห้องเรียน (Pause หรือ Active?)
$sql = "SELECT setting_value FROM system_settings WHERE setting_key = 'class_status'";
$result = $conn->query($sql);
$status = ($result->num_rows > 0) ? $result->fetch_assoc()['setting_value'] : 'active';

// 3. ตอบกลับ
echo json_encode([
    'status' => 'success',
    'class_status' => $status // 'active' หรือ 'paused'
]);
?>