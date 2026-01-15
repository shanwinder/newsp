<?php
// api/get_students_monitor.php
header('Content-Type: application/json');
require_once '../includes/db.php';

// ✅ เพิ่ม u.student_id เข้าไปใน SELECT
$sql = "SELECT u.id, u.student_id, u.name, u.class_level, u.last_seen, 
        (SELECT SUM(score) FROM progress WHERE user_id = u.id) as total_score
        FROM users u 
        WHERE u.role = 'student' 
        ORDER BY u.last_seen DESC";

$result = $conn->query($sql);
$students = [];
while ($row = $result->fetch_assoc()) {
    $row['total_score'] = $row['total_score'] ? $row['total_score'] : 0;

    // เผื่อกรณีข้อมูลเก่าไม่มี student_id ให้แสดงเป็นว่างๆ
    if (empty($row['student_id'])) $row['student_id'] = '-';

    $students[] = $row;
}

echo json_encode([
    'server_time' => date("Y-m-d H:i:s"),
    'students' => $students
]);
