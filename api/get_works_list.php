<?php
// api/get_works_list.php
require_once '../includes/db.php';
header('Content-Type: application/json');

// ✅ รับค่า game_id จาก URL (Default = 1)
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;

// SQL Query: กรองตาม game_id ที่ส่งมา
$sql = "SELECT u.id, u.student_id, u.name, 
        w.id as work_id, 
        w.status as work_status, w.work_data, w.description, w.submitted_at
        FROM users u 
        LEFT JOIN student_works w ON u.id = w.user_id AND w.game_id = $game_id
        WHERE u.role = 'student'
        ORDER BY field(w.status, 'submitted', 'reviewed', 'pending'), u.student_id ASC";

$result = $conn->query($sql);
$data = [];
while ($row = $result->fetch_assoc()) {
    if (empty($row['work_status'])) $row['work_status'] = 'pending';
    $data[] = $row;
}
echo json_encode($data);
