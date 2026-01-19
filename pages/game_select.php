<?php
// pages/game_select.php
session_start();
require_once '../includes/db.php';
require_once '../includes/student_navbar.php';

// ... ต่อจาก require_once
// เช็คสถานะล็อก
$res_nav = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'");
$global_lock = ($res_nav->fetch_assoc()['setting_value'] ?? 'locked') === 'locked';

// 1. รับค่า game_id จาก URL
if (!isset($_GET['game_id'])) {
    header("Location: student_dashboard.php");
    exit();
}
$game_id = intval($_GET['game_id']);
$user_id = $_SESSION['user_id'];

// 2. ดึงข้อมูลเกม
$stmt = $conn->prepare("SELECT * FROM games WHERE id = ?");
$stmt->bind_param("i", $game_id);
$stmt->execute();
$game = $stmt->get_result()->fetch_assoc();

if (!$game) {
    die("ไม่พบเกมนี้ในระบบ");
}

// 3. ดึงข้อมูลด่าน + คะแนนที่เคยทำได้ (JOIN กับตาราง progress)
// ถ้าไม่มีคะแนน (score) แสดงว่ายังไม่เคยเล่น -> เป็น NULL
$sql_stages = "SELECT s.*, p.score, p.completed_at 
               FROM stages s 
               LEFT JOIN progress p ON s.id = p.stage_id AND p.user_id = ?
               WHERE s.game_id = ? 
               ORDER BY s.stage_number ASC";
