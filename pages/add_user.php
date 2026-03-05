<?php
session_start();
require_once '../includes/db.php';

// ป้องกันคนอื่นที่ไม่ใช่ Admin เข้าถึง
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'ไม่มีสิทธิ์เข้าถึง']);
    exit;
}

$student_id = trim($_POST['student_id'] ?? '');
$name = trim($_POST['name'] ?? '');
$password = trim($_POST['password'] ?? '');
$role = 'student';

if (empty($student_id) || empty($name) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'กรุณากรอกข้อมูลให้ครบถ้วน']);
    exit;
}

// เช็ครหัสซ้ำ
$stmt = $conn->prepare("SELECT user_id FROM users WHERE student_id = ?");
$stmt->bind_param("s", $student_id);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'รหัสนักเรียนนี้มีในระบบแล้ว!']);
    exit;
}

// เข้ารหัสผ่าน (Hash)
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO users (student_id, name, password, role) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $student_id, $name, $hashed_password, $role);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'เกิดข้อผิดพลาดในการบันทึก']);
}
?>