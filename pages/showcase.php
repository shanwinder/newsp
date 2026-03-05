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
            background: #f0fdf4; /* ธีมพื้นหลังสีเขียวอ่อน */
            background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
            min-height: 100vh;
        }

        .header-section {
            background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); /* เปลี่ยนเป็นธีมฟาร์มสีเขียว */
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
        }

        .work-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 30px rgba(16, 185, 129, 0.2);
            border-color: #34d399;
        }

        .preview-box {
            position: relative;
            width: 100%;
            padding-top: 60%; /* Aspect Ratio 800x480 (480/800 = 60%) */
            background-color: #ffffff;
            overflow: hidden;
            border-bottom: 3px dashed #e2e8f0;
            background-size: cover;
            background-position: center;
        }

        .preview-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }

        .art-item {
            position: absolute;
            width: 12%; /* ขยายไอเทมในหน้าพรีวิวให้เห็นชัดขึ้น */
            transform: translate(-50%, -50%);
            filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.2));
        }

        .btn-like {
            border: 2px solid #eee;
            background: #f8f9fa;
            color: #ccc;
            border-radius: 50px;
            padding: 5px 15px;
            transition: 0.3s;
            font-weight: bold;
        }

        .btn-like:hover {
            background: #ffebee;
            color: #ff5252;
            border-color: #ff5252;
        }

        .btn-like.liked {
            background: #ff5252;
            color: white;
            border-color: #ff5252;
            animation: popHeart 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popHeart {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
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

    <script>
        const ASSET_PATH = '../assets/img/';
        const GAME_ID = <?php echo $game_id; ?>;

        function loadShowcase() {
            fetch(`../api/get_showcase.php?game_id=${GAME_ID}`)
                .then(res => res.json())
                .then(data => {
                    const grid = document.getElementById('gallery-grid');
                    grid.innerHTML = '';

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
                        const col = document.createElement('div');
                        col.className = 'col-md-6 col-lg-4';

                        const isLikedClass = (work.is_liked > 0) ? 'liked' : '';
                        
                        // 🟢 ดึงข้อมูลฉากหลัง และลบข้อความออกให้เนียนตา
                        let descText = work.description || '-';
                        let bgType = 'grid'; // ค่าเริ่มต้น
                        
                        const bgMatch = descText.match(/\[ฉากหลัง:\s*(.*?)\]/);
                        if (bgMatch) {
                            bgType = bgMatch[1];
                            descText = descText.replace(/\[ฉากหลัง:\s*.*?\]\s*\n*/, ''); // เอา Tag ฉากหลังออก
                        }

                        col.innerHTML = `
                            <div class="work-card shadow-sm d-flex flex-column">
                                <div class="preview-box" id="bg-${work.id}">
                                    <div class="preview-content" id="canvas-${work.id}"></div>
                                </div>
                                <div class="p-3 d-flex flex-column flex-grow-1">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h5 class="fw-bold text-success mb-0"><i class="bi bi-person-circle"></i> ${work.student_name}</h5>
                                            <small class="text-muted">ทีมรหัส: ${work.student_id}</small>
                                        </div>
                                        <button class="btn-like shadow-sm ${isLikedClass}" onclick="toggleLike(${work.id}, this)">
                                            <i class="bi bi-heart-fill"></i> <span class="like-count">${work.like_count}</span>
                                        </button>
                                    </div>
                                    <p class="text-secondary small bg-light p-2 rounded flex-grow-1 border">
                                        <strong>📜 กติกา:</strong><br>${descText}
                                    </p>
                                    <small class="text-muted text-end mt-1" style="font-size: 0.75rem">
                                        <i class="bi bi-clock"></i> ส่งเมื่อ: ${timeAgo(work.submitted_at)}
                                    </small>
                                </div>
                            </div>
                        `;

                        grid.appendChild(col);

                        // ใส่ภาพพื้นหลังให้กล่องโชว์ผลงาน
                        const bgContainer = document.getElementById(`bg-${work.id}`);
                        if (bgType === 'grass') bgContainer.style.backgroundImage = `url('${ASSET_PATH}bg_grass.webp')`;
                        else if (bgType === 'dirt') bgContainer.style.backgroundImage = `url('${ASSET_PATH}bg_dirt.webp')`;
                        else if (bgType === 'farm') bgContainer.style.backgroundImage = `url('${ASSET_PATH}bg_farm_plot.webp')`;
                        else {
                            bgContainer.style.backgroundImage = `url('https://www.transparenttextures.com/patterns/cubes.png')`;
                            bgContainer.style.backgroundColor = '#f8f9fa';
                        }

                        renderMiniCanvas(work.work_data, `canvas-${work.id}`);
                    });
                });
        }

        function renderMiniCanvas(jsonData, targetId) {
            const container = document.getElementById(targetId);
            if (!container) return;

            try {
                const items = JSON.parse(jsonData);
                items.forEach(obj => {
                    const img = document.createElement('img');
                    
                    // เนื่องจากชื่อ Type ตอนนี้ตรงกับชื่อไฟล์แล้ว (เช่น weed_spiky -> weed_spiky.webp)
                    img.src = ASSET_PATH + obj.type + '.webp';
                    img.className = 'art-item';

                    // แปลงพิกัดจากขนาด 800x480 เป็นเปอร์เซ็นต์ (%) 
                    const leftPercent = (obj.x / 800) * 100; 
                    const topPercent = (obj.y / 480) * 100; 

                    img.style.left = leftPercent + '%';
                    img.style.top = topPercent + '%';

                    container.appendChild(img);
                });
            } catch (e) {
                console.error("Error parsing layout data", e);
            }
        }

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

            fetch('../api/toggle_like.php', {
                    method: 'POST',
                    body: JSON.stringify({ work_id: workId })
                })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        alert('เกิดข้อผิดพลาดในการกดถูกใจ');
                        btn.classList.toggle('liked');
                    } else {
                        countSpan.innerText = data.likes;
                    }
                });
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
            if (e.target.closest('.work-card')) isHovering = true;
            else isHovering = false;
        });

        // รีเฟรชดูผลงานเพื่อนใหม่ทุกๆ 10 วินาที 
        setInterval(() => {
            if (!isHovering) loadShowcase();
        }, 10000); 

        loadShowcase();
    </script>

</body>
</html>