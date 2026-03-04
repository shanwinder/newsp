<?php
// api/get_leaderboard.php
header('Content-Type: application/json');
require_once '../includes/db.php';

// ป้องกัน SQL Injection
$stage_id = isset($_GET['stage_id']) ? intval($_GET['stage_id']) : 0;

if ($stage_id === 0) {
    echo json_encode([]);
    exit();
}

// ดึง Top 10 ของด่านนี้ (เรียงตามดาวมากสุด -> เวลาน้อยสุด)
// แก้ไข u.id เป็น u.user_id ให้ตรงกับโครงสร้างตาราง
$sql = "SELECT u.name, u.class_level, p.score, p.duration_seconds as duration
        FROM progress p
        JOIN users u ON p.user_id = u.user_id
        WHERE p.stage_id = $stage_id
        ORDER BY p.score DESC, p.duration_seconds ASC
        LIMIT 10";

$result = $conn->query($sql);
$data = [];

// เพิ่มการตรวจสอบ $result เผื่อกรณี Query ไม่ผ่าน จะได้ไม่พัง
if ($result) {
    while($row = $result->fetch_assoc()) {
        // หากเด็กบางคนไม่ได้ใส่ชั้นเรียน ให้แสดงช่องว่างแทนที่จะเป็น null
        if (empty($row['class_level'])) {
            $row['class_level'] = '-';
        }
        $data[] = $row;
    }
}

echo json_encode($data);
?>