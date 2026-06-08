<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

require_once '../includes/auth.php';
if (!is_student_like() || is_visitor_mode()) {
    header("Location: login.php");
    exit();
}

$game_id = 3;
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
    if (is_array($decoded) && ($decoded['project_type'] ?? '') === 'smart_farm_mini_game') {
        $existingData = $decoded;
    }
    $existingDesc = $work['description'] ?? '';
    if (($work['status'] ?? '') === 'revision') {
        $revisionFeedback = $work['feedback'];
    }
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>สร้างด่านฟาร์มอัจฉริยะของฉัน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../assets/css/conveyor_logic.css">
    <link rel="stylesheet" href="../assets/css/smart_farm_builder.css">
</head>

<body class="smart-builder-page">
    <header class="builder-hero">
        <div class="container-fluid px-lg-5">
            <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-light btn-sm rounded-pill mb-3">
                <i class="bi bi-arrow-left"></i> กลับหน้าเลือกด่าน
            </a>
            <div class="d-flex flex-wrap align-items-end justify-content-between gap-3">
                <div>
                    <h1 class="fw-bold mb-1"><i class="bi bi-diagram-3-fill me-2"></i>สร้างด่านฟาร์มอัจฉริยะของฉัน</h1>
                    <p class="fs-5 mb-0 opacity-75">Smart Farm Mini Game Builder: ออกแบบวัตถุ เงื่อนไข กฎ และทดสอบให้เล่นได้จริง</p>
                </div>
                <span class="builder-version-pill">บทที่ 3: ผู้จัดการฟาร์มอัจฉริยะ</span>
            </div>
        </div>
    </header>

    <main class="container-fluid px-lg-5 py-4">
        <?php if ($revisionFeedback): ?>
            <div class="alert alert-warning border-0 shadow-sm rounded-3">
                <h5 class="fw-bold"><i class="bi bi-arrow-return-left"></i> คุณครูส่งงานกลับให้แก้ไข</h5>
                <p class="mb-0"><?php echo htmlspecialchars($revisionFeedback); ?></p>
            </div>
        <?php endif; ?>

        <section id="smart-farm-builder"
            data-game-id="<?php echo $game_id; ?>"
            data-existing='<?php echo htmlspecialchars(json_encode($existingData, JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8'); ?>'
            data-existing-desc="<?php echo htmlspecialchars($existingDesc, ENT_QUOTES, 'UTF-8'); ?>">

            <div class="builder-grid">
                <aside class="builder-panel builder-setup-panel">
                    <div class="panel-head">
                        <span class="step-dot">1</span>
                        <div>
                            <h2>เลือกชนิดเกม</h2>
                            <p>ระบบจะจัดช่องกฎให้ตรงกับระดับตรรกะ</p>
                        </div>
                    </div>
                    <div id="logic-type-cards" class="logic-card-grid"></div>

                    <div class="panel-head mt-4">
                        <span class="step-dot">2</span>
                        <div>
                            <h2>ชื่อด่านและภารกิจ</h2>
                            <p>เขียนสั้น กระชับ และชัดเจนสำหรับเพื่อน</p>
                        </div>
                    </div>
                    <div class="builder-field-stack">
                        <label>
                            <span>ชื่อด่าน</span>
                            <input id="level-title" class="form-control" maxlength="60" placeholder="เช่น โรงคัดไข่ไก่บ้านนาอุดม">
                        </label>
                        <label>
                            <span>ภารกิจ</span>
                            <textarea id="level-mission" class="form-control" maxlength="150" rows="3" placeholder="เช่น ช่วยคัดไข่ไก่ก่อนส่งตลาด"></textarea>
                        </label>
                        <label>
                            <span>คำแนะนำก่อนเล่น</span>
                            <textarea id="level-instruction" class="form-control" maxlength="150" rows="3" placeholder="เช่น สังเกตขนาดของไข่และรอยร้าวให้ดี"></textarea>
                        </label>
                    </div>
                </aside>

                <section class="builder-panel builder-workbench-panel">
                    <div class="panel-head">
                        <span class="step-dot">3</span>
                        <div>
                            <h2>เลือกวัตถุบนสายพาน</h2>
                            <p>เลือกจากคลัง แล้วตั้งตัวหลอกและปลายทางที่ถูกต้อง</p>
                        </div>
                    </div>

                    <div class="catalog-toolbar">
                        <div class="catalog-filter" id="catalog-filter"></div>
                    </div>
                    <div id="item-catalog" class="item-catalog"></div>

                    <div class="selected-head">
                        <h3><i class="bi bi-list-check text-success"></i> วัตถุในด่านของฉัน</h3>
                        <span id="selected-count" class="badge rounded-pill text-bg-light border">0 ชิ้น</span>
                    </div>
                    <div id="selected-items" class="selected-items"></div>
                </section>

                <section class="builder-panel builder-rule-panel">
                    <div class="panel-head">
                        <span class="step-dot">4</span>
                        <div>
                            <h2>สร้างเงื่อนไข คำสั่ง และกฎ</h2>
                            <p>เลือกเงื่อนไขจากวัตถุหลัก แล้วเลือกปลายทางที่ถูกต้องให้สายพาน</p>
                        </div>
                    </div>

                    <div id="builder-rule-guide" class="rule-guide"></div>

                    <div class="rule-builder-shell">
                        <section class="conveyor-panel program-panel">
                            <div class="program-head">
                                <div>
                                    <h4>แผงกฎของด่าน</h4>
                                    <p id="builder-rule-caption">วางกฎให้ระบบอ่านจากบนลงล่าง</p>
                                </div>
                                <div class="block-trash" id="builder-block-trash">ลากบล็อกที่วางแล้วมาที่นี่เพื่อลบ</div>
                            </div>
                            <div class="rule-list" id="builder-rule-list"></div>
                            <div id="builder-readable-rules" class="readable-rules"></div>
                        </section>

                        <aside class="conveyor-panel toolbox-panel">
                            <div class="toolbox-head">
                                <h4>บล็อกที่ใช้สร้างกฎ</h4>
                                <button type="button" id="auto-fill-rules" class="btn btn-sm btn-outline-success rounded-pill fw-bold">
                                    <i class="bi bi-stars"></i> ใส่ตัวอย่างเริ่มต้น
                                </button>
                            </div>
                            <section class="palette-group">
                                <h4>1. ลากเงื่อนไข</h4>
                                <div class="block-list" id="builder-condition-blocks"></div>
                            </section>
                            <section class="palette-group">
                                <h4>2. ลากปลายทาง</h4>
                                <div class="block-list" id="builder-action-blocks"></div>
                            </section>
                        </aside>
                    </div>
                </section>

                <section class="builder-panel builder-test-panel">
                    <div class="panel-head">
                        <span class="step-dot">5</span>
                        <div>
                            <h2>ทดลองเล่นและส่งผลงาน</h2>
                            <p>ต้องทดสอบอย่างน้อย 1 ครั้งก่อนส่งให้ครูและเพื่อนเล่น</p>
                        </div>
                    </div>

                    <div id="validation-box" class="validation-box">เพิ่มข้อมูลด่าน แล้วระบบจะแจ้งสิ่งที่ยังต้องแก้ตรงนี้</div>

                    <div class="game-board" id="builder-game-board">
                        <div class="conveyor-play-area" id="builder-play-area">
                            <div class="destination-row" id="builder-destinations"></div>
                            <div class="scan-station">
                                <span class="scan-light"></span>
                                <strong>SCAN</strong>
                            </div>
                            <div class="belt-line"></div>
                            <div id="moving-item-layer" class="moving-item-layer"></div>
                        </div>
                        <div class="item-preview-bar" id="builder-preview-bar"></div>
                    </div>

                    <div class="test-result-grid">
                        <button type="button" id="run-test" class="btn btn-primary btn-lg rounded-pill fw-bold">
                            <i class="bi bi-play-fill"></i> ทดลองเล่นด่านของฉัน
                        </button>
                        <button type="button" id="submit-work" class="btn btn-success btn-lg rounded-pill fw-bold" disabled>
                            <i class="bi bi-cloud-arrow-up-fill"></i> ส่งชิ้นงาน
                        </button>
                    </div>
                    <div id="test-result" class="test-result-box">ยังไม่ได้ทดลองเล่น</div>
                </section>
            </div>
        </section>
    </main>

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
    <script src="../assets/js/logic_game/conveyor_drag_drop.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_validation.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_preview.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder.js"></script>
</body>
</html>
