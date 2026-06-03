<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

require_teacher_or_admin();
ensure_active_account($conn);

if (is_teacher()) {
    $stmt = $conn->prepare("SELECT c.*, s.school_name, (SELECT COUNT(*) FROM users u WHERE u.classroom_id = c.id AND u.role = 'student') as student_count FROM classrooms c JOIN schools s ON c.school_id = s.id WHERE c.teacher_id = ? ORDER BY c.created_at DESC");
    $stmt->bind_param("i", $_SESSION['user_id']);
} else {
    $stmt = $conn->prepare("SELECT c.*, s.school_name, (SELECT COUNT(*) FROM users u WHERE u.classroom_id = c.id AND u.role = 'student') as student_count FROM classrooms c JOIN schools s ON c.school_id = s.id ORDER BY c.created_at DESC");
}
$stmt->execute();
$rooms = $stmt->get_result();
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>ห้องเรียนของฉัน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>body { font-family: 'Kanit', sans-serif; background: #f1f5f9; }</style>
</head>
<body>
    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="h3 fw-bold text-primary mb-1">ห้องเรียนของฉัน</h1>
                <p class="text-muted mb-0">เลือกห้องเรียนก่อนดูคะแนน เพิ่มนักเรียน หรือควบคุมด่าน</p>
            </div>
            <div class="d-flex gap-2">
                <a href="dashboard.php" class="btn btn-outline-secondary rounded-pill">Dashboard</a>
                <a href="create_classroom.php" class="btn btn-success rounded-pill fw-bold"><i class="bi bi-plus-lg"></i> สร้างห้องเรียน</a>
            </div>
        </div>

        <div class="row g-3">
            <?php while ($room = $rooms->fetch_assoc()): ?>
                <div class="col-md-6 col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="fw-bold mb-0"><?php echo htmlspecialchars($room['classroom_name']); ?></h5>
                                <span class="badge <?php echo $room['status'] === 'active' ? 'bg-success' : 'bg-secondary'; ?>"><?php echo htmlspecialchars($room['status']); ?></span>
                            </div>
                            <p class="text-muted small mb-2"><?php echo htmlspecialchars($room['school_name']); ?></p>
                            <div class="mb-2">ระดับชั้น: <strong><?php echo htmlspecialchars($room['grade_level']); ?></strong></div>
                            <div class="mb-2">ปีการศึกษา: <strong><?php echo htmlspecialchars($room['academic_year'] ?: '-'); ?></strong></div>
                            <div class="mb-3">Join Code: <span class="badge bg-primary fs-6"><?php echo htmlspecialchars($room['join_code']); ?></span></div>
                            <div class="mb-4">นักเรียน: <strong><?php echo intval($room['student_count']); ?></strong> คน</div>
                            <div class="d-grid gap-2">
                                <a href="dashboard.php?classroom_id=<?php echo $room['id']; ?>" class="btn btn-primary rounded-pill">จัดการห้องนี้</a>
                                <a href="add_user.php?classroom_id=<?php echo $room['id']; ?>" class="btn btn-outline-success rounded-pill">เพิ่มนักเรียน</a>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
</body>
</html>
