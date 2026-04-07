<?php
// pages/review_work.php
session_start();
require_once '../includes/db.php';
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ห้องตรวจผลงาน - Teacher Studio</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body { font-family: 'Kanit', sans-serif; background-color: #f1f5f9; color: #334155; height: 100vh; overflow: hidden; }
        .layout-container { display: flex; height: 100vh; width: 100vw; }

        /* Sidebar (ซ้าย) */
        .sidebar { width: 340px; background: #ffffff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; z-index: 10; box-shadow: 2px 0 10px rgba(0,0,0,0.05); }
        .student-item { padding: 15px 20px; border-bottom: 1px solid #f8fafc; cursor: pointer; transition: 0.2s; }
        .student-item:hover { background: #f1f5f9; }
        .student-item.active { background: #e0f2fe; border-left: 5px solid #0ea5e9; }

        /* Main Stage (ขวา) */
        .main-stage { flex-grow: 1; background-color: #e2e8f0; display: flex; flex-direction: column; overflow-y: auto; }
        .content-wrapper { padding: 30px; }

        .bg-grid-pattern {
            background-color: #ffffff;
            background-image: linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
        }

        .canvas-container { display: flex; justify-content: center; margin-bottom: 25px; }
        #preview-stage {
            width: 800px; height: 480px; background-color: #fff; position: relative; overflow: hidden;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15); border: 8px solid #cbd5e1; border-radius: 12px;
            background-size: cover; background-position: center; transform-origin: top center;
        }
        .preview-item { position: absolute; transform: translate(-50%, -50%); filter: drop-shadow(2px 4px 4px rgba(0, 0, 0, 0.3)); object-fit: contain; }
        .role-badge { position: absolute; font-size: 12px; font-weight: bold; padding: 2px 8px; border-radius: 12px; color: white; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2); z-index: 10; }
        
        .info-card { background: #ffffff; border-radius: 20px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); }
        .status-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 20px; float: right; font-weight: bold; }
        .badge-pending { background: #e2e8f0; color: #64748b; }
        .badge-submitted { background: #fef08a; color: #854d0e; }
        .badge-revision { background: #fed7aa; color: #c2410c; }
        .badge-reviewed { background: #bbf7d0; color: #166534; }
    </style>
</head>

<body>

    <div class="layout-container">
        <div class="sidebar">
            <div class="p-3 bg-primary text-white">
                <h5 class="mb-3 fw-bold"><i class="bi bi-clipboard-check-fill me-2"></i> โต๊ะตรวจงาน</h5>
                <select id="game-filter" class="form-select shadow-sm" onchange="changeGame()">
                    <option value="1">บทที่ 1: ตรรกะคัดแยก</option>
                    <option value="2">บทที่ 2: เส้นทางรถไถ (เร็วๆ นี้)</option>
                </select>
            </div>

            <div id="student-list" class="flex-grow-1 overflow-auto">
                <div class="text-center p-4 text-muted">กำลังโหลด...</div>
            </div>

            <div class="p-3 border-top text-center bg-light">
                <a href="dashboard.php" class="btn btn-outline-secondary w-100 rounded-pill"><i class="bi bi-house-door"></i> กลับ Dashboard</a>
            </div>
        </div>

        <div class="main-stage">
            <div id="empty-state" class="d-flex flex-column align-items-center justify-content-center h-100 text-muted opacity-50">

            </div>

            <div id="presentation-panel" class="content-wrapper" style="display:none;">
                <div class="canvas-container">
                    <div id="preview-stage"></div>
                </div>

                <div class="info-card">
                    <div class="row">
                        <div class="col-md-7 border-end pe-4">
                            <div class="d-flex align-items-start mb-4">
                                <div id="icon-bg" class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3 me-3 shadow-sm" style="width: 60px; height: 60px; min-width: 60px;">
                                    <i id="display-icon" class="bi bi-person-fill"></i>
                                </div>
                                <div class="w-100">
                                    <h3 id="display-name" class="fw-bold text-primary mb-1">ชื่อนักเรียน</h3>
                                    <div class="text-secondary small mb-1" style="line-height: 1.4;"><span id="display-id">-</span></div>
                                    <div class="text-secondary small"><i class="bi bi-clock"></i> ส่งเมื่อ: <span id="display-time">-</span></div>
                                </div>
                            </div>
                            <h6 class="text-dark fw-bold mb-2"><i class="bi bi-chat-quote-fill text-warning"></i> กติกา/เงื่อนไข ที่ผู้เรียนตั้งไว้:</h6>
                            <div class="bg-light p-3 rounded-3 border mb-3">
                                <p id="display-desc" class="mb-0 fs-6 text-dark" style="white-space: pre-wrap; line-height: 1.5;"></p>
                            </div>
                        </div>

                        <div class="col-md-5 ps-4 d-flex flex-column">
                            <h6 class="text-success fw-bold mb-2"><i class="bi bi-pen-fill"></i> ข้อเสนอแนะจากคุณครู:</h6>
                            <textarea id="teacher-feedback" class="form-control mb-3 flex-grow-1 border-success" placeholder="ชื่นชม หรือแนะนำเพิ่มเติมให้นักเรียนที่นี่..." style="resize: none;"></textarea>
                            
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

    <script>
        const ASSET_PATH = '../assets/img/';
        let currentWorkId = null;
        let currentGameId = 1;

        // ⚙️ ตั้งค่าขนาดไอเทม
        const ITEM_SIZES = {
            'basket': 160, 'weed_spiky': 120, 'weed_round': 120, 'bug_red': 100, 'bug_blue': 100,
            'newseed': 100, 'fert_green_bag': 120, 'fert_red_bag': 120, 'fert_green_round': 100,
            'fert_green_square': 100, 'fert_red_round': 100, 'fert_red_square': 100
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
                                <div class="pe-2 text-truncate" style="max-width: 190px;">
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

            document.querySelectorAll('.student-item').forEach(e => e.classList.remove('active'));
            el.classList.add('active');
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

        const style = document.createElement('style');
        style.innerHTML = `@keyframes popIn { from {transform: scale(0); opacity: 0;} to {transform: scale(1); opacity: 1;} }`;
        document.head.appendChild(style);

        window.addEventListener('resize', adjustScale);
        loadStudents();
    </script>
</body>
</html>