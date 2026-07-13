<?php
// pages/review_work.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
require_teacher_or_admin();
ensure_active_account($conn);
$context = classroom_context($conn);
$lessons = require __DIR__ . '/../config/lessons.php';
if (!$context) {
    header("Location: classrooms.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ห้องตรวจผลงาน - Teacher Studio</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">







<?php
$page_styles = array (
  0 => 'games/conveyor_logic.css',
  1 => 'games/smart_farm_builder.css',
  2 => 'pages/review_work.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>

<body class="app-page review-work-page">

    <div class="layout-container">
        <div class="sidebar">
            <div class="p-3 bg-primary text-white">
                <h5 class="mb-3 fw-bold"><i class="bi bi-clipboard-check-fill me-2"></i> โต๊ะตรวจงาน</h5>
                <select id="game-filter" class="form-select shadow-sm" onchange="changeGame()">
                    <?php foreach ($lessons as $id => $lesson): ?>
                    <option value="<?php echo $id; ?>">บทที่ <?php echo $id; ?>: <?php echo htmlspecialchars($lesson['title']); ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div id="student-list" class="flex-grow-1 overflow-auto">
                <div class="text-center p-4 text-muted">กำลังโหลด...</div>
            </div>

            <div class="p-3 border-top text-center bg-light">
                <a href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-outline-secondary w-100 rounded-pill"><i class="bi bi-house-door"></i> กลับ Dashboard</a>
            </div>
        </div>

        <div class="main-stage">
            <div id="empty-state" class="d-flex flex-column align-items-center justify-content-center h-100 text-muted opacity-50">

            </div>

            <div id="presentation-panel" class="content-wrapper is-initially-hidden">
                <div class="canvas-container">
                    <div id="preview-stage"></div>
                </div>

                <div id="teacher-smart-farm-tools" class="info-card mb-3 is-initially-hidden">
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                        <div>
                            <h5 class="fw-bold text-success mb-1"><i class="bi bi-controller"></i> เครื่องมือตรวจสอบด่าน</h5>
                            <div class="text-secondary small">ทดลองเล่น ดูเฉลย ตัวหลอก ผลตรวจคุณภาพ และสถานะการใช้ตัวช่วย</div>
                        </div>
                        <div class="d-flex flex-wrap gap-2">
                            <button type="button" class="btn btn-sm btn-success rounded-pill fw-bold" onclick="openSmartFarmTeacherPlayer('preview')"><i class="bi bi-eye"></i> ทดลองเล่นด่านนี้</button>
                            <button type="button" class="btn btn-sm btn-primary rounded-pill fw-bold" onclick="openSmartFarmTeacherPlayer('challenge')"><i class="bi bi-controller"></i> โหมดท้าทาย</button>
                            <button type="button" class="btn btn-sm btn-outline-success rounded-pill fw-bold" onclick="showSmartFarmTeacherDetails('answers')"><i class="bi bi-card-checklist"></i> ดูเฉลยกฎ</button>
                            <button type="button" class="btn btn-sm btn-outline-warning rounded-pill fw-bold" onclick="showSmartFarmTeacherDetails('decoys')"><i class="bi bi-shuffle"></i> ดูตัวหลอก</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill fw-bold" onclick="showSmartFarmTeacherDetails('quality')"><i class="bi bi-clipboard2-check"></i> ดูผลตรวจคุณภาพ</button>
                        </div>
                    </div>
                    <div id="teacher-smart-farm-player" class="d-none"></div>
                    <div id="teacher-smart-farm-details" class="smart-teacher-detail"></div>
                </div>

                <div class="info-card">
                    <div class="row">
                        <div class="col-md-7 border-end pe-4">
                            <div class="d-flex align-items-start mb-4">
                                <div id="icon-bg" class="student-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-3 shadow-sm">
                                    <i id="display-icon" class="bi bi-person-fill"></i>
                                </div>
                                <div class="w-100">
                                    <h3 id="display-name" class="fw-bold text-primary mb-1">ชื่อนักเรียน</h3>
                                    <div class="student-meta text-secondary small mb-1"><span id="display-id">-</span></div>
                                    <div class="text-secondary small"><i class="bi bi-clock"></i> ส่งเมื่อ: <span id="display-time">-</span></div>
                                </div>
                            </div>
                            <h6 class="text-dark fw-bold mb-2"><i class="bi bi-chat-quote-fill text-warning"></i> กติกา/เงื่อนไข ที่ผู้เรียนตั้งไว้:</h6>
                            <div class="bg-light p-3 rounded-3 border mb-3">
                                <p id="display-desc" class="display-description mb-0 fs-6 text-dark"></p>
                            </div>
                        </div>

                        <div class="col-md-5 ps-4 d-flex flex-column">
                            <h6 class="text-success fw-bold mb-2"><i class="bi bi-pen-fill"></i> ข้อเสนอแนะจากคุณครู:</h6>
                            <textarea id="teacher-feedback" class="teacher-feedback form-control mb-3 flex-grow-1 border-success" placeholder="ชื่นชม หรือแนะนำเพิ่มเติมให้นักเรียนที่นี่..."></textarea>

                            <div class="d-flex gap-2" id="action-buttons">
                                <button id="btn-revision" onclick="markAsReviewed('revision')" class="btn btn-warning btn-lg rounded-pill fw-bold shadow flex-grow-1 text-dark">
                                    <i class="bi bi-arrow-return-left me-2"></i> ให้แก้ไข
                                </button>
                                <button id="btn-approve" onclick="markAsReviewed('reviewed')" class="btn btn-success btn-lg rounded-pill fw-bold shadow flex-grow-1">
                                    <i class="bi bi-check-circle-fill me-2"></i> ตรวจผ่าน
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../assets/js/logic_game/conveyor_drag_drop.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_validation.js"></script>
    <script src="../assets/js/logic_game/smart_farm_builder_preview.js"></script>
    <script>
        const ASSET_PATH = '../assets/img/';
        let currentWorkId = null;
        let currentGameId = 1;
        let currentSmartFarmWork = null;

        // ⚙️ ตั้งค่าขนาดไอเทม
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
            title: 'ชื่อโจทย์ซ่อมกฎ',
            system_theme: 'ระบบฟาร์มที่เลือก',
            bug_type: 'ประเภทจุดผิด',
            correct_rules: 'กฎที่ถูกต้อง',
            buggy_rules: 'กฎที่ใส่จุดผิด',
            symptom: 'อาการที่ผู้เล่นจะเห็น',
            bug_targets: 'จุดที่เป็นจุดผิด',
            fix_explanation: 'วิธีแก้และเหตุผล',
            playtest_note: 'ผลการทดลองเล่นโจทย์'
        };

        function changeGame() {
            currentGameId = document.getElementById('game-filter').value;
            document.getElementById('empty-state').style.display = 'flex';
            document.getElementById('presentation-panel').style.display = 'none';
            loadStudents();
        }

        function loadStudents() {
            fetch(`../api/get_works_list.php?game_id=${currentGameId}`)
                .then(res => res.json())
                .then(data => {
                    const listContainer = document.getElementById('student-list');
                    listContainer.innerHTML = '';

                    if (data.length === 0) {
                        listContainer.innerHTML = '<div class="text-center p-4 text-muted">ยังไม่มีผู้เรียนในระบบ</div>';
                        return;
                    }

                    data.forEach(std => {
                        const div = document.createElement('div');
                        div.className = `student-item`;

                        let badge = '<span class="status-badge badge-pending">ขาดส่ง</span>';
                        if (std.work_status === 'submitted') badge = '<span class="status-badge badge-submitted">รอตรวจ</span>';
                        if (std.work_status === 'revision') badge = '<span class="status-badge badge-revision">รอแก้</span>';
                        if (std.work_status === 'reviewed') badge = '<span class="status-badge badge-reviewed">ตรวจแล้ว</span>';

                        // 🟢 ประมวลผลข้อความแยกเดี่ยว และ กลุ่ม
                        let titleText = std.name;
                        let subText = std.student_id;
                        let iconHTML = '<i class="bi bi-person-fill text-primary me-2"></i>';

                        if (std.mode === 'group') {
                            titleText = `กลุ่มที่ ${std.group_number}`;
                            let memberCount = std.member_names ? std.member_names.split(',').length : 0;
                            subText = `<i class="bi bi-people"></i> ทีม ${memberCount} คน`;
                            iconHTML = '<i class="bi bi-people-fill text-warning me-2"></i>';
                        }

                        div.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="student-list-name pe-2 text-truncate">
                                    <div class="fw-bold text-dark text-truncate">${iconHTML}${titleText}</div>
                                    <small class="text-secondary text-truncate d-block mt-1">${subText}</small>
                                </div>
                                <div>${badge}</div>
                            </div>
                        `;

                        div.onclick = () => {
                            if (std.work_status === 'pending') return;
                            selectStudent(std, div);
                        };

                        listContainer.appendChild(div);
                    });
                });
        }

        function selectStudent(data, el) {
            currentWorkId = data.work_id;

            document.getElementById('empty-state').style.display = 'none';
            document.getElementById('presentation-panel').style.display = 'block';

            let nameDisplay = document.getElementById('display-name');
            let idDisplay = document.getElementById('display-id');
            let iconDisplay = document.getElementById('display-icon');
            let iconBg = document.getElementById('icon-bg');

            // 🟢 เปลี่ยนหน้าตาการแสดงผลหลักตามโหมด
            if (data.mode === 'group') {
                nameDisplay.innerText = `ผลงานกลุ่มที่ ${data.group_number}`;
                nameDisplay.className = 'fw-bold text-warning mb-1';
                idDisplay.innerHTML = `<b class="text-dark">สมาชิก:</b> ${data.member_names}`;
                iconDisplay.className = 'bi bi-people-fill';
                iconBg.className = 'bg-warning text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-3 shadow-sm';
            } else {
                nameDisplay.innerText = data.name;
                nameDisplay.className = 'fw-bold text-primary mb-1';
                idDisplay.innerHTML = `<b class="text-dark">รหัสนักเรียน:</b> ${data.student_id}`;
                iconDisplay.className = 'bi bi-person-fill';
                iconBg.className = 'bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-3 shadow-sm';
            }

            document.getElementById('display-time').innerText = data.submitted_at;
            document.getElementById('teacher-feedback').value = data.feedback || "";

            let desc = data.description || "";
            let bgType = 'grid';
            const bgMatch = desc.match(/\[ฉากหลัง:\s*(.*?)\]/);
            if (bgMatch) {
                bgType = bgMatch[1];
                desc = desc.replace(/\[ฉากหลัง:\s*.*?\]\s*\n*/, '');
            }
            document.getElementById('display-desc').innerText = desc || "ไม่มีคำอธิบาย";

            const btnApprove = document.getElementById('btn-approve');
            const btnRevision = document.getElementById('btn-revision');

            if (data.work_status === 'reviewed') {
                btnApprove.className = 'btn btn-secondary btn-lg rounded-pill fw-bold shadow flex-grow-1';
                btnApprove.innerHTML = '<i class="bi bi-check2-all me-2"></i> ตรวจแล้ว';
                btnRevision.style.display = 'none';
            } else if (data.work_status === 'revision') {
                btnApprove.className = 'btn btn-success btn-lg rounded-pill fw-bold shadow flex-grow-1';
                btnApprove.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> ตรวจผ่าน';
                btnRevision.style.display = 'block';
                btnRevision.className = 'btn btn-secondary btn-lg rounded-pill fw-bold shadow flex-grow-1';
                btnRevision.innerHTML = '<i class="bi bi-arrow-return-left me-2"></i> ส่งให้แก้อีกรอบ';
            } else {
                btnApprove.className = 'btn btn-success btn-lg rounded-pill fw-bold shadow flex-grow-1';
                btnApprove.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> ตรวจผ่าน';
                btnRevision.style.display = 'block';
                btnRevision.className = 'btn btn-warning btn-lg rounded-pill fw-bold shadow flex-grow-1 text-dark';
                btnRevision.innerHTML = '<i class="bi bi-arrow-return-left me-2"></i> ให้แก้ไข';
            }

            renderCanvas(data.work_data, bgType);
            setupSmartFarmTeacherReview(data.work_data);

            document.querySelectorAll('.student-item').forEach(e => e.classList.remove('active'));
            el.classList.add('active');
        }

        function setupSmartFarmTeacherReview(jsonData) {
            const tools = document.getElementById('teacher-smart-farm-tools');
            const player = document.getElementById('teacher-smart-farm-player');
            const details = document.getElementById('teacher-smart-farm-details');
            currentSmartFarmWork = null;
            tools.style.display = 'none';
            player.classList.add('d-none');
            player.innerHTML = '';
            details.innerHTML = '';

            try {
                const parsed = JSON.parse(jsonData || '{}');
                if (parsed && parsed.project_type === 'smart_farm_mini_game') {
                    currentSmartFarmWork = parsed;
                    tools.style.display = 'block';
                    showSmartFarmTeacherDetails('quality');
                }
            } catch (error) {
                currentSmartFarmWork = null;
            }
        }

        function openSmartFarmTeacherPlayer(mode) {
            if (!currentSmartFarmWork) return;
            const player = document.getElementById('teacher-smart-farm-player');
            document.getElementById('teacher-smart-farm-details').innerHTML = '';
            player.classList.remove('d-none');
            window.SmartFarmBuilderPreview.createPlayer(player, currentSmartFarmWork, {
                mode,
                allowModeSwitch: true
            });
            setTimeout(adjustScale, 50);
        }

        function showSmartFarmTeacherDetails(kind) {
            if (!currentSmartFarmWork) return;
            const player = document.getElementById('teacher-smart-farm-player');
            const details = document.getElementById('teacher-smart-farm-details');
            player.classList.add('d-none');
            const data = currentSmartFarmWork;
            const defaultBehavior = data.default_behavior || data.defaultBehavior || { type: 'pass_through', label: 'ปล่อยผ่านอัตโนมัติ' };
            const actionLabel = (id) => {
                const found = (data.actions || []).find((action) => action.id === id);
                return id === (defaultBehavior.type || defaultBehavior.id || 'pass_through') ? defaultBehavior.label : (found ? found.label : id);
            };

            if (kind === 'answers') {
                details.innerHTML = `
                    <h6 class="fw-bold text-success"><i class="bi bi-card-checklist"></i> เฉลยกฎและปลายทาง</h6>
                    <div class="smart-teacher-grid">
                        ${(data.rules || []).map((rule) => {
                            const prefix = rule.type === 'else' ? 'Else' : (rule.type === 'else_if' ? 'Else If' : 'If');
                            const condition = rule.type === 'else' ? 'วัตถุที่เหลือทั้งหมด' : (((data.conditions || []).find((item) => item.id === rule.condition) || {}).label || '-');
                            return `<div><strong>${escapeHtml(prefix)}</strong><span>${escapeHtml(condition)} → ${escapeHtml(actionLabel(rule.action))}</span></div>`;
                        }).join('')}
                        ${data.logic_type === 'if' ? `<div><strong>System</strong><span>ไม่เข้าเงื่อนไข → ${escapeHtml(defaultBehavior.label)}</span></div>` : ''}
                    </div>
                `;
                return;
            }

            if (kind === 'decoys') {
                const decoys = (data.items || []).filter((item) => item.isDecoy);
                details.innerHTML = `
                    <h6 class="fw-bold text-warning"><i class="bi bi-shuffle"></i> ตัวหลอกและเหตุผล</h6>
                    <div class="smart-teacher-grid">
                        ${decoys.length ? decoys.map((item) => `
                            <div><strong>${escapeHtml(item.fallbackIcon || '')} ${escapeHtml(item.label)}</strong><span>${escapeHtml(item.decoyReason || item.explain || 'เป็นวัตถุที่ใช้ทดสอบการสังเกตเงื่อนไข')}</span></div>
                        `).join('') : '<div class="text-secondary">ไม่มีข้อมูลตัวหลอก</div>'}
                    </div>
                `;
                return;
            }

            const quality = data.qualityCheck || {};
            const assistance = data.builder_assistance || {};
            details.innerHTML = `
                <h6 class="fw-bold text-secondary"><i class="bi bi-clipboard2-check"></i> ผลตรวจคุณภาพด่าน</h6>
                <div class="smart-teacher-grid">
                    <div><strong>Branch Balance</strong><span>${quality.balancedBranches ? 'ผ่าน' : 'ควรปรับ'}</span></div>
                    <div><strong>Decoy Quality</strong><span>${quality.hasGoodDecoys ? 'ผ่าน' : 'ควรปรับ'}</span></div>
                    <div><strong>Destination Coverage</strong><span>${quality.usesAllDestinations ? 'ผ่าน' : 'ควรปรับ'}</span></div>
                    <div><strong>Item Diversity</strong><span>${quality.diverseItems ? 'ผ่าน' : 'ควรปรับ'}</span></div>
                    <div><strong>การใช้ตัวช่วย</strong><span>${assistance.used_auto_fill ? `ใช้ใส่ตัวอย่างเริ่มต้น ${assistance.auto_fill_count || 1} ครั้ง` : 'ไม่ได้ใช้'}</span></div>
                    <div><strong>คำเตือน</strong><span>${escapeHtml((quality.warnings || []).join(' | ') || '-')}</span></div>
                </div>
            `;
        }

        function renderCanvas(jsonData, bgType) {
            const stage = document.getElementById('preview-stage');
            stage.innerHTML = '';
            stage.className = '';
            stage.style.backgroundImage = '';

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
                        renderTractorRouteWork(stage, items);
                        setTimeout(adjustScale, 50);
                        return;
                    }
                    if (items.project_type === 'smart_farm_mini_game' && window.SmartFarmBuilderPreview?.renderSummary(stage, items, { teacher: true })) {
                        setTimeout(adjustScale, 50);
                        return;
                    }
                    renderStructuredWork(stage, items);
                    setTimeout(adjustScale, 50);
                    return;
                }
                items.forEach((obj, i) => {
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'absolute';
                    wrapper.style.left = obj.x + 'px';
                    wrapper.style.top = obj.y + 'px';

                    const targetSize = ITEM_SIZES[obj.type] || 60;

                    const img = document.createElement('img');
                    img.src = ASSET_PATH + obj.type + '.webp';
                    img.className = 'preview-item';
                    img.style.width = targetSize + 'px';
                    wrapper.appendChild(img);

                    if(obj.role && obj.role !== 'decor') {
                        const badge = document.createElement('div');
                        badge.className = 'role-badge';
                        if(obj.role === 'target') {
                            badge.innerText = '🎯 เป้าหมาย';
                            badge.style.backgroundColor = '#27ae60';
                        } else if(obj.role === 'decoy') {
                            badge.innerText = '❌ ตัวหลอก';
                            badge.style.backgroundColor = '#e74c3c';
                        }
                        badge.style.transform = `translate(-50%, calc(-50% - ${(targetSize/2) + 15}px))`;
                        wrapper.appendChild(badge);
                    }

                    wrapper.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i*0.05}s both`;
                    stage.appendChild(wrapper);
                });
            } catch (e) { console.error("JSON Error", e); }

            setTimeout(adjustScale, 50);
        }

        function renderTractorRouteWork(stage, data) {
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
            stage.className = '';
            stage.style.backgroundImage = '';
            stage.style.background = '#eff6ff';
            stage.style.padding = '24px';
            stage.style.overflow = 'hidden';
            stage.innerHTML = `
                <div class="tractor-work-layout">
                    <div>
                        <div class="tractor-work-heading">ภารกิจเส้นทางรถไถ</div>
                        <div class="tractor-review-grid" style="--tractor-cols:${cols}; --tractor-rows:${rows};"></div>
                    </div>
                    <div class="tractor-work-summary">
                        <div class="tractor-work-title">${missionLabels[data.mission_type] || 'เส้นทางรถไถ'}</div>
                        <div class="tractor-work-note">วิธีตัวอย่างของผู้ออกแบบ ${Array.isArray(data.commands) ? data.commands.length : 0} คำสั่ง</div>
                        <div class="tractor-work-commands">${(data.commands || []).map(cmd => ({UP:'⬆️',DOWN:'⬇️',LEFT:'⬅️',RIGHT:'➡️'}[cmd] || '')).join(' ')}</div>
                        <div class="tractor-work-validation ${data.validated ? 'is-valid' : 'is-invalid'}">${data.validated ? 'ทดสอบผ่านแล้ว' : 'ยังไม่ผ่านการทดสอบ'}</div>
                    </div>
                </div>
            `;
            const grid = stage.querySelector('.tractor-review-grid');
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
                    cell.textContent = tractorIconAt(data, col, row, icons);
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

        function renderStructuredWork(stage, data) {
            stage.className = '';
            stage.style.backgroundImage = '';
            stage.style.background = '#f8fafc';
            stage.style.padding = '28px';
            stage.style.overflowY = 'auto';
            stage.innerHTML = `
                <div class="h-100 d-flex flex-column justify-content-center">
                    <div class="bg-white rounded-4 shadow-sm border p-4">
                        <h4 class="fw-bold text-primary mb-3"><i class="bi bi-journal-text"></i> ${data.project_type === 'smart_farm_debug_challenge' ? 'โจทย์ซ่อมกฎฟาร์มของนักเรียน' : 'ชิ้นงานสะท้อนการแก้ปัญหา'}</h4>
                        ${Object.keys(STRUCTURED_LABELS).filter(key => data[key]).map(key => `
                            <div class="mb-3">
                                <div class="small fw-bold text-secondary">${STRUCTURED_LABELS[key]}</div>
                                <div class="structured-work-value fs-6 text-dark">${escapeHtml(data[key])}</div>
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

        function markAsReviewed(statusToSave) {
            if (!currentWorkId) return;

            const btnApprove = document.getElementById('btn-approve');
            const btnRevision = document.getElementById('btn-revision');
            const feedbackText = document.getElementById('teacher-feedback').value;

            if (statusToSave === 'reviewed') {
                btnApprove.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังบันทึก...';
            } else {
                btnRevision.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังส่งกลับ...';
            }

            fetch('../api/update_work_status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ work_id: currentWorkId, status: statusToSave, feedback: feedbackText })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        if (statusToSave === 'reviewed') {
                            btnApprove.className = 'btn btn-secondary btn-lg rounded-pill fw-bold shadow flex-grow-1';
                            btnApprove.innerHTML = '<i class="bi bi-check2-all me-2"></i> บันทึกและตรวจแล้ว';
                            btnRevision.style.display = 'none';
                        } else {
                            btnRevision.className = 'btn btn-secondary btn-lg rounded-pill fw-bold shadow flex-grow-1';
                            btnRevision.innerHTML = '<i class="bi bi-arrow-return-left me-2"></i> ส่งให้เด็กแก้แล้ว';
                        }
                        setTimeout(() => { loadStudents(); }, 1000);
                    } else {
                        alert('Error: ' + data.error);
                        if (statusToSave === 'reviewed') btnApprove.innerHTML = 'ลองใหม่';
                        else btnRevision.innerHTML = 'ลองใหม่';
                    }
                });
        }

        function adjustScale() {
            const stage = document.getElementById('preview-stage');
            const container = document.querySelector('.canvas-container');
            if (!stage || !container) return;

            const containerWidth = container.clientWidth;
            if (containerWidth < 820) {
                const scale = containerWidth / 820;
                stage.style.transform = `scale(${scale})`;
            } else {
                stage.style.transform = `scale(1)`;
            }
        }

        window.addEventListener('resize', adjustScale);
        loadStudents();
    </script>
</body>
</html>
