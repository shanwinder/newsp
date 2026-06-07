<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

$projectConfigs = [
    2 => [
        'title' => 'ออกแบบเส้นทางรถไถแก้ปัญหา',
        'subtitle' => 'สร้างแผนที่ จุดเริ่มต้น จุดหมาย สิ่งกีดขวาง และลำดับคำสั่ง',
        'theme' => '#2563eb',
        'icon' => 'bi-signpost-2',
        'fields' => [
            'map' => ['label' => 'แผนที่หรือฉากที่ออกแบบ', 'placeholder' => 'เช่น ตาราง 5x5 รถไถเริ่มที่มุมซ้ายล่าง เป้าหมายอยู่มุมขวาบน มีกองฟางกลางทาง'],
            'commands' => ['label' => 'ลำดับคำสั่ง', 'placeholder' => 'เช่น ขวา, ขวา, ขึ้น, ขึ้น, ขวา'],
            'reason' => ['label' => 'เหตุผลของการเรียงคำสั่ง', 'placeholder' => 'อธิบายว่าทำไมต้องไปเส้นทางนี้ และหลบสิ่งกีดขวางอย่างไร']
        ],
        'rubric' => 'ตรวจความชัดเจนของแผนที่ ความถูกต้องของลำดับคำสั่ง และเหตุผลในการเลือกเส้นทาง'
    ],
    4 => [
        'title' => 'สร้างโจทย์บั๊กฟาร์มของฉัน',
        'subtitle' => 'เลือกฉาก อาการเสีย จุดผิด วิธีซ่อม แล้วทดลองเล่นก่อนส่งให้เพื่อนลองซ่อม',
        'theme' => '#d97706',
        'icon' => 'bi-bug',
        'rubric' => 'ตรวจว่าโจทย์มีฉาก อาการเสีย จุดผิด วิธีซ่อม และผลทดลองเล่นครบถ้วน เพื่อนสามารถกดเล่นเพื่อฝึกหาบั๊กได้จริง'
    ]
];

$game_id = isset($project_game_id) ? intval($project_game_id) : intval($_GET['game_id'] ?? 2);
if ($game_id === 3) {
    header("Location: create_project_condition.php?game_id=3");
    exit();
}
if (!isset($projectConfigs[$game_id])) {
    header("Location: student_dashboard.php");
    exit();
}

$config = $projectConfigs[$game_id];
$user_id = intval($_SESSION['user_id']);
$context = session_context();
$existing = [];
$existingDesc = '';
$revisionFeedback = null;

