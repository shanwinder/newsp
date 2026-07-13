<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

$work_id = intval($_GET['work_id'] ?? 0);
$context = session_context();
$error = '';
$work = null;
$workData = null;
$projectType = '';

if ($work_id <= 0) {
    $error = 'ไม่พบรหัสผลงานที่ต้องการเล่น';
} else {
    $stmt = $conn->prepare("
        SELECT sw.id, sw.user_id, sw.work_data, sw.description, sw.status, sw.submitted_at,
               u.name AS student_name, u.student_id, u.mode, u.group_number, u.team_id,
               (SELECT GROUP_CONCAT(name SEPARATOR ', ')
                FROM users
                WHERE team_id = u.team_id AND classroom_id = u.classroom_id) AS member_names
        FROM student_works sw
        JOIN users u ON sw.user_id = u.user_id
        WHERE sw.id = ?
          AND sw.game_id = 4
          AND sw.status IN ('submitted', 'reviewed')
          AND sw.school_id = ?
          AND sw.classroom_id = ?
          AND sw.learning_session_id = ?
        LIMIT 1
    ");
    $stmt->bind_param(
        "iiii",
        $work_id,
        $context['school_id'],
        $context['classroom_id'],
        $context['learning_session_id']
    );
    $stmt->execute();
    $work = $stmt->get_result()->fetch_assoc();

    if (!$work) {
        $error = 'ไม่พบโจทย์นี้ หรือคุณไม่มีสิทธิ์เข้าถึงผลงานนี้';
    } else {
        $decoded = json_decode($work['work_data'], true);
        $projectType = $decoded['project_type'] ?? '';
        $allowedTypes = ['smart_farm_debug_lite_challenge', 'smart_farm_debug_mode', 'smart_farm_debug_challenge'];
        if (!is_array($decoded) || !in_array($projectType, $allowedTypes, true)) {
            $error = 'ผลงานนี้ไม่ใช่โจทย์ซ่อมกฎฟาร์ม';
        } elseif (empty($decoded['tested'])) {
            $error = 'โจทย์นี้ยังไม่ผ่านการทดลองเล่นจากผู้ออกแบบ';
        } else {
            $workData = $decoded;
        }
    }
}

$isDebugMode = ($projectType === 'smart_farm_debug_mode');
$isLite = ($projectType === 'smart_farm_debug_lite_challenge');

$ownerName = '';
if ($work) {
    if (($work['mode'] ?? '') === 'group') {
        $ownerName = 'กลุ่มที่ ' . ($work['group_number'] ?? '-');
    } else {
        $ownerName = $work['student_name'] ?? 'นักเรียน';
    }
}
$isOwnWork = $work && intval($work['user_id']) === intval($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>เล่นโจทย์ซ่อมกฎของเพื่อน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">



    <?php if ($isDebugMode): ?>


    <?php else: ?>

    <?php endif; ?>

<?php
$page_styles = array (
  0 => 'games/conveyor_logic.css',
  1 => 'games/smart_farm_debugger.css',
  2 => 'games/smart_farm_debugger_lite.css',
  3 => 'games/play_debug_work.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page play-debug-work-page debugger-game">
    <div class="play-header">
        <div class="container-fluid px-lg-5">
            <a href="showcase.php?game_id=4" class="btn btn-light btn-sm rounded-pill mb-3">
                <i class="bi bi-arrow-left"></i> กลับลานโชว์ผลงาน
            </a>
            <h1 class="fw-bold mb-1"><i class="bi bi-wrench-adjustable me-2"></i> เล่นโจทย์ซ่อมกฎของเพื่อน</h1>
            <p class="fs-5 opacity-75 mb-0">ซ่อมกฎฟาร์มอัจฉริยะ: ทดสอบระบบ หาจุดผิด ซ่อม แล้วลองใหม่</p>
        </div>
    </div>

    <div class="container-fluid px-lg-5 py-4">
        <?php if ($error): ?>
            <div class="play-panel p-4 text-center">
                <i class="bi bi-exclamation-triangle-fill text-warning display-5"></i>
                <h4 class="fw-bold mt-3">ยังเปิดโจทย์นี้ไม่ได้</h4>
                <p class="text-muted mb-4"><?php echo htmlspecialchars($error); ?></p>
                <a href="showcase.php?game_id=4" class="btn btn-warning rounded-pill px-4 fw-bold">กลับลานโชว์ผลงาน</a>
            </div>
        <?php else: ?>
            <div class="row g-3 mb-3">
                <div class="col-lg-8">
                    <div class="play-panel p-3 h-100">
                        <div class="d-flex flex-wrap gap-2 mb-2">
                            <?php if ($isDebugMode): ?>
                                <span class="badge text-bg-danger rounded-pill px-3 py-2">โหมดซ่อมกฎ</span>
                                <span class="badge text-bg-light text-secondary border rounded-pill px-3 py-2"><?php echo htmlspecialchars($workData['logic_type'] ?? 'condition'); ?></span>
                            <?php else: ?>
                                <span class="badge text-bg-warning rounded-pill px-3 py-2"><?php echo htmlspecialchars($workData['themeLabel'] ?? 'ฟาร์ม'); ?></span>
                                <span class="badge text-bg-light text-secondary border rounded-pill px-3 py-2"><?php echo htmlspecialchars($workData['bugTarget'] ?? 'หาจุดผิด'); ?></span>
                            <?php endif; ?>
                        </div>
                        <h3 class="fw-bold mb-1"><?php echo htmlspecialchars($workData['title'] ?? 'โจทย์ซ่อมกฎฟาร์ม'); ?></h3>
                        <h5 class="fw-bold text-warning-emphasis mb-2">ผลงานของ: <?php echo htmlspecialchars($ownerName); ?></h5>
                        <?php if ($isOwnWork): ?>
                            <div class="alert alert-info py-2 mb-2">คุณกำลังลองเล่นโจทย์ของตนเอง</div>
                        <?php elseif (($work['mode'] ?? '') === 'group'): ?>
                            <div class="small text-muted mb-2">สมาชิกทีม: <?php echo htmlspecialchars($work['member_names'] ?? '-'); ?></div>
                        <?php endif; ?>
                        <div class="text-secondary"><?php echo htmlspecialchars($workData['problemText'] ?? $workData['problem'] ?? $workData['mission'] ?? ''); ?></div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="play-panel p-3 h-100">
                        <h5 class="fw-bold mb-2"><i class="bi bi-flag-fill text-warning"></i> เป้าหมายของคุณ</h5>
                        <p class="mb-0">ดูอาการเสีย เลือกจุดผิด เลือกวิธีซ่อม แล้วทดสอบให้ระบบฟาร์มกลับมาถูกต้อง</p>
                    </div>
                </div>
            </div>

            <div id="debug-work-player" class="play-panel p-3 p-lg-4"></div>
        <?php endif; ?>
    </div>

    <?php if ($isDebugMode): ?>
        <script src="../assets/js/logic_game/conveyor_logic_base.js"></script>
        <script src="../assets/js/logic_game/conveyor_drag_drop.js"></script>
        <script src="../assets/js/logic_game/conveyor_debug_mode.js"></script>
    <?php else: ?>
        <script src="../assets/js/logic_game/debug_challenge_preview.js"></script>
        <script src="../assets/js/logic_game/smart_farm_debugger_lite.js"></script>
    <?php endif; ?>
    <?php if (!$error): ?>
    <script>
        const WORK_ID = <?php echo intval($work_id); ?>;
        const WORK_DATA = <?php echo json_encode($workData, JSON_UNESCAPED_UNICODE); ?>;
        const IS_DEBUG_MODE = <?php echo $isDebugMode ? 'true' : 'false'; ?>;
        window.STAGE_ID = 12;
        window.GAME_ID = 4;
        window.sendResult = function (stageId, score, duration, attempts, detail) {
            fetch('../api/log_debug_work_play.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    work_id: WORK_ID,
                    stage_id: stageId,
                    score,
                    duration,
                    attempts,
                    bug_type: IS_DEBUG_MODE ? (WORK_DATA.bug_type || '') : (WORK_DATA.bugTarget || ''),
                    detail: detail || null
                })
            }).catch(() => {});
        };
        const mount = document.getElementById('debug-work-player');
        const inner = document.createElement('div');
        inner.id = 'game-container';
        mount.appendChild(inner);

        if (IS_DEBUG_MODE) {
            // Conveyor Debug Mode engine
            const gameConfig = {
                title: WORK_DATA.title || 'โจทย์ซ่อมกฎฟาร์มของเพื่อน',
                subtitle: 'สังเกตอาการ หาจุดผิด ซ่อม แล้วลองใหม่',
                levels: [{
                    levelId: 'friend-debug',
                    title: WORK_DATA.title || 'ซ่อมกฎฟาร์ม',
                    theme: WORK_DATA.theme || 'farm',
                    lessonType: WORK_DATA.logic_type || 'if_else',
                    lessonTypeLabel: WORK_DATA.logic_type === 'if' ? 'If' : (WORK_DATA.logic_type === 'if_else_if_else' ? 'If / Else If / Else' : 'If / Else'),
                    bugType: WORK_DATA.bug_type || 'wrong_action',
                    debugGoal: WORK_DATA.mission || WORK_DATA.problem || 'ตรวจจุดผิดและซ่อมกฎ',
                    intro: WORK_DATA.problem || 'กดทดสอบกฎเดิมเพื่อดูอาการผิดปกติ',
                    brokenLogic: WORK_DATA.broken_rules || [],
                    expectedLogic: WORK_DATA.fixed_rules || [],
                    conditions: WORK_DATA.conditions || [],
                    actions: WORK_DATA.actions || [],
                    machines: WORK_DATA.machines || [],
                    itemQueue: WORK_DATA.items || [],
                    allowReorder: WORK_DATA.logic_type === 'if_else_if_else',
                    suspiciousBlocks: WORK_DATA.suspicious_blocks || [],
                    debugReport: WORK_DATA.debug_report || {},
                    defaultBehavior: WORK_DATA.default_behavior || WORK_DATA.defaultBehavior || null,
                    logicType: WORK_DATA.logic_type || 'if_else',
                    mode: WORK_DATA.mode || null,
                    toolboxDecoys: WORK_DATA.toolbox_decoys || WORK_DATA.toolboxDecoys || null
                }]
            };
            window.FarmMissions.conveyorDebugMode(gameConfig);
        } else {
            // Lite engine (original)
            window.FarmMissions.smartFarmDebuggerLite(window.DebugChallengePreview.workDataToConfig(WORK_DATA));
        }
    </script>
    <?php endif; ?>
</body>
</html>