$stmt_stages = $conn->prepare($sql_stages);
$stmt_stages->bind_param("ii", $user_id, $game_id);
$stmt_stages->execute();
$stages_result = $stmt_stages->get_result();
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>เลือกด่าน - <?php echo $game['title']; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../assets/css/game_common.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background-color: #f0f9ff;
            background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
            min-height: 100vh;
        }

        .stage-card {
            border: none;
            border-radius: 20px;
            transition: all 0.3s;
            background: white;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
            cursor: pointer;
        }

        .stage-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        .stage-locked {
            filter: grayscale(100%);
            opacity: 0.7;
            cursor: not-allowed;
            pointer-events: none;
            /* ห้ามกด */
        }

        .lock-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            color: #555;
            z-index: 10;
        }

        .star-rating {
            color: #ffd700;
            font-size: 1.2rem;
            text-shadow: 1px 1px 0 #d4af37;
        }

        .btn-back {
            background-color: #ff6f61;
            color: white;
            border-radius: 50px;
            padding: 10px 25px;
            font-weight: bold;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }

        .btn-back:hover {
            background-color: #ff4757;
            color: white;
        }

        .pulse-icon i {
            animation: trophy-pulse 2s infinite;
            display: inline-block;
        }

        @keyframes trophy-pulse {
            0% {
                transform: scale(1);
            }

            50% {
                transform: scale(1.3) rotate(10deg);
                color: #b45309;
            }

            100% {
                transform: scale(1);
            }
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-5">
            <div>
                <a href="student_dashboard.php" class="btn-back">
                    <i class="bi bi-arrow-left me-2"></i> กลับหน้าหลัก
                </a>
                <a href="showcase.php?game_id=<?php echo $game_id; ?>" class="btn btn-warning rounded-pill shadow fw-bold px-4 pulse-icon">
                    <i class="bi bi-trophy-fill me-2"></i> ดูผลงานเพื่อนๆ
                </a>
            </div>

            <div class="text-center">
                <h1 class="fw-bold text-primary mb-0"><?php echo $game['title']; ?></h1>
                <p class="text-muted"><?php echo $game['description']; ?></p>
            </div>
            <div style="width: 120px;"></div>
        </div>

        <div class="row g-4">
            <?php
            $is_previous_cleared = true;
            while ($stage = $stages_result->fetch_assoc()):
                $stars = $stage['score'] ?? 0;

                // Logic การล็อกด่านตามลำดับ (Sequential Lock)
                $is_locked_sequence = !$is_previous_cleared;

                // ⚠️ Global Lock ของครู: 
                // ใน Flow ใหม่นี้ ครูจะปลดล็อกตั้งแต่หน้า Instruction แล้ว 
                // ดังนั้นหน้าเลือกด่านควรจะ "เปิด" ให้เด็กกดเข้าด่านได้เลย (ถ้าผ่านเงื่อนไขด่านก่อนหน้า)
                // แต่ถ้าครูกลับมาล็อกอีกที เราก็ควรกันไว้เหมือนเดิม
                $is_admin = (isset($_SESSION['role']) && $_SESSION['role'] == 'admin');
                $is_locked = ($is_locked_sequence || ($global_lock && !$is_admin));

                // ⚠️ แก้ไข Link: ให้วิ่งตรงเข้า play_game.php เลย (ไม่ต้องแวะ instruction แล้ว)
                $link = "play_game.php?stage_id=" . $stage['id'];

                // Event Onclick
                $onclick = "window.location.href='$link'";

                // ถ้าโดนล็อก
                if ($global_lock && !$is_admin) {
                    $onclick = "alert('⛔ คุณครูยังล็อกระบบอยู่ครับ');";
                }
                if ($is_locked_sequence) {
                    $onclick = ""; // กดไม่ได้
                }
            ?>

                <div class="col-md-4 col-sm-6">
                    <div class="card stage-card h-100 p-4 text-center <?php echo $is_locked ? 'stage-locked' : ''; ?>"
                        onclick="<?php echo $onclick; ?>">

                        <?php if ($is_locked): ?>
                            <div class="lock-icon">
                                <?php if ($global_lock && !$is_locked_sequence): ?>
                                    <i class="bi bi-sign-stop-fill text-danger"></i>
                                <?php else: ?>
                                    <i class="bi bi-lock-fill"></i>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>

                        <h1 class="display-4 fw-bold text-info mb-3"><?php echo $stage['stage_number']; ?></h1>
                        <h5 class="fw-bold text-dark"><?php echo $stage['title']; ?></h5>
                        <p class="text-secondary small mb-3"><?php echo $stage['instruction']; ?></p>

                        <div class="mt-auto">
                            <div class="star-rating">
                                <?php
                                // แสดงดาวตามคะแนน
                                for ($i = 1; $i <= 3; $i++) {
                                    echo ($i <= $stars) ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                                }
                                ?>
                            </div>
                            <?php if ($stars > 0): ?>
                                <span class="badge bg-success mt-2">ผ่านแล้ว!</span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php
                // Logic การปลดล็อค: ถ้าด่านนี้มีคะแนน > 0 แสดงว่าผ่านแล้ว -> ด่านถัดไปจะปลดล็อค
                $is_previous_cleared = ($stars > 0);
            endwhile;
            ?>
        </div>
    </div>
    <script>
        // เช็คสถานะทุก 3 วินาที เพื่อปลดล็อกปุ่มอัตโนมัติ
        setInterval(() => {
            fetch('../api/check_nav_status.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'unlocked') {
                        // ถ้าครูปลดล็อกแล้ว ให้ Reload หน้าจอเพื่อเปิดการ์ด
                        // (ทำแบบง่ายๆ คือรีโหลด ถ้าทำแบบยากคือต้องแก้ DOM class)
                        if (document.querySelector('.bi-sign-stop-fill')) {
                            location.reload();
                        }
                    } else {
                        // ถ้าครูล็อกกลับคืน
                        if (!document.querySelector('.bi-sign-stop-fill') && !document.querySelector('.stage-locked')) {
                            location.reload();
                        }
                    }
                });
        }, 3000);
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <?php
    // เช็คว่าผ่านครบ 3 ด่านหรือยัง?
    // (นับจำนวนด่านที่คะแนน > 0 ในเกมนี้)
    $check_progress = $conn->query("SELECT COUNT(*) as passed FROM progress p 
                                JOIN stages s ON p.stage_id = s.id 
                                WHERE p.user_id = {$_SESSION['user_id']} 
                                AND s.game_id = $game_id 
                                AND p.score > 0");
    $passed_count = $check_progress->fetch_assoc()['passed'];
    $total_stages = 3; // กำหนดตายตัวว่าบทนี้มี 3 ด่าน

    if ($passed_count >= $total_stages):

        $project_pages = [
            1 => 'create_project.php',          // บทที่ 1: แบบเดิม
            2 => 'create_project_algo.php',     // บทที่ 2: ไฟล์ใหม่ (เดี๋ยวสร้าง)
            3 => 'create_project_coding.php'    // บทที่ 3: ไฟล์ใหม่
        ];

        // เลือกไฟล์ปลายทาง (ถ้าไม่มีให้ Default ไปไฟล์แรก)
        $target_page = $project_pages[$game_id] ?? 'create_project.php';
    ?>
        <div class="row mt-5">
            <div class="col-12 text-center">
                <div class="card border-0 shadow-lg p-5" style="background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%); border-radius: 20px;">
                    <h2 class="fw-bold text-dark mb-3">🎉 ยินดีด้วย! คุณพิชิตครบทุกด่านแล้ว</h2>
                    <p class="fs-5 text-dark mb-4">ได้เวลาโชว์ฝีมือสร้างโจทย์ของตัวเองแล้ว!</p>
                    <a href="<?php echo $target_page; ?>?game_id=<?php echo $game_id; ?>"
                        class="btn btn-dark btn-lg rounded-pill px-5 py-3 fw-bold fs-4 pulse-anim">
                        <i class="bi bi-palette-fill me-2"></i> เข้าห้องสร้างชิ้นงาน
                    </a>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <style>
        .pulse-anim {
            animation: pulse-btn 2s infinite;
        }

        @keyframes pulse-btn {
            0% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
            }

            70% {
                transform: scale(1.05);
                box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
            }

            100% {
                transform: scale(1);
                box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
            }
        }
    </style>
</body>

</html>