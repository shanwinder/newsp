<?php
// api/submit_score.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';

// 1. ตรวจสอบสิทธิ์ (ต้อง Login)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

// 2. รับข้อมูล JSON ที่ส่งมาจากเกม (JS)
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid Input']);
    exit();
}

$user_id = $_SESSION['user_id'];
$stage_id = intval($input['stage_id']);
$score = intval($input['score']); // จำนวนดาว (1-3)
$duration = intval($input['duration']); // เวลาที่ใช้ (วินาที)
$attempts = intval($input['attempts']); // จำนวนครั้งที่ลองผิด

// 3. บันทึก/อัปเดตคะแนนลงตาราง `progress`
// ใช้ ON DUPLICATE KEY UPDATE: ถ้ามีคะแนนเก่า ให้เช็คว่าคะแนนใหม่ดีกว่าไหม? (ถ้าเท่ากันให้เอาอันล่าสุด)
$sql = "INSERT INTO progress (user_id, stage_id, score, duration_seconds, attempts, completed_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE 
        score = GREATEST(score, VALUES(score)), 
        duration_seconds = VALUES(duration_seconds),
        attempts = VALUES(attempts),
        completed_at = NOW()";

try {
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiiii", $user_id, $stage_id, $score, $duration, $attempts);
    $stmt->execute();

    // 4. (Optional) บันทึก Log การเล่นละเอียดลง `game_logs`
    $action = ($score > 0) ? 'pass' : 'fail';
    $detail = "Score: $score, Time: $duration s, Attempts: $attempts";
    $conn->query("INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES ($user_id, $stage_id, '$action', '$detail')");

    echo json_encode(['status' => 'success', 'message' => 'Score saved!']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
