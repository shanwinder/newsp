<?php
// pages/login.php
session_start();
require_once '../includes/db.php';

if (isset($_SESSION['user_id'])) {
    header("Location: " . ($_SESSION['role'] === 'admin' ? "dashboard.php" : "student_dashboard.php"));
    exit();
}

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login_type = $_POST['login_type'] ?? 'student';

    if ($login_type === 'student') {
        $driver_id = intval($_POST['driver_id']);
        $driver_pw = trim($_POST['driver_pw']);
        $is_solo = isset($_POST['is_solo']) ? true : false;

        // ตรวจสอบ Driver (กลับมาใช้ user_id ตามโครงสร้างจริงของคุณครู)
        $stmt = $conn->prepare("SELECT user_id, student_id, name, password FROM users WHERE user_id = ? AND role = 'student'");
        $stmt->bind_param("i", $driver_id);
        $stmt->execute();
        $driver = $stmt->get_result()->fetch_assoc();

        if ($driver && password_verify($driver_pw, $driver['password'])) {
            
            if (!$is_solo) {
                $nav_id = intval($_POST['nav_id']);
                $nav_pw = trim($_POST['nav_pw']);

                if ($driver_id === $nav_id) {
                    $message = "❌ ไม่สามารถเลือกตัวเองเป็นคู่หูได้!";
                } else {
                    // ตรวจสอบ Navigator
                    $stmt2 = $conn->prepare("SELECT user_id, name, password FROM users WHERE user_id = ? AND role = 'student'");
                    $stmt2->bind_param("i", $nav_id);
                    $stmt2->execute();
                    $nav = $stmt2->get_result()->fetch_assoc();

                    if ($nav && password_verify($nav_pw, $nav['password'])) {
                        // อัปเดตฐานข้อมูลจับคู่ (ใช้ partner_id และ current_role)
                        $conn->query("UPDATE users SET partner_id = $nav_id, current_role = 'driver' WHERE user_id = $driver_id");
                        $conn->query("UPDATE users SET partner_id = $driver_id, current_role = 'navigator' WHERE user_id = $nav_id");

                        session_regenerate_id(true);
                        $_SESSION['user_id'] = $driver['user_id']; // ยึด Driver เป็นหลักในการควบคุม Session
                        $_SESSION['student_id'] = $driver['student_id'];
                        $_SESSION['name'] = $driver['name'] . " & " . $nav['name']; // แสดงชื่อคู่
                        $_SESSION['role'] = 'student';
                        $_SESSION['partner_id'] = $nav['user_id'];
                        $_SESSION['current_role'] = 'driver';

                        header("Location: student_dashboard.php");
                        exit();
                    } else {
                        $message = "❌ รหัสผ่านของผู้วางแผน (Navigator) ไม่ถูกต้อง!";
                    }
                }
            } else {
                // ลุยเดี่ยว (Solo)
                $conn->query("UPDATE users SET partner_id = NULL, current_role = 'driver' WHERE user_id = $driver_id");
                session_regenerate_id(true);
                $_SESSION['user_id'] = $driver['user_id'];
                $_SESSION['student_id'] = $driver['student_id'];
                $_SESSION['name'] = $driver['name'] . " (ลุยเดี่ยว)";
                $_SESSION['role'] = 'student';
                $_SESSION['partner_id'] = null;
                $_SESSION['current_role'] = 'driver';

                header("Location: student_dashboard.php");
                exit();
            }
        } else {
            $message = "❌ รหัสผ่านของผู้คุมรถไถ (Driver) ไม่ถูกต้อง!";
        }
    } elseif ($login_type === 'admin') {
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);

        $stmt = $conn->prepare("SELECT user_id, name, password, role FROM users WHERE student_id = ? AND role = 'admin'");
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $admin = $stmt->get_result()->fetch_assoc();

        if ($admin && password_verify($password, $admin['password'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $admin['user_id'];
            $_SESSION['name'] = $admin['name'];
            $_SESSION['role'] = 'admin';
            header("Location: dashboard.php");
            exit();
        } else {
            $message = "❌ ชื่อผู้ใช้หรือรหัสผ่านครูไม่ถูกต้อง";
        }
    }
}

