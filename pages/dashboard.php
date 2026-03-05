<?php
// pages/dashboard.php
session_start();
require_once '../includes/db.php';

// Check Admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

// เช็คสถานะห้องเรียน
$res = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'class_status'");
$current_status = $res->fetch_assoc()['setting_value'] ?? 'active';

// เช็คสถานะ Navigation
$res_nav = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'");
$nav_status = $res_nav->fetch_assoc()['setting_value'] ?? 'locked';
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>Teacher Command Center - ศูนย์ควบคุมฟาร์ม</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #f1f5f9;
        }

        .control-panel {
            background: #1e293b;
            color: white;
            border-radius: 20px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .btn-control {
            border-radius: 50px;
            font-weight: bold;
            transition: 0.3s;
        }

        .table-hover tbody tr:hover {
            background-color: rgba(0, 0, 0, 0.02);
        }

        .action-btn {
            width: 32px;
            height: 32px;
            padding: 0;
            line-height: 32px;
            text-align: center;
            border-radius: 50%;
        }
    </style>
</head>

<body>

    <nav class="navbar navbar-dark bg-primary shadow-sm sticky-top">
        <div class="container">
            <span class="navbar-brand mb-0 h1"><i class="bi bi-mortarboard-fill me-2"></i> Teacher Dashboard</span>
            <a href="../logout.php" class="btn btn-light btn-sm rounded-pill text-primary fw-bold">ออกจากระบบ</a>
        </div>
    </nav>

    <div class="container py-4">

        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="control-panel h-100 shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0"><i class="bi bi-controller"></i> สถานะการเข้าเล่นเกม</h5>
                        <span id="status-text" class="badge bg-warning text-dark"><?php echo strtoupper($current_status); ?></span>
                    </div>
                    <div class="d-flex gap-2">
                        <button onclick="toggleGame('active')" class="btn btn-success flex-grow-1" id="btn-resume" <?php echo ($current_status == 'active') ? 'disabled' : ''; ?>>
                            <i class="bi bi-play-fill"></i> อนุญาตให้เข้าเล่น
                        </button>
                        <button onclick="toggleGame('paused')" class="btn btn-danger flex-grow-1" id="btn-pause" <?php echo ($current_status == 'paused') ? 'disabled' : ''; ?>>
                            <i class="bi bi-pause-fill"></i> ระงับชั่วคราว
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="control-panel h-100 shadow-sm bg-dark">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0"><i class="bi bi-traffic-light"></i> การปลดล็อกด่านถัดไป</h5>
                        <span id="nav-badge" class="badge <?php echo ($nav_status == 'locked') ? 'bg-danger' : 'bg-success'; ?>">
                            <?php echo ($nav_status == 'locked') ? '⛔ ล็อกอยู่' : '✅ ปลดล็อกแล้ว'; ?>
                        </span>
                    </div>
                    <div class="d-flex gap-2">
                        <button onclick="toggleNav('locked')" class="btn btn-outline-danger flex-grow-1"><i class="bi bi-lock-fill"></i> สั่งล็อกด่าน</button>
                        <button onclick="toggleNav('unlocked')" class="btn btn-outline-success flex-grow-1"><i class="bi bi-unlock-fill"></i> สั่งปลดล็อกด่าน</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card shadow-sm border-0 rounded-4">
            <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h5 class="mb-0 fw-bold text-primary">
                        <i class="bi bi-people-fill me-2"></i> จัดการนักเรียน
                    </h5>

                    <div class="d-flex gap-2">
                        <a href="review_work.php" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm">
                            <i class="bi bi-easel2-fill"></i> ตรวจชิ้นงาน
                        </a>
                        <a href="add_user.php" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm">
                            <i class="bi bi-person-plus-fill"></i> เพิ่มนักเรียน
                        </a>
                        <a href="import_students.php" class="btn btn-success btn-sm rounded-pill px-3 shadow-sm">
                            <i class="bi bi-file-earmark-spreadsheet-fill"></i> นำเข้า CSV
                        </a>
                        <button type="submit" form="bulk-delete-form" class="btn btn-danger btn-sm rounded-pill px-3 shadow-sm"
                            onclick="return confirm('⚠️ ยืนยันการลบนักเรียนที่เลือกทั้งหมด? ข้อมูลการเล่นจะหายไปด้วยนะ!');">
                            <i class="bi bi-trash-fill"></i> ลบที่เลือก
                        </button>
                    </div>
                </div>
            </div>

            <div class="card-body p-0">
                <form id="bulk-delete-form" action="delete_multiple_users.php" method="POST">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light text-secondary">
                                <tr>
                                    <th class="ps-4" style="width: 50px;">
                                        <input type="checkbox" class="form-check-input" id="select-all">
                                    </th>
                                    <th>รหัสนักเรียน</th>
                                    <th>ชื่อ-นามสกุล</th>
                                    <th>ชั้นเรียน</th>
                                    <th>สถานะ</th>
                                    <th>คะแนนรวม</th>
                                    <th class="text-end pe-4">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody id="student-list-body">
                                <tr>
                                    <td colspan="7" class="text-center py-5 text-muted">
                                        <div class="spinner-border text-primary mb-2" role="status"></div><br>กำลังโหลดข้อมูล...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </div>
        </div>

    </div>

    <script>
        function loadStudents() {
            fetch('../api/get_students_monitor.php')
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    const tbody = document.getElementById('student-list-body');
                    let html = '';

                    if (!data.students || data.students.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-5 text-muted">ยังไม่มีนักเรียนในระบบ</td></tr>';
                        return;
                    }

                    data.students.forEach(std => {
                        // Check Online Status
                        const lastSeenTime = new Date(std.last_seen).getTime();
                        const now = new Date(data.server_time).getTime();
                        const diff = (now - lastSeenTime) / 1000;
                        let statusBadge = (diff < 15) ?
                            '<span class="badge bg-success bg-opacity-10 text-success"><i class="bi bi-circle-fill small"></i> Online</span>' :
                            '<span class="badge bg-secondary bg-opacity-10 text-secondary">Offline</span>';

                        html += `
                            <tr>
                                <td class="ps-4">
                                    <input type="checkbox" name="selected_ids[]" value="${std.id}" class="form-check-input student-checkbox">
                                </td>
                                <td class="fw-bold text-primary">${std.student_id}</td>
                                <td class="fw-bold text-dark">${std.name}</td>
                                <td><span class="badge bg-light text-dark border">${std.class_level}</span></td>
                                <td>${statusBadge}</td>
                                <td class="fw-bold text-warning fs-6">${std.total_score} ⭐</td>
                                <td class="text-end pe-4">
                                    <a href="edit_user.php?id=${std.id}" class="btn btn-outline-warning btn-sm action-btn me-1" title="แก้ไข">
                                        <i class="bi bi-pencil-fill"></i>
                                    </a>
                                    <a href="delete_user.php?id=${std.id}" class="btn btn-outline-danger btn-sm action-btn" 
                                       title="ลบ" onclick="return confirm('ยืนยันการลบ ${std.name} ออกจากระบบ?');">
                                        <i class="bi bi-trash-fill"></i>
                                    </a>
                                </td>
                            </tr>
                        `;
                    });
                    tbody.innerHTML = html;
                })
                .catch(error => {
                    console.error("Error fetching students:", error);
                    document.getElementById('student-list-body').innerHTML = `
                        <tr><td colspan="7" class="text-center py-4 text-danger">
                            <i class="bi bi-exclamation-triangle-fill"></i> ขัดข้อง! ไม่สามารถโหลดข้อมูลได้ โปรดลองรีเฟรชหน้าเว็บ
                        </td></tr>`;
                });
        }

        // ฟังก์ชัน Select All Checkbox
        document.getElementById('select-all').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('.student-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });

        // ฟังก์ชันควบคุมห้องเรียน
        function toggleGame(status) {
            fetch('../api/toggle_class.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: status })
            }).then(res => res.json()).then(() => location.reload());
        }

        function toggleNav(status) {
            fetch('../api/toggle_nav.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: status })
            }).then(() => location.reload());
        }

        // โหลดข้อมูลครั้งแรก และตั้งเวลารีเฟรชทุก 5 วินาที
        loadStudents();
        setInterval(loadStudents, 5000); 
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>