$stmt = $conn->prepare("SELECT * FROM student_works WHERE user_id = ? AND game_id = ? AND learning_session_id = ? LIMIT 1");
$stmt->bind_param("iii", $user_id, $game_id, $context['learning_session_id']);
$stmt->execute();
$work = $stmt->get_result()->fetch_assoc();
if ($work) {
    $decoded = json_decode($work['work_data'], true);
    $existing = is_array($decoded) ? $decoded : [];
    $existingDesc = $work['description'];
    if ($work['status'] === 'revision') {
        $revisionFeedback = $work['feedback'];
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($config['title']); ?> - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body { font-family: 'Kanit', sans-serif; background:#f8fafc; min-height:100vh; color:#172033; }
        .hero { background: <?php echo $config['theme']; ?>; color:white; padding:36px 0 28px; }
        .work-panel { background:white; border-radius:8px; border:1px solid #e2e8f0; box-shadow:0 18px 40px rgba(15,23,42,.08); }
        .rubric-box { background:#fffbeb; border-left:5px solid #f59e0b; border-radius:8px; }
        textarea { min-height:130px; resize:vertical; }
        .debug-builder-grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:12px; }
        .debug-builder-choice { border:1px solid #e2e8f0; border-radius:8px; padding:14px; background:#fff; cursor:pointer; min-height:108px; }
        .debug-builder-choice input { margin-right:6px; }
        .debug-builder-choice:has(input:checked) { border-color:#d97706; box-shadow:0 0 0 3px rgba(217,119,6,.16); background:#fff7ed; }
        .debug-builder-preview { border:1px solid #fed7aa; background:#fff7ed; border-radius:8px; padding:14px; }
        .debug-builder-scene { display:inline-flex; align-items:center; min-height:30px; border-radius:999px; background:#ffedd5; color:#9a3412; padding:4px 12px; font-weight:800; margin-bottom:10px; }
        @media (max-width: 768px) { .debug-builder-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="hero">
        <div class="container">
            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-light btn-sm rounded-pill mb-3"><i class="bi bi-arrow-left"></i> กลับหน้าเลือกด่าน</a>
            <h1 class="fw-bold mb-2"><i class="bi <?php echo htmlspecialchars($config['icon']); ?>"></i> <?php echo htmlspecialchars($config['title']); ?></h1>
            <p class="fs-5 mb-0 opacity-75"><?php echo htmlspecialchars($config['subtitle']); ?></p>
        </div>
    </div>

    <div class="container py-4">
        <?php if ($revisionFeedback): ?>
            <div class="alert alert-warning border-0 shadow-sm rounded-4">
                <h5 class="fw-bold"><i class="bi bi-arrow-return-left"></i> คุณครูส่งงานกลับให้แก้ไข</h5>
                <p class="mb-0"><?php echo htmlspecialchars($revisionFeedback); ?></p>
            </div>
        <?php endif; ?>

        <div class="row g-4">
            <div class="col-lg-8">
                <div class="work-panel p-4">
                    <form id="project-form">
                        <?php if ($game_id === 4): ?>
                            <div class="mb-4">
                                <label class="form-label fw-bold">ชื่อโจทย์บั๊ก</label>
                                <input class="form-control form-control-lg" id="debug-title" value="<?php echo htmlspecialchars($existing['title'] ?? ''); ?>" placeholder="เช่น แครอทเลอะไม่ถูกล้าง">
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold">เลือกอาการเสีย</label>
                                <div class="debug-builder-grid" id="symptom-grid"></div>
                            </div>

                            <div class="row g-3 mb-4">
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">จุดผิดอยู่ที่ไหน?</label>
                                    <select class="form-select form-select-lg" id="bug-target"></select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-bold">วิธีซ่อมที่ถูกต้อง</label>
                                    <select class="form-select form-select-lg" id="correct-fix"></select>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold">ทดลองเล่นโจทย์</label>
                                <div class="d-flex flex-wrap gap-2 align-items-center">
                                    <button type="button" class="btn btn-warning rounded-pill fw-bold px-4" id="test-debug-work">
                                        <i class="bi bi-play-fill"></i> ทดลองเล่น
                                    </button>
                                    <span class="badge rounded-pill text-bg-light border text-secondary px-3 py-2" id="test-status">ยังไม่ได้ทดลอง</span>
                                </div>
                                <textarea class="form-control mt-3" id="playtest-note" placeholder="ผลทดลองเล่นจะถูกบันทึกหลังจากกดทดลองเล่น"><?php echo htmlspecialchars($existing['playtest_note'] ?? ''); ?></textarea>
                            </div>
                        <?php else: ?>
                            <?php foreach ($config['fields'] as $key => $field): ?>
                                <div class="mb-4">
                                    <label class="form-label fw-bold"><?php echo htmlspecialchars($field['label']); ?></label>
                                    <textarea class="form-control" id="field-<?php echo htmlspecialchars($key); ?>" placeholder="<?php echo htmlspecialchars($field['placeholder']); ?>"><?php echo htmlspecialchars($existing[$key] ?? ''); ?></textarea>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>

                        <div class="mb-4">
                            <label class="form-label fw-bold">คำอธิบายสรุปผลงาน</label>
                            <textarea class="form-control" id="description" placeholder="สรุปแนวคิดของผลงานนี้ให้คุณครูและเพื่อนเข้าใจ"><?php echo htmlspecialchars($existingDesc); ?></textarea>
                        </div>
                        <div class="d-flex flex-wrap gap-2 justify-content-end">
                            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-outline-secondary rounded-pill px-4">ยกเลิก</a>
                            <button type="submit" class="btn btn-success rounded-pill px-4 fw-bold"><i class="bi bi-cloud-arrow-up-fill"></i> ส่งชิ้นงาน</button>
                        </div>
                    </form>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="rubric-box p-4 mb-3">
                    <h5 class="fw-bold text-warning-emphasis"><i class="bi bi-clipboard-check"></i> เกณฑ์ตรวจชิ้นงาน</h5>
                    <p class="mb-0 text-secondary"><?php echo htmlspecialchars($config['rubric']); ?></p>
                </div>
                <div class="work-panel p-4">
                    <h5 class="fw-bold"><?php echo $game_id === 4 ? 'ตัวอย่างโจทย์' : 'สิ่งที่ต้องมี'; ?></h5>
                    <?php if ($game_id === 4): ?>
                        <div id="debug-preview"></div>
                    <?php else: ?>
                        <ul class="mb-0">
                            <li>แนวคิดถูกต้องตามบทเรียน</li>
                            <li>มีขั้นตอนหรือเงื่อนไขชัดเจน</li>
                            <li>อธิบายเหตุผลของการแก้ปัญหาได้</li>
                        </ul>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>

    <?php if ($game_id === 4): ?>
        <script src="../assets/js/logic_game/debug_challenge_preview.js"></script>
    <?php endif; ?>
    <script>
        const GAME_ID = <?php echo $game_id; ?>;
        const fieldKeys = <?php echo json_encode(array_keys($config['fields'] ?? [])); ?>;
        const existingWork = <?php echo json_encode($existing, JSON_UNESCAPED_UNICODE); ?>;
        let debugTested = !!existingWork.tested;

        function selectedDebugWorkData() {
            const symptom = document.querySelector('input[name="symptom-id"]:checked')?.value || existingWork.symptomId || 'muddy_carrot';
            return window.DebugChallengePreview.buildWorkData({
                symptomId: symptom,
                title: document.getElementById('debug-title').value,
                bugTarget: document.getElementById('bug-target').value,
                correctFix: document.getElementById('correct-fix').value,
                tested: debugTested,
                playtest_note: document.getElementById('playtest-note').value.trim()
            });
        }

        function renderDebugBuilder() {
            if (GAME_ID !== 4) return;
            const grid = document.getElementById('symptom-grid');
            const selected = existingWork.symptomId || 'muddy_carrot';
            grid.innerHTML = Object.entries(window.DebugChallengePreview.presets).map(([id, preset]) => `
                <label class="debug-builder-choice">
                    <input type="radio" name="symptom-id" value="${id}" ${id === selected ? 'checked' : ''}>
                    <strong>${preset.title}</strong>
                    <div class="small text-muted mt-1">${preset.themeLabel}</div>
                    <div class="small mt-2">${preset.problemText}</div>
                </label>
            `).join('');
            grid.addEventListener('change', () => {
                debugTested = false;
                updateDebugOptions();
            });
            updateDebugOptions();
        }

        function updateDebugOptions() {
            const symptom = document.querySelector('input[name="symptom-id"]:checked')?.value || 'muddy_carrot';
            const preset = window.DebugChallengePreview.getPreset(symptom);
            const bugSelect = document.getElementById('bug-target');
            const fixSelect = document.getElementById('correct-fix');
            bugSelect.innerHTML = preset.bugTargetChoices.map((item) => `<option value="${item.id}">${item.label}</option>`).join('');
            fixSelect.innerHTML = preset.fixChoices.map((item) => `<option value="${item.id}">${item.label}</option>`).join('');
            bugSelect.value = existingWork.symptomId === symptom ? (existingWork.bugTarget || preset.bugTarget) : preset.bugTarget;
            fixSelect.value = existingWork.symptomId === symptom ? (existingWork.correctFix || preset.correctFix) : preset.correctFix;
            document.getElementById('debug-title').value = document.getElementById('debug-title').value || preset.title;
            updateTestStatus();
            window.DebugChallengePreview.renderPreview('debug-preview', selectedDebugWorkData());
        }

        function updateTestStatus() {
            const badge = document.getElementById('test-status');
            if (!badge) return;
            badge.className = `badge rounded-pill px-3 py-2 ${debugTested ? 'text-bg-success' : 'text-bg-light border text-secondary'}`;
            badge.textContent = debugTested ? 'ทดลองแล้ว พร้อมส่ง' : 'ยังไม่ได้ทดลอง';
        }

        if (GAME_ID === 4) {
            renderDebugBuilder();
            document.getElementById('debug-title').addEventListener('input', () => window.DebugChallengePreview.renderPreview('debug-preview', selectedDebugWorkData()));
            document.getElementById('bug-target').addEventListener('change', () => { debugTested = false; updateTestStatus(); window.DebugChallengePreview.renderPreview('debug-preview', selectedDebugWorkData()); });
            document.getElementById('correct-fix').addEventListener('change', () => { debugTested = false; updateTestStatus(); window.DebugChallengePreview.renderPreview('debug-preview', selectedDebugWorkData()); });
            document.getElementById('test-debug-work').addEventListener('click', () => {
                const symptom = document.querySelector('input[name="symptom-id"]:checked')?.value || 'muddy_carrot';
                const preset = window.DebugChallengePreview.getPreset(symptom);
                if (document.getElementById('bug-target').value !== preset.bugTarget || document.getElementById('correct-fix').value !== preset.correctFix) {
                    alert('ยังทดลองไม่ผ่าน ลองตรวจจุดผิดและวิธีซ่อมอีกครั้ง');
                    debugTested = false;
                    updateTestStatus();
                    return;
                }
                debugTested = true;
                document.getElementById('playtest-note').value = `ทดลองแล้ว ${preset.feedback.afterFix}`;
                updateTestStatus();
                window.DebugChallengePreview.renderPreview('debug-preview', selectedDebugWorkData());
            });
        }

        document.getElementById('project-form').addEventListener('submit', function (event) {
            event.preventDefault();
            let workData;
            let missing = false;

            if (GAME_ID === 4) {
                workData = selectedDebugWorkData();
                if (!workData.title || !workData.playtest_note) missing = true;
                if (!workData.tested) {
                    alert('กรุณากดทดลองเล่นให้ผ่านก่อนส่งโจทย์ให้เพื่อน');
                    return;
                }
            } else {
                workData = {
                    project_type: 'structured_reflection',
                    game_id: GAME_ID
                };
                fieldKeys.forEach((key) => {
                    const value = document.getElementById(`field-${key}`).value.trim();
                    workData[key] = value;
                    if (!value) missing = true;
                });
            }

            const description = document.getElementById('description').value.trim();
            if (!description) missing = true;

            if (missing) {
                alert('กรุณากรอกข้อมูลให้ครบทุกช่องก่อนส่งชิ้นงาน');
                return;
            }

            fetch('../api/save_work.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_id: GAME_ID,
                    description,
                    items: workData
                })
            })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    window.location.href = `showcase.php?game_id=${GAME_ID}`;
                    return;
                }
                alert(data.error || data.message || 'บันทึกชิ้นงานไม่สำเร็จ');
            })
            .catch(() => alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
        });
    </script>
</body>
</html>
