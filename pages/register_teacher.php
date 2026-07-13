<?php
session_start();
require_once '../includes/db.php';
$app = require __DIR__ . '/../config/app.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $teacher_name = trim($_POST['teacher_name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $school_name = trim($_POST['school_name'] ?? '');
    $district = trim($_POST['district'] ?? '');
    $province = trim($_POST['province'] ?? '');
    $affiliation = trim($_POST['affiliation'] ?? '');

    if ($teacher_name === '' || $email === '' || $password === '' || $school_name === '') {
        $error = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'รูปแบบอีเมลไม่ถูกต้อง';
    } else {
        $stmt = $conn->prepare("SELECT user_id FROM users WHERE email = ? LIMIT 1");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            $error = 'อีเมลนี้ถูกใช้สมัครแล้ว';
        } else {
            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare("INSERT INTO schools (school_name, district, province, affiliation, contact_name, contact_email, contact_phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NOW())");
                $stmt->bind_param("sssssss", $school_name, $district, $province, $affiliation, $teacher_name, $email, $phone);
                $stmt->execute();
                $school_id = $conn->insert_id;

                $login_code = 'T' . substr(strtoupper(bin2hex(random_bytes(5))), 0, 10);
                $hashed = password_hash($password, PASSWORD_DEFAULT);
                $role = 'teacher';
                $status = 'pending';

                $stmt = $conn->prepare("INSERT INTO users (student_id, name, class_level, password, role, school_id, email, phone, status) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssisss", $login_code, $teacher_name, $hashed, $role, $school_id, $email, $phone, $status);
                $stmt->execute();

                $conn->commit();
                header("Location: pending_approval.php");
                exit();
            } catch (Throwable $e) {
                $conn->rollback();
                error_log($e->getMessage());
                $error = 'ไม่สามารถบันทึกคำขอสมัครได้ โปรดลองอีกครั้ง';
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>สมัครใช้งานครู - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">



<?php
$page_styles = array (
  0 => 'pages/register_teacher.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page register-teacher-page">
    <div class="container py-5">
        <div class="teacher-register-card mx-auto bg-white rounded-4 shadow-sm p-4 p-md-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="h3 fw-bold text-success mb-1">สมัครใช้งานสำหรับครู</h1>
                    <p class="text-muted mb-0"><?php echo htmlspecialchars($app['app_name']); ?></p>
                </div>
                <a href="login.php" class="btn btn-outline-secondary rounded-pill">กลับ</a>
            </div>

            <?php if ($error): ?>
                <div class="alert alert-danger rounded-3"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <form method="post">
                <h5 class="fw-bold mb-3">ข้อมูลครู</h5>
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <label class="form-label">ชื่อ-นามสกุล</label>
                        <input type="text" name="teacher_name" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email</label>
                        <input type="email" name="email" class="form-control" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">เบอร์โทรศัพท์</label>
                        <input type="text" name="phone" class="form-control">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">รหัสผ่าน</label>
                        <input type="password" name="password" class="form-control" required>
                    </div>
                </div>

                <h5 class="fw-bold mb-3">ข้อมูลโรงเรียน</h5>
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">ชื่อโรงเรียน</label>
                        <input type="text" name="school_name" class="form-control" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">อำเภอ</label>
                        <input type="text" name="district" class="form-control">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">จังหวัด</label>
                        <input type="text" name="province" class="form-control">
                    </div>
                    <div class="col-12">
                        <label class="form-label">สังกัด</label>
                        <input type="text" name="affiliation" class="form-control">
                    </div>
                </div>

                <button type="submit" class="btn btn-success w-100 rounded-pill fw-bold py-2 mt-4">ส่งคำขอสมัครใช้งาน</button>
            </form>
        </div>
    </div>
</body>
</html>
