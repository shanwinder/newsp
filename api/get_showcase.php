<?php
// api/get_showcase.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
header('Content-Type: application/json');

$my_id = $_SESSION['user_id'] ?? 0;
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;
$context = session_context();

// 🟢 เพิ่ม w.feedback เพื่อดึงข้อเสนอแนะของครูออกมาด้วย
$sql = "SELECT w.id, w.game_id, w.work_data, w.description, w.submitted_at, w.status, w.feedback,
               u.mode, u.group_number, u.team_id,
               u.name as student_name, u.student_id,
               (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users WHERE team_id = u.team_id AND classroom_id = u.classroom_id) as member_names,
               (SELECT COUNT(*) FROM project_likes WHERE work_id = w.id) as like_count,
               (SELECT COUNT(*) FROM project_likes WHERE work_id = w.id AND user_id = $my_id) as is_liked
        FROM student_works w
        JOIN users u ON w.user_id = u.user_id
        WHERE w.status IN ('submitted', 'reviewed')
          AND w.game_id = ?
          AND w.school_id = ?
          AND w.classroom_id = ?
          AND w.learning_session_id = ?
        ORDER BY w.submitted_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("iiii", $game_id, $context['school_id'], $context['classroom_id'], $context['learning_session_id']);
$stmt->execute();
$result = $stmt->get_result();
$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}
echo json_encode($data);
?>
