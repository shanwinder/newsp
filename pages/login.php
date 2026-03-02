<?php
// pages/login.php
session_start();
require_once '../includes/db.php';

// ถ้า Login อยู่แล้ว ให้ Redirect ไปตาม Role เลย (ไม่ต้อง Login ซ้ำ)
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role'] === 'admin') {
        header("Location: dashboard.php");
    } else {
        header("Location: student_dashboard.php");
    }
    exit();
}

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // ใช้ Prepared Statement ป้องกัน SQL Injection 100%
    // ⚠️ แก้ไข: ดึง user_id, pair_id และ pair_role เข้ามาด้วย
    $stmt = $conn->prepare("SELECT user_id, student_id, name, password, role, pair_id, pair_role FROM users WHERE student_id = ? LIMIT 1");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        // ตรวจสอบรหัสผ่านด้วย password_verify
        if (password_verify($password, $user['password'])) {
            // Regenerate ID เพื่อป้องกัน Session Fixation Attack
            session_regenerate_id(true);

            // บันทึก Session พื้นฐาน
            $_SESSION['user_id'] = $user['user_id']; // ⚠️ แก้จาก id เป็น user_id ให้ตรงกับ DB
            $_SESSION['student_id'] = $user['student_id'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['role'] = $user['role'];

            // บันทึก Session สำหรับ Pair Programming (เฉพาะนักเรียน)
            if ($user['role'] === 'student') {
                $_SESSION['pair_id'] = $user['pair_id'];
                $_SESSION['pair_role'] = $user['pair_role'];
            }

            // Redirect ตาม Role
            if ($user['role'] === 'admin') {
                header("Location: dashboard.php");
            } else {
                header("Location: student_dashboard.php"); // หรือจะเปลี่ยนเป็น waiting_room.php ในอนาคต
            }
            exit();
        } else {
            $message = "❌ รหัสผ่านไม่ถูกต้อง ลองใหม่อีกครั้งนะ!";
        }
    } else {
        $message = "❌ ไม่พบชื่อผู้ใช้นี้ในระบบ";
    }
    $stmt->close();
}
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>เข้าสู่ระบบ - เกษตรกรตัวน้อย (Young Smart Farmer)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Kanit', sans-serif;
            /* ⚠️ เปลี่ยนสีพื้นหลังเป็นโทนธรรมชาติ/เกษตรกรรม (เขียว-เหลืองทอง) */
            background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .login-box {
            background: rgba(255, 255, 255, 0.95);
            padding: 40px;
            border-radius: 25px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
            border: 5px solid #fff;
            max-width: 400px;
            width: 90%;
            z-index: 10;
            position: relative;
            animation: popIn 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }

        @keyframes popIn {
            0% {
                transform: scale(0.5);
                opacity: 0;
            }

            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .form-control {
            border-radius: 15px;
            padding: 12px;
            border: 2px solid #eee;
        }

        .form-control:focus {
            /* เปลี่ยนสี Focus เป็นสีส้มดิน/แครอท */
            border-color: #e67e22;
            box-shadow: 0 0 0 0.25rem rgba(230, 126, 34, 0.25);
        }

        .btn-game {
            /* เปลี่ยนปุ่มเป็นสีส้ม/น้ำตาล เพื่อให้เข้ากับธีม */
            background-color: #d35400;
            color: white;
            border-radius: 50px;
            padding: 12px;
            font-weight: bold;
            font-size: 1.1rem;
            transition: all 0.3s;
            border: none;
        }

        .btn-game:hover {
            background-color: #e67e22;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(211, 84, 0, 0.4);
            color: white;
        }

        /* Floating Emojis (เปลี่ยนเป็นธีมฟาร์ม) */
        .emoji-float {
            position: absolute;
            font-size: 3.5rem;
            animation: float 6s ease-in-out infinite;
            z-index: 1;
            user-select: none;
        }

        @keyframes float {

            0%,
            100% {
                transform: translateY(0) rotate(0deg);
            }

            50% {
                transform: translateY(-20px) rotate(10deg);
            }
        }
    </style>
</head>

<body>

    <div class="emoji-float" style="top: 10%; left: 10%;">🚜</div>
    <div class="emoji-float" style="top: 20%; right: 15%; animation-delay: 1s;">🌾</div>
    <div class="emoji-float" style="bottom: 15%; left: 20%; animation-delay: 2s;">👨‍🌾</div>
    <div class="emoji-float" style="bottom: 10%; right: 10%; animation-delay: 1.5s;">☀️</div>

    <div class="login-box text-center">
        <h2 class="mb-2" style="color: #27ae60; font-weight: 800;">เกษตรกรตัวน้อย</h2>
        <p class="mb-4 text-muted">พร้อมลงมือทำฟาร์มหรือยัง?</p>

        <?php if (!empty($message)): ?>
            <div class="alert alert-danger rounded-4"><?php echo $message; ?></div>
        <?php endif; ?>

        <form method="post">
            <div class="mb-3 text-start">
                <label class="form-label ps-2">รหัสนักเรียน</label>
                <input type="text" class="form-control" name="username" placeholder="กรอกเลขประจำตัว" required autofocus>
            </div>

            <div class="mb-4 text-start">
                <label class="form-label ps-2">รหัสผ่าน</label>
                <input type="password" class="form-control" name="password" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn btn-game w-100">🚜 เข้าสู่ฟาร์ม</button>
        </form>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>