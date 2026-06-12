<?php
// pages/dashboard.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

require_teacher_or_admin();
ensure_active_account($conn);

$context = classroom_context($conn);
$classrooms = [];

if (is_teacher()) {
    $stmt_rooms = $conn->prepare("SELECT c.*, s.school_name FROM classrooms c JOIN schools s ON c.school_id = s.id WHERE c.teacher_id = ? ORDER BY c.created_at DESC");
    $stmt_rooms->bind_param("i", $_SESSION['user_id']);
} else {
    $stmt_rooms = $conn->prepare("SELECT c.*, s.school_name FROM classrooms c JOIN schools s ON c.school_id = s.id ORDER BY c.created_at DESC");
}
$stmt_rooms->execute();
$rooms_result = $stmt_rooms->get_result();
while ($room = $rooms_result->fetch_assoc()) {
    $classrooms[] = $room;
}

if (!$context && is_teacher()) {
    header("Location: classrooms.php");
    exit();
}

if (!$context && is_super_admin() && empty($classrooms)) {
    header("Location: super_admin_dashboard.php");
    exit();
}

if (!$context) {
    header("Location: login.php");
    exit();
}

$current_status = $context['learning_session']['class_status'] ?? 'active';
$nav_status = $context['learning_session']['navigation_status'] ?? 'locked';
$active_classroom = $context['classroom'];
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($app['teacher_dashboard_title']); ?></title>
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
            <span class="navbar-brand mb-0 h1"><i class="bi bi-mortarboard-fill me-2"></i> <?php echo htmlspecialchars($app['teacher_dashboard_title']); ?></span>
            <div class="d-flex gap-2">
                <?php if (is_super_admin()): ?>
                    <a href="super_admin_dashboard.php" class="btn btn-warning btn-sm rounded-pill text-dark fw-bold">อนุมัติครู</a>
                <?php endif; ?>
                <a href="manual_teacher.php" class="btn btn-light btn-sm rounded-pill text-primary fw-bold">คู่มือครู</a>
                <a href="classrooms.php" class="btn btn-light btn-sm rounded-pill text-primary fw-bold">ห้องเรียนของฉัน</a>
                <a href="../logout.php" class="btn btn-light btn-sm rounded-pill text-primary fw-bold">ออกจากระบบ</a>
            </div>
        </div>
    </nav>

    <div class="container py-4">
        <div class="card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h4 class="fw-bold text-primary mb-1"><?php echo htmlspecialchars($active_classroom['classroom_name']); ?></h4>
                    <div class="text-muted">
                        <?php echo htmlspecialchars($active_classroom['school_name']); ?> |
                        Join Code: <span class="badge bg-success"><?php echo htmlspecialchars($active_classroom['join_code']); ?></span>
                    </div>
                </div>
                <form method="get" class="d-flex gap-2 align-items-center">
                    <select name="classroom_id" class="form-select" onchange="this.form.submit()">
                        <?php foreach ($classrooms as $room): ?>
                            <option value="<?php echo $room['id']; ?>" <?php echo intval($room['id']) === intval($active_classroom['id']) ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars($room['classroom_name'] . ' - ' . $room['join_code']); ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <a href="create_classroom.php" class="btn btn-success rounded-pill text-nowrap">สร้างห้องเรียน</a>
                </form>
            </div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="control-panel h-100 shadow-sm">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="mb-0"><i class="bi bi-controller"></i> สถานะการเข้าเรียน</h5>
                        <span id="status-text" class="badge bg-warning text-dark"><?php echo strtoupper($current_status); ?></span>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <button onclick="toggleGame('active')" class="btn btn-success flex-grow-1" id="btn-resume" <?php echo ($current_status == 'active') ? 'disabled' : ''; ?>>
                            <i class="bi bi-play-fill"></i> อนุญาตให้เข้าเรียน
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
                        <button onclick="toggleNav('locked')" class="btn btn-outline-danger flex-grow-1"><i class="bi bi-lock-fill"></i> สั่งล็อกภารกิจ</button>
                        <button onclick="toggleNav('unlocked')" class="btn btn-outline-success flex-grow-1"><i class="bi bi-unlock-fill"></i> สั่งปลดล็อกภารกิจ</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="card shadow-sm border-0 rounded-4">
            <div class="card-header bg-white py-3">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h5 class="mb-0 fw-bold text-primary">
                        <i class="bi bi-people-fill me-2"></i> จัดการนักเรียนและผลการเรียนรู้
                    </h5>

                    <div class="d-flex gap-2">
                        <a href="review_work.php" class="btn btn-warning btn-sm rounded-pill px-3 fw-bold text-dark shadow-sm">
                            <i class="bi bi-easel2-fill"></i> ตรวจชิ้นงาน
                        </a>
                        <a href="add_user.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-primary btn-sm rounded-pill px-3 shadow-sm">
                            <i class="bi bi-person-plus-fill"></i> เพิ่มนักเรียน
                        </a>
                        <a href="import_students.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-success btn-sm rounded-pill px-3 shadow-sm">
                            <i class="bi bi-file-earmark-spreadsheet-fill"></i> นำเข้า CSV
                        </a>
                        <a href="export_scores.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-outline-success btn-sm rounded-pill px-3 shadow-sm">
                            <i class="bi bi-download"></i> Export คะแนน
                        </a>
                        <a href="assessment_manage.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm">
                            <i class="bi bi-journal-check"></i> จัดการข้อสอบ
                        </a>
                        <a href="assessment_settings.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-outline-dark btn-sm rounded-pill px-3 shadow-sm">
                            <i class="bi bi-sliders"></i> ตั้งค่าการสอบ
                        </a>
                        <a href="assessment_report.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-info btn-sm rounded-pill px-3 shadow-sm text-dark">
                            <i class="bi bi-bar-chart-fill"></i> ผลสอบก่อน–หลัง
                        </a>
                        <a href="../api/export_assessment_scores.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-outline-info btn-sm rounded-pill px-3 shadow-sm text-dark">
                            <i class="bi bi-filetype-csv"></i> Export ผลสอบ
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
