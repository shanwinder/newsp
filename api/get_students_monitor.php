<?php
// api/get_students_monitor.php
header('Content-Type: application/json');
require_once '../includes/db.php';

// ✅ แก้ไข u.id เป็น u.user_id และ alias เป็น id เพื่อให้ JS ฝั่งหน้าจอใช้งานได้เหมือนเดิม
// ✅ แก้ไขเงื่อนไข SUM(score) ให้เป็น WHERE user_id = u.user_id
$sql = "SELECT u.user_id as id, u.student_id, u.name, u.class_level, u.last_seen, 
        (SELECT SUM(score) FROM progress WHERE user_id = u.user_id) as total_score
        FROM users u 
        WHERE u.role = 'student' 
        ORDER BY u.last_seen DESC";

$result = $conn->query($sql);
$students = [];

// เช็คกันพังกรณี SQL Error
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['total_score'] = $row['total_score'] ? intval($row['total_score']) : 0;

        // เผื่อกรณีข้อมูลเก่าไม่มี ให้แสดงเป็นว่างๆ (-)
        if (empty($row['student_id'])) $row['student_id'] = '-';
        if (empty($row['class_level'])) $row['class_level'] = '-';

        $students[] = $row;
    }
}

echo json_encode([
    'server_time' => date("Y-m-d H:i:s"),
    'students' => $students
]);
?>