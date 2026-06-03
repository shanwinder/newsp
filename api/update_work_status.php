<?php
// api/update_work_status.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
header('Content-Type: application/json');

if (!is_teacher_or_admin()) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit();
}
$context = classroom_context($conn);

$input = json_decode(file_get_contents('php://input'), true);

if ($input && isset($input['work_id'])) {
    $work_id = intval($input['work_id']);
    $status = $input['status'];
    // ✅ รับค่า feedback เพิ่มเข้ามา
    $feedback = isset($input['feedback']) ? $input['feedback'] : '';

    if (!in_array($status, ['submitted', 'reviewed', 'revision'], true) || !$context) {
        echo json_encode(['success' => false, 'error' => 'Invalid status or classroom']);
        exit();
    }

    $stmt = $conn->prepare("UPDATE student_works SET status = ?, feedback = ? WHERE id = ? AND school_id = ? AND classroom_id = ? AND teacher_id = ?");
    $stmt->bind_param("ssiiii", $status, $feedback, $work_id, $context['school_id'], $context['classroom_id'], $context['teacher_id']);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid Input']);
}
?>
