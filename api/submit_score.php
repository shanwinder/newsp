<?php
// api/submit_score.php
header('Content-Type: application/json');
session_start();
require_once '../includes/db.php';

// 1. ตรวจสอบสิทธิ์
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// 2. รับข้อมูล JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid Input']);
    exit();
}

$primary_user_id = $_SESSION['user_id'];
$pair_id = $_SESSION['pair_id'] ?? null;
$stage_id = intval($input['stage_id']);
$score = intval($input['score'] ?? 0);
$duration = intval($input['time_taken'] ?? $input['duration'] ?? 0); // ⚠️ แก้บั๊ก Frontend กับ Backend ชื่อตัวแปรไม่ตรงกัน
$attempts = intval($input['attempts'] ?? 0);

// 3. หารายชื่อคนที่จะได้คะแนน (ถ้ามีคู่ก็ดึงมา 2 คน, ถ้าลุยเดี่ยวก็ดึงคนเดียว)
$users_to_update = [$primary_user_id];
if ($pair_id) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE pair_id = ? AND id != ?");
    $stmt->bind_param("ii", $pair_id, $primary_user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $users_to_update[] = $row['id'];
    }
    $stmt->close();
}

// 4. บันทึกคะแนนให้ทุกคนในกลุ่มด้วย Transaction เพื่อป้องกันข้อผิดพลาด
$conn->begin_transaction();
try {
    $sql = "INSERT INTO progress (user_id, stage_id, score, duration_seconds, attempts, completed_at) 
            VALUES (?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
            score = GREATEST(score, VALUES(score)), 
            duration_seconds = VALUES(duration_seconds),
            attempts = VALUES(attempts),
            completed_at = NOW()";
    $stmt = $conn->prepare($sql);

    foreach ($users_to_update as $uid) {
        // บันทึกตาราง progress
        $stmt->bind_param("iiiii", $uid, $stage_id, $score, $duration, $attempts);
        $stmt->execute();

        // บันทึกตาราง game_logs แยกรายบุคคล
        $action = ($score > 0) ? 'pass' : 'fail';
        $detail = "Score: $score, Time: $duration s, Attempts: $attempts";
        $conn->query("INSERT INTO game_logs (user_id, stage_id, action, detail) VALUES ($uid, $stage_id, '$action', '$detail')");
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Score saved for pair!']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
