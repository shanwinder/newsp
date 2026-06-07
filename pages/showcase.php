<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';
$game_id = intval($_GET['game_id'] ?? 1);
$context = session_context();
$project_pages = [
    1 => 'create_project_logic.php',
    2 => 'create_project_algo.php',
    3 => 'create_project_condition.php',
    4 => 'create_project_debug.php'
];
$project_page = $project_pages[$game_id] ?? 'create_project_logic.php';
$game_meta = [
    1 => [
        'lesson_no' => 'บทที่ 1',
        'title' => 'ตรรกะคัดแยก',
        'icon' => 'bi-diagram-3-fill',
        'theme' => 'success'
    ],
    2 => [
        'lesson_no' => 'บทที่ 2',
        'title' => 'เส้นทางเดินรถไถ',
        'icon' => 'bi-signpost-2-fill',
        'theme' => 'primary'
    ],
    3 => [
        'lesson_no' => 'บทที่ 3',
        'title' => 'Smart Farm Manager',
        'icon' => 'bi-diagram-3',
        'theme' => 'info'
    ],
    4 => [
        'lesson_no' => 'บทที่ 4',
        'title' => 'กู้วิกฤตฟาร์ม',
        'icon' => 'bi-bug-fill',
        'theme' => 'danger'
    ]
];
$current_game = $game_meta[$game_id] ?? $game_meta[1];
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
                                <h5 class="fw-bold text-success mb-2">📜 กติกาและเงื่อนไขของด่าน:</h5>
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

        const STRUCTURED_LABELS = {
            map: 'แผนที่หรือฉากที่ออกแบบ',
            commands: 'ลำดับคำสั่งตัวอย่าง',
            situation: 'สถานการณ์ของแปลงผัก',
            rules: 'เงื่อนไข If-Then-Else',
            reason: 'เหตุผล',
            title: 'ชื่อโจทย์บั๊ก',
            system_theme: 'ระบบฟาร์มที่เลือก',
            bug_type: 'ประเภทบั๊ก',
            correct_rules: 'กฎที่ถูกต้อง',
            buggy_rules: 'กฎที่ใส่บั๊ก',
            symptom: 'อาการที่ผู้เล่นจะเห็น',
            bug_targets: 'จุดที่เป็นบั๊ก',
            fix_explanation: 'วิธีแก้และเหตุผล',
            playtest_note: 'ผลการทดลองเล่นโจทย์'
        };

        let worksList = {}; 

        function parseWorkData(jsonData) {
            try {
                return JSON.parse(jsonData);
            } catch (e) {
                return null;
            }
        }

        function getTractorRouteSummary(data) {
            if (!data || data.project_type !== 'tractor_route') return null;

            const missionLabels = {
                target: 'ไปถึงจุดหมาย',
                obstacle: 'หลบสิ่งกีดขวาง',
                harvest: 'เก็บเกี่ยวผลผลิต'
            };

            return {
                mission: missionLabels[data.mission_type] || 'เส้นทางรถไถ',
                commandCount: Array.isArray(data.commands) ? data.commands.length : 0,
                obstacleCount: Array.isArray(data.obstacles) ? data.obstacles.length : 0,
                cropCount: Array.isArray(data.crops) ? data.crops.length : 0,
                validated: !!data.validated
            };
        }

        function getSmartFarmSummary(data) {
            return window.SmartFarmBuilderPreview?.getSummary(data) || null;
        }

        function getDebugChallengeSummary(data) {
            if (!data || data.project_type !== 'smart_farm_debug_challenge') return null;
            return {
                kind: 'debug_challenge',
                title: data.title || 'โจทย์บั๊กฟาร์ม',
                system: data.system_theme || 'ระบบฟาร์ม',
                bugType: data.bug_type || 'debugging',
                symptom: data.symptom || ''
            };
        }

        function renderProjectSummary(summary) {
            if (!summary) return '';
            if (summary.kind === 'smart_farm') {
                return window.SmartFarmBuilderPreview.renderBadges(summary);
            }
            if (summary.kind === 'debug_challenge') {
                return `
                    <div class="project-summary small mt-2">
                        <span class="badge text-bg-warning rounded-pill">${escapeHtml(summary.bugType)}</span>
                        <span class="badge text-bg-light border rounded-pill">${escapeHtml(summary.system)}</span>
                    </div>
                `;
            }
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
        }

        function loadShowcase() {
            fetch(`../api/get_showcase.php?game_id=${GAME_ID}`)
                .then(res => res.json())
                .then(data => {
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
                        const parsedWorkData = parseWorkData(work.work_data);
                        const tractorSummary = getTractorRouteSummary(parsedWorkData);
                        const smartSummaryRaw = getSmartFarmSummary(parsedWorkData);
                        const smartSummary = smartSummaryRaw ? { ...smartSummaryRaw, kind: 'smart_farm' } : null;
                        const debugSummary = getDebugChallengeSummary(parsedWorkData);
                        const activeSummary = smartSummary || debugSummary || tractorSummary;
                        const projectSummaryHTML = renderProjectSummary(activeSummary);
                        let playButtonHTML = '';
                        if (smartSummary) {
                            playButtonHTML = smartSummary.tested ? `
                                <a href="play_smart_farm_work.php?work_id=${work.id}" class="btn btn-success btn-sm rounded-pill fw-bold mt-2 align-self-start">
                                    <i class="bi bi-play-fill"></i> เล่นด่านของเพื่อน
                                </a>
                            ` : `
                                <span class="badge text-bg-light border text-secondary rounded-pill mt-2 align-self-start">
                                    ยังไม่พร้อมให้เล่น
                                </span>
                            `;
                        } else if (tractorSummary?.validated) {
                            playButtonHTML = `
                                <a href="play_student_work.php?work_id=${work.id}" class="btn btn-primary btn-sm rounded-pill fw-bold mt-2 align-self-start">
                                    <i class="bi bi-play-fill"></i> ลองเล่นโจทย์นี้
                                </a>
                            `;
                        } else if (tractorSummary) {
                            playButtonHTML = `
                                <span class="badge text-bg-light border text-secondary rounded-pill mt-2 align-self-start">
                                    ยังไม่พร้อมให้เล่น
                                </span>
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
                                    ${projectSummaryHTML}
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
                        renderMiniCanvas(work.work_data, `canvas-${work.id}`, work.bgType);
                    });
                    
                    setTimeout(resizeCanvases, 100);
                });
        }

        // 🖥️ ฟังก์ชันเปิด Presentation Mode
        function openPresentation(workId) {
            const work = worksList[workId];
            if(!work) return;

            let modalTitleStr = work.mode === 'group' ? `กลุ่มที่ ${work.group_number}` : escapeHtml(work.student_name);
            document.getElementById('modal-title-text').innerHTML = `
                <i class="bi bi-easel-fill me-2"></i> ผลงานของ: ${modalTitleStr}
                <div class="small fw-normal opacity-75 mt-1">
                    ${GAME_META.lesson_no}: ${GAME_META.title}
                </div>
            `;
            
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
            const summary = getTractorRouteSummary(parsedModalData);
            const smartSummaryRaw = getSmartFarmSummary(parsedModalData);
            const smartSummary = smartSummaryRaw ? { ...smartSummaryRaw, kind: 'smart_farm' } : null;
            const debugSummary = getDebugChallengeSummary(parsedModalData);
            const modalSummaryHTML = smartSummary ? `
                <div class="alert alert-success py-2 small mb-3 border-0 shadow-sm rounded-3">
                    <strong>${escapeHtml(smartSummary.title)}</strong><br>
                    ${escapeHtml(smartSummary.logic)} |
                    วัตถุ ${smartSummary.itemCount} |
                    ตัวหลอก ${smartSummary.decoyCount} |
                    ${smartSummary.tested ? `ทดสอบแล้ว ${Math.round(smartSummary.accuracy * 100)}%` : 'ยังไม่พร้อมให้เล่น'}
                </div>
            ` : (debugSummary ? `
                <div class="alert alert-warning py-2 small mb-3 border-0 shadow-sm rounded-3">
                    <strong>${escapeHtml(debugSummary.title)}</strong><br>
                    ${escapeHtml(debugSummary.system)} |
                    ${escapeHtml(debugSummary.bugType)}
                </div>
            ` : (summary ? `
                <div class="alert alert-primary py-2 small mb-3 border-0 shadow-sm rounded-3">
                    <strong>${GAME_META.lesson_no}: ${GAME_META.title}</strong><br>
                    ประเภทภารกิจ: ${summary.mission} |
                    วิธีตัวอย่าง ${summary.commandCount} |
                    อุปสรรค ${summary.obstacleCount} |
                    ผลผลิต ${summary.cropCount} |
                    ${summary.validated ? 'ทดสอบผ่านแล้ว' : 'ยังไม่ผ่านการทดสอบ'}
                </div>
            ` : ''));
            document.getElementById('modal-project-summary').innerHTML = modalSummaryHTML;

            document.getElementById('modal-desc').innerText = work.cleanDesc;
            document.getElementById('modal-time').innerHTML = `<i class="bi bi-clock"></i> ${timeAgo(work.submitted_at)}`;
            const modalActionArea = document.getElementById('modal-action-area');
            if (modalActionArea) {
                modalActionArea.innerHTML = smartSummary?.tested ? `
                    <a href="play_smart_farm_work.php?work_id=${work.id}" class="btn btn-success btn-lg rounded-pill fw-bold shadow-sm mt-3">
                        <i class="bi bi-controller"></i> เล่นด่านของเพื่อน
                    </a>
                    <div class="small text-muted mt-2">เล่นด่านสายพานตรรกะที่เพื่อนออกแบบ</div>
                ` : (summary?.validated ? `
                    <a href="play_student_work.php?work_id=${work.id}" class="btn btn-success btn-lg rounded-pill fw-bold shadow-sm mt-3">
                        <i class="bi bi-controller"></i> ลองเล่นโจทย์นี้
                    </a>
                    <div class="small text-muted mt-2">ลองแก้โจทย์ของเพื่อนด้วยวิธีของคุณเอง</div>
                ` : '');
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

            renderMiniCanvas(work.work_data, 'modal-canvas-content', work.bgType);

            const presentationModal = new bootstrap.Modal(document.getElementById('presentationModal'));
            presentationModal.show();
        }

        document.getElementById('presentationModal').addEventListener('shown.bs.modal', function () {
            resizeCanvases();
        });

        function renderMiniCanvas(jsonData, targetId, bgType) {
            const container = document.getElementById(targetId);
            if (!container) return;
            container.innerHTML = ''; 

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

            try {
                const items = JSON.parse(jsonData);
                if (!Array.isArray(items)) {
                    if (items.project_type === 'tractor_route') {
                        renderTractorRoutePreview(stage, items);
                        container.appendChild(stage);
                        return;
                    }
                    if (items.project_type === 'smart_farm_mini_game' && window.SmartFarmBuilderPreview?.renderSummary(stage, items)) {
                        container.appendChild(stage);
                        return;
                    }
                    renderStructuredPreview(stage, items);
                    container.appendChild(stage);
                    return;
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
            } catch (e) {
                console.error("Error parsing layout data", e);
            }
            container.appendChild(stage);
        }

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

        function renderStructuredPreview(stage, data) {
            stage.classList.remove('bg-grid-pattern');
            stage.style.background = '#f8fafc';
            stage.style.padding = '28px';
            stage.style.overflow = 'hidden';
            stage.innerHTML = `
                <div style="height:100%; display:flex; align-items:center; justify-content:center;">
                    <div style="background:white; border:1px solid #e2e8f0; border-radius:18px; padding:24px; width:90%; max-height:88%; overflow:hidden; box-shadow:0 10px 25px rgba(15,23,42,.08);">
                        <div style="font-weight:800; color:#166534; font-size:28px; margin-bottom:14px;">${data.project_type === 'smart_farm_debug_challenge' ? 'โจทย์บั๊กฟาร์ม' : 'ชิ้นงานแก้ปัญหา'}</div>
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
            
            // 🟢 แก้บั๊ก NaN: เปลี่ยนขีดกลาง (-) ให้เป็นทับ (/) เพื่อให้ Safari และมือถืออ่านออก
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
        // 🟢 ระบบ Auto-Refresh ฉบับรองรับ Tablet & PC
        // ==========================================
        let isInteracting = false;
        let interactionTimer;

        // ฟังก์ชันหน่วงเวลาเมื่อมีการขยับจอหรือสัมผัส
        function resetInteraction() {
            isInteracting = true;
            clearTimeout(interactionTimer);
            // ถ้านิ่งไปเกิน 3 วินาที ให้ถือว่าเลิกใช้งานแล้ว (อนุญาตให้รีเฟรชได้)
            interactionTimer = setTimeout(() => {
                isInteracting = false;
            }, 3000);
        }

        // ดักจับทั้งเมาส์, การสัมผัสจอ (Touch) และการเลื่อนจอ (Scroll)
        document.addEventListener('mousemove', resetInteraction);
        document.addEventListener('touchstart', resetInteraction, {passive: true});
        document.addEventListener('scroll', resetInteraction, {passive: true});

        // สั่งรีเฟรชทุกๆ 10 วินาที 
        setInterval(() => { 
            // เช็คว่ามีกล่องพรีเซนต์งาน (Modal) เปิดค้างอยู่ไหม (Bootstrap จะใส่คลาสนี้ที่ body อัตโนมัติ)
            const isModalOpen = document.body.classList.contains('modal-open');
            
            // ถ้าไม่ได้เปิด Modal ค้างไว้ และไม่ได้กำลังถูหน้าจออยู่ -> โหลดผลงานใหม่!
            if (!isModalOpen && !isInteracting) {
                loadShowcase(); 
            }
        }, 10000); 

        // โหลดครั้งแรกตอนเปิดหน้าเว็บ
        loadShowcase();
    </script>
</body>
</html>
