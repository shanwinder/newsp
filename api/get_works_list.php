<?php
// api/get_works_list.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
header('Content-Type: application/json');

if (!is_teacher_or_admin()) {
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;
$context = classroom_context($conn);
if (!$context) {
    echo json_encode([]);
    exit();
}

// 🟢 นำ GROUP BY ออก และปรับให้เรียงลำดับสถานะ (รอตรวจ -> ขาดส่ง -> ตรวจแล้ว) ตามด้วยเวลาส่งงานล่าสุด
$sql = "SELECT u.user_id as id, u.student_id, u.name, u.mode, u.group_number, u.team_id,
        (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM users WHERE team_id = u.team_id AND classroom_id = u.classroom_id AND u.team_id IS NOT NULL AND u.team_id != '') as member_names,
        w.id as work_id, 
        COALESCE(w.status, 'pending') as work_status, 
        w.work_data, w.description, w.submitted_at, w.feedback
        FROM users u 
        LEFT JOIN student_works w ON 
            (w.user_id = u.user_id OR (u.team_id IS NOT NULL AND u.team_id != '' AND w.user_id IN (SELECT user_id FROM users WHERE team_id = u.team_id AND classroom_id = u.classroom_id)))
            AND w.game_id = ?
            AND w.learning_session_id = ?
        WHERE u.role = 'student'
          AND u.school_id = ?
          AND u.classroom_id = ?
          AND u.teacher_id = ?
        ORDER BY 
            FIELD(COALESCE(w.status, 'pending'), 'submitted', 'revision', 'pending', 'reviewed'), 
            w.submitted_at DESC, 
            u.group_number ASC, 
            u.student_id ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "iiiii",
    $game_id,
    $context['learning_session_id'],
    $context['school_id'],
    $context['classroom_id'],
    $context['teacher_id']
);
$stmt->execute();
$result = $stmt->get_result();
$data = [];

// ตัวแปรเก็บประวัติเพื่อป้องกันการแสดงผลซ้ำซ้อน
$seen_users = [];
$seen_teams = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        
        // 1. ป้องกันนักเรียนคนเดิมแสดงซ้ำ (ในกรณีที่นักเรียนเคยกดส่งงานเก่าๆ ไว้หลายครั้ง จะดึงมาแค่อันล่าสุด)
        if (in_array($row['id'], $seen_users)) {
            continue;
        }
        
        // 2. ป้องกันกลุ่มเดิมแสดงซ้ำ (ถ้านักเรียนอยู่กลุ่มเดียวกัน จะยุบรวมให้เหลือแค่ 1 แถว)
        if ($row['mode'] === 'group' && !empty($row['team_id'])) {
            if (in_array($row['team_id'], $seen_teams)) {
                $seen_users[] = $row['id']; // บันทึกว่าคนนี้ถูกดึงเข้ากลุ่มไปแล้ว จะได้ไม่โผล่มาเป็นชื่อเดี่ยวๆ
                continue; 
            }
            $seen_teams[] = $row['team_id'];
        }
        
        $seen_users[] = $row['id'];
        
        // จัดการรองรับระบบเก่า (ถ้างานชิ้นนั้นไม่มี mode ระบุไว้ ให้ถือว่าเป็น solo)
        if (empty($row['mode'])) {
            $row['mode'] = 'solo';
        }
        
        $data[] = $row;
    }
} else {
    // แจ้งเตือนกรณีเชื่อมต่อฐานข้อมูลมีปัญหา
    echo json_encode(['error' => 'Database Query Failed: ' . $conn->error]);
    exit();
}

echo json_encode($data);
?>