// ดึงรายชื่อนักเรียนมาแสดงใน Dropdown
$students = [];
$res = $conn->query("SELECT user_id, name FROM users WHERE role = 'student' ORDER BY name ASC");
if ($res) {
    while ($row = $res->fetch_assoc()) {
        $students[] = $row;
    }
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>จับคู่เข้าฟาร์ม - Young Smart Farmer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Kanit', sans-serif; background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow-x: hidden; }
        .login-box { background: rgba(255, 255, 255, 0.95); padding: 40px; border-radius: 25px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); border: 5px solid #fff; max-width: 800px; width: 95%; position: relative; }
        .form-control, .form-select { border-radius: 15px; padding: 12px; border: 2px solid #eee; }
        .form-control:focus, .form-select:focus { border-color: #e67e22; box-shadow: 0 0 0 0.25rem rgba(230, 126, 34, 0.25); }
        .btn-game { background-color: #d35400; color: white; border-radius: 50px; padding: 15px; font-weight: bold; font-size: 1.2rem; transition: all 0.3s; border: none; }
        .btn-game:hover { background-color: #e67e22; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(211, 84, 0, 0.4); color: white; }
        .role-box { background: #f8f9fa; border-radius: 20px; padding: 20px; border: 2px dashed #ccc; transition: all 0.3s; }
        .role-box.driver { border-color: #3498db; background: #ebf5fb; }
        .role-box.nav { border-color: #9b59b6; background: #f4ecf8; }
        .emoji-float { position: absolute; font-size: 3.5rem; animation: float 6s ease-in-out infinite; z-index: -1; }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
    </style>
</head>
<body>
    <div class="emoji-float" style="top: 10%; left: 5%;">🚜</div>
    <div class="emoji-float" style="top: 20%; right: 5%; animation-delay: 1s;">🌾</div>
    <div class="emoji-float" style="bottom: 15%; left: 10%; animation-delay: 2s;">👨‍🌾</div>

    <div class="login-box text-center">
        <h2 class="mb-2" style="color: #27ae60; font-weight: 800;">👨‍🌾 จับคู่เข้าฟาร์ม (Pair Programming)</h2>
        <p class="mb-4 text-muted">ตกลงกันให้ดีว่าใครจะขับรถไถ ใครจะดูแผนที่!</p>
        
        <?php if (!empty($message)): ?>
            <div class="alert alert-danger rounded-4"><?php echo $message; ?></div>
        <?php endif; ?>

        <form method="post" id="studentForm">
            <input type="hidden" name="login_type" value="student">
            
            <div class="row g-4 text-start mb-4">
                <div class="col-md-6">
                    <div class="role-box driver h-100">
                        <h4 class="text-primary fw-bold text-center">🚜 ผู้คุมรถไถ (Driver)</h4>
                        <p class="text-center text-muted small">คนจับเมาส์และลากคำสั่ง</p>
                        <div class="mb-3">
                            <label class="form-label">เลือกชื่อนักเรียน</label>
                            <select class="form-select" name="driver_id" required>
                                <option value="" disabled selected>-- ค้นหาชื่อของตนเอง --</option>
                                <?php foreach ($students as $s): ?>
                                    <option value="<?php echo $s['user_id']; ?>"><?php echo htmlspecialchars($s['name']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รหัสผ่าน (PIN)</label>
                            <input type="password" class="form-control" name="driver_pw" placeholder="••••" required>
                        </div>
                    </div>
                </div>

                <div class="col-md-6" id="navColumn">
                    <div class="role-box nav h-100">
                        <h4 class="text-purple fw-bold text-center" style="color:#8e44ad;">🗺️ ผู้วางแผน (Navigator)</h4>
                        <p class="text-center text-muted small">คนช่วยคิดและตรวจจับข้อผิดพลาด</p>
                        <div class="mb-3">
                            <label class="form-label">เลือกชื่อนักเรียน</label>
                            <select class="form-select" name="nav_id" id="navId" required>
                                <option value="" disabled selected>-- ค้นหาชื่อของตนเอง --</option>
                                <?php foreach ($students as $s): ?>
                                    <option value="<?php echo $s['user_id']; ?>"><?php echo htmlspecialchars($s['name']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รหัสผ่าน (PIN)</label>
                            <input type="password" class="form-control" name="nav_pw" id="navPw" placeholder="••••" required>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-check form-switch d-flex justify-content-center mb-4">
                <input class="form-check-input me-2" type="checkbox" name="is_solo" id="isSolo" onchange="toggleSolo()">
                <label class="form-check-label text-muted" for="isSolo">วันนี้เพื่อนไม่มา (ลุยเดี่ยว)</label>
            </div>

            <button type="submit" class="btn btn-game w-100 shadow">🚀 ยืนยันการจับคู่ และเข้าสู่ฟาร์ม</button>
        </form>

        <div class="mt-4 pt-3 border-top">
            <button class="btn btn-sm btn-outline-secondary rounded-pill" type="button" data-bs-toggle="collapse" data-bs-target="#adminLogin">
                สำหรับครูผู้สอน
            </button>
            <div class="collapse mt-3" id="adminLogin">
                <form method="post" class="text-start mx-auto" style="max-width: 300px;">
                    <input type="hidden" name="login_type" value="admin">
                    <input type="text" class="form-control mb-2" name="username" placeholder="รหัสครูผู้สอน" required>
                    <input type="password" class="form-control mb-2" name="password" placeholder="รหัสผ่าน" required>
                    <button type="submit" class="btn btn-secondary w-100 rounded-pill">เข้าสู่ระบบครู</button>
                </form>
            </div>
        </div>
    </div>

    <script>
        function toggleSolo() {
            const isSolo = document.getElementById('isSolo').checked;
            const navCol = document.getElementById('navColumn');
            const navId = document.getElementById('navId');
            const navPw = document.getElementById('navPw');
            
            if(isSolo) {
                navCol.style.opacity = '0.3';
                navCol.style.pointerEvents = 'none';
                navId.removeAttribute('required');
                navPw.removeAttribute('required');
            } else {
                navCol.style.opacity = '1';
                navCol.style.pointerEvents = 'auto';
                navId.setAttribute('required', 'required');
                navPw.setAttribute('required', 'required');
            }
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>