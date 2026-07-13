<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

require_teacher_or_admin();
ensure_active_account($conn);

$id = $_GET['id'] ?? 0;
$msg = "";

// 🟢 แก้ไข: เปลี่ยน id เป็น user_id
$stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ? AND role = 'student' AND (? = 1 OR teacher_id = ?)");
$is_admin = is_super_admin() ? 1 : 0;
$teacher_id = intval($_SESSION['user_id']);
$stmt->bind_param("iii", $id, $is_admin, $teacher_id);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    echo "ไม่พบผู้ใช้";
    exit();
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = trim($_POST['name']);
    $class_level = trim($_POST['class_level']);
    $password = $_POST['password'];

    if (!empty($password)) {
        // กรณีเปลี่ยนรหัสผ่าน
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        // 🟢 แก้ไข: เปลี่ยน WHERE id=? เป็น WHERE user_id=?
        $update = $conn->prepare("UPDATE users SET name=?, class_level=?, password=? WHERE user_id=?");
        $update->bind_param("sssi", $name, $class_level, $hashed, $id);
    } else {
        // กรณีไม่เปลี่ยนรหัสผ่าน
        // 🟢 แก้ไข: เปลี่ยน WHERE id=? เป็น WHERE user_id=?
        $update = $conn->prepare("UPDATE users SET name=?, class_level=? WHERE user_id=?");
        $update->bind_param("ssi", $name, $class_level, $id);
    }

    if ($update->execute()) {
        echo "<script>alert('อัปเดตข้อมูลสำเร็จ!'); window.location.href='dashboard.php';</script>";
    } else {
        $msg = "Error: " . $conn->error;
    }
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>แก้ไขข้อมูลนักเรียน</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">




<?php
$page_styles = array (
  0 => 'pages/edit_user.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>

<body class="app-page edit-user-page">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card border-0 shadow-sm p-4 rounded-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4 class="fw-bold text-warning"><i class="bi bi-pencil-square"></i> แก้ไขข้อมูล</h4>
                        <a href="dashboard.php" class="btn btn-light rounded-pill btn-sm">ยกเลิก</a>
                    </div>

                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label text-muted">รหัสนักเรียน (แก้ไขไม่ได้)</label>
                            <input type="text" class="form-control bg-light" value="<?php echo htmlspecialchars($user['student_id']); ?>" disabled>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชื่อ-นามสกุล</label>
                            <input type="text" name="name" class="form-control" required value="<?php echo htmlspecialchars($user['name']); ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชั้นเรียน</label>
                            <input type="text" name="class_level" class="form-control" required value="<?php echo htmlspecialchars($user['class_level']); ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">เปลี่ยนรหัสผ่านใหม่</label>
                            <input type="text" name="password" class="form-control" placeholder="เว้นว่างไว้ หากไม่ต้องการเปลี่ยน">
                        </div>

                        <button type="submit" class="btn btn-warning w-100 rounded-pill py-2 fw-bold text-dark mt-3">
                            ยืนยันการแก้ไข
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</body>

</html>
