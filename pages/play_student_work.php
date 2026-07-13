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
          AND sw.game_id = 2
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
        if (!is_array($decoded) || ($decoded['project_type'] ?? '') !== 'tractor_route') {
            $error = 'ผลงานนี้ไม่ใช่โจทย์เส้นทางรถไถ';
        } elseif (empty($decoded['validated'])) {
            $error = 'โจทย์นี้ยังไม่พร้อมให้เพื่อนเล่น';
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

$cleanDescription = $work['description'] ?? '';
$cleanDescription = preg_replace('/^\[ประเภทภารกิจ:\s*.*?\]\s*/u', '', $cleanDescription);
$isOwnWork = $work && intval($work['user_id']) === intval($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ลองเล่นโจทย์ของเพื่อน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>




<?php
$page_styles = array (
  0 => 'games/play_student_work.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>

<body class="app-page play-student-work-page">
    <div class="play-header">
        <div class="container-fluid px-lg-5">
            <a href="showcase.php?game_id=2" class="btn btn-light btn-sm rounded-pill mb-3">
                <i class="bi bi-arrow-left"></i> กลับลานโชว์ผลงาน
            </a>
            <h1 class="fw-bold mb-1"><i class="bi bi-controller me-2"></i> ลองเล่นโจทย์ของเพื่อน</h1>
            <p class="fs-5 opacity-75 mb-0">บทที่ 2: เส้นทางเดินรถไถ</p>
        </div>
    </div>

    <div class="container-fluid px-lg-5 py-4">
        <?php if ($error): ?>
            <div class="play-panel p-4 text-center">
                <i class="bi bi-exclamation-triangle-fill text-warning display-5"></i>
                <h4 class="fw-bold mt-3">ยังเปิดโจทย์นี้ไม่ได้</h4>
                <p class="text-muted mb-4"><?php echo htmlspecialchars($error); ?></p>
                <a href="showcase.php?game_id=2" class="btn btn-primary rounded-pill px-4 fw-bold">กลับลานโชว์ผลงาน</a>
            </div>
        <?php else: ?>
            <div class="row g-3 mb-3">
                <div class="col-lg-8">
                    <div class="play-panel p-3 h-100">
                        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                            <span class="badge text-bg-primary rounded-pill px-3 py-2">ภารกิจ: <span id="mission-label"></span></span>
                            <span class="badge text-bg-light text-secondary border rounded-pill px-3 py-2">
                                วิธีตัวอย่างของผู้ออกแบบ <span id="sample-count"></span> คำสั่ง
                            </span>
                        </div>
                        <h4 class="fw-bold mb-1">ผลงานของ: <?php echo htmlspecialchars($ownerName); ?></h4>
                        <?php if ($isOwnWork): ?>
                            <div class="alert alert-info py-2 mb-2">คุณกำลังลองเล่นโจทย์ของตนเอง</div>
                        <?php elseif (($work['mode'] ?? '') === 'group'): ?>
                            <div class="small text-muted mb-2">
                                สมาชิกทีม: <?php echo htmlspecialchars($work['member_names'] ?? '-'); ?>
                            </div>
                        <?php endif; ?>
                        <?php if (trim($cleanDescription) !== ''): ?>
                            <div class="work-description text-secondary"><?php echo htmlspecialchars($cleanDescription); ?></div>
                        <?php endif; ?>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="play-panel p-3 h-100">
                        <h5 class="fw-bold mb-2"><i class="bi bi-flag-fill text-success"></i> เป้าหมายของคุณ</h5>
                        <p id="mission-help" class="mb-2"></p>
                        <p class="small text-muted mb-0">สร้างคำสั่งของคุณเอง ระบบจะตรวจจากผลลัพธ์ของภารกิจ ไม่ต้องเหมือนวิธีตัวอย่างของผู้ออกแบบ</p>
                    </div>
                </div>
            </div>

            <div class="play-panel p-3 p-lg-4">
                <div class="row g-3">
                    <div class="col-xl-8">
                        <div id="phaser-canvas"></div>
                    </div>
                    <div class="col-xl-4">
                        <div class="h-100 d-flex flex-column gap-3">
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <h5 class="fw-bold mb-0"><i class="bi bi-arrow-repeat text-primary"></i> คำสั่งของคุณ</h5>
                                    <span id="command-count" class="badge text-bg-secondary rounded-pill">0 / 30</span>
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
                                    <button id="run-route" class="btn btn-success flex-fill fw-bold"><i class="bi bi-play-fill"></i> รัน</button>
                                </div>
                            </div>

                            <div id="feedback-box" class="alert alert-info mb-0 rounded-3">ลองสร้างเส้นทางของคุณเอง แล้วกดรันเพื่อทดสอบ</div>

                            <div id="result-panel" class="stat-box d-none">
                                <h6 class="fw-bold mb-2"><i class="bi bi-bar-chart-fill text-primary"></i> ผลการเล่น</h6>
                                <div id="result-text" class="small"></div>
                            </div>

                            <div>
                                <button id="show-sample" class="btn btn-outline-success rounded-pill fw-bold w-100">
                                    <i class="bi bi-eye-fill"></i> ดูวิธีตัวอย่างของผู้ออกแบบ
                                </button>
                                <div id="sample-panel" class="stat-box mt-2 d-none">
                                    <div class="fw-bold mb-2">หนึ่งวิธีที่ผู้ออกแบบใช้ทดสอบโจทย์</div>
                                    <div id="sample-commands"></div>
                                    <div class="small text-muted mt-2">คุณอาจมีวิธีอื่นที่ถูกต้องได้เช่นกัน</div>
                                </div>
                            </div>

                            <div class="d-flex gap-2 mt-auto">
                                <button id="reset-play" class="btn btn-light border rounded-pill fw-bold flex-fill">
                                    <i class="bi bi-arrow-counterclockwise"></i> เล่นใหม่
                                </button>
                                <a href="showcase.php?game_id=2" class="btn btn-primary rounded-pill fw-bold flex-fill">กลับลานโชว์ผลงาน</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <?php if (!$error): ?>
        <?php require __DIR__ . '/../includes/app_scripts.php'; ?>
        <script>
            const WORK_DATA = <?php echo json_encode($workData, JSON_UNESCAPED_UNICODE); ?>;
            const MAX_COMMANDS = 30;
            const DIRS = {
                UP: { icon: '⬆️', label: 'ขึ้น', dc: 0, dr: -1 },
                DOWN: { icon: '⬇️', label: 'ลง', dc: 0, dr: 1 },
                LEFT: { icon: '⬅️', label: 'ซ้าย', dc: -1, dr: 0 },
                RIGHT: { icon: '➡️', label: 'ขวา', dc: 1, dr: 0 }
            };
            const ASSET_MAP = {
                start: { emoji: '🚜', label: 'รถไถ' },
                target: { emoji: '🧺', label: 'ตะกร้า' },
                barn: { emoji: '🏚️', label: 'โรงนา' },
                hay: { emoji: '🌾', label: 'กองฟาง' },
                rock: { emoji: '🪨', label: 'หิน' },
                crop: { emoji: '🌽', label: 'ผลผลิต' }
            };
            const MISSION_LABELS = {
                target: 'ไปถึงจุดหมาย',
                obstacle: 'หลบสิ่งกีดขวาง',
                harvest: 'เก็บเกี่ยวผลผลิต'
            };
            const MISSION_HELP = {
                target: 'พารถไถไปถึงตะกร้าเป้าหมาย',
                obstacle: 'พารถไถไปถึงเป้าหมายโดยไม่ชนกองฟางหรือหิน',
                harvest: 'เก็บผลผลิตให้ครบก่อนกลับโรงนา'
            };

            let sceneRef = null;
            let commands = [];
            let isRunning = false;
            let lastResult = null;
            let tractorFacing = null;
            let collectedKeys = new Set();

            function normalizePoint(point) {
                if (!point) return null;
                return {
                    col: Number.isInteger(point.col) ? point.col : point.c,
                    row: Number.isInteger(point.row) ? point.row : point.r
                };
            }

            function normalizeWorkData(data) {
                return {
                    ...data,
                    grid: data.grid || { cols: 6, rows: 5 },
                    start: normalizePoint(data.start),
                    target: normalizePoint(data.target),
                    barn: normalizePoint(data.barn),
                    obstacles: (data.obstacles || []).map(item => ({
                        col: Number.isInteger(item.col) ? item.col : item.c,
                        row: Number.isInteger(item.row) ? item.row : item.r,
                        type: item.type || 'hay'
                    })),
                    crops: (data.crops || []).map((item, index) => ({
                        col: Number.isInteger(item.col) ? item.col : item.c,
                        row: Number.isInteger(item.row) ? item.row : item.r,
                        key: `${Number.isInteger(item.col) ? item.col : item.c},${Number.isInteger(item.row) ? item.row : item.r}`,
                        index
                    })),
                    commands: Array.isArray(data.sample_commands) ? data.sample_commands : (Array.isArray(data.commands) ? data.commands : [])
                };
            }

            const puzzle = normalizeWorkData(WORK_DATA);

            function commandIcons(commandList) {
                return (commandList || []).filter(cmd => DIRS[cmd]).map(cmd => DIRS[cmd].icon);
            }

            function showFeedback(message, type = 'info') {
                const box = document.getElementById('feedback-box');
                const classes = {
                    info: 'alert alert-info mb-0 rounded-3',
                    success: 'alert alert-success mb-0 rounded-3',
                    warning: 'alert alert-warning mb-0 rounded-3',
                    danger: 'alert alert-danger mb-0 rounded-3'
                };
                box.className = classes[type] || classes.info;
                box.textContent = message;
            }

            function validatePlayerCommands(data, playerCommands) {
                const cols = data.grid?.cols || 6;
                const rows = data.grid?.rows || 5;
                if (!data.start) {
                    return { success: false, reason: 'invalid_data', message: 'ข้อมูลโจทย์ไม่สมบูรณ์', path: [] };
                }
                if (!Array.isArray(playerCommands) || playerCommands.length === 0) {
                    return { success: false, reason: 'no_commands', message: 'เพิ่มคำสั่งก่อนกดรันนะ', path: [{ ...data.start, step: 0 }], collected: [] };
                }

                let pos = { ...data.start };
                const path = [{ ...pos, step: 0 }];
                const collected = new Set();
                const obstacles = new Map((data.obstacles || []).map(item => [`${item.col},${item.row}`, item]));

                for (let i = 0; i < playerCommands.length; i++) {
                    const cmd = playerCommands[i];
                    const dir = DIRS[cmd];
                    if (!dir) continue;

                    pos = { col: pos.col + dir.dc, row: pos.row + dir.dr };
                    path.push({ ...pos, step: i + 1, dir: cmd });

                    if (pos.col < 0 || pos.col >= cols || pos.row < 0 || pos.row >= rows) {
                        return {
                            success: false,
                            reason: 'out_of_bounds',
                            message: 'รถไถออกนอกแผนที่ ลองตรวจทิศทางอีกครั้ง',
                            failedAt: pos,
                            path,
                            collected: Array.from(collected)
                        };
                    }

                    const obstacle = obstacles.get(`${pos.col},${pos.row}`);
                    if (obstacle) {
                        return {
                            success: false,
                            reason: 'obstacle',
                            message: obstacle.type === 'hay' ? 'รถไถชนกองฟาง ลองวางเส้นทางใหม่' : 'รถไถชนหิน ลองวางเส้นทางใหม่',
                            failedAt: pos,
                            path,
                            collected: Array.from(collected)
                        };
                    }

                    const crop = (data.crops || []).find(item => item.col === pos.col && item.row === pos.row);
                    if (crop) collected.add(crop.key);
                }

                if (data.mission_type === 'harvest') {
                    const barn = data.barn;
                    const allCollected = (data.crops || []).every(item => collected.has(item.key));
                    if (!allCollected) {
                        return {
                            success: false,
                            reason: 'crops_missing',
                            message: 'ยังเก็บผลผลิตไม่ครบ ต้องเก็บให้ครบก่อนกลับโรงนา',
                            path,
                            collected: Array.from(collected)
                        };
                    }
                    if (!barn || pos.col !== barn.col || pos.row !== barn.row) {
                        return {
                            success: false,
                            reason: 'not_reached_barn',
                            message: 'เก็บผลผลิตแล้ว ต้องกลับไปที่โรงนาให้สำเร็จ',
                            path,
                            collected: Array.from(collected)
                        };
                    }
                    return {
                        success: true,
                        reason: 'success',
                        message: 'สำเร็จ! คุณเก็บผลผลิตครบและกลับถึงโรงนาแล้ว',
                        path,
                        collected: Array.from(collected)
                    };
                }

                const target = data.target;
                if (!target || pos.col !== target.col || pos.row !== target.row) {
                    return {
                        success: false,
                        reason: 'not_reached_target',
                        message: 'ยังไม่ถึงเป้าหมาย ลองปรับลำดับคำสั่งอีกครั้ง',
                        path,
                        collected: Array.from(collected)
                    };
                }

                return {
                    success: true,
                    reason: 'success',
                    message: data.mission_type === 'obstacle' ? 'สำเร็จ! คุณถึงเป้าหมายโดยไม่ชนสิ่งกีดขวาง' : 'สำเร็จ! คุณแก้โจทย์นี้ได้แล้ว',
                    path,
                    collected: Array.from(collected)
                };
            }

            function setControls(enabled) {
                document.querySelectorAll('.command-add, #clear-commands, #run-route, #reset-play').forEach(button => {
                    button.disabled = !enabled;
                });
            }

            function renderCommands() {
                const zone = document.getElementById('command-zone');
                document.getElementById('command-count').textContent = `${commands.length} / ${MAX_COMMANDS}`;
                zone.innerHTML = '';
                if (commands.length === 0) {
                    zone.innerHTML = '<span class="text-muted small">กดปุ่มลูกศรเพื่อเพิ่มคำสั่ง</span>';
                    return;
                }
                commands.forEach((cmd, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'command-chip';
                    button.textContent = DIRS[cmd].icon;
                    button.title = `ลบคำสั่ง ${DIRS[cmd].label}`;
                    button.addEventListener('click', () => {
                        if (isRunning) return;
                        commands.splice(index, 1);
                        lastResult = null;
                        collectedKeys = new Set();
                        renderCommands();
                        redrawBoard();
                        hideResultPanel();
                    });
                    zone.appendChild(button);
                });
            }

            function hideResultPanel() {
                document.getElementById('result-panel').classList.add('d-none');
                document.getElementById('result-text').innerHTML = '';
            }

            function renderResultPanel(result) {
                const panel = document.getElementById('result-panel');
                const text = document.getElementById('result-text');
                const sampleCount = puzzle.commands.length;
                let compareText = '';
                if (result.success) {
                    if (commands.join(',') === puzzle.commands.join(',')) {
                        compareText = 'คุณใช้เส้นทางเดียวกับผู้ออกแบบเลย';
                    } else if (commands.length < sampleCount) {
                        compareText = 'คุณพบเส้นทางที่สั้นกว่าวิธีตัวอย่างของผู้ออกแบบ';
                    } else if (commands.length === sampleCount) {
                        compareText = 'คุณใช้จำนวนคำสั่งเท่ากับวิธีตัวอย่างของผู้ออกแบบ';
                    } else {
                        compareText = 'วิธีของคุณยาวกว่า แต่ยังเป็นคำตอบที่ถูกต้อง';
                    }
                }

                text.innerHTML = result.success ? `
                    <div class="fw-bold text-success mb-1">คุณแก้โจทย์นี้ได้แล้ว</div>
                    <div>จำนวนคำสั่งที่ใช้: <strong>${commands.length}</strong></div>
                    <div>วิธีตัวอย่างของผู้ออกแบบ: <strong>${sampleCount}</strong> คำสั่ง</div>
                    <div class="mt-1">${compareText}</div>
                ` : `
                    <div class="fw-bold text-danger mb-1">ยังไม่ผ่าน</div>
                    <div>${result.message}</div>
                `;
                panel.classList.remove('d-none');
            }

            function runRoute(animated = true) {
                const result = validatePlayerCommands(puzzle, commands);
                lastResult = result;

                if (result.reason === 'no_commands' || result.reason === 'invalid_data') {
                    showFeedback(result.message, result.reason === 'no_commands' ? 'warning' : 'danger');
                    redrawBoard(null, new Set(), null, null, result.path || []);
                    renderResultPanel(result);
                    return;
                }

                isRunning = true;
                setControls(false);
                collectedKeys = new Set();
                tractorFacing = null;
                redrawBoard(puzzle.start, collectedKeys, null, null, [{ ...puzzle.start, step: 0 }]);
                showFeedback('รถไถกำลังวิ่งตามคำสั่งของคุณ', 'info');

                const path = result.path || [];
                let currentStep = 0;
                const playStep = () => {
                    const point = path[currentStep] || puzzle.start;
                    if (point.dir) tractorFacing = point.dir;
                    const collectedForStep = collectCropsAlongPath(path.slice(0, currentStep + 1));
                    collectedKeys = collectedForStep;
                    const failedHere = result.failedAt && point.col === result.failedAt.col && point.row === result.failedAt.row;
                    redrawBoard(point, collectedKeys, failedHere ? result.failedAt : null, tractorFacing, path.slice(0, currentStep + 1));

                    if (currentStep >= path.length - 1) {
                        isRunning = false;
                        setControls(true);
                        showFeedback(result.message, result.success ? 'success' : 'danger');
                        renderResultPanel(result);
                        return;
                    }

                    currentStep += 1;
                    window.setTimeout(playStep, animated ? 280 : 0);
                };
                playStep();
            }

            function collectCropsAlongPath(path) {
                const collected = new Set();
                path.forEach(point => {
                    const crop = (puzzle.crops || []).find(item => item.col === point.col && item.row === point.row);
                    if (crop) collected.add(crop.key);
                });
                return collected;
            }

            function resetPlay() {
                commands = [];
                lastResult = null;
                tractorFacing = null;
                collectedKeys = new Set();
                renderCommands();
                hideResultPanel();
                showFeedback('ลองสร้างเส้นทางของคุณเอง แล้วกดรันเพื่อทดสอบ', 'info');
                redrawBoard();
            }

            function revealSample(force = false) {
                if (!force && (!lastResult || !lastResult.success)) {
                    const ok = window.confirm('ถ้าดูวิธีตัวอย่างก่อน คุณอาจเสียโอกาสลองคิดด้วยตนเอง ต้องการดูหรือไม่?');
                    if (!ok) return;
                }
                const panel = document.getElementById('sample-panel');
                const target = document.getElementById('sample-commands');
                target.innerHTML = commandIcons(puzzle.commands).map(icon => `<span class="sample-chip">${icon}</span>`).join('');
                panel.classList.remove('d-none');
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
                if (key === 'start') return addTractorObject(scene, x, y, size, facingDir);
                const asset = ASSET_MAP[key] || ASSET_MAP.target;
                return scene.add.text(x, y, asset.emoji, {
                    fontSize: `${Math.max(30, Math.floor(size * .72))}px`,
                    fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
                }).setOrigin(.5);
            }

            function redrawBoard(testPos = null, collected = collectedKeys, dangerCell = null, facingDir = tractorFacing, routePath = lastResult?.path || []) {
                if (!sceneRef) return;
                const cols = puzzle.grid?.cols || 6;
                const rows = puzzle.grid?.rows || 5;
                sceneRef.boardLayer.removeAll(true);
                const tile = Math.min(66, Math.floor(Math.min(500 / cols, 360 / rows)));
                const originX = Math.floor((540 - cols * tile) / 2);
                const originY = Math.floor((400 - rows * tile) / 2);
                sceneRef.boardLayer.add(sceneRef.add.rectangle(270, 200, cols * tile + 22, rows * tile + 22, 0xffffff, .9)
                    .setStrokeStyle(2, 0xcbd5e1, 1));

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const x = originX + col * tile + tile / 2;
                        const y = originY + row * tile + tile / 2;
                        const fill = dangerCell && dangerCell.col === col && dangerCell.row === row ? 0xfee2e2 : ((row + col) % 2 === 0 ? 0xecfdf5 : 0xdcfce7);
                        sceneRef.boardLayer.add(sceneRef.add.rectangle(x, y, tile - 4, tile - 4, fill, .96)
                            .setStrokeStyle(1, 0x94a3b8, .9));

                        let pathStep = null;
                        for (let i = routePath.length - 1; i >= 0; i--) {
                            if (routePath[i].col === col && routePath[i].row === row) {
                                pathStep = routePath[i];
                                break;
                            }
                        }
                        if (pathStep && pathStep.step > 0) {
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

                if (puzzle.target) addObjectAt('target', puzzle.target);
                if (puzzle.barn) addObjectAt('barn', puzzle.barn);
                puzzle.obstacles.forEach(item => addObjectAt(item.type, item));
                puzzle.crops.forEach(item => {
                    if (!collected.has(item.key)) addObjectAt('crop', item);
                });
                const tractorPos = testPos || puzzle.start;
                if (tractorPos) addObjectAt('start', tractorPos, facingDir);

                function addObjectAt(key, point, objectFacingDir = null) {
                    const x = originX + point.col * tile + tile / 2;
                    const y = originY + point.row * tile + tile / 2;
                    sceneRef.boardLayer.add(addGameObject(sceneRef, key, x, y, tile * .82, objectFacingDir));
                }
            }

            document.getElementById('mission-label').textContent = MISSION_LABELS[puzzle.mission_type] || 'เส้นทางรถไถ';
            document.getElementById('mission-help').textContent = MISSION_HELP[puzzle.mission_type] || 'พารถไถไปถึงเป้าหมาย';
            document.getElementById('sample-count').textContent = puzzle.commands.length;
            document.querySelectorAll('.command-add').forEach(button => {
                button.addEventListener('click', () => {
                    if (commands.length >= MAX_COMMANDS) {
                        showFeedback('คำสั่งเต็มแล้ว ลบคำสั่งบางตัวก่อนนะ', 'warning');
                        return;
                    }
                    commands.push(button.dataset.dir);
                    lastResult = null;
                    collectedKeys = new Set();
                    renderCommands();
                    hideResultPanel();
                    redrawBoard();
                });
            });
            document.getElementById('clear-commands').addEventListener('click', resetPlay);
            document.getElementById('run-route').addEventListener('click', () => runRoute(true));
            document.getElementById('reset-play').addEventListener('click', resetPlay);
            document.getElementById('show-sample').addEventListener('click', () => revealSample(false));

            renderCommands();
            const DPR = Math.min(window.devicePixelRatio || 1, 2);
            new Phaser.Game({
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
                        redrawBoard();
                    }
                }
            });
        </script>
    <?php endif; ?>
</body>

</html>
