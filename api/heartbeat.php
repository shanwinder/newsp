<?php
// api/heartbeat.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

// 1. ถ้า Login อยู่ ให้ถือว่านักเรียน Online -> อัปเดตเวลาล่าสุด
if (isset($_SESSION['user_id'])) {
    $uid = intval($_SESSION['user_id']); // แปลงเป็นตัวเลขเพื่อความปลอดภัย
    
    // ✅ แก้ไขบั๊ก: เปลี่ยนจาก id เป็น user_id ให้ตรงกับฐานข้อมูล
    $conn->query("UPDATE users SET last_seen = NOW() WHERE user_id = $uid");
}

// 2. เช็คสถานะห้องเรียน (Pause หรือ Active?) จาก learning session ของห้องตนเอง
$learning_session_id = intval($_SESSION['learning_session_id'] ?? 0);
if ($learning_session_id > 0) {
    $stmt = $conn->prepare("SELECT class_status FROM learning_sessions WHERE id = ?");
    $stmt->bind_param("i", $learning_session_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $status = $row['class_status'] ?? 'active';
} else {
    $sql = "SELECT setting_value FROM system_settings WHERE setting_key = 'class_status'";
    $result = $conn->query($sql);
    $status = ($result && $result->num_rows > 0) ? $result->fetch_assoc()['setting_value'] : 'active';
}

// 3. ตอบกลับข้อมูลให้ Script หน้าจอเด็กรับรู้
echo json_encode([
    'status' => 'success',
    'class_status' => $status 
]);
?>
