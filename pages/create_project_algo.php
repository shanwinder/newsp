<?php
// pages/create_project_algo.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$game_id = 2;
$user_id = intval($_SESSION['user_id']);
$context = session_context();
$existingData = null;
$existingDesc = '';
$revisionFeedback = null;

$stmt = $conn->prepare("SELECT * FROM student_works WHERE user_id = ? AND game_id = ? AND learning_session_id = ? LIMIT 1");
$stmt->bind_param("iii", $user_id, $game_id, $context['learning_session_id']);
$stmt->execute();
$work = $stmt->get_result()->fetch_assoc();
if ($work) {
    $decoded = json_decode($work['work_data'], true);
    $existingData = is_array($decoded) ? $decoded : null;
    $existingDesc = preg_replace('/^\[ประเภทภารกิจ:\s*.*?\]\s*/u', '', $work['description'] ?? '');
    if (($work['status'] ?? '') === 'revision') {
        $revisionFeedback = $work['feedback'] ?? '';
    }
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>สตูดิโอออกแบบเส้นทางรถไถ - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #eef6ff;
            min-height: 100vh;
            color: #172033;
        }

        .studio-header {
            background: linear-gradient(135deg, #0f766e 0%, #2563eb 100%);
            color: #fff;
            padding: 28px 0 24px;
        }

        .studio-panel {
            background: #fff;
            border: 1px solid #dbe7f3;
            border-radius: 8px;
            box-shadow: 0 16px 36px rgba(15, 23, 42, .08);
        }

        .tool-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
        }

        .tool-button {
            min-height: 78px;
            border: 2px solid #dbe7f3;
            border-radius: 8px;
            background: #f8fbff;
            transition: border-color .15s, background .15s, transform .15s;
        }

        .tool-button:hover:not(:disabled),
        .tool-button.active {
            border-color: #2563eb;
            background: #eff6ff;
            transform: translateY(-1px);
        }

        .tool-button:disabled {
            opacity: .45;
            cursor: not-allowed;
        }

        .tool-button.tool-erase {
            grid-column: 1 / -1;
            border-color: #ef4444;
            background: #fff1f2;
            color: #991b1b;
        }

        .tool-button.tool-erase:hover:not(:disabled),
        .tool-button.tool-erase.active {
            border-color: #dc2626;
            background: #fee2e2;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, .12);
            transform: translateY(-1px);
        }

        .tool-button.tool-erase .erase-label {
            font-weight: 800;
        }

        .tool-button.tool-erase .erase-help {
            font-size: .75rem;
            color: #b91c1c;
        }

        .tool-button.tool-erase .count-badge {
            display: none;
        }

        #selected-tool-label.erase-mode {
            background: #dc2626 !important;
            color: #ffffff !important;
        }

        #phaser-canvas,
        #phaser-canvas canvas {
            touch-action: pan-y;
        }

        #phaser-canvas {
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: #f8fafc;
            border: 1px solid #dbe7f3;
            border-radius: 8px;
        }

        #phaser-canvas canvas {
            width: min(540px, 100%) !important;
            height: auto !important;
            display: block;
            image-rendering: auto;
        }

        .command-zone {
            min-height: 120px;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            gap: 8px;
            padding: 10px;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            background: #f8fafc;
        }

        .command-chip {
            width: 42px;
            height: 42px;
            border: 0;
            border-radius: 8px;
            background: #2563eb;
            color: #fff;
            font-size: 22px;
            box-shadow: 0 4px 10px rgba(37, 99, 235, .25);
        }

        .mission-tabs .btn {
            border-radius: 999px;
        }

        .count-badge {
            font-size: .78rem;
        }

        .studio-checklist {
            border: 1px solid #dbe7f3;
        }

        .check-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
        }

        .check-item.done {
            color: #15803d;
            font-weight: 600;
        }

        .check-item.missing {
            color: #b91c1c;
            font-weight: 600;
        }
    </style>
</head>

