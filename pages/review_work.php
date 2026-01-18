<?php
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
    <title>Art Gallery - ตรวจชิ้นงาน</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background-color: #121212;
            color: #e0e0e0;
            height: 100vh;
            overflow: hidden;
            /* ซ่อน Scrollbar ของ Body หลัก */
        }

        .layout-container {
            display: flex;
            height: 100vh;
            width: 100vw;
        }

        /* --- Sidebar (ซ้าย) --- */
        .sidebar {
            width: 320px;
            background: #1e1e2f;
            border-right: 1px solid #333;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
            z-index: 10;
        }

        .student-list-container {
            overflow-y: auto;
            flex-grow: 1;
        }

        .student-item {
            padding: 15px 20px;
            border-bottom: 1px solid #2a2a3e;
            cursor: pointer;
            transition: 0.2s;
        }

        .student-item:hover {
            background: #2a2a3e;
        }

        .student-item.active {
            background: #E91E63;
            color: white;
            border-left: 5px solid white;
        }

        /* --- Main Stage (ขวา) --- */
        .main-stage {
            flex-grow: 1;
            background: #000;
            /* พื้นหลังดำสนิทเพื่อให้งานเด่น */
            background-image: radial-gradient(#333 1px, transparent 1px);
            background-size: 20px 20px;
            /* จุด Dot จางๆ ที่พื้นหลังใหญ่ */
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            /* ✅ อนุญาตให้ Scroll แนวตั้งได้ */
            position: relative;
        }

        /* Container เนื้อหา (แนวตั้ง) */
        .content-wrapper {
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            padding: 40px 20px;
            padding-bottom: 100px;
            /* เผื่อที่ด้านล่าง */
        }

        /* 1. ส่วนแสดงภาพ (Canvas) */
        .canvas-container {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
        }

        #preview-stage {
            width: 800px;
            height: 500px;
            background-color: white;
            /* ✅ เส้นกริด (Grid Lines) ตามที่ขอ */
            background-image:
                linear-gradient(#e0e0e0 1px, transparent 1px),
                linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
            background-size: 50px 50px;

            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            border: 10px solid #fff;
            border-radius: 4px;
            transition: transform 0.3s ease;
        }

        .preview-item {
            position: absolute;
            width: 80px;
            height: 80px;
            object-fit: contain;
            transform: translate(-50%, -50%);
            filter: drop-shadow(2px 4px 5px rgba(0, 0, 0, 0.2));
        }

        /* 2. ส่วนข้อมูล (Info Card) ด้านล่าง */
        .info-card {
            background: #1e1e2f;
            border-radius: 20px;
            padding: 30px;
            border: 1px solid #333;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
            from {
                transform: translateY(20px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* Status Badges */
        .status-badge {
            font-size: 0.75rem;
            padding: 4px 10px;
            border-radius: 20px;
            float: right;
        }

        .badge-pending {
            background: #444;
            color: #aaa;
        }

        .badge-submitted {
            background: #FFC107;
            color: #000;
            animation: pulse 2s infinite;
        }

        .badge-reviewed {
            background: #00C853;
            color: white;
        }

        @keyframes pulse {
            0% {
                opacity: 1;
            }

            50% {
                opacity: 0.5;
            }

            100% {
                opacity: 1;
            }
        }
    </style>
</head>

<body>

    <div class="layout-container">
        <div class="sidebar">
            <div class="p-4 bg-dark text-white border-bottom border-secondary">
                <h5 class="mb-0 fw-bold"><i class="bi bi-collection-fill me-2"></i>รายชื่อผลงาน</h5>
                <small class="text-white-50">เลือกรายชื่อเพื่อตรวจงาน</small>
            </div>
            <div id="student-list" class="student-list-container">
                <div class="text-center p-4 text-secondary">Loading...</div>
            </div>
            <div class="p-3 border-top border-secondary text-center">
                <a href="dashboard.php" class="btn btn-outline-secondary w-100 rounded-pill">กลับ Dashboard</a>
            </div>
        </div>

        <div class="main-stage">

            <div id="empty-state" class="d-flex flex-column align-items-center justify-content-center h-100 text-secondary opacity-50">

            </div>

            <div id="presentation-panel" class="content-wrapper" style="display:none;">

                <div class="canvas-container">
                    <div id="preview-stage">
                    </div>
                </div>

                <div class="info-card">
                    <div class="row align-items-start">
                        <div class="col-md-8 border-end border-secondary pe-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4 me-3" style="width: 60px; height: 60px;">
                                    <i class="bi bi-person"></i>
                                </div>
                                <div>
                                    <h2 id="display-name" class="fw-bold text-white mb-0">Student Name</h2>
                                    <span class="text-white-50"><i class="bi bi-card-heading"></i> ID: <span id="display-id">-</span></span>
                                    <span class="text-white-50 ms-3"><i class="bi bi-clock"></i> ส่งเมื่อ: <span id="display-time">-</span></span>
                                </div>
                            </div>

                            <div class="mt-4">
                                <label class="text-warning text-uppercase small fw-bold mb-2">Concept / คำอธิบายผลงาน</label>
                                <div class="p-3 rounded-3" style="background: rgba(255,255,255,0.05);">
                                    <p id="display-desc" class="mb-0 fs-5 fst-italic text-light" style="white-space: pre-wrap; line-height: 1.6;">-</p>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4 ps-4 d-flex flex-column justify-content-center" style="min-height: 200px;">
                            <h5 class="text-white mb-3">ผลการตรวจสอบ</h5>
                            <button id="btn-approve" onclick="markAsReviewed()" class="btn btn-success w-100 btn-lg rounded-pill fw-bold shadow mb-3 py-3">
                                <i class="bi bi-check-circle-fill me-2"></i> ให้คะแนน / ผ่าน
                            </button>
                            <div class="text-center text-white-50 small">
                                * เมื่อกดปุ่มแล้ว สถานะจะเปลี่ยนเป็น "ตรวจแล้ว"
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
        let currentStudentId = null;

        // 1. Load Data
        function loadStudents() {
            const scrollEl = document.querySelector('.student-list-container');
            const scrollPos = scrollEl ? scrollEl.scrollTop : 0;

            fetch('../api/get_works_list.php')
                .then(res => res.json())
                .then(data => {
                    const listContainer = document.getElementById('student-list');
                    listContainer.innerHTML = '';

                    data.forEach(std => {
                        const div = document.createElement('div');
                        div.className = `student-item ${currentStudentId === std.id ? 'active' : ''}`;

                        let badge = '<span class="status-badge badge-pending">ขาดส่ง</span>';
                        if (std.work_status === 'submitted') badge = '<span class="status-badge badge-submitted">รอตรวจ</span>';
                        if (std.work_status === 'reviewed') badge = '<span class="status-badge badge-reviewed">ตรวจแล้ว</span>';

                        div.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <div class="fw-bold">${std.name}</div>
                            <small class="opacity-75">${std.student_id}</small>
                        </div>
                        ${badge}
                    </div>
                `;

                        div.onclick = () => {
                            if (std.work_status === 'pending') return;
                            selectStudent(std, div);
                        };

                        listContainer.appendChild(div);
                    });

                    if (scrollEl) scrollEl.scrollTop = scrollPos;
                });
        }

        // 2. Select Student
        function selectStudent(data, el) {
            currentStudentId = data.id;
            currentWorkId = data.work_id;

            document.getElementById('empty-state').style.display = 'none';
            document.getElementById('presentation-panel').style.display = 'block';

            // Update Text
            document.getElementById('display-name').innerText = data.name;
            document.getElementById('display-id').innerText = data.student_id;
            document.getElementById('display-desc').innerText = data.description || "-";
            document.getElementById('display-time').innerText = data.submitted_at;

            // Button State
            const btn = document.getElementById('btn-approve');
            if (data.work_status === 'reviewed') {
                btn.className = 'btn btn-secondary w-100 btn-lg rounded-pill disabled py-3';
                btn.innerHTML = '<i class="bi bi-check2-all"></i> ตรวจเรียบร้อยแล้ว';
                btn.disabled = true;
            } else {
                btn.className = 'btn btn-success w-100 btn-lg rounded-pill shadow py-3';
                btn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> ให้คะแนน / ผ่าน';
                btn.disabled = false;
            }

            // Render Canvas
            renderCanvas(data.work_data);

            // UI Active State
            document.querySelectorAll('.student-item').forEach(e => e.classList.remove('active'));
            el.classList.add('active');
        }

        function renderCanvas(jsonData) {
            const stage = document.getElementById('preview-stage');
            stage.innerHTML = '';

            // ✅ 1. สร้าง Dictionary เพื่อแปลง Key เป็นชื่อไฟล์จริง
            const fileMapping = {
                'dog': 'dog',
                'cat': 'cat',
                'rabbit': 'rabbit',
                'sq_red': 'red_square', // แปลง sq_red -> red_square
                'ci_green': 'green_circle', // แปลง ci_green -> green_circle
                'tri_blue': 'blue_triangle', // เผื่อมีสามเหลี่ยม
                'sq_yellow': 'yellow_square' // เผื่อมีสี่เหลี่ยมเหลือง
            };

            try {
                const items = JSON.parse(jsonData);
                items.forEach((obj, i) => {
                    const img = document.createElement('img');

                    // ✅ 2. ใช้ชื่อไฟล์จาก Mapping (ถ้าไม่มีให้ใช้ชื่อเดิม)
                    const realFileName = fileMapping[obj.type] || obj.type;

                    img.src = ASSET_PATH + realFileName + '.webp'; // โหลดไฟล์ที่ถูกต้อง

                    img.className = 'preview-item';
                    img.style.left = obj.x + 'px';
                    img.style.top = obj.y + 'px';

                    // Animation Pop-in
                    img.style.animation = `popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i*0.05}s both`;

                    stage.appendChild(img);
                });
            } catch (e) {
                console.error("JSON Error", e);
            }

            setTimeout(adjustScale, 50);
        }

        // 3. Update API
        function markAsReviewed() {
            if (!currentWorkId) return;

            const btn = document.getElementById('btn-approve');
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> บันทึก...';

            fetch('../api/update_work_status.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        work_id: currentWorkId,
                        status: 'reviewed'
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        btn.className = 'btn btn-secondary w-100 btn-lg rounded-pill disabled py-3';
                        btn.innerHTML = '<i class="bi bi-check2-all"></i> บันทึกแล้ว';
                        loadStudents();
                    } else {
                        alert('Error: ' + data.error);
                        btn.innerHTML = 'ลองใหม่';
                    }
                });
        }

        // Resize Logic
        function adjustScale() {
            const stage = document.getElementById('preview-stage');
            const container = document.querySelector('.canvas-container');
            if (!stage || !container) return;

            const containerWidth = container.clientWidth;
            // ถ้าย่อจอเล็กกว่า 800px ให้ Scale ลง
            if (containerWidth < 820) {
                const scale = containerWidth / 820;
                stage.style.transform = `scale(${scale})`;
            } else {
                stage.style.transform = `scale(1)`;
            }
        }

        // Add CSS Animation
        const style = document.createElement('style');
        style.innerHTML = `@keyframes popIn { from {transform: translate(-50%, -50%) scale(0);} to {transform: translate(-50%, -50%) scale(1);} }`;
        document.head.appendChild(style);

        window.addEventListener('resize', adjustScale);
        loadStudents();
        setInterval(loadStudents, 5000);
    </script>

</body>

</html>