<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit();
}

// ✅ รับค่า game_id
$game_id = $_GET['game_id'] ?? 1;
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>Hall of Fame - ลานโชว์ของ</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #f0f2f5;
            min-height: 100vh;
        }

        .header-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 0 40px;
            margin-bottom: 40px;
            border-bottom-left-radius: 50px;
            border-bottom-right-radius: 50px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        /* Card Design */
        .work-card {
            border: none;
            border-radius: 20px;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
            background: white;
            height: 100%;
        }

        .work-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }

        /* Canvas Mockup */
        .preview-box {
            position: relative;
            width: 100%;
            padding-top: 62.5%;
            /* Aspect Ratio 16:10 (800x500) */
            background-color: #ffffff;
            /* Grid Background */
            background-image:
                linear-gradient(#f0f0f0 1px, transparent 1px),
                linear-gradient(90deg, #f0f0f0 1px, transparent 1px);
            background-size: 30px 30px;
            overflow: hidden;
            border-bottom: 1px solid #eee;
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
            width: 10%;
            /* ขนาดสัมพัทธ์ */
            transform: translate(-50%, -50%);
            filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.1));
        }

        /* Like Button */
        .btn-like {
            border: none;
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
        }

        .btn-like.liked {
            background: #ff5252;
            color: white;
            animation: popHeart 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popHeart {
            0% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.3);
            }

            100% {
                transform: scale(1);
            }
        }
    </style>
</head>

<body>

    <div class="header-section text-center">
        <div class="container">
            <h1 class="fw-bold display-4 mb-2">🏆 Hall of Fame</h1>
            <p class="fs-5 opacity-75">รวมผลงานสุดเจ๋งของเพื่อนๆ ที่ผ่านการตรวจสอบแล้ว</p>
            <div class="mt-4">
                <a href="create_project.php?game_id=<?php echo $game_id; ?>" class="btn btn-light rounded-pill px-4 fw-bold me-2 text-primary">
                    <i class="bi bi-plus-lg"></i> สร้างงานของฉัน
                </a>
                <a href="student_dashboard.php" class="btn btn-outline-light rounded-pill px-4">กลับหน้าหลัก</a>
            </div>
        </div>
    </div>

    <div class="container pb-5">
        <div id="gallery-grid" class="row g-4">
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">กำลังโหลดแกลเลอรี...</p>
            </div>
        </div>
    </div>

    <script>
        const ASSET_PATH = '../assets/img/';
        // ✅ ประกาศตัวแปรรับค่าจาก PHP
        const GAME_ID = <?php echo $game_id; ?>;

        // Mapping ชื่อไฟล์
        const fileMapping = {
            'dog': 'dog',
            'cat': 'cat',
            'rabbit': 'rabbit',
            'sq_red': 'red_square',
            'ci_green': 'green_circle',
            'tri_blue': 'blue_triangle',
            'sq_yellow': 'yellow_square'
        };

        function loadShowcase() {
            fetch(`../api/get_showcase.php?game_id=${GAME_ID}`)
                .then(res => res.json())
                .then(data => {
                    const grid = document.getElementById('gallery-grid');
                    grid.innerHTML = '';

                    if (data.length === 0) {
                        grid.innerHTML = `
                    <div class="col-12 text-center py-5 text-muted">
                        <i class="bi bi-images display-1 opacity-25"></i>
                        <h4 class="mt-3">ยังไม่มีผลงานใน Hall of Fame</h4>
                        <p>รีบส่งงานให้ครูตรวจ แล้วมาเป็นคนแรกกันเถอะ!</p>
                    </div>
                `;
                        return;
                    }

                    data.forEach(work => {
                        const col = document.createElement('div');
                        col.className = 'col-md-6 col-lg-4';

                        const isLikedClass = (work.is_liked > 0) ? 'liked' : '';

                        col.innerHTML = `
                    <div class="work-card shadow-sm h-100 d-flex flex-column">
                        <div class="preview-box">
                            <div class="preview-content" id="canvas-${work.id}"></div>
                        </div>
                        <div class="p-4 d-flex flex-column flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h5 class="fw-bold text-dark mb-0">${work.student_name}</h5>
                                    <small class="text-muted">${work.student_id}</small>
                                </div>
                                <button class="btn-like shadow-sm ${isLikedClass}" onclick="toggleLike(${work.id}, this)">
                                    <i class="bi bi-heart-fill"></i> <span class="like-count">${work.like_count}</span>
                                </button>
                            </div>
                            <p class="text-secondary small bg-light p-2 rounded flex-grow-1">
                                <i class="bi bi-quote"></i> ${work.description || '-'}
                            </p>
                            <small class="text-muted mt-2" style="font-size: 0.8rem">
                                <i class="bi bi-clock"></i> ส่งเมื่อ: ${timeAgo(work.submitted_at)}
                            </small>
                        </div>
                    </div>
                `;

                        grid.appendChild(col);

                        // Render Canvas เล็ก
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
                    const realName = fileMapping[obj.type] || obj.type;
                    img.src = ASSET_PATH + realName + '.webp';
                    img.className = 'art-item';

                    // แปลงพิกัดจาก Canvas 800x500 เป็น % เพื่อให้ย่อขยายได้ (Responsive)
                    const leftPercent = (obj.x / 600) * 100; // อิงจากหน้า create width=600
                    const topPercent = (obj.y / 500) * 100; // อิงจากหน้า create height=500

                    img.style.left = leftPercent + '%';
                    img.style.top = topPercent + '%';

                    container.appendChild(img);
                });
            } catch (e) {}
        }

        function toggleLike(workId, btn) {
            // Animation feedback ทันที (ไม่ต้องรอ Server)
            const countSpan = btn.querySelector('.like-count');
            let currentCount = parseInt(countSpan.innerText);

            if (btn.classList.contains('liked')) {
                // Unlike Visual
                btn.classList.remove('liked');
                countSpan.innerText = Math.max(0, currentCount - 1);
            } else {
                // Like Visual
                btn.classList.add('liked');
                countSpan.innerText = currentCount + 1;
            }

            // Call API
            fetch('../api/toggle_like.php', {
                    method: 'POST',
                    body: JSON.stringify({
                        work_id: workId
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (!data.success) {
                        // ถ้า Error ให้ Revert visual กลับ
                        alert('เกิดข้อผิดพลาด');
                        btn.classList.toggle('liked');
                    } else {
                        // อัปเดตยอดจริงจาก Server เพื่อความชัวร์
                        countSpan.innerText = data.likes;
                    }
                });
        }

        // Helper: Time Ago (แปลงเวลาเป็น "2 นาทีที่แล้ว")
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

        // ✅ เพิ่มส่วนนี้: Auto Refresh ทุก 10 วินาที
        let isHovering = false; // ตัวแปรเช็คว่าเม้าส์ชี้งานอยู่ไหม

        // ดักจับว่าผู้ใช้กำลังเอามือ/เมาส์ แตะที่การ์ดงานไหม (ถ้าแตะอยู่ อย่าเพิ่งรีเฟรช เดี๋ยวเสียจังหวะ)
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.work-card')) isHovering = true;
            else isHovering = false;
        });

        setInterval(() => {
            // ถ้านักเรียนไม่ได้กำลังเอาเมาส์ชี้งานอยู่ ให้รีเฟรชข้อมูล
            if (!isHovering) {
                console.log("Auto refreshing gallery...");
                loadShowcase();
            }
        }, 10000); // 10000 ms = 10 วินาที (ปรับเวลาตรงนี้ได้ครับ)

        // เรียกครั้งแรกทันที
        loadShowcase();
    </script>

</body>

</html>