<body>
    <div class="studio-header">
        <div class="container-fluid px-lg-5">
            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-light btn-sm rounded-pill mb-3">
                <i class="bi bi-arrow-left"></i> กลับหน้าเลือกด่าน
            </a>
            <h1 class="fw-bold mb-1"><i class="bi bi-signpost-2-fill me-2"></i> สตูดิโอออกแบบเส้นทางรถไถ</h1>
            <p class="fs-5 opacity-75 mb-0">สร้างโจทย์ลำดับคำสั่งที่รถไถวิ่งได้จริง ทดสอบให้ผ่าน แล้วส่งให้คุณครูตรวจ</p>
        </div>
    </div>

    <div class="container-fluid px-lg-5 py-4">
        <?php if ($revisionFeedback): ?>
            <div class="alert alert-warning border-0 shadow-sm rounded-3">
                <h5 class="fw-bold"><i class="bi bi-arrow-return-left"></i> คุณครูส่งงานกลับให้แก้ไข</h5>
                <p class="mb-0"><?php echo htmlspecialchars($revisionFeedback); ?></p>
            </div>
        <?php endif; ?>

        <div class="studio-panel p-3 p-lg-4">
            <div class="row g-3">
                <div class="col-xl-3 col-lg-4 order-2 order-xl-1">
                    <div class="h-100 d-flex flex-column gap-3">
                        <div>
                            <h5 class="fw-bold mb-2"><i class="bi bi-flag-fill text-primary"></i> ประเภทภารกิจ</h5>
                            <div class="mission-tabs d-grid gap-2">
                                <button class="btn btn-outline-primary mission-button" data-mission="target">🧺 ไปถึงจุดหมาย</button>
                                <button class="btn btn-outline-primary mission-button" data-mission="obstacle">🌾 หลบสิ่งกีดขวาง</button>
                                <button class="btn btn-outline-primary mission-button" data-mission="harvest">🌽 เก็บเกี่ยวผลผลิต</button>
                            </div>
                        </div>

                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="fw-bold mb-0"><i class="bi bi-tools text-primary"></i> เครื่องมือ</h5>
                                <span id="selected-tool-label" class="badge text-bg-primary rounded-pill">รถไถ</span>
                            </div>
                            <div class="tool-grid" id="toolbox"></div>
                        </div>

                        <div class="alert alert-info small mb-0">
                            คลิกเครื่องมือ แล้วคลิกช่องในแผนที่เพื่อวางวัตถุ ช่องหนึ่งวางได้หนึ่งอย่างเท่านั้น
                        </div>
                    </div>
                </div>

                <div class="col-xl-6 col-lg-8 order-1 order-xl-2">
                    <div class="d-flex justify-content-between flex-wrap gap-2 align-items-center mb-2">
                        <h5 class="fw-bold mb-0"><i class="bi bi-grid-3x3-gap-fill text-success"></i> กระดานแผนที่ 6 x 5</h5>
                        <span id="validation-badge" class="badge text-bg-secondary rounded-pill px-3 py-2">ยังไม่ได้ทดสอบ</span>
                    </div>
                    <div id="phaser-canvas"></div>
                    <div id="feedback-box" class="alert alert-info mt-3 mb-0 rounded-3">เริ่มจากวางรถไถและเป้าหมายบนแผนที่</div>
                </div>

                <div class="col-xl-3 order-3">
                    <div class="h-100 d-flex flex-column gap-3">
                        <div>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="fw-bold mb-0"><i class="bi bi-arrow-repeat text-primary"></i> คำสั่งเฉลย</h5>
                                <span id="command-count" class="badge text-bg-secondary rounded-pill">0 / 15</span>
                            </div>
                            <div id="command-zone" class="command-zone mb-2">
                                <span class="text-muted small">กดปุ่มลูกศรเพื่อเพิ่มคำสั่ง</span>
                            </div>
                            <div class="row g-2 mb-2">
                                <div class="col-3"><button class="btn btn-outline-primary w-100 fw-bold command-add" data-dir="UP">⬆️</button></div>
                                <div class="col-3"><button class="btn btn-outline-primary w-100 fw-bold command-add" data-dir="DOWN">⬇️</button></div>
                                <div class="col-3"><button class="btn btn-outline-primary w-100 fw-bold command-add" data-dir="LEFT">⬅️</button></div>
                                <div class="col-3"><button class="btn btn-outline-primary w-100 fw-bold command-add" data-dir="RIGHT">➡️</button></div>
                            </div>
                            <div class="d-flex gap-2">
                                <button id="clear-commands" class="btn btn-outline-danger flex-fill fw-bold">ล้างคำสั่ง</button>
                                <button id="test-route" class="btn btn-success flex-fill fw-bold"><i class="bi bi-play-fill"></i> ทดสอบ</button>
                            </div>
                        </div>

                        <div class="studio-checklist rounded-3 p-3 bg-light">
                            <h6 class="fw-bold mb-2">
                                <i class="bi bi-list-check text-primary"></i> เช็กลิสต์ก่อนส่ง
                            </h6>
                            <ul class="list-unstyled small mb-0" id="project-checklist"></ul>
                        </div>

                        <div class="flex-grow-1 d-flex flex-column">
                            <label class="form-label fw-bold"><i class="bi bi-chat-text-fill text-primary"></i> คำอธิบายวิธีคิด</label>
                            <textarea id="thinking-input" class="form-control flex-grow-1" style="min-height: 150px; resize: vertical;" placeholder="อธิบายว่ารถไถเริ่มจากไหน ต้องหลบหรือเก็บอะไร และทำไมลำดับคำสั่งนี้จึงพาไปถึงเป้าหมายได้"><?php echo htmlspecialchars($existingDesc); ?></textarea>
                        </div>

                        <div class="d-grid gap-2">
                            <button id="submit-work" class="btn btn-primary btn-lg rounded-pill fw-bold shadow">
                                <i class="bi bi-cloud-arrow-up-fill me-2"></i> ส่งชิ้นงาน
                            </button>
                            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-light border rounded-pill fw-bold text-secondary">ยกเลิก</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const GAME_ID = <?php echo $game_id; ?>;
        const EXISTING_WORK = <?php echo json_encode($existingData, JSON_UNESCAPED_UNICODE); ?>;
        const GRID = { cols: 6, rows: 5 };
        const MAX_COMMANDS = 15;
        const DIRS = {
            UP: { icon: '⬆️', label: 'ขึ้น', dc: 0, dr: -1 },
            DOWN: { icon: '⬇️', label: 'ลง', dc: 0, dr: 1 },
            LEFT: { icon: '⬅️', label: 'ซ้าย', dc: -1, dr: 0 },
            RIGHT: { icon: '➡️', label: 'ขวา', dc: 1, dr: 0 }
        };
        const USE_EMOJI_ASSETS = true;

        /**
         * TODO:
         * ตอนนี้ใช้ emoji เป็นต้นแบบชั่วคราว เมื่อมีภาพ HD ให้เปลี่ยน helper
         * ให้โหลด tractor.webp, basket.webp, hay.webp, rock.webp, barn.webp, crop.webp แทน
         */
        const ASSET_MAP = {
            start: { emoji: '🚜', label: 'รถไถ', max: 1 },
            target: { emoji: '🧺', label: 'ตะกร้า', max: 1 },
            barn: { emoji: '🏚️', label: 'โรงนา', max: 1 },
            hay: { emoji: '🌾', label: 'กองฟาง', max: 5 },
            rock: { emoji: '🪨', label: 'หิน', max: 5 },
            crop: { emoji: '🌽', label: 'ผลผลิต', max: 3 },
            erase: { emoji: '🧹', label: 'ยางลบ', max: Infinity }
        };

        let sceneRef = null;
        let selectedTool = 'start';
        let missionType = 'target';
        let testPassed = false;
        let isTesting = false;
        let tractorFacing = null;
        let lastTestPath = [];
        let commands = [];
        let objects = {
            start: null,
            target: null,
            barn: null,
            obstacles: [],
            crops: []
        };

        function normalizePoint(point) {
            if (!point) return null;
            return { col: Number.isInteger(point.col) ? point.col : point.c, row: Number.isInteger(point.row) ? point.row : point.r };
        }

        function loadExistingWork() {
            if (!EXISTING_WORK || EXISTING_WORK.project_type !== 'tractor_route') return;
            missionType = EXISTING_WORK.mission_type || 'target';
            objects.start = normalizePoint(EXISTING_WORK.start);
            objects.target = normalizePoint(EXISTING_WORK.target);
            objects.barn = normalizePoint(EXISTING_WORK.barn);
            objects.obstacles = (EXISTING_WORK.obstacles || []).map(item => ({
                col: Number.isInteger(item.col) ? item.col : item.c,
                row: Number.isInteger(item.row) ? item.row : item.r,
                type: item.type || 'hay'
            }));
            objects.crops = (EXISTING_WORK.crops || []).map(item => ({
                col: Number.isInteger(item.col) ? item.col : item.c,
                row: Number.isInteger(item.row) ? item.row : item.r
            }));
            commands = Array.isArray(EXISTING_WORK.commands) ? EXISTING_WORK.commands.filter(cmd => DIRS[cmd]).slice(0, MAX_COMMANDS) : [];
            testPassed = !!EXISTING_WORK.validated;
        }

        function toolAllowed(tool) {
            if (tool === 'erase' || tool === 'start' || tool === 'hay' || tool === 'rock') return true;
            if (tool === 'target') return missionType !== 'harvest';
            if (tool === 'barn' || tool === 'crop') return missionType === 'harvest';
            return false;
        }

        function countTool(tool) {
            if (tool === 'start') return objects.start ? 1 : 0;
            if (tool === 'target') return objects.target ? 1 : 0;
            if (tool === 'barn') return objects.barn ? 1 : 0;
            if (tool === 'hay' || tool === 'rock') return objects.obstacles.filter(item => item.type === tool).length;
            if (tool === 'crop') return objects.crops.length;
            return 0;
        }

        function updateSelectedToolLabel(key) {
            const asset = ASSET_MAP[key] || ASSET_MAP.start;
            const selectedLabel = document.getElementById('selected-tool-label');
            selectedLabel.textContent = key === 'erase' ? 'โหมดลบวัตถุ' : asset.label;
            selectedLabel.classList.toggle('erase-mode', key === 'erase');
        }

        function renderToolbox() {
            const toolbox = document.getElementById('toolbox');
            toolbox.innerHTML = '';
            Object.keys(ASSET_MAP).forEach((key) => {
                const asset = ASSET_MAP[key];
                const current = countTool(key);
                const maxText = Number.isFinite(asset.max) ? `${current}/${asset.max}` : 'ลบ';
                const disabled = !toolAllowed(key);
                const button = document.createElement('button');
                button.type = 'button';
                button.className = `tool-button ${key === 'erase' ? 'tool-erase' : ''} ${selectedTool === key ? 'active' : ''}`;
                button.disabled = disabled;
                if (key === 'erase') {
                    button.innerHTML = `
                        <div class="fs-3">${asset.emoji}</div>
                        <div class="erase-label">โหมดลบวัตถุ</div>
                        <div class="erase-help">เลือกแล้วคลิกช่องที่ต้องการลบ</div>
                    `;
                } else {
                    button.innerHTML = `
                        <div class="fs-3">${asset.emoji}</div>
                        <div class="fw-bold small">${asset.label}</div>
                        <span class="badge text-bg-light border count-badge">${maxText}</span>
                    `;
                }
                button.addEventListener('click', () => {
                    selectedTool = key;
                    updateSelectedToolLabel(key);
                    renderToolbox();
                });
                toolbox.appendChild(button);
            });
            updateChecklist();
        }

        function renderMissionButtons() {
            document.querySelectorAll('.mission-button').forEach((button) => {
                button.classList.toggle('btn-primary', button.dataset.mission === missionType);
                button.classList.toggle('btn-outline-primary', button.dataset.mission !== missionType);
            });
        }

        function invalidateTest() {
            testPassed = false;
            tractorFacing = null;
            lastTestPath = [];
            const badge = document.getElementById('validation-badge');
            badge.className = 'badge text-bg-secondary rounded-pill px-3 py-2';
            badge.textContent = 'ยังไม่ได้ทดสอบ';
            updateChecklist();
        }

        function showFeedback(message, type = 'info') {
            const box = document.getElementById('feedback-box');
            const classes = {
                info: 'alert alert-info mt-3 mb-0 rounded-3',
                success: 'alert alert-success mt-3 mb-0 rounded-3',
                warning: 'alert alert-warning mt-3 mb-0 rounded-3',
                danger: 'alert alert-danger mt-3 mb-0 rounded-3'
            };
            box.className = classes[type] || classes.info;
            box.textContent = message;
        }

        function sameCell(point, col, row) {
            return point && point.col === col && point.row === row;
        }

        function findObjectAt(col, row) {
            if (sameCell(objects.start, col, row)) return { kind: 'start' };
            if (sameCell(objects.target, col, row)) return { kind: 'target' };
            if (sameCell(objects.barn, col, row)) return { kind: 'barn' };
            const obstacle = objects.obstacles.find(item => item.col === col && item.row === row);
            if (obstacle) return { kind: 'obstacle', type: obstacle.type };
            const crop = objects.crops.find(item => item.col === col && item.row === row);
            if (crop) return { kind: 'crop' };
            return null;
        }

        function removeAt(col, row) {
            if (sameCell(objects.start, col, row)) objects.start = null;
            if (sameCell(objects.target, col, row)) objects.target = null;
            if (sameCell(objects.barn, col, row)) objects.barn = null;
            objects.obstacles = objects.obstacles.filter(item => !(item.col === col && item.row === row));
            objects.crops = objects.crops.filter(item => !(item.col === col && item.row === row));
            updateChecklist();
        }

        function placeObject(col, row) {
            if (isTesting) return;
            if (selectedTool === 'erase') {
                removeAt(col, row);
                invalidateTest();
                redrawBoard();
                renderToolbox();
                showFeedback('ลบวัตถุในช่องแล้ว สามารถเลือกเครื่องมืออื่นเพื่อวางใหม่ได้', 'info');
                return;
            }

            if (!toolAllowed(selectedTool)) {
                showFeedback('เครื่องมือนี้ยังไม่ใช้กับประเภทภารกิจที่เลือก', 'warning');
                return;
            }
            if (findObjectAt(col, row)) {
                showFeedback('ช่องนี้มีวัตถุอยู่แล้ว ใช้ยางลบก่อนวางใหม่', 'warning');
                return;
            }
            if (countTool(selectedTool) >= ASSET_MAP[selectedTool].max) {
                showFeedback(`วาง${ASSET_MAP[selectedTool].label}ครบจำนวนสูงสุดแล้ว`, 'warning');
                return;
            }

            if (selectedTool === 'start') objects.start = { col, row };
            if (selectedTool === 'target') objects.target = { col, row };
            if (selectedTool === 'barn') objects.barn = { col, row };
            if (selectedTool === 'hay' || selectedTool === 'rock') objects.obstacles.push({ col, row, type: selectedTool });
            if (selectedTool === 'crop') objects.crops.push({ col, row });

            invalidateTest();
            redrawBoard();
            renderToolbox();
            showFeedback(`วาง${ASSET_MAP[selectedTool].label}แล้ว`, 'info');
        }

        function missionLabel() {
            return {
                target: 'ไปถึงจุดหมาย',
                obstacle: 'หลบสิ่งกีดขวาง',
                harvest: 'เก็บเกี่ยวผลผลิต'
            }[missionType] || 'ไปถึงจุดหมาย';
        }

        function setMission(type) {
            if (missionType === type) return;
            missionType = type;
            if (missionType === 'harvest') {
                objects.target = null;
            } else {
                objects.barn = null;
                objects.crops = [];
            }
            if (!toolAllowed(selectedTool)) selectedTool = 'start';
            updateSelectedToolLabel(selectedTool);
            invalidateTest();
            renderMissionButtons();
            renderToolbox();
            redrawBoard();
            showFeedback(`เปลี่ยนเป็นภารกิจ${missionLabel()}แล้ว`, 'info');
        }

        function validateBasic() {
            if (!objects.start) return 'ยังไม่มีรถไถจุดเริ่มต้นนะ';
            if (missionType === 'harvest') {
                if (!objects.barn) return 'อย่าลืมวางโรงนาให้รถไถกลับไป';
                if (objects.crops.length === 0) return 'ภารกิจเก็บเกี่ยวต้องมีผลผลิตอย่างน้อย 1 จุด';
            } else {
                if (!objects.target) return 'อย่าลืมวางเป้าหมายให้รถไถไปถึง';
            }
            if (missionType === 'obstacle' && objects.obstacles.length === 0) {
                return 'ภารกิจหลบสิ่งกีดขวางต้องมีกองฟางหรือหินอย่างน้อย 1 จุด';
            }
            if (commands.length === 0) return 'เพิ่มคำสั่งลูกศรก่อนส่งชิ้นงานนะ';
            return '';
        }

        function updateChecklist() {
            const list = document.getElementById('project-checklist');
            if (!list) return;

            const thinking = document.getElementById('thinking-input').value.trim();
            const hasDestination = missionType === 'harvest' ? !!objects.barn : !!objects.target;
            const hasMissionRequirement =
                missionType === 'target'
                || (missionType === 'obstacle' && objects.obstacles.length > 0)
                || (missionType === 'harvest' && objects.crops.length > 0);
            const checks = [
                { label: 'วางรถไถจุดเริ่มต้นแล้ว', ok: !!objects.start },
                { label: missionType === 'harvest' ? 'วางโรงนาแล้ว' : 'วางเป้าหมายแล้ว', ok: hasDestination },
                { label: 'ทำตามเงื่อนไขของประเภทภารกิจแล้ว', ok: hasMissionRequirement },
                { label: 'มีคำสั่งเฉลยแล้ว', ok: commands.length > 0 },
                { label: 'ทดสอบเส้นทางผ่านแล้ว', ok: testPassed },
                { label: 'เขียนคำอธิบายวิธีคิดแล้ว', ok: thinking.length > 0 }
            ];

            list.innerHTML = checks.map(item => `
                <li class="check-item ${item.ok ? 'done' : 'missing'}">
                    <span>${item.ok ? '✅' : '⬜'}</span>
                    <span>${item.label}</span>
                </li>
            `).join('');
        }

        function routeDestination() {
            return missionType === 'harvest' ? objects.barn : objects.target;
        }

        function testRoute(animated = true) {
            const basicError = validateBasic();
            if (basicError) {
                showFeedback(basicError, 'warning');
                return Promise.resolve(false);
            }

            isTesting = true;
            setCommandControls(false);
            let pos = { ...objects.start };
            let collected = new Set();
            tractorFacing = null;
            lastTestPath = [{ col: pos.col, row: pos.row, step: 0 }];
            redrawBoard(pos, collected);
            showFeedback('รถไถกำลังทดสอบเส้นทาง', 'info');

            const runStep = (index) => {
                if (index >= commands.length) {
                    isTesting = false;
                    setCommandControls(true);
                    const destination = routeDestination();
                    const atDestination = destination && pos.col === destination.col && pos.row === destination.row;
                    const allCollected = objects.crops.every(item => collected.has(`${item.col},${item.row}`));
                    if (missionType === 'harvest' && atDestination && !allCollected) {
                        return finishTest(false, 'ยังเก็บผลผลิตไม่ครบก่อนกลับโรงนา');
                    }
                    if (atDestination && (missionType !== 'harvest' || allCollected)) {
                        redrawBoard(pos, collected, null, tractorFacing, lastTestPath);
                        return finishTest(true, 'โจทย์นี้ใช้งานได้ พร้อมส่งชิ้นงานแล้ว');
                    }
                    return finishTest(false, missionType === 'harvest' ? 'ยังไม่กลับถึงโรงนา' : 'รถไถยังไม่ถึงเป้าหมาย');
                }

                const dir = DIRS[commands[index]];
                tractorFacing = commands[index];
                const next = { col: pos.col + dir.dc, row: pos.row + dir.dr };
                if (next.col < 0 || next.row < 0 || next.col >= GRID.cols || next.row >= GRID.rows) {
                    isTesting = false;
                    setCommandControls(true);
                    redrawBoard(pos, collected, null, tractorFacing);
                    return finishTest(false, 'รถไถออกนอกแผนที่');
                }

                const obstacle = objects.obstacles.find(item => item.col === next.col && item.row === next.row);
                if (obstacle) {
                    isTesting = false;
                    setCommandControls(true);
                    redrawBoard(pos, collected, next, tractorFacing);
                    return finishTest(false, obstacle.type === 'hay' ? 'รถไถชนกองฟาง' : 'รถไถชนหิน');
                }

                pos = next;
                const crop = objects.crops.find(item => item.col === pos.col && item.row === pos.row);
                if (crop) collected.add(`${crop.col},${crop.row}`);
                lastTestPath.push({
                    col: pos.col,
                    row: pos.row,
                    step: index + 1,
                    dir: commands[index]
                });
                redrawBoard(pos, collected, null, tractorFacing);
                window.setTimeout(() => runStep(index + 1), animated ? 280 : 0);
                return null;
            };

            return new Promise((resolve) => {
                window.finishTest = (ok, message) => {
                    finishTestResult(ok, message);
                    resolve(ok);
                };
                runStep(0);
            });
        }

        function finishTest(ok, message) {
            if (typeof window.finishTest === 'function') {
                window.finishTest(ok, message);
            } else {
                finishTestResult(ok, message);
            }
            return ok;
        }

        function finishTestResult(ok, message) {
            testPassed = ok;
            const badge = document.getElementById('validation-badge');
            badge.className = ok ? 'badge text-bg-success rounded-pill px-3 py-2' : 'badge text-bg-danger rounded-pill px-3 py-2';
            badge.textContent = ok ? 'ทดสอบผ่าน' : 'ทดสอบไม่ผ่าน';
            showFeedback(message, ok ? 'success' : 'danger');
            updateChecklist();
        }

        function renderCommands() {
            const zone = document.getElementById('command-zone');
            document.getElementById('command-count').textContent = `${commands.length} / ${MAX_COMMANDS}`;
            zone.innerHTML = '';
            if (commands.length === 0) {
                zone.innerHTML = '<span class="text-muted small">กดปุ่มลูกศรเพื่อเพิ่มคำสั่ง</span>';
                updateChecklist();
                return;
            }
            commands.forEach((cmd, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'command-chip';
                button.textContent = DIRS[cmd].icon;
                button.title = `ลบคำสั่ง ${DIRS[cmd].label}`;
                button.addEventListener('click', () => {
                    if (isTesting) return;
                    commands.splice(index, 1);
                    invalidateTest();
                    renderCommands();
                    redrawBoard();
                });
                zone.appendChild(button);
            });
            updateChecklist();
        }

        function setCommandControls(enabled) {
            document.querySelectorAll('.command-add, #clear-commands, #test-route, #submit-work').forEach(button => {
                button.disabled = !enabled;
            });
            if (enabled) {
                renderMissionButtons();
                renderToolbox();
                return;
            }
            document.querySelectorAll('.tool-button, .mission-button').forEach(button => {
                button.disabled = true;
            });
        }

        function buildWorkData() {
            return {
                project_type: 'tractor_route',
                mission_type: missionType,
                grid: GRID,
                start: objects.start,
                target: missionType === 'harvest' ? null : objects.target,
                barn: missionType === 'harvest' ? objects.barn : null,
                obstacles: objects.obstacles,
                crops: missionType === 'harvest' ? objects.crops : [],
                commands,
                validated: testPassed
            };
        }

        function submitWork() {
            const basicError = validateBasic();
            if (basicError) {
                showFeedback(basicError, 'warning');
                return;
            }
            if (!testPassed) {
                showFeedback('ลองกด “ทดสอบเส้นทาง” ให้ผ่านก่อนส่งนะ', 'warning');
                return;
            }
            const thinking = document.getElementById('thinking-input').value.trim();
            if (!thinking) {
                showFeedback('เขียนอธิบายวิธีคิดของตนเองก่อนส่งนะ', 'warning');
                return;
            }

            const finalDescription = `[ประเภทภารกิจ: ${missionLabel()}]\n\n${thinking}`;
            fetch('../api/save_work.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_id: GAME_ID,
                    description: finalDescription,
                    items: buildWorkData()
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.href = `showcase.php?game_id=${GAME_ID}`;
                    return;
                }
                showFeedback(data.error || data.message || 'บันทึกชิ้นงานไม่สำเร็จ', 'danger');
            })
            .catch(() => showFeedback('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้', 'danger'));
        }

        function addTractorObject(scene, x, y, size, facingDir = null) {
            const group = scene.add.container(x, y);
            const tractor = scene.add.text(0, 0, ASSET_MAP.start.emoji, {
                fontSize: `${Math.max(30, Math.floor(size * .72))}px`,
                fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
            }).setOrigin(.5);

            group.add(tractor);

            if (facingDir && DIRS[facingDir]) {
                const badgeBg = scene.add.circle(size * .28, -size * .28, 13, 0x2563eb, 1)
                    .setStrokeStyle(2, 0xffffff, 1);
                const arrow = scene.add.text(size * .28, -size * .28, DIRS[facingDir].icon, {
                    fontSize: '16px',
                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
                }).setOrigin(.5);
                group.add([badgeBg, arrow]);
            }

            return group;
        }

        function addGameObject(scene, key, x, y, size, facingDir = null) {
            if (key === 'start') {
                return addTractorObject(scene, x, y, size, facingDir);
            }

            const asset = ASSET_MAP[key] || ASSET_MAP.target;
            if (USE_EMOJI_ASSETS) {
                return scene.add.text(x, y, asset.emoji, {
                    fontSize: `${Math.max(30, Math.floor(size * .72))}px`,
                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
                }).setOrigin(.5);
            }
            return scene.add.image(x, y, key).setDisplaySize(size, size).setOrigin(.5);
        }

        function redrawBoard(testPos = null, collected = new Set(), dangerCell = null, facingDir = null, routePath = []) {
            if (!sceneRef) return;
            sceneRef.boardLayer.removeAll(true);
            const tile = 66;
            const originX = Math.floor((540 - GRID.cols * tile) / 2);
            const originY = Math.floor((400 - GRID.rows * tile) / 2);
            sceneRef.boardLayer.add(sceneRef.add.rectangle(270, 200, GRID.cols * tile + 22, GRID.rows * tile + 22, 0xffffff, .9)
                .setStrokeStyle(2, 0xcbd5e1, 1));

            for (let row = 0; row < GRID.rows; row++) {
                for (let col = 0; col < GRID.cols; col++) {
                    const x = originX + col * tile + tile / 2;
                    const y = originY + row * tile + tile / 2;
                    const fill = dangerCell && dangerCell.col === col && dangerCell.row === row ? 0xfee2e2 : ((row + col) % 2 === 0 ? 0xecfdf5 : 0xdcfce7);
                    const cell = sceneRef.add.rectangle(x, y, tile - 4, tile - 4, fill, .96)
                        .setStrokeStyle(1, 0x94a3b8, .9)
                        .setInteractive({ useHandCursor: true });
                    cell.on('pointerdown', () => placeObject(col, row));
                    sceneRef.boardLayer.add(cell);

                    let pathStep = null;
                    for (let i = routePath.length - 1; i >= 0; i--) {
                        if (routePath[i].col === col && routePath[i].row === row) {
                            pathStep = routePath[i];
                            break;
                        }
                    }
                    if (pathStep) {
                        const dot = sceneRef.add.circle(x, y + tile * .28, 10, 0x2563eb, .95);
                        const num = sceneRef.add.text(x, y + tile * .28, String(pathStep.step), {
                            fontSize: '12px',
                            color: '#ffffff',
                            fontFamily: '"Kanit", sans-serif'
                        }).setOrigin(.5);
                        sceneRef.boardLayer.add([dot, num]);
                    }
                }
            }

            if (objects.target) addObjectAt('target', objects.target);
            if (objects.barn) addObjectAt('barn', objects.barn);
            objects.obstacles.forEach(item => addObjectAt(item.type, item));
            objects.crops.forEach(item => {
                if (!collected.has(`${item.col},${item.row}`)) addObjectAt('crop', item);
            });
            const tractorPos = testPos || objects.start;
            if (tractorPos) addObjectAt('start', tractorPos, facingDir);

            function addObjectAt(key, point, objectFacingDir = null) {
                const x = originX + point.col * tile + tile / 2;
                const y = originY + point.row * tile + tile / 2;
                sceneRef.boardLayer.add(addGameObject(sceneRef, key, x, y, tile * .82, objectFacingDir));
            }
        }

        const DPR = Math.min(window.devicePixelRatio || 1, 2);
        const phaserConfig = {
            type: Phaser.AUTO,
            parent: 'phaser-canvas',
            width: 540,
            height: 400,
            resolution: DPR,
            antialias: true,
            roundPixels: true,
            transparent: true,
            input: {
                mouse: { preventDefaultWheel: false },
                touch: { capture: false }
            },
            scene: {
                create() {
                    sceneRef = this;
                    this.add.rectangle(270, 200, 540, 400, 0xf8fafc, 1);
                    this.boardLayer = this.add.container(0, 0);
                    redrawBoard(null, new Set(), null, tractorFacing, testPassed ? lastTestPath : []);
                }
            }
        };

        document.querySelectorAll('.mission-button').forEach(button => {
            button.addEventListener('click', () => setMission(button.dataset.mission));
        });
        document.querySelectorAll('.command-add').forEach(button => {
            button.addEventListener('click', () => {
                if (commands.length >= MAX_COMMANDS) {
                    showFeedback('คำสั่งเต็มแล้ว ลบคำสั่งบางตัวก่อนนะ', 'warning');
                    return;
                }
                commands.push(button.dataset.dir);
                invalidateTest();
                renderCommands();
                redrawBoard();
            });
        });
        document.getElementById('clear-commands').addEventListener('click', () => {
            commands = [];
            invalidateTest();
            renderCommands();
            redrawBoard();
        });
        document.getElementById('test-route').addEventListener('click', () => testRoute(true));
        document.getElementById('submit-work').addEventListener('click', submitWork);
        document.getElementById('thinking-input').addEventListener('input', updateChecklist);

        loadExistingWork();
        updateSelectedToolLabel(selectedTool);
        renderMissionButtons();
        renderToolbox();
        renderCommands();
        if (testPassed) {
            const badge = document.getElementById('validation-badge');
            badge.className = 'badge text-bg-success rounded-pill px-3 py-2';
            badge.textContent = 'ทดสอบผ่าน';
            lastTestPath = objects.start ? [{ col: objects.start.col, row: objects.start.row, step: 0 }] : [];
            let previewPos = objects.start ? { ...objects.start } : null;
            commands.forEach((cmd, index) => {
                const dir = DIRS[cmd];
                if (!previewPos || !dir) return;
                previewPos = { col: previewPos.col + dir.dc, row: previewPos.row + dir.dr };
                if (previewPos.col >= 0 && previewPos.row >= 0 && previewPos.col < GRID.cols && previewPos.row < GRID.rows) {
                    lastTestPath.push({ col: previewPos.col, row: previewPos.row, step: index + 1, dir: cmd });
                    tractorFacing = cmd;
                }
            });
        }
        updateChecklist();
        new Phaser.Game(phaserConfig);
    </script>
</body>
</html>
