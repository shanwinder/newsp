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

$user_id = $_SESSION['user_id'];
$stage_id = intval($input['stage_id']);
$score = intval($input['score']); // จำนวนดาว (1-3)

// รองรับทั้งคีย์ duration และ time_taken เผื่อไว้
$duration = intval($input['duration'] ?? $input['time_taken'] ?? 0); 
$attempts = intval($input['attempts']); // จำนวนครั้งที่ลองผิด

try {
    // 3. ดึงข้อมูลคู่หู (Partner) และบทบาทปัจจุบัน (Role) ของคนที่กำลังกดส่งคะแนน
    $stmt_user = $conn->prepare("SELECT partner_id, current_role FROM users WHERE id = ?");
    $stmt_user->bind_param("i", $user_id);
    $stmt_user->execute();
    $user_data = $stmt_user->get_result()->fetch_assoc();
    
    $partner_id = $user_data['partner_id'];
    $role = $user_data['current_role']; // 'navigator' หรือ 'driver'

    // 4. บันทึก/อัปเดตคะแนนลงตาราง `progress` ให้ทั้งตัวเองและคู่หู
    $sql_progress = "INSERT INTO progress (user_id, stage_id, score, duration_seconds, attempts, completed_at) 
                     VALUES (?, ?, ?, ?, ?, NOW())
                     ON DUPLICATE KEY UPDATE 
                     score = GREATEST(score, VALUES(score)), 
                     duration_seconds = VALUES(duration_seconds),
                     attempts = VALUES(attempts),
                     completed_at = NOW()";
    $stmt_prog = $conn->prepare($sql_progress);

    // 4.1 บันทึกคะแนนให้ตัวเอง
    $stmt_prog->bind_param("iiiii", $user_id, $stage_id, $score, $duration, $attempts);
    $stmt_prog->execute();

    // 4.2 บันทึกคะแนนให้คู่หู (ถ้ามีการจับคู่ไว้)
    if ($partner_id) {
        $stmt_prog->bind_param("iiiii", $partner_id, $stage_id, $score, $duration, $attempts);
        $stmt_prog->execute();
    }

    // 5. บันทึก Log การเล่น (ระบุบทบาทไว้สำหรับใช้วิเคราะห์ผล PA)
    $action = ($score > 0) ? 'pass' : 'fail';
    
    // Log ของตัวเอง
    $detail_self = "Score: $score, Time: $duration s, Attempts: $attempts, Role: $role";
    $sql_log = "INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES (?, ?, ?, ?)";
    $stmt_log = $conn->prepare($sql_log);
    $stmt_log->bind_param("iiss", $user_id, $stage_id, $action, $detail_self);
    $stmt_log->execute();
    
    // Log ของคู่หู (สลับบทบาทใน Log ให้ถูกต้อง)
    if ($partner_id) {
        $partner_role = ($role === 'navigator') ? 'driver' : 'navigator';
        $detail_partner = "Score: $score, Time: $duration s, Attempts: $attempts, Role: $partner_role";
        $stmt_log->bind_param("iiss", $partner_id, $stage_id, $action, $detail_partner);
        $stmt_log->execute();
    }

    // ส่ง success เป็น true กลับไปให้ JavaScript ทำงานต่อ
    echo json_encode(['status' => 'success', 'success' => true, 'message' => 'Score saved for pair!']);

} catch (Exception $e) {
    error_log($e->getMessage()); // เก็บ error ลง log ของ server
    echo json_encode(['status' => 'error', 'success' => false, 'message' => 'Database error']);
}
?>