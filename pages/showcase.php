<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
require_once '../includes/db.php';
require_once '../includes/context.php';
require_once '../includes/assessment.php';
assessment_require_pretest_for_game($conn);
$lessons = require __DIR__ . '/../config/lessons.php';
$game_id = intval($_GET['game_id'] ?? 1);
$context = session_context();
$project_pages = [
    1 => 'create_project_logic.php',
    2 => 'create_project_algo.php',
    3 => 'create_project_condition.php',
    4 => 'create_project_debug.php'
];
$project_page = $project_pages[$game_id] ?? 'create_project_logic.php';

// ใช้ config กลางแทน hard-code $game_meta
$lesson = $lessons[$game_id] ?? $lessons[1];
$current_game = [
    'lesson_no'   => 'บทที่ ' . $game_id,
    'title'       => $lesson['title'],
    'icon'        => $lesson['bi_icon'],
    'theme'       => $lesson['theme'],
    'modal_title' => $lesson['modal_heading'],
];
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ลานโชว์ผลงาน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../assets/css/smart_farm_builder.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #f0fdf4;
            min-height: 100vh;
        }

        .header-section {
            background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
            color: white;
            padding: 60px 0 40px;
            margin-bottom: 40px;
            border-bottom-left-radius: 50px;
            border-bottom-right-radius: 50px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .work-card {
            border: 3px solid #e2e8f0;
            border-radius: 20px;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
            background: white;
            height: 100%;
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .work-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 30px rgba(16, 185, 129, 0.2);
            border-color: #34d399;
        }

        .work-card.reviewed-card {
            border: 4px solid #fbbf24;
            background: #fffbeb;
            box-shadow: 0 10px 20px rgba(245, 158, 11, 0.15);
        }
        .work-card.reviewed-card:hover {
            box-shadow: 0 15px 30px rgba(245, 158, 11, 0.3);
            border-color: #f59e0b;
        }

        .badge-reviewed {
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white;
            padding: 6px 15px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 0.85rem;
            z-index: 20;
            box-shadow: 0 4px 10px rgba(217, 119, 6, 0.4);
            pointer-events: none;
        }

        .lesson-badge {
            position: absolute;
            top: 15px;
            left: 15px;
            z-index: 20;
            background: rgba(37, 99, 235, .95);
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 999px;
            font-size: .78rem;
            font-weight: 800;
            box-shadow: 0 4px 10px rgba(37, 99, 235, .25);
            pointer-events: none;
        }

        .project-summary {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .preview-box {
            position: relative;
            width: 100%;
            padding-top: 60%;
            background-color: #f8fafc;
            overflow: hidden;
            border-bottom: 3px dashed #e2e8f0;
            cursor: pointer;
        }

        .preview-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .bg-grid-pattern {
            background-color: #ffffff;
            background-image: 
                linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .zoom-hint {
            position: absolute;
            bottom: 10px;
            right: 10px;
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 6px 15px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
            opacity: 0;
            transition: 0.3s;
            pointer-events: none;
            z-index: 15;
        }
        .preview-box:hover .zoom-hint { opacity: 1; }

        .btn-like {
            border: 2px solid #eee;
            background: #f8f9fa;
            color: #ccc;
            border-radius: 50px;
            padding: 5px 15px;
            transition: 0.3s;
            font-weight: bold;
        }
        .btn-like:hover { background: #ffebee; color: #ff5252; border-color: #ff5252; }
        .btn-like.liked { background: #ff5252; color: white; border-color: #ff5252; }
        
        .member-list-box {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 8px 12px;
            font-size: 0.8rem;
            line-height: 1.4;
            margin-top: 8px;
            border: 1px dashed #cbd5e1;
        }

        /* 🟢 สไตล์สำหรับกล่องข้อเสนอแนะจากครู */
        .feedback-box {
            background-color: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.85rem;
            margin-top: 10px;
        }

        /* 🟢 Debug Mode preview card */
        .debug-preview-card {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 14px;
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .debug-preview-card .debug-title {
            font-weight: 800;
            color: #9a3412;
            font-size: 22px;
            margin-bottom: 10px;
        }
        .debug-preview-card .debug-field {
            margin-bottom: 6px;
            font-size: 16px;
            color: #451a03;
        }
        .debug-preview-card .debug-field strong {
            color: #c2410c;
        }

        /* 🟢 Fallback card */
        .fallback-preview {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            padding: 24px;
            color: #94a3b8;
        }
    </style>
</head>

<body>

    <div class="header-section text-center">
        <div class="container">
            <h1 class="fw-bold display-5 mb-2">
                <i class="bi <?php echo $current_game['icon']; ?> text-warning"></i>
                ลานโชว์ผลงาน <?php echo $current_game['lesson_no']; ?>
            </h1>
            <p class="fs-5 opacity-75 mb-1"><?php echo htmlspecialchars($current_game['title']); ?></p>
            <p class="opacity-75 mb-0">รวมผลงานสร้างสรรค์จากภารกิจของบทเรียนนี้</p>
            <div class="mt-4">
                <?php
                $user_id = $_SESSION['user_id'];
                $sql_work = "SELECT status FROM student_works WHERE user_id = $user_id AND game_id = $game_id AND learning_session_id = {$context['learning_session_id']} LIMIT 1";
                $res_work = $conn->query($sql_work);
                $has_work = ($res_work && $res_work->num_rows > 0);
                $work_status = $has_work ? $res_work->fetch_assoc()['status'] : null;

                $btn_text = "สร้างโจทย์ของทีมฉัน";
                $btn_icon = "bi-plus-lg";
                $btn_style = "btn-warning text-dark";

                if ($has_work) {
                    if ($work_status === 'revision') {
                        $btn_text = "เข้าไปแก้ไขงานด่วน";
                        $btn_icon = "bi-exclamation-triangle-fill";
                        $btn_style = "btn-danger";
                    } else {
                        $btn_text = "แก้ไขโจทย์ของทีมฉัน";
                        $btn_icon = "bi-pencil-square";
                    }
                }
                ?>
                <a href="<?php echo $project_page; ?>?game_id=<?php echo $game_id; ?>" class="btn <?php echo $btn_style; ?> rounded-pill px-4 fw-bold me-2 shadow-sm">
                    <i class="bi <?php echo $btn_icon; ?>"></i> <?php echo $btn_text; ?>
                </a>
                <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-outline-light rounded-pill px-4 fw-bold">กลับหน้าเลือกด่าน</a>
            </div>
        </div>
    </div>

    <div class="container pb-5">
        <div id="gallery-grid" class="row g-4">
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-success" role="status"></div>
                <p class="mt-2 text-muted fw-bold">กำลังรวบรวมผลงานจากภารกิจการเรียนรู้...</p>
            </div>
        </div>
    </div>

    <div class="modal fade" id="presentationModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
                <div class="modal-header bg-success text-white border-0 py-3">
                    <h4 class="modal-title fw-bold" id="modal-title-text"><i class="bi bi-easel-fill me-2"></i> นำเสนอผลงาน</h4>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-0 bg-light">
                    <div class="preview-box border-bottom border-5 border-success" style="border-radius: 0; cursor: default;">
                        <div id="modal-canvas-content" class="preview-content"></div>
                    </div>
                    <div class="p-4 bg-white">
                        <div id="modal-members-area"></div>
                        <div id="modal-project-summary" class="mb-3"></div>
                        
                        <div class="row align-items-start">
                            <div class="col-md-8">
                                <h5 class="fw-bold text-success mb-2" id="modal-section-title">📜 กติกาและเงื่อนไขของด่าน:</h5>
                                <p id="modal-desc" class="text-dark fs-5 mb-3" style="white-space: pre-wrap; line-height: 1.6;"></p>
                                
                                <div id="modal-feedback-area"></div>
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge bg-light text-secondary border fs-6 px-3 py-2" id="modal-time"></span>
                                <div id="modal-action-area"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_validation.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_preview.js"></script>
    <script>
        const ASSET_PATH = '../assets/img/';
        const GAME_ID = <?php echo $game_id; ?>;
        const GAME_META = <?php echo json_encode($current_game, JSON_UNESCAPED_UNICODE); ?>;
        
        const ITEM_SIZES = {
            'basket': 160, 'weed_spiky': 120, 'weed_round': 120, 'bug_red': 100, 'bug_blue': 100,
            'newseed': 100, 'fert_green_bag': 120, 'fert_red_bag': 120, 'fert_green_round': 100,
            'fert_green_square': 100, 'fert_red_round': 100, 'fert_red_square': 100
        };

        // ========================================
        // 🟢 BUG TYPE LABELS (Thai translations)
        // ========================================
        const BUG_TYPE_LABELS = {
            wrong_condition: 'เงื่อนไขผิด',
            wrong_action: 'คำสั่งผิด',
            too_broad_condition: 'เงื่อนไขกว้างเกินไป',
            too_narrow_condition: 'เงื่อนไขแคบเกินไป',
            wrong_else_action: 'คำสั่งกรณีอื่นผิด',
            wrong_order: 'ลำดับกฎผิด',
            boundary_error: 'ขอบเขตตัวเลขผิด',
            missing_condition: 'ขาดเงื่อนไข',
            missing_action: 'ขาดคำสั่ง',
            extra_rule: 'มีกฎเกินจำเป็น',
            action: 'คำสั่ง',
            order: 'ลำดับเงื่อนไข',
            broad_condition: 'เงื่อนไขกว้างเกินไป',
            repeat_count: 'จำนวนรอบ'
        };

        function bugTypeLabel(type) {
            return BUG_TYPE_LABELS[type] || type || 'บั๊กของกฎระบบ';
        }

        // ========================================
        // 🟢 SHOWCASE RENDERERS - แยกตาม game_id
        // ========================================

        // --- DEFAULT / FALLBACK ---
        const DefaultShowcaseRenderer = {
            getSummary(data) { return null; },
            renderBadges(summary) { return ''; },
            renderPreview(stage, data, bgType) {
                stage.classList.remove('bg-grid-pattern');
                stage.style.background = '#f1f5f9';
                stage.innerHTML = `
                    <div class="fallback-preview">
                        <i class="bi bi-file-earmark-x display-4"></i>
                        <div class="mt-2 fw-bold">ไม่สามารถแสดงตัวอย่างผลงานนี้ได้</div>
                        <div class="small">ข้อมูลชิ้นงานอาจเป็นรูปแบบเก่าหรือไม่สมบูรณ์</div>
                    </div>
                `;
            },
            renderModal(work, data) { return ''; },
            getPlayUrl(work, data) { return null; },
            getPlayButtonHTML(work, data) { return ''; },
            getModalTitle() { return '📜 กติกาและเงื่อนไขของด่าน:'; }
        };

        // --- บทที่ 1: Logic Sorting ---
        const LogicShowcaseRenderer = {
            getSummary(data) { return null; },
            renderBadges(summary) { return ''; },
            renderPreview(stage, data, bgType) {
                // Chapter 1 uses array layout (objects on canvas)
                if (Array.isArray(data)) {
                    renderLogicArrayPreview(stage, data, bgType);
                } else {
                    renderStructuredPreview(stage, data);
                }
            },
            renderModal(work, data) { return ''; },
            getPlayUrl(work, data) { return null; },
            getPlayButtonHTML(work, data) { return ''; },
            getModalTitle() { return '📜 เงื่อนไขของโจทย์:'; }
        };

        // --- บทที่ 2: Tractor Route ---
        const TractorRouteShowcaseRenderer = {
            getSummary(data) {
                if (!data || data.project_type !== 'tractor_route') return null;
                const missionLabels = { target: 'ไปถึงจุดหมาย', obstacle: 'หลบสิ่งกีดขวาง', harvest: 'เก็บเกี่ยวผลผลิต' };
                return {
                    kind: 'tractor_route',
                    mission: missionLabels[data.mission_type] || 'เส้นทางรถไถ',
                    commandCount: Array.isArray(data.commands) ? data.commands.length : 0,
                    obstacleCount: Array.isArray(data.obstacles) ? data.obstacles.length : 0,
                    cropCount: Array.isArray(data.crops) ? data.crops.length : 0,
                    validated: !!data.validated
                };
            },
            renderBadges(summary) {
                if (!summary) return '';
                return `
                    <div class="project-summary small mt-2">
                        <span class="badge text-bg-primary rounded-pill">${summary.mission}</span>
                        <span class="badge text-bg-light border rounded-pill">วิธีตัวอย่าง ${summary.commandCount}</span>
                        <span class="badge text-bg-light border rounded-pill">อุปสรรค ${summary.obstacleCount}</span>
                        ${summary.cropCount > 0 ? `<span class="badge text-bg-light border rounded-pill">ผลผลิต ${summary.cropCount}</span>` : ''}
                        <span class="badge ${summary.validated ? 'text-bg-success' : 'text-bg-danger'} rounded-pill">
                            ${summary.validated ? 'ทดสอบผ่าน' : 'ยังไม่ผ่าน'}
                        </span>
                    </div>
                `;
            },
            renderPreview(stage, data) {
                renderTractorRoutePreview(stage, data);
            },
            renderModal(work, data) {
                const summary = this.getSummary(data);
                if (!summary) return '';
                return `
                    <div class="alert alert-primary py-2 small mb-3 border-0 shadow-sm rounded-3">
                        <strong>${GAME_META.lesson_no}: ${GAME_META.title}</strong><br>
                        ประเภทภารกิจ: ${summary.mission} |
                        วิธีตัวอย่าง ${summary.commandCount} |
                        อุปสรรค ${summary.obstacleCount} |
                        ผลผลิต ${summary.cropCount} |
                        ${summary.validated ? 'ทดสอบผ่านแล้ว' : 'ยังไม่ผ่านการทดสอบ'}
                    </div>
                `;
            },
            getPlayUrl(work, data) {
                const summary = this.getSummary(data);
                return summary?.validated ? `play_student_work.php?work_id=${work.id}` : null;
            },
            getPlayButtonHTML(work, data) {
                const url = this.getPlayUrl(work, data);
                if (url) {
                    return `<a href="${url}" class="btn btn-primary btn-sm rounded-pill fw-bold mt-2 align-self-start"><i class="bi bi-play-fill"></i> ลองเล่นโจทย์นี้</a>`;
                }
                const summary = this.getSummary(data);
                if (summary) {
                    return `<span class="badge text-bg-light border text-secondary rounded-pill mt-2 align-self-start">ยังไม่พร้อมให้เล่น</span>`;
                }
                return '';
            },
            getModalTitle() { return '📜 ภารกิจเส้นทางรถไถ:'; }
        };

        // --- บทที่ 3: Smart Farm Mini Game ---
        const SmartFarmShowcaseRenderer = {
            getSummary(data) {
                if (!data || data.project_type !== 'smart_farm_mini_game') return null;
                const raw = window.SmartFarmBuilderPreview?.getSummary(data);
                return raw ? { ...raw, kind: 'smart_farm' } : null;
            },
            renderBadges(summary) {
                return window.SmartFarmBuilderPreview?.renderBadges(summary) || '';
            },
            renderPreview(stage, data) {
                if (data.project_type === 'smart_farm_mini_game' && window.SmartFarmBuilderPreview?.renderSummary(stage, data)) {
                    return;
                }
                renderStructuredPreview(stage, data);
            },
            renderModal(work, data) {
                const summary = this.getSummary(data);
                if (!summary) return '';
                return `
                    <div class="alert alert-success py-2 small mb-3 border-0 shadow-sm rounded-3">
                        <strong>${escapeHtml(summary.title)}</strong><br>
                        ${escapeHtml(summary.logic)} |
                        วัตถุ ${summary.itemCount} |
                        ตัวหลอก ${summary.decoyCount} |
                        ${summary.tested ? `ทดสอบแล้ว ${Math.round(summary.accuracy * 100)}%` : 'ยังไม่พร้อมให้เล่น'}
                    </div>
                `;
            },
            getPlayUrl(work, data) {
                const summary = this.getSummary(data);
                return summary?.tested ? `play_smart_farm_work.php?work_id=${work.id}` : null;
            },
            getPlayButtonHTML(work, data) {
                const url = this.getPlayUrl(work, data);
                if (url) {
                    return `<a href="${url}" class="btn btn-success btn-sm rounded-pill fw-bold mt-2 align-self-start"><i class="bi bi-play-fill"></i> เล่นด่านของเพื่อน</a>`;
                }
                if (this.getSummary(data)) {
                    return `<span class="badge text-bg-light border text-secondary rounded-pill mt-2 align-self-start">ยังไม่พร้อมให้เล่น</span>`;
                }
                return '';
            },
            getModalTitle() { return '📜 กติกาด่านสายพาน:'; }
        };

        // --- บทที่ 4: Debug Mode (ใหม่ + Lite เก่า + Debug Challenge เก่า) ---
        const DebugModeShowcaseRenderer = {
            getSummary(data) {
                if (!data) return null;
                const pt = data.project_type || '';
                // Debug Mode (conveyor-based)
                if (pt === 'smart_farm_debug_mode') {
                    return {
                        kind: 'debug_mode',
                        title: data.title || 'โจทย์ซ่อมกฎฟาร์ม',
                        bugType: bugTypeLabel(data.bug_type),
                        logicType: data.logic_type || 'if_else',
                        problem: data.problem || data.mission || '',
                        tested: !!data.tested,
                        testResult: data.test_result || null,
                        isLegacy: false
                    };
                }
                // Lite challenge
                if (pt === 'smart_farm_debug_lite_challenge') {
                    return {
                        kind: 'debug_lite',
                        title: data.title || 'โจทย์ซ่อมกฎฟาร์ม',
                        system: data.themeLabel || data.theme || 'ฟาร์ม',
                        bugType: bugTypeLabel(data.bugTarget) || 'หาจุดผิด',
                        symptom: data.problemText || '',
                        tested: !!data.tested,
                        isLegacy: false
                    };
                }
                // Old debug challenge (legacy)
                if (pt === 'smart_farm_debug_challenge') {
                    return {
                        kind: 'debug_challenge_legacy',
                        title: data.title || 'โจทย์ซ่อมกฎฟาร์ม',
                        system: data.system_theme || 'ระบบฟาร์ม',
                        bugType: bugTypeLabel(data.bug_type) || 'ซ่อมกฎ',
                        symptom: data.symptom || '',
                        tested: false,
                        isLegacy: true
                    };
                }
                return null;
            },
            renderBadges(summary) {
                if (!summary) return '';
                let badges = `
                    <div class="project-summary small mt-2">
                        <span class="badge text-bg-warning rounded-pill">${escapeHtml(summary.bugType)}</span>
                `;
                if (summary.system) {
                    badges += `<span class="badge text-bg-light border rounded-pill">${escapeHtml(summary.system)}</span>`;
                }
                if (summary.tested) {
                    badges += `<span class="badge text-bg-success rounded-pill">ทดสอบแล้ว</span>`;
                }
                if (summary.isLegacy) {
                    badges += `<span class="badge text-bg-secondary rounded-pill">รูปแบบเก่า</span>`;
                }
                badges += '</div>';
                return badges;
            },
            renderPreview(stage, data) {
                const summary = this.getSummary(data);
                stage.classList.remove('bg-grid-pattern');
                stage.style.backgroundImage = '';
                stage.style.background = '#fff7ed';
                stage.style.padding = '0';
                stage.style.overflow = 'hidden';

                if (!summary) {
                    stage.innerHTML = `
                        <div class="fallback-preview">
                            <i class="bi bi-wrench-adjustable display-4 text-warning"></i>
                            <div class="mt-2 fw-bold text-secondary">ผลงานนี้ใช้รูปแบบข้อมูลที่ระบบยังไม่รองรับ</div>
                        </div>
                    `;
                    return;
                }

                stage.innerHTML = `
                    <div class="debug-preview-card">
                        <div class="debug-title">${escapeHtml(summary.title)}</div>
                        <div class="debug-field"><strong>ประเภทจุดผิด:</strong> ${escapeHtml(summary.bugType)}</div>
                        ${summary.problem ? `<div class="debug-field"><strong>อาการ:</strong> ${escapeHtml(summary.problem)}</div>` : ''}
                        ${summary.symptom ? `<div class="debug-field"><strong>อาการ:</strong> ${escapeHtml(summary.symptom)}</div>` : ''}
                        ${summary.system ? `<div class="debug-field"><strong>ฉาก:</strong> ${escapeHtml(summary.system)}</div>` : ''}
                        ${summary.logicType ? `<div class="debug-field"><strong>ตรรกะ:</strong> ${escapeHtml(summary.logicType)}</div>` : ''}
                        <div class="debug-field"><strong>สถานะ:</strong> ${summary.tested ? '✅ ทดสอบแล้ว' : '⏳ ยังไม่ทดสอบ'}</div>
                        ${summary.isLegacy ? '<div class="debug-field text-secondary"><small>📦 รูปแบบเก่า</small></div>' : ''}
                    </div>
                `;
            },
            renderModal(work, data) {
                const summary = this.getSummary(data);
                if (!summary) return '';
                return `
                    <div class="alert alert-warning py-2 small mb-3 border-0 shadow-sm rounded-3">
                        <strong>${escapeHtml(summary.title)}</strong><br>
                        ${escapeHtml(summary.bugType)}
                        ${summary.system ? ` | ${escapeHtml(summary.system)}` : ''}
                        ${summary.tested ? ' | ทดสอบแล้ว' : ''}
                        ${summary.isLegacy ? ' | รูปแบบเก่า' : ''}
                    </div>
                `;
            },
            getPlayUrl(work, data) {
                const summary = this.getSummary(data);
                if (!summary || !summary.tested) return null;
                if (summary.isLegacy) return null; // Legacy works may not be playable
                return `play_debug_work.php?work_id=${work.id}`;
            },
            getPlayButtonHTML(work, data) {
                const summary = this.getSummary(data);
                if (!summary) return '';
                const url = this.getPlayUrl(work, data);
                if (url) {
                    return `<a href="${url}" class="btn btn-warning btn-sm rounded-pill fw-bold mt-2 align-self-start"><i class="bi bi-wrench-adjustable"></i> เล่นโจทย์ซ่อมกฎของเพื่อน</a>`;
                }
                if (summary.isLegacy) {
                    return `<span class="badge text-bg-secondary rounded-pill mt-2 align-self-start">ผลงานรุ่นเก่า อาจเล่นไม่ได้</span>`;
                }
                return `<span class="badge text-bg-light border text-secondary rounded-pill mt-2 align-self-start">ยังไม่พร้อมให้เล่น</span>`;
            },
            getModalTitle() { return '📜 รายละเอียดโจทย์ซ่อมกฎ:'; }
        };

        // --- Renderer Registry ---
        const ShowcaseRenderers = {
            1: LogicShowcaseRenderer,
            2: TractorRouteShowcaseRenderer,
            3: SmartFarmShowcaseRenderer,
            4: DebugModeShowcaseRenderer
        };

        function getRenderer(gameId) {
            return ShowcaseRenderers[gameId] || DefaultShowcaseRenderer;
        }

        // ========================================
        // 🟢 STRUCTURED LABELS (for legacy data)
        // ========================================
        const STRUCTURED_LABELS = {
            map: 'แผนที่หรือฉากที่ออกแบบ',
            commands: 'ลำดับคำสั่งตัวอย่าง',
            situation: 'สถานการณ์ของแปลงผัก',
            rules: 'เงื่อนไข If-Then-Else',
            reason: 'เหตุผล',
            title: 'ชื่อโจทย์ซ่อมกฎ',
            system_theme: 'ระบบฟาร์มที่เลือก',
            bug_type: 'ประเภทจุดผิด',
            correct_rules: 'กฎที่ถูกต้อง',
            buggy_rules: 'กฎที่ใส่จุดผิด',
            symptom: 'อาการที่ผู้เล่นจะเห็น',
            bug_targets: 'จุดที่เป็นจุดผิด',
            fix_explanation: 'วิธีแก้และเหตุผล',
            playtest_note: 'ผลการทดลองเล่นโจทย์',
            theme: 'ธีมฟาร์ม',
            problemText: 'อาการเสีย',
            bugTarget: 'จุดผิด',
            correctFix: 'วิธีซ่อมที่ถูกต้อง'
        };

        let worksList = {}; 
        let lastDataHash = ''; // 🟢 สำหรับเทียบว่าข้อมูลเปลี่ยนหรือยัง

        function parseWorkData(jsonData) {
            try {
                return JSON.parse(jsonData);
            } catch (e) {
                return null;
            }
        }

        // ========================================
        // 🟢 MAIN SHOWCASE LOADER (ใช้ renderer ตาม game_id)
        // ========================================
        function loadShowcase() {
            fetch(`../api/get_showcase.php?game_id=${GAME_ID}`)
                .then(res => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then(data => {
                    // 🟢 Smart refresh: ตรวจว่าข้อมูลเปลี่ยนจริงหรือไม่
                    const newHash = JSON.stringify(data.map(w => w.id + ':' + w.status + ':' + (w.like_count || 0)));
                    if (newHash === lastDataHash) return; // ข้อมูลไม่เปลี่ยน ไม่ต้อง render ใหม่
                    lastDataHash = newHash;

                    const grid = document.getElementById('gallery-grid');
                    grid.innerHTML = '';
                    worksList = {}; 

                    if (data.length === 0) {
                        grid.innerHTML = `
                            <div class="col-12 text-center py-5 text-muted">
                                <i class="bi bi-inboxes display-1 opacity-25"></i>
                                <h4 class="mt-3 fw-bold">ยังไม่มีผลงานในตอนนี้</h4>
                                <p>เป็นทีมแรกที่ส่งโจทย์เข้ามาท้าทายเพื่อนๆ สิ!</p>
                            </div>
                        `;
                        return;
                    }

                    data.forEach(work => {
                        worksList[work.id] = work; 

                        // 🟢 ใช้ game_id จาก API response (ไม่เดาจาก data)
                        const workGameId = Number(work.game_id || GAME_ID);
                        const renderer = getRenderer(workGameId);

                        const col = document.createElement('div');
                        col.className = 'col-md-6 col-lg-4 d-flex align-items-stretch';

                        const isLikedClass = (work.is_liked > 0) ? 'liked' : '';
                        
                        let descText = work.description || '-';
                        let bgType = 'grid'; 
                        
                        const bgMatch = descText.match(/\[ฉากหลัง:\s*(.*?)\]/);
                        if (bgMatch) {
                            bgType = bgMatch[1];
                            descText = descText.replace(/\[ฉากหลัง:\s*.*?\]\s*\n*/, ''); 
                        }
                        work.cleanDesc = descText; 
                        work.bgType = bgType; 

                        const isReviewed = work.status === 'reviewed';
                        const reviewedClass = isReviewed ? 'reviewed-card' : '';
                        const reviewedBadge = isReviewed ? '<div class="badge-reviewed"><i class="bi bi-award-fill"></i> ตรวจแล้ว</div>' : '';
                        const lessonBadge = `
                            <div class="lesson-badge">
                                ${GAME_META.lesson_no}: ${GAME_META.title}
                            </div>
                        `;

                        // 🟢 Parse work_data แล้วส่งให้ renderer ตาม game_id
                        const parsedWorkData = parseWorkData(work.work_data);
                        let summaryHTML = '';
                        let playButtonHTML = '';

                        if (parsedWorkData) {
                            const summary = renderer.getSummary(parsedWorkData);
                            summaryHTML = renderer.renderBadges(summary);
                            playButtonHTML = renderer.getPlayButtonHTML(work, parsedWorkData);
                        } else {
                            // 🟢 Fallback: JSON parse ไม่ได้
                            summaryHTML = `
                                <div class="project-summary small mt-2">
                                    <span class="badge text-bg-secondary rounded-pill">ข้อมูลไม่สมบูรณ์</span>
                                </div>
                            `;
                        }

                        let teamInfoHTML = '';
                        if (work.mode === 'group') {
                            teamInfoHTML = `
                                <div style="width: calc(100% - 70px);">
                                    <h5 class="fw-bold mb-0" style="color: #d35400;"><i class="bi bi-people-fill"></i> กลุ่มที่ ${work.group_number}</h5>
                                    <div class="member-list-box text-muted">
                                        <strong>สมาชิก:</strong> ${escapeHtml(work.member_names || '-')}
                                    </div>
                                </div>
                            `;
                        } else {
                            teamInfoHTML = `
                                <div style="width: calc(100% - 70px);">
                                    <h5 class="fw-bold text-success mb-0 text-truncate"><i class="bi bi-person-circle"></i> ${escapeHtml(work.student_name)}</h5>
                                    <small class="text-muted d-block mt-1">รหัสนักเรียน: ${escapeHtml(work.student_id)}</small>
                                </div>
                            `;
                        }

                        // 🟢 ประมวลผลข้อเสนอแนะจากครู (ถ้ามีการพิมพ์ให้คำชมไว้)
                        let feedbackHTML = '';
                        if (isReviewed && work.feedback && work.feedback.trim() !== '') {
                            feedbackHTML = `
                                <div class="feedback-box">
                                    <span class="text-success"><i class="bi bi-chat-heart-fill"></i> <strong>ครูณัฐดนัย:</strong> ${escapeHtml(work.feedback)}</span>
                                </div>
                            `;
                        }

                        col.innerHTML = `
                            <div class="work-card shadow-sm w-100 ${reviewedClass}">
                                ${reviewedBadge}
                                ${lessonBadge}
                                <div class="preview-box" onclick="openPresentation(${work.id})" title="คลิกเพื่อนำเสนอจอใหญ่">
                                    <div class="preview-content" id="canvas-${work.id}"></div>
                                    <div class="zoom-hint"><i class="bi bi-arrows-fullscreen"></i> ขยายเต็มจอ</div>
                                </div>
                                <div class="p-3 d-flex flex-column flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-start mb-3">
                                        ${teamInfoHTML}
                                        <button class="btn-like shadow-sm ${isLikedClass}" onclick="toggleLike(${work.id}, this)">
                                            <i class="bi bi-heart-fill"></i> <span class="like-count">${work.like_count}</span>
                                        </button>
                                    </div>
                                    ${summaryHTML}
                                    <div class="bg-light p-2 rounded flex-grow-1 border d-flex flex-column">
                                        <p class="text-secondary small mb-0" style="max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
                                            <strong>📜 คำอธิบาย:</strong><br>${escapeHtml(descText)}
                                        </p>
                                        ${feedbackHTML}
                                        ${playButtonHTML}
                                    </div>
                                </div>
                            </div>
                        `;

                        grid.appendChild(col);

                        // 🟢 Preview rendering ใช้ renderer ตาม game_id
                        const container = document.getElementById(`canvas-${work.id}`);
                        if (container && parsedWorkData) {
                            const stage = document.createElement('div');
                            stage.className = 'scalable-canvas';
                            stage.style.width = '800px';
                            stage.style.height = '480px';
                            stage.style.position = 'absolute';
                            stage.style.top = '0';
                            stage.style.left = '0';
                            stage.style.transformOrigin = 'top left';

                            if (bgType === 'farm') {
                                stage.style.backgroundImage = `url('${ASSET_PATH}bg_farm.webp')`;
                                stage.style.backgroundSize = 'cover';
                            } else if (bgType === 'barn') {
                                stage.style.backgroundImage = `url('${ASSET_PATH}bg_barn.webp')`;
                                stage.style.backgroundSize = 'cover';
                            } else if (bgType === 'v_garden') {
                                stage.style.backgroundImage = `url('${ASSET_PATH}bg_v_garden.webp')`;
                                stage.style.backgroundSize = 'cover';
                            } else {
                                stage.classList.add('bg-grid-pattern');
                            }

                            renderer.renderPreview(stage, parsedWorkData, bgType);
                            container.appendChild(stage);
                        } else if (container) {
                            // 🟢 Fallback preview for unparseable data
                            const stage = document.createElement('div');
                            stage.className = 'scalable-canvas';
                            stage.style.width = '800px';
                            stage.style.height = '480px';
                            stage.style.position = 'absolute';
                            stage.style.top = '0';
                            stage.style.left = '0';
                            stage.style.transformOrigin = 'top left';
                            DefaultShowcaseRenderer.renderPreview(stage, null, 'grid');
                            container.appendChild(stage);
                        }
                    });
                    
                    setTimeout(resizeCanvases, 100);
                })
                .catch(err => {
                    // 🟢 Error handling: ไม่ล้าง gallery เดิมเมื่อ fetch ล้มเหลว
                    console.warn('โหลดผลงานใหม่ไม่สำเร็จ:', err);
                    const grid = document.getElementById('gallery-grid');
                    // ถ้าไม่มีข้อมูลเลย (ครั้งแรก) แสดง error
                    if (Object.keys(worksList).length === 0) {
                        grid.innerHTML = `
                            <div class="col-12 text-center py-5 text-muted">
                                <i class="bi bi-wifi-off display-1 opacity-25"></i>
                                <h4 class="mt-3 fw-bold">ยังโหลดผลงานใหม่ไม่ได้</h4>
                                <p>กรุณาลองอีกครั้ง หรือรีเฟรชหน้า</p>
                            </div>
                        `;
                    }
                });
        }

        // ========================================
        // 🟢 PRESENTATION MODE (ใช้ renderer ตาม game_id)
        // ========================================
        function openPresentation(workId) {
            const work = worksList[workId];
            if(!work) return;

            const workGameId = Number(work.game_id || GAME_ID);
            const renderer = getRenderer(workGameId);

            let modalTitleStr = work.mode === 'group' ? `กลุ่มที่ ${work.group_number}` : escapeHtml(work.student_name);
            document.getElementById('modal-title-text').innerHTML = `
                <i class="bi bi-easel-fill me-2"></i> ผลงานของ: ${modalTitleStr}
                <div class="small fw-normal opacity-75 mt-1">
                    ${GAME_META.lesson_no}: ${GAME_META.title}
                </div>
            `;
            
            // 🟢 หัวข้อ modal เฉพาะบท
            document.getElementById('modal-section-title').textContent = renderer.getModalTitle();

            let membersHtml = '';
            if (work.mode === 'group') {
                membersHtml = `
                    <div class="alert alert-warning py-2 small mb-3 border-0 shadow-sm rounded-3">
                        <strong class="text-dark"><i class="bi bi-people-fill text-warning fs-5 align-middle me-1"></i> สมาชิกทีม:</strong> 
                        <span class="text-secondary ms-1">${escapeHtml(work.member_names || '-')}</span>
                    </div>`;
            }
            document.getElementById('modal-members-area').innerHTML = membersHtml;

            const parsedModalData = parseWorkData(work.work_data);
            
            // 🟢 Modal summary ใช้ renderer
            const modalSummaryHTML = parsedModalData ? renderer.renderModal(work, parsedModalData) : '';
            document.getElementById('modal-project-summary').innerHTML = modalSummaryHTML;

            document.getElementById('modal-desc').innerText = work.cleanDesc;
            document.getElementById('modal-time').innerHTML = `<i class="bi bi-clock"></i> ${timeAgo(work.submitted_at)}`;
            
            // 🟢 ปุ่มเล่นใน modal ใช้ renderer
            const modalActionArea = document.getElementById('modal-action-area');
            if (modalActionArea && parsedModalData) {
                const playUrl = renderer.getPlayUrl(work, parsedModalData);
                if (playUrl) {
                    const summary = renderer.getSummary(parsedModalData);
                    const isDebug = (workGameId === 4);
                    modalActionArea.innerHTML = `
                        <a href="${playUrl}" class="btn ${isDebug ? 'btn-warning' : 'btn-success'} btn-lg rounded-pill fw-bold shadow-sm mt-3">
                            <i class="bi ${isDebug ? 'bi-wrench-adjustable' : 'bi-controller'}"></i> ${isDebug ? 'เล่นโจทย์ซ่อมกฎของเพื่อน' : 'เล่นด่านของเพื่อน'}
                        </a>
                        <div class="small text-muted mt-2">${isDebug ? 'สังเกตอาการ หาจุดผิด ซ่อม แล้วลองใหม่' : 'ลองแก้โจทย์ของเพื่อนด้วยวิธีของคุณเอง'}</div>
                    `;
                } else {
                    modalActionArea.innerHTML = '';
                }
            } else if (modalActionArea) {
                modalActionArea.innerHTML = '';
            }
            
            // 🟢 แสดงคอมเมนต์คุณครูในหน้าจอใหญ่ด้วย
            let feedbackModalHtml = '';
            if (work.status === 'reviewed' && work.feedback && work.feedback.trim() !== '') {
                feedbackModalHtml = `
                    <div class="alert alert-success py-2 mt-2 border-0 shadow-sm rounded-3">
                        <strong class="text-success"><i class="bi bi-chat-heart-fill fs-5 align-middle me-1"></i> ข้อเสนอแนะจากคุณครู:</strong> 
                        <span class="text-dark ms-1">${escapeHtml(work.feedback)}</span>
                    </div>`;
            }
            document.getElementById('modal-feedback-area').innerHTML = feedbackModalHtml;

            // 🟢 Modal preview ใช้ renderer
            const modalContainer = document.getElementById('modal-canvas-content');
            modalContainer.innerHTML = '';
            if (parsedModalData) {
                const stage = document.createElement('div');
                stage.className = 'scalable-canvas';
                stage.style.width = '800px';
                stage.style.height = '480px';
                stage.style.position = 'absolute';
                stage.style.top = '0';
                stage.style.left = '0';
                stage.style.transformOrigin = 'top left';

                if (work.bgType === 'farm') {
                    stage.style.backgroundImage = `url('${ASSET_PATH}bg_farm.webp')`;
                    stage.style.backgroundSize = 'cover';
                } else if (work.bgType === 'barn') {
                    stage.style.backgroundImage = `url('${ASSET_PATH}bg_barn.webp')`;
                    stage.style.backgroundSize = 'cover';
                } else if (work.bgType === 'v_garden') {
                    stage.style.backgroundImage = `url('${ASSET_PATH}bg_v_garden.webp')`;
                    stage.style.backgroundSize = 'cover';
                } else {
                    stage.classList.add('bg-grid-pattern');
                }

                renderer.renderPreview(stage, parsedModalData, work.bgType);
                modalContainer.appendChild(stage);
            }

            const presentationModal = new bootstrap.Modal(document.getElementById('presentationModal'));
            presentationModal.show();
        }

        document.getElementById('presentationModal').addEventListener('shown.bs.modal', function () {
            resizeCanvases();
        });

        // ========================================
        // 🟢 PREVIEW HELPER FUNCTIONS
        // ========================================

        // Logic Chapter 1: Array layout preview
        function renderLogicArrayPreview(stage, items, bgType) {
            if (bgType === 'farm') {
                stage.style.backgroundImage = `url('${ASSET_PATH}bg_farm.webp')`;
                stage.style.backgroundSize = 'cover';
            } else if (bgType === 'barn') {
                stage.style.backgroundImage = `url('${ASSET_PATH}bg_barn.webp')`;
                stage.style.backgroundSize = 'cover';
            } else if (bgType === 'v_garden') {
                stage.style.backgroundImage = `url('${ASSET_PATH}bg_v_garden.webp')`;
                stage.style.backgroundSize = 'cover';
            } else {
                stage.classList.add('bg-grid-pattern');
            }

            items.forEach((obj) => {
                const wrapper = document.createElement('div');
                wrapper.style.position = 'absolute';
                wrapper.style.left = obj.x + 'px';
                wrapper.style.top = obj.y + 'px';

                const targetSize = ITEM_SIZES[obj.type] || 60;

                const img = document.createElement('img');
                img.src = ASSET_PATH + obj.type + '.webp';
                img.style.width = targetSize + 'px';
                img.style.position = 'absolute';
                img.style.transform = 'translate(-50%, -50%)'; 
                img.style.filter = 'drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.3))';
                wrapper.appendChild(img);

                if(obj.role && obj.role !== 'decor') {
                    const badge = document.createElement('div');
                    badge.innerText = obj.role === 'target' ? '🎯 เป้าหมาย' : '❌ ตัวหลอก';
                    badge.style.backgroundColor = obj.role === 'target' ? '#27ae60' : '#e74c3c';
                    badge.style.color = 'white';
                    badge.style.position = 'absolute';
                    badge.style.whiteSpace = 'nowrap';
                    badge.style.padding = '4px 10px';
                    badge.style.borderRadius = '12px';
                    badge.style.fontSize = '14px';
                    badge.style.fontWeight = 'bold';
                    badge.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                    badge.style.transform = `translate(-50%, calc(-50% - ${(targetSize/2) + 15}px))`;
                    wrapper.appendChild(badge);
                }

                stage.appendChild(wrapper);
            });
        }

        // Tractor Route preview
        function buildRoutePath(data) {
            const dirs = {
                UP: { dc: 0, dr: -1, icon: '⬆️' },
                DOWN: { dc: 0, dr: 1, icon: '⬇️' },
                LEFT: { dc: -1, dr: 0, icon: '⬅️' },
                RIGHT: { dc: 1, dr: 0, icon: '➡️' }
            };
            const start = data.start;
            if (!start || !Array.isArray(data.commands)) return [];

            let pos = {
                col: start.col ?? start.c,
                row: start.row ?? start.r
            };
            const path = [{ ...pos, step: 0 }];

            data.commands.forEach((cmd, index) => {
                const dir = dirs[cmd];
                if (!dir) return;
                pos = {
                    col: pos.col + dir.dc,
                    row: pos.row + dir.dr
                };
                path.push({
                    ...pos,
                    step: index + 1,
                    dir: cmd,
                    icon: dir.icon
                });
            });

            return path;
        }

        function renderTractorRoutePreview(stage, data) {
            const missionLabels = {
                target: 'ไปถึงจุดหมาย',
                obstacle: 'หลบสิ่งกีดขวาง',
                harvest: 'เก็บเกี่ยวผลผลิต'
            };
            const icons = {
                start: '🚜',
                target: '🧺',
                barn: '🏚️',
                hay: '🌾',
                rock: '🪨',
                crop: '🌽'
            };
            const cols = data.grid?.cols || 6;
            const rows = data.grid?.rows || 5;
            const path = buildRoutePath(data).filter(item => item.col >= 0 && item.row >= 0 && item.col < cols && item.row < rows);
            stage.classList.remove('bg-grid-pattern');
            stage.style.background = '#eff6ff';
            stage.style.padding = '24px';
            stage.style.overflow = 'hidden';
            stage.innerHTML = `
                <div style="height:100%; display:grid; grid-template-columns: 1fr 260px; gap:18px; align-items:stretch;">
                    <div>
                        <div style="font-weight:800; color:#1d4ed8; font-size:26px; margin-bottom:12px;">ภารกิจเส้นทางรถไถ</div>
                        <div class="tractor-preview-grid" style="display:grid; grid-template-columns:repeat(${cols}, 1fr); grid-template-rows:repeat(${rows}, 1fr); gap:6px; height:340px;"></div>
                    </div>
                    <div style="background:white; border:1px solid #dbe7f3; border-radius:12px; padding:18px; overflow:hidden;">
                        <div style="font-weight:800; color:#0f172a; font-size:20px;">${missionLabels[data.mission_type] || 'เส้นทางรถไถ'}</div>
                        <div style="color:#64748b; margin:10px 0 14px;">วิธีตัวอย่างของผู้ออกแบบ ${Array.isArray(data.commands) ? data.commands.length : 0} คำสั่ง</div>
                        <div style="font-size:22px; line-height:1.8; word-break:break-word;">${(data.commands || []).map(cmd => ({UP:'⬆️',DOWN:'⬇️',LEFT:'⬅️',RIGHT:'➡️'}[cmd] || '')).join(' ')}</div>
                        <div style="margin-top:16px; color:${data.validated ? '#16a34a' : '#dc2626'}; font-weight:800;">${data.validated ? 'ทดสอบผ่านแล้ว' : 'ยังไม่ผ่านการทดสอบ'}</div>
                    </div>
                </div>
            `;
            const grid = stage.querySelector('.tractor-preview-grid');
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const cell = document.createElement('div');
                    cell.style.background = (row + col) % 2 === 0 ? '#ecfdf5' : '#dcfce7';
                    cell.style.border = '1px solid #94a3b8';
                    cell.style.borderRadius = '8px';
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                    cell.style.fontSize = '30px';
                    const objectIcon = tractorIconAt(data, col, row, icons);
                    let pathStep = null;
                    for (let i = path.length - 1; i >= 0; i--) {
                        if (path[i].col === col && path[i].row === row && path[i].step > 0) {
                            pathStep = path[i];
                            break;
                        }
                    }
                    if (objectIcon) {
                        cell.textContent = objectIcon;
                    } else if (pathStep) {
                        cell.innerHTML = `
                            <div style="display:flex; flex-direction:column; align-items:center; line-height:1;">
                                <span style="font-size:16px;">${pathStep.icon || ''}</span>
                                <span style="font-size:12px; font-weight:800; color:#1d4ed8;">${pathStep.step}</span>
                            </div>
                        `;
                    }
                    grid.appendChild(cell);
                }
            }
        }

        function tractorIconAt(data, col, row, icons) {
            const same = (point) => point && (point.col ?? point.c) === col && (point.row ?? point.r) === row;
            if (same(data.start)) return icons.start;
            if (same(data.target)) return icons.target;
            if (same(data.barn)) return icons.barn;
            const obstacle = (data.obstacles || []).find(item => same(item));
            if (obstacle) return icons[obstacle.type] || icons.rock;
            if ((data.crops || []).some(item => same(item))) return icons.crop;
            return '';
        }

        // Structured preview (for legacy/fallback data)
        function renderStructuredPreview(stage, data) {
            stage.classList.remove('bg-grid-pattern');
            stage.style.background = '#f8fafc';
            stage.style.padding = '28px';
            stage.style.overflow = 'hidden';
            
            let titleText = 'ชิ้นงานแก้ปัญหา';
            if (data.project_type === 'smart_farm_debug_challenge') titleText = 'โจทย์ซ่อมกฎฟาร์ม';
            if (data.project_type === 'smart_farm_debug_mode') titleText = 'โจทย์ซ่อมกฎฟาร์ม (โหมดใหม่)';

            stage.innerHTML = `
                <div style="height:100%; display:flex; align-items:center; justify-content:center;">
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:18px; padding:24px; width:90%; max-height:88%; overflow:hidden; box-shadow:0 10px 25px rgba(15,23,42,.08);">
                        <div style="font-weight:800; color:#166534; font-size:28px; margin-bottom:14px;">${titleText}</div>
                        ${Object.keys(STRUCTURED_LABELS).filter(key => data[key]).slice(0, 3).map(key => `
                            <div style="margin-bottom:12px;">
                                <div style="font-weight:700; color:#64748b; font-size:16px;">${STRUCTURED_LABELS[key]}</div>
                                <div style="white-space:pre-wrap; color:#1f2937; font-size:20px; line-height:1.35;">${escapeHtml(data[key])}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ========================================
        // 🟢 UTILITY FUNCTIONS
        // ========================================
        function escapeHtml(text) {
            return String(text || '').replace(/[&<>"']/g, function (char) {
                return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
            });
        }

        function resizeCanvases() {
            document.querySelectorAll('.preview-content').forEach(container => {
                const stage = container.querySelector('.scalable-canvas');
                if (stage) {
                    const scale = container.clientWidth / 800; 
                    stage.style.transform = `scale(${scale})`;
                }
            });
        }
        window.addEventListener('resize', resizeCanvases);

        function toggleLike(workId, btn) {
            const countSpan = btn.querySelector('.like-count');
            let currentCount = parseInt(countSpan.innerText);

            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                countSpan.innerText = Math.max(0, currentCount - 1);
            } else {
                btn.classList.add('liked');
                countSpan.innerText = currentCount + 1;
            }

            fetch('../api/toggle_like.php', { method: 'POST', body: JSON.stringify({ work_id: workId }) })
                .then(res => res.json())
                .then(data => { if (!data.success) btn.classList.toggle('liked'); else countSpan.innerText = data.likes; });
        }

        function timeAgo(dateString) {
            if (!dateString) return "เมื่อสักครู่";
            
            // 🟢 แก้ปัญหา NaN: เปลี่ยนขีดกลาง (-) ให้เป็นทับ (/) เพื่อให้ Safari และมือถืออ่านออก
            let safeDateString = dateString.replace(/-/g, '/');
            
            const date = new Date(safeDateString);
            
            // ดักจับกรณีถ้ายังแปลงไม่สำเร็จอีก ให้แสดงวันที่ดั้งเดิมไปเลย
            if (isNaN(date.getTime())) return dateString;

            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);

            // 🟢 ดักกรณีเวลาติดลบ (เวลาในคอมพิวเตอร์ของเด็กเดินช้ากว่าเวลาเซิร์ฟเวอร์นิดหน่อย)
            if (seconds < 0 || seconds < 60) return "เมื่อสักครู่";
            
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
            return Math.floor(hours / 24) + " วันที่แล้ว";
        }

        // ==========================================
        // 🟢 ระบบ Auto-Refresh ฉบับปรับปรุง
        // ==========================================
        let isInteracting = false;
        let interactionTimer;

        // ฟังก์ชันหน่วงเวลาเมื่อมีการขยับจอหรือสัมผัส
        function resetInteraction() {
            isInteracting = true;
            clearTimeout(interactionTimer);
            // ถ้านิ่งไปเกิน 5 วินาที ให้ถือว่าเลิกใช้งานแล้ว (อนุญาตให้รีเฟรชได้)
            interactionTimer = setTimeout(() => {
                isInteracting = false;
            }, 5000);
        }

        // ดักจับทั้งเมาส์, การสัมผัสจอ (Touch) และการเลื่อนจอ (Scroll)
        document.addEventListener('mousemove', resetInteraction);
        document.addEventListener('touchstart', resetInteraction, {passive: true});
        document.addEventListener('scroll', resetInteraction, {passive: true});

        // 🟢 ปรับเป็น 30 วินาที (จากเดิม 10 วินาที) เพื่อลดการรบกวนผู้ใช้
        setInterval(() => { 
            // เช็คว่ามีกล่องพรีเซนต์งาน (Modal) เปิดค้างอยู่ไหม
            const isModalOpen = document.body.classList.contains('modal-open');
            
            // ถ้าไม่ได้เปิด Modal ค้างไว้ และไม่ได้กำลังถูหน้าจออยู่ -> โหลดผลงานใหม่!
            if (!isModalOpen && !isInteracting) {
                loadShowcase(); 
            }
        }, 30000); 

        // โหลดครั้งแรกตอนเปิดหน้าเว็บ
        loadShowcase();
    </script>
</body>
</html>
