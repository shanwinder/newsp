<?php
// api/get_students_monitor.php
header('Content-Type: application/json');
require_once '../includes/db.php';

// ดึงข้อมูลนักเรียน + คะแนนรวม
$sql = "SELECT u.id, u.name, u.class_level, u.last_seen, 
        (SELECT SUM(score) FROM progress WHERE user_id = u.id) as total_score
        FROM users u 
        WHERE u.role = 'student' 
        ORDER BY u.last_seen DESC"; // คน online ขึ้นก่อน

$result = $conn->query($sql);
$students = [];
while($row = $result->fetch_assoc()) {
    $row['total_score'] = $row['total_score'] ? $row['total_score'] : 0;
    $students[] = $row;
}

echo json_encode([
    'server_time' => date("Y-m-d H:i:s"), // ส่งเวลา Server ไปเทียบ
    'students' => $students
]);
?>