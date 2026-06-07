<?php
// pages/login.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        :root {
            --leaf: #1f8f4a;
            --leaf-dark: #0f5132;
            --leaf-soft: #dff7dc;
            --sun: #f5a524;
            --soil: #7a4f27;
            --water: #1d9bd7;
            --cream: #fff9ed;
            --ink: #19312a;
        }

        * {
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            margin: 0;
            font-family: 'Kanit', sans-serif;
            color: var(--ink);
            background:
                linear-gradient(120deg, rgba(14, 82, 45, .82), rgba(31, 143, 74, .28) 44%, rgba(245, 165, 36, .24)),
                url('../assets/img/bg_farm.webp') center/cover fixed;
            overflow-x: hidden;
        }

        body::before,
        body::after {
            content: "";
            position: fixed;
            pointer-events: none;
            z-index: 0;
        }

        body::before {
            inset: auto -8vw -16vh -8vw;
            height: 34vh;
            background:
                radial-gradient(ellipse at 18% 100%, rgba(122, 79, 39, .8) 0 16%, transparent 17%),
                repeating-linear-gradient(105deg, rgba(122, 79, 39, .72) 0 28px, rgba(91, 57, 28, .72) 28px 56px);
            opacity: .9;
            transform: skewY(-2deg);
        }

        body::after {
            width: 460px;
            height: 460px;
            top: -180px;
            right: -120px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255, 226, 126, .95), rgba(245, 165, 36, .14) 58%, transparent 70%);
            filter: blur(2px);
        }

        .login-page {
            position: relative;
            z-index: 1;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 36px 18px;
        }

        .login-shell {
            width: min(1180px, 100%);
            display: grid;
            grid-template-columns: minmax(330px, .92fr) minmax(420px, 1fr);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, .72);
            border-radius: 28px;
            background: rgba(255, 255, 255, .76);
            box-shadow: 0 34px 90px rgba(10, 48, 31, .34);
            backdrop-filter: blur(22px);
        }

        .farm-hero-panel {
            position: relative;
            min-height: 720px;
            padding: 42px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            color: #fff;
            background:
                linear-gradient(180deg, rgba(8, 68, 44, .18), rgba(8, 68, 44, .84)),
                url('../assets/img/ori_bg_farm.webp') center/cover;
            overflow: hidden;
        }

        .farm-hero-panel::before {
            content: "";
            position: absolute;
            inset: 0;
            background:
                linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px),
                linear-gradient(0deg, rgba(255,255,255,.1) 1px, transparent 1px);
            background-size: 42px 42px;
            mask-image: linear-gradient(to bottom, rgba(0,0,0,.62), transparent 72%);
        }

        .farm-hero-panel::after {
            content: "";
            position: absolute;
            left: -14%;
            right: -14%;
            bottom: -6%;
            height: 32%;
            background:
                repeating-linear-gradient(102deg, rgba(105, 67, 30, .92) 0 24px, rgba(67, 102, 42, .88) 24px 48px);
            border-top: 8px solid rgba(247, 209, 126, .65);
            transform: rotate(-2deg);
            opacity: .95;
        }

        .hero-content,
        .hero-footer,
        .tractor-scene {
            position: relative;
            z-index: 2;
        }

        .farm-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            width: fit-content;
            padding: 9px 15px;
            border: 1px solid rgba(255, 255, 255, .5);
            border-radius: 999px;
            background: rgba(9, 69, 45, .38);
            box-shadow: 0 12px 30px rgba(0, 0, 0, .16);
            backdrop-filter: blur(10px);
            font-weight: 700;
        }

        .farm-hero-panel h1 {
            margin: 24px 0 12px;
            font-size: clamp(2.4rem, 5vw, 4.6rem);
            line-height: 1.02;
            font-weight: 800;
            text-shadow: 0 10px 30px rgba(0, 0, 0, .28);
            letter-spacing: 0;
        }

        .farm-hero-panel p {
            max-width: 440px;
            margin: 0;
            color: rgba(255, 255, 255, .88);
            font-size: 1.12rem;
            line-height: 1.7;
        }

        .tractor-scene {
            min-height: 230px;
        }

        .orchard-tree {
            position: absolute;
            left: 2%;
            bottom: -36px;
            width: min(265px, 58%);
            filter: drop-shadow(0 20px 20px rgba(0, 0, 0, .28));
            animation: orchard-bob 5s ease-in-out infinite;
        }

        .floating-crop {
            position: absolute;
            display: grid;
            place-items: center;
            width: 58px;
            height: 58px;
            border-radius: 18px;
            background: rgba(255, 255, 255, .92);
            box-shadow: 0 16px 34px rgba(13, 77, 44, .24);
            animation: crop-float 4.5s ease-in-out infinite;
        }

        .floating-crop img {
            width: 38px;
            height: 38px;
            object-fit: contain;
        }

        .crop-1 { right: 12%; bottom: 126px; }
        .crop-2 { right: 28%; bottom: 42px; animation-delay: .8s; }
        .crop-3 { right: 4%; bottom: 26px; animation-delay: 1.4s; }

        .hero-footer {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }

        .field-chip {
            min-height: 88px;
            padding: 14px;
            border-radius: 18px;
            background: rgba(255, 255, 255, .18);
            border: 1px solid rgba(255, 255, 255, .35);
            backdrop-filter: blur(10px);
        }

        .field-chip strong {
            display: block;
            font-size: 1.42rem;
            line-height: 1;
        }

        .field-chip span {
            display: block;
            margin-top: 8px;
            color: rgba(255, 255, 255, .82);
            font-size: .86rem;
        }

        .auth-panel {
            padding: clamp(26px, 4vw, 48px);
            background:
                linear-gradient(180deg, rgba(255, 249, 237, .94), rgba(255, 255, 255, .94)),
                radial-gradient(circle at 92% 8%, rgba(29, 155, 215, .13), transparent 28%);
        }

        .brand-lockup {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            margin-bottom: 22px;
            text-align: left;
        }

        .brand-mark {
            width: 66px;
            height: 66px;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            border-radius: 21px;
            background: linear-gradient(145deg, #fff7d4, #c8efc5);
            box-shadow: inset 0 -6px 12px rgba(31, 143, 74, .16), 0 16px 32px rgba(31, 143, 74, .18);
            font-size: 2rem;
        }

        .brand-title {
            margin: 0;
            color: var(--leaf-dark);
            font-size: clamp(1.7rem, 3vw, 2.5rem);
            font-weight: 800;
            line-height: 1.12;
        }

        .brand-subtitle {
            margin: 6px 0 0;
            color: #647067;
            font-size: .98rem;
        }

        .farm-tabs {
            padding: 6px;
            border-radius: 18px;
            background: rgba(31, 143, 74, .1);
            border: 1px solid rgba(31, 143, 74, .18);
        }

        .farm-tabs .nav-link {
            min-height: 56px;
            border: 0;
            border-radius: 14px;
            color: #496356;
            font-weight: 800;
            transition: transform .2s ease, background .2s ease, box-shadow .2s ease;
        }

        .farm-tabs .nav-link:hover {
            transform: translateY(-1px);
        }

        .farm-tabs .nav-link.active {
            color: #fff;
            background: linear-gradient(135deg, var(--leaf), #39b86d);
            box-shadow: 0 12px 24px rgba(31, 143, 74, .25);
        }

        .role-box {
            margin: 0 auto;
            padding: 22px;
            border-radius: 22px;
            border: 1px solid rgba(31, 143, 74, .22);
            background: rgba(255, 255, 255, .72);
            box-shadow: 0 18px 40px rgba(25, 49, 42, .08);
        }

        .role-box.solo {
            max-width: 470px;
            background:
                linear-gradient(180deg, rgba(223, 247, 220, .72), rgba(255, 255, 255, .84));
        }

        .role-box.group {
            background:
                linear-gradient(180deg, rgba(255, 241, 214, .82), rgba(255, 255, 255, .9));
            border-color: rgba(245, 165, 36, .36);
        }

        .section-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 18px;
            color: var(--leaf-dark);
            font-size: 1.22rem;
            font-weight: 800;
        }

        .role-box.group .section-title {
            color: #a6510f;
        }

        .form-label {
            color: #314b40;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .input-shell {
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 54px;
            padding: 0 14px;
            border: 1px solid rgba(31, 143, 74, .18);
            border-radius: 16px;
            background: rgba(255, 255, 255, .94);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9);
            transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }

        .input-shell:focus-within {
            border-color: var(--sun);
            box-shadow: 0 0 0 .24rem rgba(245, 165, 36, .18), 0 12px 24px rgba(31, 143, 74, .09);
            transform: translateY(-1px);
        }

        .input-shell i {
            flex: 0 0 auto;
            color: var(--leaf);
            font-size: 1.08rem;
        }

        .input-shell .form-control,
        .input-shell .form-select {
            min-height: 52px;
            padding: 0;
            border: 0;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
        }

        .form-control::placeholder {
            color: #9aa89f;
        }

        .btn-game {
            min-height: 60px;
            border: 0;
            border-radius: 18px;
            color: #fff;
            background: linear-gradient(135deg, #e76f22, var(--sun));
            box-shadow: 0 18px 30px rgba(198, 91, 22, .28);
            font-size: 1.16rem;
            font-weight: 800;
            transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }

        .btn-game:hover,
        .btn-game:focus {
            color: #fff;
            transform: translateY(-2px);
            filter: saturate(1.08);
            box-shadow: 0 24px 42px rgba(198, 91, 22, .34);
        }

        .member-tile {
            height: 100%;
            padding: 13px;
            border: 1px solid rgba(122, 79, 39, .12);
            border-radius: 18px;
            background: rgba(255, 255, 255, .78);
        }

        .member-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 10px;
            padding: 6px 10px;
            border-radius: 999px;
            color: #fff;
            background: linear-gradient(135deg, var(--soil), #b47435);
            font-size: .82rem;
            font-weight: 700;
        }

        .teacher-gate {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid rgba(31, 143, 74, .16);
        }

        .teacher-toggle {
            border-color: rgba(15, 81, 50, .28);
            color: var(--leaf-dark);
            background: rgba(255, 255, 255, .72);
            font-weight: 700;
        }

        .teacher-toggle:hover {
            border-color: var(--leaf);
            color: var(--leaf-dark);
            background: var(--leaf-soft);
        }

        .teacher-panel {
            max-width: 380px;
            margin: 0 auto;
            padding: 18px;
            border-radius: 20px;
            background: rgba(255, 255, 255, .74);
            border: 1px solid rgba(31, 143, 74, .16);
        }

        .alert {
            border: 0;
            border-radius: 18px;
            box-shadow: 0 12px 28px rgba(167, 42, 42, .12);
        }

        @keyframes orchard-bob {
            0%, 100% { transform: translateY(0) rotate(-1deg); }
            50% { transform: translateY(-8px) rotate(1deg); }
        }

        @keyframes crop-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
        }

        @media (max-width: 991px) {
            .login-shell {
                grid-template-columns: 1fr;
            }

            .farm-hero-panel {
                min-height: 360px;
                padding: 30px;
            }

            .tractor-scene {
                min-height: 120px;
            }

            .orchard-tree {
                width: 210px;
                bottom: -58px;
            }

            .hero-footer {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }
        }

        @media (max-width: 575px) {
            .login-page {
                padding: 14px;
                align-items: flex-start;
            }

            .login-shell {
                border-radius: 22px;
            }

            .farm-hero-panel {
                min-height: 300px;
                padding: 24px;
            }

            .farm-hero-panel p,
            .hero-footer {
                display: none;
            }

            .brand-lockup {
                align-items: flex-start;
            }

            .brand-mark {
                width: 56px;
                height: 56px;
                border-radius: 18px;
            }

            .farm-tabs .nav-link {
                min-height: 50px;
                font-size: .98rem;
            }

            .role-box {
                padding: 16px;
            }
        }
    </style>
</head>
<body>
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
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
