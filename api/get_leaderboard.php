<?php
// api/get_leaderboard.php
header('Content-Type: application/json');
require_once '../includes/db.php';

$stage_id = intval($_GET['stage_id']);

// ดึง Top 10 ของด่านนี้ (เรียงตามดาวมากสุด -> เวลาน้อยสุด)
$sql = "SELECT u.name, u.class_level, p.score, p.duration_seconds as duration
        FROM progress p
        JOIN users u ON p.user_id = u.id
        WHERE p.stage_id = $stage_id
        ORDER BY p.score DESC, p.duration_seconds ASC
        LIMIT 10";

$result = $conn->query($sql);
$data = [];
while($row = $result->fetch_assoc()) {
    $data[] = $row;
}
echo json_encode($data);
?>