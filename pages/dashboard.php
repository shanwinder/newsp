<?php
// pages/dashboard.php
session_start();
require_once '../includes/db.php';

// Check Admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

// เช็คสถานะปัจจุบัน
$res = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'class_status'");
$current_status = $res->fetch_assoc()['setting_value'] ?? 'active';

// เพิ่ม: ดึงสถานะ Navigation ล่าสุดมาเช็คก่อน render ปุ่ม
$res_nav = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'");
$nav_status = $res_nav->fetch_assoc()['setting_value'] ?? 'locked';
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>Teacher Command Center</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #f1f5f9;
        }

        .stat-card {
            border: none;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: 0.3s;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .status-online {
            color: #10b981;
            font-weight: bold;
        }

        .status-offline {
            color: #94a3b8;
        }

        /* สวิตช์ควบคุม */
        .control-panel {
            background: #1e293b;
            color: white;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .btn-control {
            border-radius: 50px;
            padding: 10px 30px;
            font-size: 1.2rem;
            font-weight: bold;
            transition: 0.3s;
        }
    </style>
</head>

<body>

    <nav class="navbar navbar-dark bg-primary shadow-sm">
        <div class="container">
            <span class="navbar-brand mb-0 h1"><i class="bi bi-mortarboard-fill me-2"></i> Teacher Dashboard</span>
            <a href="../logout.php" class="btn btn-light btn-sm rounded-pill text-primary fw-bold">Logout</a>
        </div>
    </nav>

    <div class="container py-4">

        <div class="control-panel d-flex justify-content-between align-items-center shadow">
            <div>
                <h3 class="mb-1">🎮 แผงควบคุมห้องเรียน</h3>
                <p class="text-white-50 mb-0">สถานะปัจจุบัน: <span id="status-text" class="fw-bold text-warning"><?php echo strtoupper($current_status); ?></span></p>
            </div>
            <div>
                <button onclick="toggleGame('active')" class="btn btn-success btn-control me-2" id="btn-resume"
                    <?php echo ($current_status == 'active') ? 'disabled' : ''; ?>>
                    <i class="bi bi-play-fill"></i> เริ่มเกม
                </button>

                <button onclick="toggleGame('paused')" class="btn btn-danger btn-control" id="btn-pause"
                    <?php echo ($current_status == 'paused') ? 'disabled' : ''; ?>>
                    <i class="bi bi-pause-fill"></i> หยุดเกมชั่วคราว
                </button>
            </div>
            <div class="mt-4 p-4 bg-dark rounded-4 text-white shadow">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="mb-0"><i class="bi bi-traffic-light text-warning"></i> ควบคุมการเข้าเล่น/เปลี่ยนด่าน</h4>
                    <span id="nav-status-badge" class="badge rounded-pill <?php echo ($nav_status == 'locked') ? 'bg-danger' : 'bg-success'; ?>">
                        <?php echo ($nav_status == 'locked') ? '⛔ ล็อกอยู่' : '✅ เปิดใช้งาน'; ?>
                    </span>
                </div>

                <div class="d-flex gap-3">
                    <button id="btn-lock" onclick="toggleNav('locked')"
                        class="btn <?php echo ($nav_status == 'locked') ? 'btn-danger' : 'btn-outline-danger'; ?> btn-lg flex-grow-1 position-relative">
                        <i class="bi bi-lock-fill"></i> ห้ามเข้าเล่น / ให้รอ
                        <?php if ($nav_status == 'locked'): ?>
                            <span class="position-absolute top-0 start-100 translate-middle p-2 bg-light border border-light rounded-circle"></span>
                        <?php endif; ?>
                    </button>

                    <button id="btn-unlock" onclick="toggleNav('unlocked')"
                        class="btn <?php echo ($nav_status == 'unlocked') ? 'btn-success' : 'btn-outline-success'; ?> btn-lg flex-grow-1">
                        <i class="bi bi-unlock-fill"></i> อนุญาตให้เข้าเล่น
                    </button>
                </div>
                <small class="text-muted mt-3 d-block">
                    <i class="bi bi-info-circle"></i>
                    <strong>สถานะล็อก:</strong> นักเรียนจะเข้าด่านไม่ได้ และคนที่เล่นจบจะค้างที่หน้าสรุปคะแนน<br>
                    <strong>สถานะเปิด:</strong> นักเรียนเข้าเล่นเกมได้ และกดไปด่านต่อไปได้
                </small>
            </div>
        </div>

        <div class="card shadow-sm border-0 rounded-4">
            <div class="card-header bg-white py-3 d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold text-primary"><i class="bi bi-people-fill me-2"></i> รายชื่อนักเรียน (Real-time)</h5>
                <span class="badge bg-info text-dark" id="online-count">Online: 0 คน</span>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light text-secondary">
                            <tr>
                                <th class="ps-4">ชื่อนักเรียน</th>
                                <th>ชั้นเรียน</th>
                                <th>สถานะ</th>
                                <th>คะแนนรวม</th>
                                <th>ล่าสุดเมื่อ</th>
                            </tr>
                        </thead>
                        <tbody id="student-list">
                            <tr>
                                <td colspan="5" class="text-center py-4 text-muted">กำลังโหลดข้อมูล...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 1. ฟังก์ชันสั่ง Pause/Resume
        function toggleGame(status) {
            if (!confirm('ยืนยันที่จะเปลี่ยนสถานะห้องเรียนเป็น ' + status + '?')) return;

            fetch('../api/toggle_class.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: status
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'success') {
                        updateControlUI(data.new_status);
                    }
                });
        }

        function updateControlUI(status) {
            document.getElementById('status-text').innerText = status.toUpperCase();
            document.getElementById('btn-resume').disabled = (status === 'active');
            document.getElementById('btn-pause').disabled = (status === 'paused');
        }

        // 2. ฟังก์ชันดึงรายชื่อนักเรียน (Real-time Monitoring)
        function loadStudents() {
            // สร้างไฟล์ api/get_students_monitor.php (เดี๋ยวผมให้ code ด้านล่าง)
            fetch('../api/get_students_monitor.php')
                .then(res => res.json())
                .then(data => {
                    const tbody = document.getElementById('student-list');
                    let html = '';
                    let onlineCount = 0;

                    data.students.forEach(std => {
                        // เช็คว่า Online ไหม (ถ้า last_seen ไม่เกิน 10 วินาทีถือว่า Online)
                        const lastSeenTime = new Date(std.last_seen).getTime();
                        const now = new Date(data.server_time).getTime();
                        const diff = (now - lastSeenTime) / 1000;

                        let statusHtml = '<span class="status-offline"><i class="bi bi-circle-fill small"></i> Offline</span>';
                        if (diff < 15) { // 15 วินาที
                            statusHtml = '<span class="status-online"><i class="bi bi-circle-fill small"></i> Online</span>';
                            onlineCount++;
                        }

                        html += `
                    <tr>
                        <td class="ps-4 fw-bold text-dark">${std.name}</td>
                        <td><span class="badge bg-light text-dark border">${std.class_level}</span></td>
                        <td>${statusHtml}</td>
                        <td class="fw-bold text-warning">${std.total_score} ⭐</td>
                        <td class="text-muted small">${std.last_seen || '-'}</td>
                    </tr>
                `;
                    });

                    tbody.innerHTML = html;
                    document.getElementById('online-count').innerText = `Online: ${onlineCount} คน`;
                });
        }

        // เรียกทำงานทุก 3 วินาที
        setInterval(loadStudents, 3000);
        loadStudents(); // เรียกครั้งแรกเลย

        // ฟังก์ชัน JS อัปเดต UI ทันทีไม่ต้องรอโหลด
        function toggleNav(status) {
            // ส่งคำสั่งไป API
            fetch('../api/toggle_nav.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: status
                    })
                })
                .then(() => {
                    updateNavButtons(status);
                });
        }

        function updateNavButtons(status) {
            const btnLock = document.getElementById('btn-lock');
            const btnUnlock = document.getElementById('btn-unlock');
            const badge = document.getElementById('nav-status-badge');

            if (status === 'locked') {
                // ปรับปุ่ม Lock เป็น Active
                btnLock.className = 'btn btn-danger btn-lg flex-grow-1';
                btnUnlock.className = 'btn btn-outline-success btn-lg flex-grow-1';
                // ปรับ Badge
                badge.className = 'badge rounded-pill bg-danger';
                badge.innerText = '⛔ ล็อกอยู่';
            } else {
                // ปรับปุ่ม Unlock เป็น Active
                btnLock.className = 'btn btn-outline-danger btn-lg flex-grow-1';
                btnUnlock.className = 'btn btn-success btn-lg flex-grow-1';
                // ปรับ Badge
                badge.className = 'badge rounded-pill bg-success';
                badge.innerText = '✅ เปิดใช้งาน';
            }
        }
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>