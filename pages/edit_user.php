<?php
session_start();
require_once '../includes/db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit();
}

$id = $_GET['id'] ?? 0;
$msg = "";

// ดึงข้อมูลเก่า
$stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
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
        $update = $conn->prepare("UPDATE users SET name=?, class_level=?, password=? WHERE id=?");
        $update->bind_param("sssi", $name, $class_level, $hashed, $id);
    } else {
        // กรณีไม่เปลี่ยนรหัสผ่าน
        $update = $conn->prepare("UPDATE users SET name=?, class_level=? WHERE id=?");
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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #f1f5f9;
        }
    </style>
</head>

<body>
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
                            <input type="text" class="form-control bg-light" value="<?php echo $user['student_id']; ?>" disabled>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชื่อ-นามสกุล</label>
                            <input type="text" name="name" class="form-control" required value="<?php echo $user['name']; ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ชั้นเรียน</label>
                            <input type="text" name="class_level" class="form-control" required value="<?php echo $user['class_level']; ?>">
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