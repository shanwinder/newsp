<?php
// pages/login.php
session_start();
require_once '../includes/db.php';

// หากล็อกอินอยู่แล้วให้ข้ามไปหน้า Dashboard
if (isset($_SESSION['user_id'])) {
    header("Location: " . ($_SESSION['role'] === 'admin' ? "dashboard.php" : "student_dashboard.php"));
    exit();
}

$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login_type = $_POST['login_type'] ?? 'student';

    if ($login_type === 'student') {
        $mode = $_POST['mode'] ?? 'solo';
        $team_id = uniqid('team_'); // สร้างรหัสทีมอ้างอิงสำหรับเซสชันนี้
        $members_data = [];
        $all_valid = true;
        $names = [];
        $primary_user = null;

        // ฟังก์ชันช่วยเช็ครหัสผ่าน
        function verifyStudent($conn, $id, $pw) {
            $stmt = $conn->prepare("SELECT user_id, student_id, name, password FROM users WHERE user_id = ? AND role = 'student'");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            if ($user && password_verify($pw, $user['password'])) {
                return $user;
            }
            return false;
        }

        if ($mode === 'solo') {
            $u_id = intval($_POST['solo_id']);
            $u_pw = trim($_POST['solo_pw']);
            $user = verifyStudent($conn, $u_id, $u_pw);
            
            if ($user) {
                $members_data[] = ['id' => $user['user_id'], 'role' => 'solo'];
                $names[] = $user['name'];
                $primary_user = $user;
            } else {
                $all_valid = false;
                $message = "❌ รหัสผ่านไม่ถูกต้อง!";
            }

        } elseif ($mode === 'pair') {
            $driver_id = intval($_POST['driver_id']);
            $driver_pw = trim($_POST['driver_pw']);
            $nav_id = intval($_POST['nav_id']);
            $nav_pw = trim($_POST['nav_pw']);

            if ($driver_id === $nav_id) {
                $all_valid = false;
                $message = "❌ ไม่สามารถเลือกตัวเองเป็นคู่หูได้!";
            } else {
                $driver = verifyStudent($conn, $driver_id, $driver_pw);
                $nav = verifyStudent($conn, $nav_id, $nav_pw);
                
                if ($driver && $nav) {
                    $members_data[] = ['id' => $driver['user_id'], 'role' => 'driver'];
                    $members_data[] = ['id' => $nav['user_id'], 'role' => 'navigator'];
                    $names[] = $driver['name'];
                    $names[] = $nav['name'];
                    $primary_user = $driver; // ให้ Driver เป็นคนแรก
                } else {
                    $all_valid = false;
                    $message = "❌ รหัสผ่านของผู้คุมรถไถ หรือ ผู้วางแผน ไม่ถูกต้อง!";
                }
            }

        } elseif ($mode === 'group') {
            $group_number = intval($_POST['group_number']);
            $group_ids = $_POST['group_ids'] ?? [];
            $group_pws = $_POST['group_pws'] ?? [];
            
            // กรองเอาเฉพาะคนที่เลือกชื่อมาจริงๆ (ป้องกันช่องว่าง)
            $selected_ids = array_filter($group_ids);
            
            // เช็คว่าเลือกคนซ้ำหรือไม่
            if (count($selected_ids) !== count(array_unique($selected_ids))) {
                $all_valid = false;
                $message = "❌ ห้ามเลือกสมาชิกซ้ำกันในกลุ่มเดียวกัน!";
            } elseif (count($selected_ids) < 2) {
                $all_valid = false;
                $message = "❌ การเล่นแบบกลุ่ม ต้องมีสมาชิกอย่างน้อย 2 คนขึ้นไป!";
            } else {
                foreach ($group_ids as $index => $g_id) {
                    if (empty($g_id)) continue; // ข้ามช่องที่ไม่ได้เลือก
                    
                    $g_pw = trim($group_pws[$index]);
                    $member = verifyStudent($conn, intval($g_id), $g_pw);
                    
                    if ($member) {
                        $members_data[] = ['id' => $member['user_id'], 'role' => 'member'];
                        $names[] = $member['name'];
                        if (!$primary_user) $primary_user = $member; // คนแรกสุดเป็นตัวแทนกลุ่ม
                    } else {
                        $all_valid = false;
                        $message = "❌ รหัสผ่านของสมาชิกบางคนไม่ถูกต้อง!";
                        break;
                    }
                }
            }
        }

        // หากทุกอย่างถูกต้อง ให้ Update ลงฐานข้อมูล และสร้าง Session
        if ($all_valid && !empty($members_data)) {
            $member_ids = [];
            
            // ล้างข้อมูลเก่าก่อนอัปเดตใหม่
            $stmt_update = $conn->prepare("UPDATE users SET mode = ?, team_id = ?, team_role = ?, group_number = ? WHERE user_id = ?");
            
            foreach ($members_data as $m) {
                $g_num = ($mode === 'group') ? $group_number : NULL;
                $stmt_update->bind_param("sssii", $mode, $team_id, $m['role'], $g_num, $m['id']);
                $stmt_update->execute();
                $member_ids[] = $m['id']; // เก็บ ID ทุกคนไว้
            }

            session_regenerate_id(true);
            $_SESSION['user_id'] = $primary_user['user_id'];
            $_SESSION['student_id'] = $primary_user['student_id'];
            $_SESSION['role'] = 'student';
            $_SESSION['mode'] = $mode;
            $_SESSION['team_id'] = $team_id;
            $_SESSION['team_members'] = $member_ids; // *** สำคัญ: อาร์เรย์เก็บสมาชิกทุกคน ***
            
            // จัดการชื่อที่จะแสดงในระบบตามโหมด
            if ($mode === 'solo') {
                $_SESSION['name'] = $names[0];
            } elseif ($mode === 'pair') {
                $_SESSION['name'] = implode(" และ ", $names);
                $_SESSION['current_role'] = 'driver'; // ส่งผลต่อ UI การแสดงผลดั้งเดิม
            } else {
                $_SESSION['name'] = "กลุ่มที่ " . $group_number;
            }

            header("Location: student_dashboard.php");
            exit();
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
    <title>เข้าสู่ฟาร์ม - Young Smart Farmer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Kanit', sans-serif; background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; overflow-x: hidden; padding: 20px 0;}
        .login-box { background: rgba(255, 255, 255, 0.95); padding: 40px; border-radius: 25px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); border: 5px solid #fff; max-width: 800px; width: 95%; position: relative; }
        .form-control, .form-select { border-radius: 15px; padding: 12px; border: 2px solid #eee; }
        .form-control:focus, .form-select:focus { border-color: #e67e22; box-shadow: 0 0 0 0.25rem rgba(230, 126, 34, 0.25); }
        .btn-game { background-color: #d35400; color: white; border-radius: 50px; padding: 15px; font-weight: bold; font-size: 1.2rem; transition: all 0.3s; border: none; }
        .btn-game:hover { background-color: #e67e22; transform: translateY(-3px); box-shadow: 0 5px 15px rgba(211, 84, 0, 0.4); color: white; }
        .role-box { background: #f8f9fa; border-radius: 20px; padding: 20px; border: 2px dashed #ccc; transition: all 0.3s; }
        .role-box.solo { border-color: #27ae60; background: #e9f7ef; }
        .role-box.driver { border-color: #3498db; background: #ebf5fb; }
        .role-box.nav { border-color: #9b59b6; background: #f4ecf8; }
        .role-box.group { border-color: #e67e22; background: #fdf2e9; }
        .nav-pills .nav-link { border-radius: 50px; color: #555; margin: 0 5px; border: 2px solid transparent;}
        .nav-pills .nav-link.active { background-color: #27ae60; border-color: #27ae60; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);}
    </style>
</head>
<body>
    <div class="login-box text-center">
        <h2 class="mb-2" style="color: #27ae60; font-weight: 800;">👨‍🌾 เข้าสู่ฟาร์มเกษตรกรน้อย</h2>
        <p class="mb-4 text-muted">เลือกรูปแบบการเรียนรู้ของคุณในวันนี้</p>
        
        <?php if (!empty($message)): ?>
            <div class="alert alert-danger rounded-4 shadow-sm"><?php echo $message; ?></div>
        <?php endif; ?>

        <ul class="nav nav-pills nav-justified mb-4" id="pills-tab" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active fw-bold fs-5" data-bs-toggle="pill" data-bs-target="#pills-solo" type="button" role="tab">👤 ลุยเดี่ยว</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold fs-5" data-bs-toggle="pill" data-bs-target="#pills-pair" type="button" role="tab">👥 จับคู่</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold fs-5" data-bs-toggle="pill" data-bs-target="#pills-group" type="button" role="tab">👨‍👩‍👧‍👦 แบบกลุ่ม</button>
            </li>
        </ul>

        <div class="tab-content" id="pills-tabContent">
            <div class="tab-pane fade show active" id="pills-solo" role="tabpanel">
                <form method="post">
                    <input type="hidden" name="login_type" value="student">
                    <input type="hidden" name="mode" value="solo">
                    <div class="role-box solo mx-auto text-start" style="max-width: 400px;">
                        <h4 class="text-success fw-bold text-center">👤 เกษตรกรฉายเดี่ยว</h4>
                        <div class="mb-3 mt-3">
                            <label class="form-label">เลือกชื่อนักเรียน</label>
                            <select class="form-select" name="solo_id" required>
                                <option value="" disabled selected>-- ค้นหาชื่อของตนเอง --</option>
                                <?php foreach ($students as $s): ?>
                                    <option value="<?php echo $s['user_id']; ?>"><?php echo htmlspecialchars($s['name']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">รหัสผ่าน (PIN)</label>
                            <input type="password" class="form-control" name="solo_pw" placeholder="••••" required>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-game w-100 mt-4 shadow">🚀 เข้าสู่ฟาร์ม</button>
                </form>
            </div>

            <div class="tab-pane fade" id="pills-pair" role="tabpanel">
                <form method="post">
                    <input type="hidden" name="login_type" value="student">
                    <input type="hidden" name="mode" value="pair">
                    <div class="row g-4 text-start">
                        <div class="col-md-6">
                            <div class="role-box driver h-100">
                                <h4 class="text-primary fw-bold text-center">🚜 ผู้คุมรถไถ (Driver)</h4>
                                <div class="mb-3 mt-3">
                                    <label class="form-label">เลือกชื่อนักเรียน</label>
                                    <select class="form-select" name="driver_id" required>
                                        <option value="" disabled selected>-- ค้นหาชื่อตนเอง --</option>
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
                        <div class="col-md-6">
                            <div class="role-box nav h-100">
                                <h4 class="fw-bold text-center" style="color:#8e44ad;">🗺️ ผู้วางแผน (Navigator)</h4>
                                <div class="mb-3 mt-3">
                                    <label class="form-label">เลือกชื่อนักเรียน</label>
                                    <select class="form-select" name="nav_id" required>
                                        <option value="" disabled selected>-- ค้นหาชื่อตนเอง --</option>
                                        <?php foreach ($students as $s): ?>
                                            <option value="<?php echo $s['user_id']; ?>"><?php echo htmlspecialchars($s['name']); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">รหัสผ่าน (PIN)</label>
                                    <input type="password" class="form-control" name="nav_pw" placeholder="••••" required>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-game w-100 mt-4 shadow">🚀 จับคู่และเข้าสู่ฟาร์ม</button>
                </form>
            </div>

            <div class="tab-pane fade" id="pills-group" role="tabpanel">
                <form method="post">
                    <input type="hidden" name="login_type" value="student">
                    <input type="hidden" name="mode" value="group">
                    <div class="role-box group text-start mx-auto">
                        <h4 class="text-warning fw-bold text-center" style="color:#d35400 !important;">👨‍👩‍👧‍👦 ทีมเกษตรกร</h4>
                        
                        <div class="row align-items-center mb-4 mt-3">
                            <div class="col-md-4 text-md-end">
                                <label class="form-label fw-bold mb-0">เลือกกลุ่มที่ :</label>
                            </div>
                            <div class="col-md-5">
                                <select class="form-select border-warning" name="group_number" required>
                                    <option value="" disabled selected>-- หมายเลขกลุ่ม --</option>
                                    <?php for($i=1; $i<=8; $i++): ?>
                                        <option value="<?php echo $i; ?>">กลุ่มที่ <?php echo $i; ?></option>
                                    <?php endfor; ?>
                                </select>
                            </div>
                        </div>

                        <hr>
                        <p class="text-center text-muted small">เลือกสมาชิกอย่างน้อย 2 คน</p>
                        
                        <div class="row g-3">
                            <?php for($i=1; $i<=4; $i++): ?>
                            <div class="col-md-6">
                                <div class="p-2 border rounded bg-white">
                                    <span class="badge bg-secondary mb-2">คนที่ <?php echo $i; ?> <?php echo $i<=2 ? '<span class="text-warning">*</span>' : '(ถ้ามี)'; ?></span>
                                    <select class="form-select form-select-sm mb-2" name="group_ids[]" <?php echo $i<=2 ? 'required' : ''; ?>>
                                        <option value="" selected>-- เลือกชื่อนักเรียน --</option>
                                        <?php foreach ($students as $s): ?>
                                            <option value="<?php echo $s['user_id']; ?>"><?php echo htmlspecialchars($s['name']); ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                    <input type="password" class="form-control form-control-sm" name="group_pws[]" placeholder="รหัสผ่าน" <?php echo $i<=2 ? 'required' : ''; ?>>
                                </div>
                            </div>
                            <?php endfor; ?>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-game w-100 mt-4 shadow">🚀 จัดทีมและเข้าสู่ฟาร์ม</button>
                </form>
            </div>
        </div>

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
        document.querySelectorAll('select[name="group_ids[]"]').forEach((select, index) => {
            select.addEventListener('change', function() {
                let pwInput = document.querySelectorAll('input[name="group_pws[]"]')[index];
                if (this.value !== "") {
                    pwInput.setAttribute('required', 'required');
                } else if (index >= 2) { 
                    pwInput.removeAttribute('required');
                    pwInput.value = '';
                }
            });
        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>