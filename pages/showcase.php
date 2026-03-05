<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}
$game_id = $_GET['game_id'] ?? 1;
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>Hall of Fame - ลานโชว์ผลงานฟาร์ม</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

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
            <h1 class="fw-bold display-4 mb-2"><i class="bi bi-star-fill text-warning"></i> ลานโชว์ผลงาน</h1>
            <p class="fs-5 opacity-75">รวมมิตรโจทย์ปริศนาและผลงานสุดสร้างสรรค์จากเพื่อนๆ</p>
            <div class="mt-4">
                <a href="create_project_logic.php?game_id=<?php echo $game_id; ?>" class="btn btn-warning rounded-pill px-4 fw-bold me-2 shadow-sm text-dark">
                    <i class="bi bi-plus-lg"></i> สร้างโจทย์ของทีมฉัน
                </a>
                <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn btn-outline-light rounded-pill px-4 fw-bold">กลับหน้าเลือกด่าน</a>
            </div>
        </div>
    </div>

    <div class="container pb-5">
        <div id="gallery-grid" class="row g-4">
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-success" role="status"></div>
                <p class="mt-2 text-muted fw-bold">กำลังรวบรวมผลงานจากแปลงเกษตร...</p>
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
                        
                        <div class="row align-items-start">
                            <div class="col-md-8">
                                <h5 class="fw-bold text-success mb-2">📜 กติกาและเงื่อนไขของด่าน:</h5>
                                <p id="modal-desc" class="text-dark fs-5 mb-3" style="white-space: pre-wrap; line-height: 1.6;"></p>
                                
                                <div id="modal-feedback-area"></div>
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge bg-light text-secondary border fs-6 px-3 py-2" id="modal-time"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        const ASSET_PATH = '../assets/img/';
        const GAME_ID = <?php echo $game_id; ?>;
        
        const ITEM_SIZES = {
            'basket': 80, 'weed_spiky': 60, 'weed_round': 60, 'bug_red': 50, 'bug_blue': 50,
            'seed': 50, 'fert_green_bag': 60, 'fert_red_bag': 60, 'fert_green_round': 50,
            'fert_green_square': 50, 'fert_red_round': 50, 'fert_red_square': 50
        };

        let worksList = {}; 

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

                        let teamInfoHTML = '';
                        if (work.mode === 'group') {
                            teamInfoHTML = `
                                <div style="width: calc(100% - 70px);">
                                    <h5 class="fw-bold mb-0" style="color: #d35400;"><i class="bi bi-people-fill"></i> กลุ่มที่ ${work.group_number}</h5>
                                    <div class="member-list-box text-muted">
                                        <strong>สมาชิก:</strong> ${work.member_names || '-'}
                                    </div>
                                </div>
                            `;
                        } else {
                            teamInfoHTML = `
                                <div style="width: calc(100% - 70px);">
                                    <h5 class="fw-bold text-success mb-0 text-truncate"><i class="bi bi-person-circle"></i> ${work.student_name}</h5>
                                    <small class="text-muted d-block mt-1">รหัสนักเรียน: ${work.student_id}</small>
                                </div>
                            `;
                        }

                        // 🟢 ประมวลผลข้อเสนอแนะจากครู (ถ้ามีการพิมพ์ให้คำชมไว้)
                        let feedbackHTML = '';
                        if (isReviewed && work.feedback && work.feedback.trim() !== '') {
                            feedbackHTML = `
                                <div class="feedback-box">
                                    <span class="text-success"><i class="bi bi-chat-heart-fill"></i> <strong>คุณครู:</strong> ${work.feedback}</span>
                                </div>
                            `;
                        }

                        col.innerHTML = `
                            <div class="work-card shadow-sm w-100 ${reviewedClass}">
                                ${reviewedBadge}
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
                                    <div class="bg-light p-2 rounded flex-grow-1 border d-flex flex-column">
                                        <p class="text-secondary small mb-0" style="max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
                                            <strong>📜 กติกา:</strong><br>${descText}
                                        </p>
                                        ${feedbackHTML}
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

            let modalTitleStr = work.mode === 'group' ? `กลุ่มที่ ${work.group_number}` : work.student_name;
            document.getElementById('modal-title-text').innerHTML = `<i class="bi bi-easel-fill me-2"></i> ผลงานของ: ${modalTitleStr}`;
            
            let membersHtml = '';
            if (work.mode === 'group') {
                membersHtml = `
                    <div class="alert alert-warning py-2 small mb-3 border-0 shadow-sm rounded-3">
                        <strong class="text-dark"><i class="bi bi-people-fill text-warning fs-5 align-middle me-1"></i> สมาชิกทีม:</strong> 
                        <span class="text-secondary ms-1">${work.member_names || '-'}</span>
                    </div>`;
            }
            document.getElementById('modal-members-area').innerHTML = membersHtml;

            document.getElementById('modal-desc').innerText = work.cleanDesc;
            document.getElementById('modal-time').innerHTML = `<i class="bi bi-clock"></i> ${timeAgo(work.submitted_at)}`;
            
            // 🟢 แสดงคอมเมนต์คุณครูในหน้าจอใหญ่ด้วย
            let feedbackModalHtml = '';
            if (work.status === 'reviewed' && work.feedback && work.feedback.trim() !== '') {
                feedbackModalHtml = `
                    <div class="alert alert-success py-2 mt-2 border-0 shadow-sm rounded-3">
                        <strong class="text-success"><i class="bi bi-chat-heart-fill fs-5 align-middle me-1"></i> ข้อเสนอแนะจากคุณครู:</strong> 
                        <span class="text-dark ms-1">${work.feedback}</span>
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
            const date = new Date(dateString);
            const now = new Date();
            const seconds = Math.floor((now - date) / 1000);
            if (seconds < 60) return "เมื่อสักครู่";
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
            return Math.floor(hours / 24) + " วันที่แล้ว";
        }

        let isHovering = false; 
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.work-card') || document.body.classList.contains('modal-open')) isHovering = true;
            else isHovering = false;
        });

        setInterval(() => { if (!isHovering) loadShowcase(); }, 10000); 

        loadShowcase();
    </script>
</body>
</html>