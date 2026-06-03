<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Login required']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
$work_id = intval($input['work_id'] ?? 0);
$user_id = $_SESSION['user_id'];
$context = session_context();

if ($work_id > 0) {
    $work_check = $conn->prepare("SELECT id FROM student_works WHERE id = ? AND school_id = ? AND classroom_id = ?");
    $work_check->bind_param("iii", $work_id, $context['school_id'], $context['classroom_id']);
    $work_check->execute();
    if ($work_check->get_result()->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Work not found']);
        exit();
    }

    // เช็คว่าเคยไลค์ไหม
    $check = $conn->query("SELECT id FROM project_likes WHERE user_id = $user_id AND work_id = $work_id");

    if ($check->num_rows > 0) {
        // มีแล้ว -> ลบออก (Unlike)
        $conn->query("DELETE FROM project_likes WHERE user_id = $user_id AND work_id = $work_id");
        $action = 'unliked';
    } else {
        // ยังไม่มี -> เพิ่ม (Like)
        $stmt = $conn->prepare("INSERT INTO project_likes (user_id, work_id, school_id, classroom_id) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiii", $user_id, $work_id, $context['school_id'], $context['classroom_id']);
        $stmt->execute();
        $action = 'liked';
    }

    // นับจำนวนไลค์ล่าสุดส่งกลับไป
    $countRes = $conn->query("SELECT COUNT(*) as total FROM project_likes WHERE work_id = $work_id");
    $total = $countRes->fetch_assoc()['total'];

    echo json_encode(['success' => true, 'action' => $action, 'likes' => $total]);
}
