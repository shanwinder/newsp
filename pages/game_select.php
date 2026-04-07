<?php
// pages/game_select.php
session_start();
require_once '../includes/db.php';

// เช็คสถานะล็อกของครู
$res_nav = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'");
$global_lock = ($res_nav->fetch_assoc()['setting_value'] ?? 'locked') === 'locked';

// 1. รับค่า game_id จาก URL
if (!isset($_GET['game_id'])) {
    header("Location: student_dashboard.php");
    exit();
}
$game_id = intval($_GET['game_id']);
$user_id = $_SESSION['user_id'];

// 2. ดึงข้อมูลบทเรียน
$stmt = $conn->prepare("SELECT * FROM games WHERE id = ?");
$stmt->bind_param("i", $game_id);
$stmt->execute();
$game = $stmt->get_result()->fetch_assoc();

if (!$game) {
    die("ไม่พบแปลงเกษตรนี้ในระบบ");
}

// 3. ดึงข้อมูลด่าน + คะแนนที่เคยทำได้
// ใช้ LEFT JOIN progress เพื่อดูว่าเคยได้ดาวไหม (ถ้าไม่มีคะแนน จะเป็น NULL)
$sql_stages = "SELECT s.*, p.score, p.completed_at 
               FROM stages s 
               LEFT JOIN progress p ON s.id = p.stage_id AND p.user_id = ?
               WHERE s.game_id = ? 
               ORDER BY s.stage_number ASC";
$stmt_stages = $conn->prepare($sql_stages);
$stmt_stages->bind_param("ii", $user_id, $game_id);
$stmt_stages->execute();
$stages_result = $stmt_stages->get_result();

