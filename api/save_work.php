<?php
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $user_id = $_SESSION['user_id'];
    $game_id = intval($data['game_id']);
    $work_data = json_encode($data['items'], JSON_UNESCAPED_UNICODE); // แปลง Array กลับเป็น JSON String
    $desc = $conn->real_escape_string($data['description']);
    $status = 'submitted';

    // เช็คว่าเคยส่งหรือยัง ถ้าเคยแล้วให้ Update แทน Insert
    $check = $conn->query("SELECT id FROM student_works WHERE user_id = $user_id AND game_id = $game_id");
    
    if ($check->num_rows > 0) {
        $sql = "UPDATE student_works SET work_data = '$work_data', description = '$desc', status = '$status', submitted_at = NOW() 
                WHERE user_id = $user_id AND game_id = $game_id";
    } else {
        $sql = "INSERT INTO student_works (user_id, game_id, work_data, description, status) 
                VALUES ($user_id, $game_id, '$work_data', '$desc', '$status')";
    }

    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}
?>