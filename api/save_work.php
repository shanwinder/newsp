<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

function respond_error($message) {
    echo json_encode(['success' => false, 'message' => $message, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit();
}

function validate_smart_farm_work($items) {
    if (!is_array($items)) {
        respond_error('ข้อมูลด่านบทที่ 3 ไม่ถูกต้อง');
    }

    if (($items['project_type'] ?? '') !== 'smart_farm_mini_game') {
        respond_error('บทที่ 3 ต้องส่งงานในรูปแบบ Smart Farm Mini Game เท่านั้น');
    }

    $logicType = $items['logic_type'] ?? '';
    $allowedLogicTypes = ['if', 'if_else', 'if_else_if_else'];
    if (!in_array($logicType, $allowedLogicTypes, true)) {
        respond_error('ชนิดเกมของบทที่ 3 ไม่ถูกต้อง');
    }

    if (trim($items['title'] ?? '') === '') {
        respond_error('กรุณาตั้งชื่อด่านก่อนส่งงาน');
    }

    if (trim($items['mission'] ?? '') === '') {
        respond_error('กรุณาเขียนภารกิจก่อนส่งงาน');
    }

    if (trim($items['instruction'] ?? '') === '') {
        respond_error('กรุณาเขียนคำแนะนำก่อนเล่นก่อนส่งงาน');
    }

    if (empty($items['testResult']['tested'])) {
        respond_error('กรุณาทดลองเล่นด่านก่อนส่งงาน');
    }

    $workItems = $items['items'] ?? null;
    if (!is_array($workItems) || count($workItems) === 0) {
        respond_error('กรุณาเลือกวัตถุบนสายพานก่อนส่งงาน');
    }

    $rules = $items['rules'] ?? null;
    if (!is_array($rules) || count($rules) === 0) {
        respond_error('กรุณาสร้างกฎของด่านก่อนส่งงาน');
    }

    $branchCounts = ['if' => 0, 'else_if' => 0, 'else' => 0, 'pass_through' => 0];
    $decoyCount = 0;
    foreach ($workItems as $workItem) {
        if (!is_array($workItem)) {
            respond_error('รายการวัตถุในด่านมีรูปแบบไม่ถูกต้อง');
        }
        if (empty($workItem['correctResult']) && empty($workItem['correctAction'])) {
            respond_error('วัตถุทุกชิ้นต้องมีปลายทางที่ถูกต้อง');
        }
        $branch = $workItem['expectedRuleBranch'] ?? null;
        if (!$branch) {
            respond_error('วัตถุทุกชิ้นต้องระบุ branch ที่ควรเข้า');
        }
        if (!array_key_exists($branch, $branchCounts)) {
            respond_error('branch ของวัตถุไม่ถูกต้อง');
        }
        $branchCounts[$branch]++;
        if (!empty($workItem['isDecoy'])) {
            $decoyCount++;
        }
    }

    if ($logicType === 'if') {
        if (($items['mode'] ?? '') !== 'single_action_if') {
            respond_error('เกม If ต้องใช้โหมด Single-Action If');
        }

        $defaultBehavior = $items['default_behavior'] ?? $items['defaultBehavior'] ?? [];
        $defaultId = $defaultBehavior['type'] ?? $defaultBehavior['id'] ?? '';
        if ($defaultId !== 'pass_through') {
            respond_error('เกม If ต้องตั้งค่า default behavior เป็นปล่อยผ่านอัตโนมัติ');
        }

        foreach ($rules as $rule) {
            if (($rule['type'] ?? '') === 'else') {
                respond_error('เกม If ไม่ต้องมี Else');
            }
        }

        if ($branchCounts['if'] < 1) {
            respond_error('เกม If ต้องมีวัตถุเข้าเงื่อนไขอย่างน้อย 1 ชิ้น');
        }
        if ($branchCounts['pass_through'] < 2) {
            respond_error('เกม If ต้องมีวัตถุปล่อยผ่านอย่างน้อย 2 ชิ้น');
        }
        if ($decoyCount < 1) {
            respond_error('เกม If ต้องมีตัวหลอกอย่างน้อย 1 ชิ้น');
        }
    }

    if ($logicType === 'if_else') {
        if ($branchCounts['if'] < 2 || $branchCounts['else'] < 2) {
            respond_error('เกม If / Else ต้องมีวัตถุใน branch If และ Else อย่างน้อยฝั่งละ 2 ชิ้น');
        }
        if (!array_filter($rules, fn($rule) => ($rule['type'] ?? '') === 'else')) {
            respond_error('เกม If / Else ต้องมีแถว Else');
        }
    }

    if ($logicType === 'if_else_if_else') {
        if ($branchCounts['if'] < 2 || $branchCounts['else_if'] < 2 || $branchCounts['else'] < 2) {
            respond_error('เกม If / Else If / Else ต้องมีวัตถุครบทั้ง If, Else If และ Else อย่างน้อย branch ละ 2 ชิ้น');
        }
        if (!array_filter($rules, fn($rule) => ($rule['type'] ?? '') === 'else_if')) {
            respond_error('เกม If / Else If / Else ต้องมีแถว Else If');
        }
        if (!array_filter($rules, fn($rule) => ($rule['type'] ?? '') === 'else')) {
            respond_error('เกม If / Else If / Else ต้องมีแถว Else');
        }
    }
}

function validate_smart_farm_debug_work($items) {
    if (!is_array($items)) {
        respond_error('ข้อมูลชิ้นงานบทที่ 4 ไม่ถูกต้อง');
    }

    $allowedProjectTypes = ['smart_farm_debug_challenge', 'smart_farm_debug_lite_challenge'];
    if (!in_array($items['project_type'] ?? '', $allowedProjectTypes, true)) {
        respond_error('บทที่ 4 ต้องส่งงานในรูปแบบ Smart Farm Debug Challenge เท่านั้น');
    }

    $requiredFields = [
        'title' => 'กรุณาตั้งชื่อโจทย์บั๊ก',
        'playtest_note' => 'กรุณาบันทึกผลการทดลองเล่นโจทย์'
    ];

    // Lite version uses different fields
    if (($items['project_type'] ?? '') === 'smart_farm_debug_lite_challenge') {
        $requiredFields['theme'] = 'กรุณาเลือกธีมฟาร์ม';
        $requiredFields['problemText'] = 'กรุณาเขียนอาการเสีย';
        $requiredFields['bugTarget'] = 'กรุณาระบุจุดผิด';
        $requiredFields['correctFix'] = 'กรุณาเขียนวิธีซ่อม';
    } else {
        $requiredFields['system_theme'] = 'กรุณาเลือกระบบฟาร์ม';
        $requiredFields['bug_type'] = 'กรุณาระบุประเภทบั๊ก';
        $requiredFields['correct_rules'] = 'กรุณาเขียนกฎที่ถูกต้อง';
        $requiredFields['buggy_rules'] = 'กรุณาเขียนกฎที่ใส่บั๊ก';
        $requiredFields['symptom'] = 'กรุณาเขียนอาการที่ผู้เล่นจะเห็น';
        $requiredFields['bug_targets'] = 'กรุณาระบุจุดที่เป็นบั๊ก';
        $requiredFields['fix_explanation'] = 'กรุณาอธิบายวิธีแก้และเหตุผล';
    }

    foreach ($requiredFields as $field => $message) {
        if (trim($items[$field] ?? '') === '') {
            respond_error($message);
        }
    }
}

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    $user_id = $_SESSION['user_id'];
    $game_id = intval($data['game_id']);
    $items = $data['items'] ?? null;
    if ($game_id === 3) {
        validate_smart_farm_work($items);
    }
    if ($game_id === 4) {
        validate_smart_farm_debug_work($items);
    }
    $work_data = json_encode($data['items'], JSON_UNESCAPED_UNICODE); // แปลง Array กลับเป็น JSON String
    $desc = $data['description'];
    $status = 'submitted';
    $context = session_context();

    // เช็คว่าเคยส่งหรือยัง ถ้าเคยแล้วให้ Update แทน Insert
    $check = $conn->prepare("SELECT id FROM student_works WHERE user_id = ? AND game_id = ? AND learning_session_id = ?");
    $check->bind_param("iii", $user_id, $game_id, $context['learning_session_id']);
    $check->execute();
    $existing = $check->get_result();
    
    if ($existing->num_rows > 0) {
        $stmt = $conn->prepare("UPDATE student_works SET work_data = ?, description = ?, status = ?, submitted_at = NOW()
                WHERE user_id = ? AND game_id = ? AND learning_session_id = ?");
        $stmt->bind_param("sssiii", $work_data, $desc, $status, $user_id, $game_id, $context['learning_session_id']);
    } else {
        $stmt = $conn->prepare("INSERT INTO student_works (user_id, game_id, work_data, description, status, school_id, classroom_id, teacher_id, learning_session_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param(
            "iisssiiii",
            $user_id,
            $game_id,
            $work_data,
            $desc,
            $status,
            $context['school_id'],
            $context['classroom_id'],
            $context['teacher_id'],
            $context['learning_session_id']
        );
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $conn->error]);
    }
} else {
    respond_error('ไม่พบข้อมูลที่ต้องการบันทึก');
}
?>
