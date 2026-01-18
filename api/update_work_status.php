<?php
// api/update_work_status.php
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

// เช็ค Admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if ($input && isset($input['work_id'])) {
    $work_id = intval($input['work_id']);
    $status = $conn->real_escape_string($input['status']);

    $sql = "UPDATE student_works SET status = '$status' WHERE id = $work_id";

    if ($conn->query($sql)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid Input']);
}
