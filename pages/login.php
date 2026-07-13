<?php
// pages/login.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';
require_once '../includes/media_credit.php';

// หากล็อกอินอยู่แล้วให้ข้ามไปหน้า Dashboard
if (isset($_SESSION['user_id'])) {
    header("Location: " . (in_array($_SESSION['role'], ['admin', 'super_admin', 'teacher'], true) ? "dashboard.php" : "student_dashboard.php"));
    exit();
}

$message = '';

function verifyStudentByJoinCode(mysqli $conn, string $join_code, string $student_id, string $pin)
{
    $sql = "SELECT u.user_id, u.student_id, u.name, u.password,
                   u.school_id, u.classroom_id, u.teacher_id,
                   ls.id as learning_session_id
            FROM users u
            JOIN classrooms c ON u.classroom_id = c.id
            JOIN learning_sessions ls ON ls.classroom_id = c.id AND ls.status = 'active'
            WHERE c.join_code = ?
              AND c.status = 'active'
              AND u.student_id = ?
              AND u.role = 'student'
              AND u.status = 'active'
            LIMIT 1";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $join_code, $student_id);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    return ($user && password_verify($pin, $user['password'])) ? $user : false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $login_type = $_POST['login_type'] ?? 'student';

    if ($login_type === 'student') {
        $mode = $_POST['mode'] ?? 'solo';
        $join_code = strtoupper(trim($_POST['join_code'] ?? ''));
        $team_id = uniqid('team_'); // สร้างรหัสทีมอ้างอิงสำหรับเซสชันนี้
        $members_data = [];
        $all_valid = true;
        $names = [];
        $primary_user = null;
        $login_context = null;

        if ($join_code === '') {
            $all_valid = false;
            $message = "❌ กรุณากรอก Join Code ของห้องเรียน";
        }

        if ($mode === 'solo') {
            $student_id = trim($_POST['solo_student_id'] ?? '');
            $u_pw = trim($_POST['solo_pw'] ?? '');
            $user = $all_valid ? verifyStudentByJoinCode($conn, $join_code, $student_id, $u_pw) : false;

            if ($user) {
                $members_data[] = ['id' => $user['user_id'], 'role' => 'solo'];
                $names[] = $user['name'];
                $primary_user = $user;
                $login_context = $user;
            } else {
                $all_valid = false;
                if ($message === '') {
                    $message = "❌ Join Code, รหัสนักเรียน หรือ PIN ไม่ถูกต้อง";
                }
            }

        } elseif ($mode === 'group') {
            $group_number = intval($_POST['group_number']);
            $group_ids = $_POST['group_student_ids'] ?? [];
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

                    $g_pw = trim($group_pws[$index] ?? '');
                    $member = verifyStudentByJoinCode($conn, $join_code, trim($g_id), $g_pw);

                    if ($member) {
                        $members_data[] = ['id' => $member['user_id'], 'role' => 'member'];
                        $names[] = $member['name'];
                        if (!$primary_user) $primary_user = $member; // คนแรกสุดเป็นตัวแทนกลุ่ม
                        if (!$login_context) $login_context = $member;
                    } else {
                        $all_valid = false;
                        $message = "❌ Join Code, รหัสนักเรียน หรือ PIN ของสมาชิกบางคนไม่ถูกต้อง!";
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
            $_SESSION['school_id'] = intval($login_context['school_id']);
            $_SESSION['classroom_id'] = intval($login_context['classroom_id']);
            $_SESSION['teacher_id'] = intval($login_context['teacher_id']);
            $_SESSION['learning_session_id'] = intval($login_context['learning_session_id']);
            $_SESSION['join_code'] = $join_code;

            // จัดการชื่อที่จะแสดงในระบบตามโหมด
            if ($mode === 'solo') {
                $_SESSION['name'] = $names[0];
            } else {
                $_SESSION['name'] = "กลุ่มที่ " . $group_number;
            }

            header("Location: student_dashboard.php");
            exit();
        }

    } elseif ($login_type === 'admin') {
        $username = trim($_POST['username']);
        $password = trim($_POST['password']);

        $stmt = $conn->prepare("SELECT user_id, name, password, role, school_id, status FROM users WHERE (student_id = ? OR email = ?) AND role IN ('admin','super_admin','teacher') LIMIT 1");
        $stmt->bind_param("ss", $username, $username);
        $stmt->execute();
        $admin = $stmt->get_result()->fetch_assoc();

        if ($admin && password_verify($password, $admin['password'])) {
            if ($admin['role'] === 'teacher' && $admin['status'] !== 'active') {
                header("Location: pending_approval.php");
                exit();
            }

            session_regenerate_id(true);
            $_SESSION['user_id'] = $admin['user_id'];
            $_SESSION['name'] = $admin['name'];
            $_SESSION['role'] = $admin['role'];
            $_SESSION['school_id'] = intval($admin['school_id'] ?? 0);

            $context = classroom_context($conn);
            if ($context) {
                apply_context_to_session($context);
            }

            header("Location: dashboard.php");
            exit();
        } else {
            $message = "❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        }
    }
}

$selectedLoginType = $_POST['login_type'] ?? 'student';
$selectedMode = $_POST['mode'] ?? 'solo';
$isSoloActive = $selectedMode !== 'group';
$showAdminLogin = $selectedLoginType === 'admin' && $message !== '';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>เข้าสู่บทเรียน - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">




<?php
$page_styles = array (
  0 => 'pages/login.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page login-page">
    <div class="login-page">
        <main class="login-shell" aria-label="เข้าสู่ระบบบทเรียนฟาร์ม">
            <section class="farm-hero-panel" aria-hidden="true">
                <div class="hero-content">
                    <div class="farm-badge"><i class="bi bi-sun-fill"></i> ห้องเรียนเกษตรอัจฉริยะ</div>
                    <h1><?php echo htmlspecialchars($app['app_name']); ?></h1>
                    <p><?php echo htmlspecialchars($app['app_subtitle']); ?> ลงชื่อเข้าใช้เพื่อเริ่มภารกิจในแปลงเกษตรและร่วมทีมแก้โจทย์อย่างสร้างสรรค์</p>
                </div>

                <div class="tractor-scene">
                    <img class="orchard-tree" src="../assets/img/newplant.webp" alt="">
                    <span class="floating-crop crop-1"><img src="../assets/img/newseed.webp" alt=""></span>
                    <span class="floating-crop crop-2"><img src="../assets/img/newsprout.webp" alt=""></span>
                    <span class="floating-crop crop-3"><img src="../assets/img/basket.webp" alt=""></span>
                </div>

                <div class="hero-footer">
                    <div class="field-chip">
                        <strong><i class="bi bi-person-check-fill"></i></strong>
                        <span>เล่นเดี่ยว</span>
                    </div>
                    <div class="field-chip">
                        <strong><i class="bi bi-people-fill"></i></strong>
                        <span>รวมทีม</span>
                    </div>
                    <div class="field-chip">
                        <strong><i class="bi bi-mortarboard-fill"></i></strong>
                        <span>ครูผู้สอน</span>
                    </div>
                </div>
            </section>

            <section class="auth-panel text-center">
                <div class="brand-lockup">
                    <div class="brand-mark">🌾</div>
                    <div>
                        <h2 class="brand-title"><?php echo htmlspecialchars($app['app_name']); ?></h2>
                        <p class="brand-subtitle"><?php echo htmlspecialchars($app['app_subtitle']); ?></p>
                    </div>
                </div>

                <?php if (!empty($message)): ?>
                    <div class="alert alert-danger text-start mb-4"><?php echo $message; ?></div>
                <?php endif; ?>

                <ul class="nav nav-pills nav-justified farm-tabs mb-4" id="pills-tab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link <?php echo $isSoloActive ? 'active' : ''; ?>" id="solo-tab" data-bs-toggle="pill" data-bs-target="#pills-solo" type="button" role="tab" aria-controls="pills-solo" aria-selected="<?php echo $isSoloActive ? 'true' : 'false'; ?>">
                            <i class="bi bi-person-fill me-1"></i> รายบุคคล
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link <?php echo !$isSoloActive ? 'active' : ''; ?>" id="group-tab" data-bs-toggle="pill" data-bs-target="#pills-group" type="button" role="tab" aria-controls="pills-group" aria-selected="<?php echo !$isSoloActive ? 'true' : 'false'; ?>">
                            <i class="bi bi-people-fill me-1"></i> แบบกลุ่ม
                        </button>
                    </li>
                </ul>

                <div class="tab-content" id="pills-tabContent">
                    <div class="tab-pane fade <?php echo $isSoloActive ? 'show active' : ''; ?>" id="pills-solo" role="tabpanel" aria-labelledby="solo-tab">
                        <form method="post">
                            <input type="hidden" name="login_type" value="student">
                            <input type="hidden" name="mode" value="solo">
                            <div class="role-box solo text-start">
                                <div class="section-title"><i class="bi bi-flower1"></i> เริ่มภารกิจรายบุคคล</div>
                                <div class="mb-3">
                                    <label class="form-label">Join Code ห้องเรียน</label>
                                    <div class="input-shell">
                                        <i class="bi bi-key-fill"></i>
                                        <input type="text" class="form-control text-uppercase" name="join_code" placeholder="เช่น DEMO4" required>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">รหัสนักเรียน</label>
                                    <div class="input-shell">
                                        <i class="bi bi-person-badge-fill"></i>
                                        <input type="text" class="form-control" name="solo_student_id" placeholder="เช่น 4001" required>
                                    </div>
                                </div>
                                <div class="mb-0">
                                    <label class="form-label">รหัสผ่าน (PIN)</label>
                                    <div class="input-shell">
                                        <i class="bi bi-shield-lock-fill"></i>
                                        <input type="password" class="form-control" name="solo_pw" placeholder="••••" required>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-game w-100 mt-4">
                                <i class="bi bi-play-fill me-1"></i> เข้าสู่บทเรียน
                            </button>
                        </form>
                    </div>

                    <div class="tab-pane fade <?php echo !$isSoloActive ? 'show active' : ''; ?>" id="pills-group" role="tabpanel" aria-labelledby="group-tab">
                        <form method="post">
                            <input type="hidden" name="login_type" value="student">
                            <input type="hidden" name="mode" value="group">
                            <div class="role-box group text-start">
                                <div class="section-title"><i class="bi bi-diagram-3-fill"></i> จัดทีมลงแปลงเกษตร</div>
                                <div class="mb-3">
                                    <label class="form-label">Join Code ห้องเรียน</label>
                                    <div class="input-shell">
                                        <i class="bi bi-key-fill"></i>
                                        <input type="text" class="form-control text-uppercase" name="join_code" placeholder="เช่น DEMO4" required>
                                    </div>
                                </div>

                                <div class="row align-items-end g-3 mb-3">
                                    <div class="col-md-4">
                                        <label class="form-label mb-md-2">เลือกกลุ่มที่</label>
                                    </div>
                                    <div class="col-md-8">
                                        <div class="input-shell">
                                            <i class="bi bi-grid-3x3-gap-fill"></i>
                                            <select class="form-select" name="group_number" required>
                                                <option value="" disabled selected>หมายเลขกลุ่ม</option>
                                                <?php for($i=1; $i<=8; $i++): ?>
                                                    <option value="<?php echo $i; ?>">กลุ่มที่ <?php echo $i; ?></option>
                                                <?php endfor; ?>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <p class="text-center text-muted small mb-3">เลือกสมาชิกอย่างน้อย 2 คน</p>

                                <div class="row g-3">
                                    <?php for($i=1; $i<=4; $i++): ?>
                                    <div class="col-md-6">
                                        <div class="member-tile">
                                            <span class="member-badge">
                                                <i class="bi bi-person-hearts"></i>
                                                คนที่ <?php echo $i; ?> <?php echo $i<=2 ? '*' : '(ถ้ามี)'; ?>
                                            </span>
                                            <input type="text" class="form-control form-control-sm mb-2 rounded-3" name="group_student_ids[]" placeholder="รหัสนักเรียน" <?php echo $i<=2 ? 'required' : ''; ?>>
                                            <input type="password" class="form-control form-control-sm rounded-3" name="group_pws[]" placeholder="รหัสผ่าน" <?php echo $i<=2 ? 'required' : ''; ?>>
                                        </div>
                                    </div>
                                    <?php endfor; ?>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-game w-100 mt-4">
                                <i class="bi bi-rocket-takeoff-fill me-1"></i> จัดทีมและเข้าสู่บทเรียน
                            </button>
                        </form>
                    </div>
                </div>

                <div class="mt-4 mb-2">
                    <p class="text-muted small mb-2">ยังไม่มีรหัสนักเรียน? ทดลองใช้งานระบบได้ที่นี่</p>
                    <a href="guest_start.php" class="btn btn-outline-secondary rounded-pill px-4 fw-bold">
                        👀 ทดลองใช้งานในฐานะผู้เยี่ยมชม
                    </a>
                    <a href="about_media.php" class="btn btn-outline-success rounded-pill px-4 fw-bold ms-2">
                        <i class="bi bi-info-circle-fill"></i> เกี่ยวกับสื่อ
                    </a>
                </div>

                <div class="teacher-gate">
                    <button class="btn btn-sm teacher-toggle rounded-pill px-3" type="button" data-bs-toggle="collapse" data-bs-target="#adminLogin" aria-expanded="<?php echo $showAdminLogin ? 'true' : 'false'; ?>" aria-controls="adminLogin">
                        <i class="bi bi-mortarboard-fill me-1"></i> สำหรับครูผู้สอน
                    </button>
                    <div class="collapse mt-3 <?php echo $showAdminLogin ? 'show' : ''; ?>" id="adminLogin">
                        <div class="teacher-panel">
                            <form method="post" class="text-start">
                                <input type="hidden" name="login_type" value="admin">
                                <div class="input-shell mb-2">
                                    <i class="bi bi-envelope-at-fill"></i>
                                    <input type="text" class="form-control" name="username" placeholder="อีเมลหรือรหัสผู้ใช้ครู" required>
                                </div>
                                <div class="input-shell mb-3">
                                    <i class="bi bi-lock-fill"></i>
                                    <input type="password" class="form-control" name="password" placeholder="รหัสผ่าน" required>
                                </div>
                                <button type="submit" class="btn btn-success w-100 rounded-4 fw-bold py-2">เข้าสู่ระบบครู</button>
                            </form>
                            <div class="text-center mt-3">
                                <a href="register_teacher.php" class="small text-decoration-none fw-bold text-success">สมัครใช้งานสำหรับครู</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <?php render_media_credit_footer('about_media.php'); ?>

    <script>
        document.querySelectorAll('input[name="group_student_ids[]"]').forEach((input, index) => {
            input.addEventListener('input', function() {
                let pwInput = document.querySelectorAll('input[name="group_pws[]"]')[index];
                if (this.value.trim() !== "") {
                    pwInput.setAttribute('required', 'required');
                } else if (index >= 2) {
                    pwInput.removeAttribute('required');
                    pwInput.value = '';
                }
            });
        });
    </script>
    <?php require __DIR__ . '/../includes/app_scripts.php'; ?>
</body>
</html>
