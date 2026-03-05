<?php
// api/get_showcase.php
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

$my_id = $_SESSION['user_id'] ?? 0;
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;

// 🟢 เพิ่ม w.feedback เพื่อดึงข้อเสนอแนะของครูออกมาด้วย
$sql = "SELECT w.id, w.work_data, w.description, w.submitted_at, w.status, w.feedback,
               u.mode, u.group_number, u.team_id,
               u.name as student_name, u.student_id,
               (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users WHERE team_id = u.team_id) as member_names,
               (SELECT COUNT(*) FROM project_likes WHERE work_id = w.id) as like_count,
               (SELECT COUNT(*) FROM project_likes WHERE work_id = w.id AND user_id = $my_id) as is_liked
        FROM student_works w
        JOIN users u ON w.user_id = u.user_id
        WHERE w.status IN ('submitted', 'reviewed') AND w.game_id = $game_id
        ORDER BY w.submitted_at DESC";

$result = $conn->query($sql);
$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}
echo json_encode($data);
?>