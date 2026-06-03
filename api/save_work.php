<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
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
    $desc = $data['description'];
    $status = 'submitted';
    $context = session_context();

    // เช็คว่าเคยส่งหรือยัง ถ้าเคยแล้วให้ Update แทน Insert
    $check = $conn->prepare("SELECT id FROM student_works WHERE user_id = ? AND game_id = ? AND learning_session_id = ?");
    $check->bind_param("iii", $user_id, $game_id, $context['learning_session_id']);
    $check->execute();
    $existing = $check->get_result();
    
    if ($existing->num_rows > 0) {
        $stmt = $conn->prepare("UPDATE student_works SET work_data = ?, description = ?, status = ?, submitted_at = NOW()
                WHERE user_id = ? AND game_id = ? AND learning_session_id = ?");
        $stmt->bind_param("sssiii", $work_data, $desc, $status, $user_id, $game_id, $context['learning_session_id']);
    } else {
        $stmt = $conn->prepare("INSERT INTO student_works (user_id, game_id, work_data, description, status, school_id, classroom_id, teacher_id, learning_session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "iisssiiii",
            $user_id,
            $game_id,
            $work_data,
            $desc,
            $status,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id']
        );
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
}
?>
