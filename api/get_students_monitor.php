<?php
// api/get_students_monitor.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

if (!is_teacher_or_admin()) {
    echo json_encode(['error' => 'Unauthorized', 'students' => []]);
    exit();
}

$context = classroom_context($conn);
if (!$context) {
    echo json_encode(['server_time' => date("Y-m-d H:i:s"), 'students' => []]);
    exit();
}

$sql = "SELECT u.user_id as id, u.student_id, u.name, u.class_level, u.last_seen,
        (SELECT SUM(score) FROM progress p WHERE p.user_id = u.user_id AND p.learning_session_id = ?) as total_score
        FROM users u
        WHERE u.role = 'student'
          AND u.school_id = ?
          AND u.classroom_id = ?
          AND u.teacher_id = ?
        ORDER BY u.last_seen DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "iiii",
    $context['learning_session_id'],
    $context['school_id'],
    $context['classroom_id'],
    $context['teacher_id']
);
$stmt->execute();
$result = $stmt->get_result();
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
