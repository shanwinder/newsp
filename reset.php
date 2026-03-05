<?php
// reset.php (สคริปต์สำหรับรีเซ็ตระบบ)
session_start();
require_once 'includes/db.php';

?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>System Reset - ล้างข้อมูลระบบ</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        body { font-family: 'Kanit', sans-serif; background-color: #f8fafc; }
        .reset-box { max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    </style>
</head>
<body>

<div class="container">
    <div class="reset-box text-center">
        <h2 class="text-danger fw-bold mb-3"><i class="bi bi-exclamation-triangle-fill"></i> System Reset</h2>
        <p class="text-secondary mb-4">ระบบกำลังทำการกวาดล้างข้อมูลนักเรียนและกิจกรรมทั้งหมดเพื่อเริ่มต้นใหม่</p>
        
        <div class="text-start bg-light p-4 rounded-3 border mb-4" style="font-size: 1.1rem;">
            <?php
            // 1. ลบข้อมูล "ยอดไลก์" ทั้งหมด และรีเซ็ต AUTO_INCREMENT
            if ($conn->query("DELETE FROM project_likes")) {
                $conn->query("ALTER TABLE project_likes AUTO_INCREMENT = 1");
                echo "<div class='text-success mb-2'><i class='bi bi-check-circle-fill'></i> ล้างข้อมูล 'การกดไลก์' และรีเซ็ตลำดับ ID สำเร็จ</div>";
            }

            // 2. ลบข้อมูล "ผลงานของนักเรียน (Showcase)" ทั้งหมด และรีเซ็ต AUTO_INCREMENT
            if ($conn->query("DELETE FROM student_works")) {
                $conn->query("ALTER TABLE student_works AUTO_INCREMENT = 1");
                echo "<div class='text-success mb-2'><i class='bi bi-check-circle-fill'></i> ล้างข้อมูล 'ผลงานและโจทย์' และรีเซ็ตลำดับ ID สำเร็จ</div>";
            }

            // 3. ลบข้อมูล "ความคืบหน้าและคะแนน" ทั้งหมด และรีเซ็ต AUTO_INCREMENT
            if ($conn->query("DELETE FROM progress")) {
                $conn->query("ALTER TABLE progress AUTO_INCREMENT = 1");
                echo "<div class='text-success mb-2'><i class='bi bi-check-circle-fill'></i> ล้างข้อมูล 'ประวัติการเล่นและคะแนน' และรีเซ็ตลำดับ ID สำเร็จ</div>";
            }

            // 4. ลบ "บัญชีนักเรียน" ทั้งหมด และรีเซ็ต AUTO_INCREMENT ให้เริ่มรันต่อจาก Admin
            if ($conn->query("DELETE FROM users WHERE role = 'student'")) {
                $conn->query("ALTER TABLE users AUTO_INCREMENT = 1");
                echo "<div class='text-success mb-2'><i class='bi bi-check-circle-fill'></i> ล้างบัญชีผู้ใช้ 'นักเรียน' และจัดเรียงลำดับ ID ใหม่สำเร็จ</div>";
            }

            // 5. ตรวจสอบบัญชี Admin (ถ้าเผลอลบไป จะสร้างกลับมาให้ใหม่เพื่อไม่ให้เข้าเว็บไม่ได้)
            $check_admin = $conn->query("SELECT user_id FROM users WHERE role = 'admin' OR student_id = 'admin'");
            if ($check_admin->num_rows == 0) {
                $pwd_admin = password_hash("1234", PASSWORD_DEFAULT);
                $conn->query("INSERT INTO users (student_id, name, password, role) VALUES ('admin', 'ครูผู้สอน (Admin)', '$pwd_admin', 'admin')");
                echo "<div class='text-primary mt-3'><i class='bi bi-shield-lock-fill'></i> สร้างบัญชี Admin เริ่มต้นให้ใหม่ (User: admin / Pass: 1234)</div>";
            } else {
                echo "<div class='text-primary mt-3'><i class='bi bi-shield-check'></i> บัญชี Admin ยังคงอยู่และปลอดภัย</div>";
            }
            ?>
        </div>

        <h4 class="text-success fw-bold mb-3">🎉 รีเซ็ตระบบเสร็จสมบูรณ์!</h4>
        <p class="text-muted">ฐานข้อมูลของคุณกลับมาสะอาดเอี่ยม พร้อมสำหรับการเรียนการสอนรอบใหม่แล้วครับ</p>
        
        <a href="pages/login.php" class="btn btn-primary rounded-pill px-5 py-2 mt-2 fw-bold shadow-sm">
            <i class="bi bi-box-arrow-in-right"></i> กลับไปหน้า login
        </a>
    </div>
</div>

</body>
</html>