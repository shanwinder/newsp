<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';

require_teacher_or_admin();
ensure_active_account($conn);

$context = classroom_context($conn, isset($_GET['classroom_id']) ? intval($_GET['classroom_id']) : null);
if (!$context) {
    header("Location: classrooms.php");
    exit();
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $student_id = trim($_POST['student_id']);
    $name = trim($_POST['name']);
    $class_level = trim($_POST['class_level']);
    $password = $_POST['password'];
    $role = 'student'; // บังคับเป็น student

    // เช็ครหัสนักเรียนซ้ำเฉพาะในห้องเรียนเดียวกัน
    $check = $conn->prepare("SELECT user_id FROM users WHERE student_id = ? AND classroom_id = ?");
    $check->bind_param("si", $student_id, $context['classroom_id']);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        $error = "รหัสนักเรียนนี้ ($student_id) มีในระบบแล้ว!";
    } else {
        // 2. บันทึกข้อมูล (Hash Password)
        $hashed_pwd = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("INSERT INTO users (student_id, name, class_level, password, role, school_id, classroom_id, teacher_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')");
        $stmt->bind_param("sssssiii", $student_id, $name, $class_level, $hashed_pwd, $role, $context['school_id'], $context['classroom_id'], $context['teacher_id']);

        if ($stmt->execute()) {
            $success = "เพิ่มนักเรียนเรียบร้อยแล้ว!";
        } else {
            $error = "เกิดข้อผิดพลาด: " . $conn->error;
        }
    }
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>เพิ่มนักเรียนใหม่</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: #f1f5f9;
        }

        .card-custom {
            border: none;
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .form-control {
            border-radius: 10px;
            padding: 10px 15px;
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card card-custom p-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h4 class="fw-bold text-primary mb-1"><i class="bi bi-person-plus-fill"></i> เพิ่มนักเรียนใหม่</h4>
                            <div class="small text-muted">ห้อง: <?php echo htmlspecialchars($context['classroom']['classroom_name']); ?> | Join Code: <?php echo htmlspecialchars($context['classroom']['join_code']); ?></div>
                        </div>
                        <a href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>" class="btn btn-outline-secondary rounded-pill btn-sm"><i class="bi bi-arrow-left"></i> กลับ</a>
                    </div>

                    <?php if ($error): ?>
                        <div class="alert alert-danger rounded-3"><?php echo $error; ?></div>
                    <?php endif; ?>
                    <?php if ($success): ?>
                        <div class="alert alert-success rounded-3"><?php echo $success; ?></div>
                    <?php endif; ?>

                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label text-muted">รหัสนักเรียน (Student ID)</label>
                            <input type="text" name="student_id" class="form-control" required placeholder="เช่น 66001">
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted">ชื่อ-นามสกุล</label>
                            <input type="text" name="name" class="form-control" required placeholder="เช่น ด.ช.รักเรียน ขยันยิ่ง">
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted">ชั้นเรียน</label>
                            <input type="text" name="class_level" class="form-control" required placeholder="เช่น ป.4/1">
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted">รหัสผ่านเริ่มต้น</label>
                            <input type="text" name="password" class="form-control" required value="1234">
                            <small class="text-muted">* ค่าเริ่มต้นแนะนำคือ 1234</small>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 rounded-pill py-2 fw-bold mt-3">
                            <i class="bi bi-save"></i> บันทึกข้อมูล
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>

</body>

</html>