// กำหนดสีธีมตามบทเรียน
$theme_colors = [
    1 => ['bg' => '#e9f7ef', 'text' => 'text-success', 'border' => 'border-success'],
    2 => ['bg' => '#ebf5fb', 'text' => 'text-primary', 'border' => 'border-primary'],
    3 => ['bg' => '#e0f7fa', 'text' => 'text-info', 'border' => 'border-info'],
    4 => ['bg' => '#fdf2e9', 'text' => 'text-warning', 'border' => 'border-warning']
];
$theme = $theme_colors[$game_id] ?? $theme_colors[1];
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>เลือกด่าน - <?php echo htmlspecialchars($game['title']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../assets/css/game_common.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background-color: <?php echo $theme['bg']; ?>;
            background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
            min-height: 100vh;
        }

        .stage-card {
            border: 2px solid transparent;
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
        }

        .lock-icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            color: #555;
            z-index: 10;
        }

        .star-rating {
            color: #ffd700;
            font-size: 1.5rem;
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
            0% { transform: scale(1); }
            50% { transform: scale(1.3) rotate(10deg); color: #b45309; }
            100% { transform: scale(1); }
        }
    </style>
</head>

<body>
    <?php require_once '../includes/student_navbar.php'; ?>

    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
            <div>
                <a href="student_dashboard.php" class="btn-back">
                    <i class="bi bi-arrow-left me-2"></i> กลับหน้าหลักฟาร์ม
                </a>
                <a href="showcase.php?game_id=<?php echo $game_id; ?>" class="btn btn-warning rounded-pill shadow fw-bold px-4 pulse-icon">
                    <i class="bi bi-trophy-fill me-2"></i> ดูผลงานเพื่อนๆ
                </a>
            </div>

            <div class="text-center">
                <h1 class="fw-bold <?php echo $theme['text']; ?> mb-0"><?php echo htmlspecialchars($game['title']); ?></h1>
                <p class="text-muted fs-5"><?php echo htmlspecialchars($game['learning_topic']); ?></p>
            </div>
            <div style="width: 120px;" class="d-none d-md-block"></div>
        </div>

        <div class="row g-4 justify-content-center">
            <?php
            $is_previous_cleared = true; // ด่านแรกปลดล็อกเสมอ
            $passed_count = 0;
            $total_stages = 0;

            while ($stage = $stages_result->fetch_assoc()):
                $total_stages++;
                $stars = $stage['score'] ?? 0;

                if ($stars > 0) $passed_count++;

                // Logic การล็อกด่านตามลำดับ
                $is_locked_sequence = !$is_previous_cleared;

                // ตรวจสอบว่าครูล็อกหน้าจออยู่หรือไม่
                $is_admin = (isset($_SESSION['role']) && $_SESSION['role'] == 'admin');
                $is_locked = ($is_locked_sequence || ($global_lock && !$is_admin));

                // ลิงก์เข้าสู่ด่าน
                $link = "play_game.php?stage_id=" . $stage['id'];
                $onclick = "window.location.href='$link'";

                // ถ้าโดนล็อก
                if ($global_lock && !$is_admin) {
                    $onclick = "alert('⛔ คุณครูยังล็อกระบบอยู่ครับ โปรดรอสัญญาณ');";
                }
                if ($is_locked_sequence) {
                    $onclick = ""; // กดไม่ได้
                }
            ?>

                <div class="col-md-4 col-sm-6">
                    <div class="card stage-card h-100 p-4 text-center <?php echo $is_locked ? 'stage-locked' : ''; ?> <?php echo !$is_locked ? $theme['border'] : ''; ?>"
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

                        <h1 class="display-1 fw-bold <?php echo $theme['text']; ?> mb-3"><?php echo $stage['stage_number']; ?></h1>
                        <h4 class="fw-bold text-dark"><?php echo htmlspecialchars($stage['title']); ?></h4>
                        <p class="text-secondary mb-4"><?php echo htmlspecialchars($stage['instruction']); ?></p>

                        <div class="mt-auto">
                            <div class="star-rating">
                                <?php
                                for ($i = 1; $i <= 3; $i++) {
                                    echo ($i <= $stars) ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                                }
                                ?>
                            </div>
                            <?php if ($stars > 0): ?>
                                <span class="badge bg-success mt-2 px-3 py-2 rounded-pill fs-6"><i class="bi bi-check-circle-fill"></i> ผ่านแล้ว!</span>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php
                // ด่านถัดไปจะปลดล็อคก็ต่อเมื่อด่านนี้ได้คะแนน > 0
                $is_previous_cleared = ($stars > 0);
            endwhile;
            ?>
        </div>
    </div>

    <?php include '../includes/class_control_script.php'; ?>
    <script>
        setInterval(() => {
            fetch('../api/check_nav_status.php')
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'unlocked' && document.querySelector('.bi-sign-stop-fill')) {
                        location.reload();
                    } else if (data.status === 'locked' && !document.querySelector('.bi-sign-stop-fill') && !document.querySelector('.stage-locked')) {
                        location.reload();
                    }
                });
        }, 3000);
    </script>

    <?php
    // ถ้าผ่านครบ 3 ด่าน (ครบทุกด่านในบทเรียนนี้) ให้แสดงปุ่มสร้างโปรเจกต์
    if ($passed_count >= $total_stages && $total_stages > 0):
        $sql_work = "SELECT status FROM student_works WHERE user_id = $user_id AND game_id = $game_id LIMIT 1";
        $res_work = $conn->query($sql_work);
        $project_status = ($res_work && $res_work->num_rows > 0) ? $res_work->fetch_assoc()['status'] : null;

        // กำหนดไฟล์ปลายทางสำหรับสร้างชิ้นงานตามบทเรียน
        $project_pages = [
            1 => 'create_project_logic.php',    // บทที่ 1: ตรรกะคัดแยก
            2 => 'create_project_algo.php',     // บทที่ 2: ลำดับรถไถ
            3 => 'create_project_condition.php',// บทที่ 3: เงื่อนไขรดน้ำ
            4 => 'create_project_debug.php'     // บทที่ 4: แก้บั๊กฟาร์ม
        ];
        $target_page = $project_pages[$game_id] ?? 'create_project_logic.php';
    ?>
        <div class="container mt-5 mb-5">
            <div class="row">
                <div class="col-12 text-center">
                    <div class="card border-0 shadow-lg p-5" style="background: linear-gradient(135deg, #FFD700 0%, #FDB931 100%); border-radius: 20px;">
                        <?php if ($project_status === 'revision'): ?>
                            <h2 class="fw-bold text-danger mb-3">⚠️ โครงงานถูกส่งกลับให้แก้ไข</h2>
                            <p class="fs-5 text-dark mb-4">คุณครูมีคำแนะนำเพิ่มเติม อ่านฟีดแบ็กแล้วเข้าไปปรับปรุงผลงานด่วน!</p>
                            <a href="<?php echo $target_page; ?>?game_id=<?php echo $game_id; ?>"
                                class="btn btn-danger btn-lg rounded-pill px-5 py-3 fw-bold fs-4 pulse-anim shadow">
                                <i class="bi bi-pencil-square me-2"></i> เข้าไปแก้ไขผลงานด่วน
                            </a>
                        <?php elseif ($project_status === 'submitted' || $project_status === 'reviewed'): ?>
                            <h2 class="fw-bold text-dark mb-3">✅ คุณได้สร้างผลงานเรียบร้อยแล้ว</h2>
                            <p class="fs-5 text-dark mb-4">คุณสามารถเข้าไปดูหรือปรับปรุงผลงานให้ดีขึ้นกว่าเดิมได้เสมอนะ!</p>
                            <a href="<?php echo $target_page; ?>?game_id=<?php echo $game_id; ?>"
                                class="btn btn-dark btn-lg rounded-pill px-5 py-3 fw-bold fs-4 pulse-anim">
                                <i class="bi bi-pencil-square me-2"></i> แก้ไขผลงานล่าสุด
                            </a>
                        <?php else: ?>
                            <h2 class="fw-bold text-dark mb-3">🎉 ยินดีด้วย! ทีมของคุณพิชิตครบทุกด่านแล้ว</h2>
                            <p class="fs-5 text-dark mb-4">ได้เวลาโชว์ฝีมือสร้าง "ผลงานนวัตกรรมฟาร์ม" ของพวกเราแล้ว!</p>
                            <a href="<?php echo $target_page; ?>?game_id=<?php echo $game_id; ?>"
                                class="btn btn-dark btn-lg rounded-pill px-5 py-3 fw-bold fs-4 pulse-anim">
                                <i class="bi bi-palette-fill me-2"></i> เข้าห้องสร้างชิ้นงาน
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <style>
        .pulse-anim {
            animation: pulse-btn 2s infinite;
        }
        @keyframes pulse-btn {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }
    </style>
</body>
</html>