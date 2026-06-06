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
          AND sw.game_id = 3
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
        $error = 'ไม่พบด่านนี้ หรือคุณไม่มีสิทธิ์เข้าถึงผลงานนี้';
    } else {
        $decoded = json_decode($work['work_data'], true);
        if (!is_array($decoded) || ($decoded['project_type'] ?? '') !== 'smart_farm_mini_game') {
            $error = 'ผลงานนี้ไม่ใช่ Smart Farm Mini Game';
        } elseif (empty($decoded['testResult']['tested'])) {
            $error = 'ด่านนี้ยังไม่ผ่านการทดลองเล่นจากผู้ออกแบบ';
        } else {
            $workData = $decoded;
        }
    }
}

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
    <title>เล่นด่านฟาร์มของเพื่อน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../assets/css/conveyor_logic.css">
    <link rel="stylesheet" href="../assets/css/smart_farm_builder.css">
    <style>
        body { font-family: 'Kanit', sans-serif; background:#eef7f1; color:#163025; min-height:100vh; }
        .play-header { background: linear-gradient(135deg, #126d56 0%, #2f8f62 100%); color:#fff; padding:28px 0 24px; }
        .play-panel { background:#fff; border:1px solid #d8e6dc; border-radius:8px; box-shadow:0 12px 28px rgba(22,48,37,.08); }
    </style>
</head>

<body>
    <div class="play-header">
        <div class="container-fluid px-lg-5">
            <a href="showcase.php?game_id=3" class="btn btn-light btn-sm rounded-pill mb-3">
                <i class="bi bi-arrow-left"></i> กลับลานโชว์ผลงาน
            </a>
            <h1 class="fw-bold mb-1"><i class="bi bi-controller me-2"></i> เล่นด่านฟาร์มของเพื่อน</h1>
            <p class="fs-5 opacity-75 mb-0">บทที่ 3: Smart Farm Mini Game Builder</p>
        </div>
    </div>

    <div class="container-fluid px-lg-5 py-4">
        <?php if ($error): ?>
            <div class="play-panel p-4 text-center">
                <i class="bi bi-exclamation-triangle-fill text-warning display-5"></i>
                <h4 class="fw-bold mt-3">ยังเปิดด่านนี้ไม่ได้</h4>
                <p class="text-muted mb-4"><?php echo htmlspecialchars($error); ?></p>
                <a href="showcase.php?game_id=3" class="btn btn-success rounded-pill px-4 fw-bold">กลับลานโชว์ผลงาน</a>
            </div>
        <?php else: ?>
            <div class="row g-3 mb-3">
                <div class="col-lg-8">
                    <div class="play-panel p-3 h-100">
                        <div class="d-flex flex-wrap gap-2 mb-2">
                            <span class="badge text-bg-success rounded-pill px-3 py-2"><?php echo htmlspecialchars($workData['themeLabel'] ?? 'ฟาร์มอัจฉริยะ'); ?></span>
                            <span class="badge text-bg-light text-secondary border rounded-pill px-3 py-2"><?php echo htmlspecialchars($workData['logic_type'] ?? 'condition'); ?></span>
                        </div>
                        <h3 class="fw-bold mb-1"><?php echo htmlspecialchars($workData['title'] ?? 'ด่านฟาร์มอัจฉริยะ'); ?></h3>
                        <h5 class="fw-bold text-success mb-2">ผลงานของ: <?php echo htmlspecialchars($ownerName); ?></h5>
                        <?php if ($isOwnWork): ?>
                            <div class="alert alert-info py-2 mb-2">คุณกำลังลองเล่นด่านของตนเอง</div>
                        <?php elseif (($work['mode'] ?? '') === 'group'): ?>
                            <div class="small text-muted mb-2">สมาชิกทีม: <?php echo htmlspecialchars($work['member_names'] ?? '-'); ?></div>
                        <?php endif; ?>
                        <div class="text-secondary" style="white-space: pre-wrap;"><?php echo htmlspecialchars($workData['mission'] ?? ''); ?></div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="play-panel p-3 h-100">
                        <h5 class="fw-bold mb-2"><i class="bi bi-flag-fill text-success"></i> เป้าหมายของคุณ</h5>
                        <p class="mb-0"><?php echo htmlspecialchars($workData['instruction'] ?? 'สังเกตคุณสมบัติของวัตถุ แล้วดูว่ากฎของผู้ออกแบบส่งไปปลายทางถูกต้องหรือไม่'); ?></p>
                    </div>
                </div>
            </div>

            <div id="smart-farm-player" class="play-panel p-3 p-lg-4"></div>
        <?php endif; ?>
    </div>

    <div class="modal fade" id="itemDetailModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title fw-bold" id="item-detail-title">รายละเอียดวัตถุ</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="item-detail-body"></div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_validation.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_preview.js"></script>
    <?php if (!$error): ?>
    <script>
        const WORK_DATA = <?php echo json_encode($workData, JSON_UNESCAPED_UNICODE); ?>;
        function escapeHtml(value) {
            return String(value ?? '').replace(/[&<>"']/g, (char) => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char]));
        }
        function showItemDetail(item, showAnswers, data) {
            const defaultBehavior = data.default_behavior || data.defaultBehavior || { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ' };
            const expected = item.correctResult || item.correctAction;
            const action = (data.actions || []).find((entry) => entry.id === expected);
            const actionLabel = expected === (defaultBehavior.type || defaultBehavior.id || 'pass_through')
                ? defaultBehavior.label
                : (action ? action.label : expected);
            document.getElementById('item-detail-title').textContent = item.label;
            document.getElementById('item-detail-body').innerHTML = `
                <div class="text-center display-4 mb-2">${escapeHtml(item.fallbackIcon || '🌱')}</div>
                <div class="detail-props">
                    ${(item.propsDisplay || []).map((prop) => `<span>${escapeHtml(prop)}</span>`).join('')}
                </div>
                <p class="mb-2"><strong>ก่อนเล่น:</strong> ${item.isDecoy ? 'วัตถุนี้อาจเป็นตัวหลอก ลองสังเกตให้ดี' : 'ลองดูว่าเข้าเงื่อนไขใด'}</p>
                ${showAnswers ? `
                    <hr>
                    <p class="mb-2"><strong>ผลลัพธ์ที่ถูกต้อง:</strong> ${escapeHtml(actionLabel)}</p>
                    <p class="mb-0 text-secondary">${escapeHtml(item.explain || '')}</p>
                ` : '<p class="mb-0 text-secondary">เฉลยปลายทางจะแสดงหลังเล่นจบ</p>'}
            `;
            new bootstrap.Modal(document.getElementById('itemDetailModal')).show();
        }
        window.SmartFarmBuilderPreview.createPlayer('smart-farm-player', WORK_DATA, { onInspect: showItemDetail });
    </script>
    <?php endif; ?>
</body>
</html>
