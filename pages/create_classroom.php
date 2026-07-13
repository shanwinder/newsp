<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

require_teacher_or_admin();
ensure_active_account($conn);

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $classroom_name = trim($_POST['classroom_name'] ?? '');
    $grade_level = trim($_POST['grade_level'] ?? 'ป.4');
    $academic_year = trim($_POST['academic_year'] ?? '');
    $session_name = trim($_POST['session_name'] ?? 'รอบการเรียนรู้หลัก');

    if ($classroom_name === '') {
        $error = 'กรุณากรอกชื่อห้องเรียน';
    } else {
        $teacher_id = intval($_SESSION['user_id']);
        $school_id = intval($_SESSION['school_id'] ?? 0);

        if (is_super_admin() && isset($_POST['teacher_id'])) {
            $teacher_id = intval($_POST['teacher_id']);
            $stmt = $conn->prepare("SELECT school_id FROM users WHERE user_id = ? AND role IN ('teacher','super_admin','admin')");
            $stmt->bind_param("i", $teacher_id);
            $stmt->execute();
            $teacher = $stmt->get_result()->fetch_assoc();
            $school_id = intval($teacher['school_id'] ?? $school_id);
        }

        if ($school_id <= 0) {
            $error = 'ไม่พบข้อมูลโรงเรียนของครู';
        } else {
            $join_code = build_join_code($conn);
            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare("INSERT INTO classrooms (school_id, teacher_id, classroom_name, grade_level, academic_year, join_code, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())");
                $stmt->bind_param("iissss", $school_id, $teacher_id, $classroom_name, $grade_level, $academic_year, $join_code);
                $stmt->execute();
                $classroom_id = $conn->insert_id;

                $stmt = $conn->prepare("INSERT INTO learning_sessions (school_id, classroom_id, teacher_id, session_name, class_status, navigation_status, status, created_at) VALUES (?, ?, ?, ?, 'active', 'locked', 'active', NOW())");
                $stmt->bind_param("iiis", $school_id, $classroom_id, $teacher_id, $session_name);
                $stmt->execute();

                $conn->commit();
                $_SESSION['classroom_id'] = $classroom_id;
                header("Location: dashboard.php?classroom_id=" . $classroom_id);
                exit();
            } catch (Throwable $e) {
                $conn->rollback();
                error_log($e->getMessage());
                $error = 'ไม่สามารถสร้างห้องเรียนได้';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>สร้างห้องเรียน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">



<?php
$page_styles = array (
  0 => 'pages/create_classroom.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page create-classroom-page">
    <div class="container py-5">
        <div class="classroom-create-card mx-auto bg-white rounded-4 shadow-sm p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h4 fw-bold text-success mb-0">สร้างห้องเรียน</h1>
                <a href="classrooms.php" class="btn btn-outline-secondary rounded-pill">กลับ</a>
            </div>
            <?php if ($error): ?><div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>
            <form method="post">
                <div class="mb-3">
                    <label class="form-label">ชื่อห้องเรียน</label>
                    <input type="text" name="classroom_name" class="form-control" placeholder="เช่น ป.4/1 ภาคเรียนที่ 1" required>
                </div>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">ระดับชั้น</label>
                        <input type="text" name="grade_level" class="form-control" value="ป.4">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">ปีการศึกษา</label>
                        <input type="text" name="academic_year" class="form-control" placeholder="เช่น 2569">
                    </div>
                </div>
                <div class="mt-3">
                    <label class="form-label">ชื่อรอบการใช้งาน</label>
                    <input type="text" name="session_name" class="form-control" value="รอบการเรียนรู้หลัก">
                </div>
                <button type="submit" class="btn btn-success w-100 rounded-pill fw-bold py-2 mt-4">สร้างห้องเรียนและ Join Code</button>
            </form>
        </div>
    </div>
</body>
</html>
