<?php
// api/get_showcase.php
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

$my_id = $_SESSION['user_id'] ?? 0;
// ✅ รับค่า game_id (ถ้าไม่มีให้เป็น 1)
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;

$sql = "SELECT w.id, w.work_data, w.description, w.submitted_at, 
               u.name as student_name, u.student_id,
               (SELECT COUNT(*) FROM project_likes WHERE work_id = w.id) as like_count,
               (SELECT COUNT(*) FROM project_likes WHERE work_id = w.id AND user_id = $my_id) as is_liked
        FROM student_works w
        JOIN users u ON w.user_id = u.id
        WHERE w.status = 'reviewed' AND w.game_id = $game_id  -- ✅ กรองตรงนี้
        ORDER BY w.submitted_at DESC";

$result = $conn->query($sql);
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
