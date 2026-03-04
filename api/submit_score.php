<?php
// api/submit_score.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';

// 1. ตรวจสอบสิทธิ์ (ต้อง Login)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Unauthorized']);
    exit();
}

// 2. รับข้อมูล JSON ที่ส่งมาจากเกม (JS)
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Invalid Input']);
    exit();
}

$submitter_id = $_SESSION['user_id']; // คนที่ถือเมาส์และกดส่งคะแนน
$stage_id = intval($input['stage_id']);
$score = intval($input['score']); // จำนวนดาว (0-3)

// รองรับทั้งคีย์ duration และ time_taken เผื่อไว้
$duration = intval($input['duration'] ?? $input['time_taken'] ?? 0); 
$attempts = intval($input['attempts']); // จำนวนครั้งที่ลองผิด
$mode = $_SESSION['mode'] ?? 'solo';

// 3. ดึงรายชื่อสมาชิกในทีมจาก Session (เป็น Array ของ user_id)
// หากไม่มีให้ยึดคนที่ล็อกอินเป็นหลักคนเดียว (ป้องกันกรณีเซสชันเก่าค้าง)
$team_members = $_SESSION['team_members'] ?? [$submitter_id];

try {
    // เตรียมคำสั่ง SQL สำหรับบันทึก/อัปเดตคะแนน (เตรียมไว้รันซ้ำในลูป)
    $sql_progress = "INSERT INTO progress (user_id, stage_id, score, duration_seconds, attempts, completed_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE 
                     score = GREATEST(score, VALUES(score)), 
                     duration_seconds = VALUES(duration_seconds),
                     attempts = VALUES(attempts),
                     completed_at = NOW()";
    $stmt_prog = $conn->prepare($sql_progress);

    // เตรียมคำสั่ง SQL สำหรับบันทึก Log การเล่น
    $action = ($score > 0) ? 'pass' : 'fail';
    $sql_log = "INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES (?, ?, ?, ?)";
    $stmt_log = $conn->prepare($sql_log);

    // เตรียมคำสั่ง SQL สำหรับดึงบทบาท (Role) ของแต่ละคนมาบันทึก Log
    $stmt_role = $conn->prepare("SELECT team_role FROM users WHERE user_id = ?");

    // 4. วนลูปบันทึกข้อมูลให้ "ทุกคน" ในทีม
    foreach ($team_members as $member_id) {
        
        // 4.1 บันทึกคะแนนลงตาราง progress
        $stmt_prog->bind_param("iiiii", $member_id, $stage_id, $score, $duration, $attempts);
        $stmt_prog->execute();

        // 4.2 หาบทบาท (team_role) ปัจจุบันของคนๆ นี้
        $stmt_role->bind_param("i", $member_id);
        $stmt_role->execute();
        $role_result = $stmt_role->get_result()->fetch_assoc();
        $team_role = $role_result['team_role'] ?? 'solo';

        // 4.3 บันทึก Log การเล่น (ระบุด้วยว่าใครเป็นคนกดส่งข้อมูล)
        $is_submitter = ($member_id == $submitter_id) ? " (คนกดส่งงาน)" : "";
        $detail = "Mode: $mode, Role: $team_role{$is_submitter}, Score: $score, Time: $duration s, Attempts: $attempts";
        
        $stmt_log->bind_param("iiss", $member_id, $stage_id, $action, $detail);
        $stmt_log->execute();
    }

    // ส่ง success เป็น true กลับไปให้ JavaScript ทำงานต่อ
    echo json_encode(['status' => 'success', 'success' => true, 'message' => 'Score saved for all team members!']);

} catch (Exception $e) {
    error_log($e->getMessage()); // เก็บ error ลง log ของ server
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Database error']);
}
?>