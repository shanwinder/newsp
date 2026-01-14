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
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-5">
            <div>
                <a href="student_dashboard.php" class="btn-back">
                    <i class="bi bi-arrow-left me-2"></i> กลับหน้าหลัก
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

                // Logic เดิม: ล็อกถ้ายังไม่ผ่านด่านก่อนหน้า
                $is_locked_sequence = !$is_previous_cleared;

                // Logic ใหม่: ล็อกถ้าครูสั่งปิด (Global Lock)
                // แต่ถ้าเป็น Admin ให้มองเห็นเสมอ
                $is_admin = (isset($_SESSION['role']) && $_SESSION['role'] == 'admin');
                $is_locked = ($is_locked_sequence || ($global_lock && !$is_admin));

                $link = "play_game.php?stage_id=" . $stage['id'];

                // ถ้าล็อกเพราะครูสั่ง ให้เปลี่ยน Link เป็น Alert
                $onclick = "window.location.href='$link'";
                if ($global_lock && !$is_admin) {
                    $onclick = "alert('⛔ คุณครูยังล็อกระบบอยู่ครับ รอสัญญาณนะ!');";
                }
                if ($is_locked_sequence) {
                    $onclick = ""; // กดไม่ได้เลยถ้ายังเล่นไม่ถึง
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
</body>

</html>