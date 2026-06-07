<?php
// pages/game_select.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

$context = session_context();

// เช็คสถานะล็อกของครูเฉพาะรอบการเรียนรู้ของห้องนี้
if ($context['learning_session_id'] > 0) {
    $stmt_nav = $conn->prepare("SELECT navigation_status FROM learning_sessions WHERE id = ?");
    $stmt_nav->bind_param("i", $context['learning_session_id']);
    $stmt_nav->execute();
    $nav_row = $stmt_nav->get_result()->fetch_assoc();
    $global_lock = ($nav_row['navigation_status'] ?? 'locked') === 'locked';
} else {
    $res_nav = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'");
    $global_lock = ($res_nav->fetch_assoc()['setting_value'] ?? 'locked') === 'locked';
}

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
    die("ไม่พบภารกิจการเรียนรู้นี้ในระบบ");
}

// 3. ดึงข้อมูลด่าน + คะแนนที่เคยทำได้
// ใช้ LEFT JOIN progress เพื่อดูว่าเคยได้ดาวไหม (ถ้าไม่มีคะแนน จะเป็น NULL)
$sql_stages = "SELECT s.*, p.score, p.completed_at 
               FROM stages s 
               LEFT JOIN progress p ON s.id = p.stage_id AND p.user_id = ? AND p.learning_session_id = ?
               WHERE s.game_id = ? 
               ORDER BY s.stage_number ASC";
$stmt_stages = $conn->prepare($sql_stages);
$stmt_stages->bind_param("iii", $user_id, $context['learning_session_id'], $game_id);
$stmt_stages->execute();
$stages_result = $stmt_stages->get_result();

$stages = [];
$passed_count = 0;
$total_stages = 0;
while ($stage = $stages_result->fetch_assoc()) {
    $total_stages++;
    $stage['score'] = $stage['score'] ?? 0;
    if ($stage['score'] > 0) {
        $passed_count++;
    }
    $stages[] = $stage;
}

$can_create_project = ($passed_count >= $total_stages && $total_stages > 0);
$project_pages = [
    1 => 'create_project_logic.php',
    2 => 'create_project_algo.php',
    3 => 'create_project_condition.php',
    4 => 'create_project_debug.php'
];
$target_page = $project_pages[$game_id] ?? 'create_project_logic.php';
$project_status = null;

if ($can_create_project) {
    $stmt_work = $conn->prepare("SELECT status FROM student_works WHERE user_id = ? AND game_id = ? AND learning_session_id = ? LIMIT 1");
    $stmt_work->bind_param("iii", $user_id, $game_id, $context['learning_session_id']);
    $stmt_work->execute();
    $work_row = $stmt_work->get_result()->fetch_assoc();
    $project_status = $work_row['status'] ?? null;
}

$project_cta_texts = [
    1 => 'ขั้นต่อไป: ออกแบบภารกิจตรรกะคัดแยกของคุณเอง',
    2 => 'ขั้นต่อไป: ออกแบบภารกิจเส้นทางรถไถของคุณเอง',
    3 => 'ขั้นต่อไป: ออกแบบภารกิจ Smart Farm Manager ของคุณเอง',
    4 => 'ขั้นต่อไป: ออกแบบภารกิจซ่อมกฎฟาร์มของคุณเอง'
];

$project_cta = [
    'hero_class' => 'project-hero-new',
    'icon' => 'bi-stars',
    'title' => 'เยี่ยมมาก! คุณผ่านบทเรียนนี้ครบทุกด่านแล้ว',
    'text' => $project_cta_texts[$game_id] ?? $project_cta_texts[2],
    'button' => 'เข้าห้องสร้างชิ้นงาน',
    'sticky' => 'พร้อมสร้างชิ้นงานแล้ว'
];
if ($project_status === 'revision') {
    $project_cta = [
        'hero_class' => 'project-hero-revision',
        'icon' => 'bi-exclamation-triangle-fill',
        'title' => 'คุณครูส่งชิ้นงานกลับให้แก้ไข',
        'text' => 'อ่านคำแนะนำแล้วปรับปรุงผลงานให้ดีขึ้น',
        'button' => 'แก้ไขชิ้นงาน',
        'sticky' => 'มีชิ้นงานที่ต้องแก้ไข'
    ];
} elseif ($project_status === 'submitted') {
    $project_cta = [
        'hero_class' => 'project-hero-submitted',
        'icon' => 'bi-check-circle-fill',
        'title' => 'คุณสร้างชิ้นงานแล้ว',
        'text' => 'สามารถเข้าไปดูหรือปรับปรุงชิ้นงานล่าสุดได้',
        'button' => 'ดู/แก้ไขชิ้นงานล่าสุด',
        'sticky' => 'ชิ้นงานถูกส่งแล้ว'
    ];
} elseif ($project_status === 'reviewed') {
    $project_cta = [
        'hero_class' => 'project-hero-reviewed',
        'icon' => 'bi-patch-check-fill',
        'title' => 'คุณมีชิ้นงานที่ครูตรวจแล้ว',
        'text' => 'เข้าไปดูชิ้นงานและข้อเสนอแนะจากคุณครูได้',
        'button' => 'ดูชิ้นงานที่ครูตรวจแล้ว',
        'sticky' => 'ครูตรวจชิ้นงานแล้ว'
    ];
} elseif ($project_status === 'pending') {
    $project_cta = [
        'hero_class' => 'project-hero-submitted',
        'icon' => 'bi-pencil-square',
        'title' => 'คุณมีชิ้นงานที่ยังทำต่อได้',
        'text' => 'กลับไปทำชิ้นงานต่อ แล้วทดสอบเส้นทางให้ผ่านก่อนส่ง',
        'button' => 'ทำชิ้นงานต่อ',
        'sticky' => 'ทำชิ้นงานต่อ'
    ];
}

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
    <title>เลือกด่าน - <?php echo htmlspecialchars($game['title']); ?> | <?php echo htmlspecialchars($app['app_name']); ?></title>
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
            <?php if ($can_create_project): ?>padding-bottom: 96px;<?php endif; ?>
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

        .project-completion-hero {
            border: 0;
            border-radius: 18px;
            color: #1f2937;
            overflow: hidden;
            box-shadow: 0 18px 40px rgba(15, 23, 42, .14);
        }

        .project-hero-new { background: linear-gradient(135deg, #facc15 0%, #fb923c 100%); }
        .project-hero-submitted { background: linear-gradient(135deg, #86efac 0%, #38bdf8 100%); }
        .project-hero-reviewed { background: linear-gradient(135deg, #bbf7d0 0%, #22c55e 100%); }
        .project-hero-revision { background: linear-gradient(135deg, #fed7aa 0%, #f87171 100%); }

        .project-sticky-cta {
            position: fixed;
            left: 50%;
            bottom: 16px;
            transform: translateX(-50%);
            z-index: 1050;
            max-width: 720px;
            width: calc(100% - 24px);
            border-radius: 999px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, .25);
        }

        .project-sticky-cta.is-hidden {
            display: none !important;
        }

        @media (max-width: 576px) {
            .project-sticky-cta {
                border-radius: 18px;
            }
        }
    </style>
</head>

<body>
    <?php require_once '../includes/student_navbar.php'; ?>

    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
            <div>
                <a href="student_dashboard.php" class="btn-back">
                    <i class="bi bi-arrow-left me-2"></i> กลับหน้าหลัก
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

        <?php if ($can_create_project): ?>
            <div class="card project-completion-hero <?php echo $project_cta['hero_class']; ?> mb-4">
                <div class="card-body p-4 p-lg-5">
                    <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                        <div class="d-flex align-items-start gap-3">
                            <div class="bg-white bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 64px; height: 64px; min-width: 64px;">
                                <i class="bi <?php echo htmlspecialchars($project_cta['icon']); ?> fs-2 text-dark"></i>
                            </div>
                            <div>
                                <h2 class="fw-bold mb-2"><?php echo htmlspecialchars($project_cta['title']); ?></h2>
                                <p class="fs-5 mb-0"><?php echo htmlspecialchars($project_cta['text']); ?></p>
                            </div>
                        </div>
                        <a href="<?php echo $target_page; ?>?game_id=<?php echo $game_id; ?>"
                           class="btn btn-dark btn-lg rounded-pill px-4 py-3 fw-bold shadow">
                            <i class="bi bi-palette-fill me-2"></i> <?php echo htmlspecialchars($project_cta['button']); ?>
                        </a>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <div class="row g-4 justify-content-center">
            <?php
            $is_previous_cleared = true; // ด่านแรกปลดล็อกเสมอ
            $is_admin = (isset($_SESSION['role']) && in_array($_SESSION['role'], ['admin', 'super_admin', 'teacher'], true));

            foreach ($stages as $stage):
                $stars = $stage['score'] ?? 0;

                // Logic การล็อกด่านตามลำดับ
                $is_locked_sequence = !$is_previous_cleared;

                // ตรวจสอบว่าครูล็อกหน้าจออยู่หรือไม่
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
            endforeach;
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

    <?php if ($can_create_project): ?>
        <div id="projectStickyCta" class="project-sticky-cta bg-white border d-flex align-items-center justify-content-between gap-2 px-3 py-2">
            <div class="fw-bold text-dark text-truncate">
                <i class="bi <?php echo htmlspecialchars($project_cta['icon']); ?> text-primary me-2"></i>
                <?php echo htmlspecialchars($project_cta['sticky']); ?>
            </div>
            <div class="d-flex align-items-center gap-2">
                <a href="<?php echo $target_page; ?>?game_id=<?php echo $game_id; ?>" class="btn btn-primary rounded-pill fw-bold px-3">
                    <?php echo htmlspecialchars($project_cta['button']); ?>
                </a>
                <button type="button" class="btn btn-light border rounded-circle" aria-label="ปิดแถบสร้างชิ้นงาน" onclick="document.getElementById('projectStickyCta').classList.add('is-hidden')">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </div>

        <?php if ($project_status === null): ?>
            <div class="modal fade" id="completionModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg rounded-4">
                        <div class="modal-body text-center p-4 p-lg-5">
                            <div class="display-4 mb-3">🎉</div>
                            <h3 class="fw-bold mb-2">ผ่านครบทุกด่านแล้ว!</h3>
                            <p class="fs-5 text-secondary"><?php echo $game_id === 4 ? 'ต่อไปมาสร้างโจทย์ซ่อมกฎฟาร์มของตัวเองกันเถอะ' : 'ต่อไปมาสร้างโจทย์เส้นทางรถไถของตัวเองกันเถอะ'; ?></p>
                            <div class="d-flex justify-content-center flex-wrap gap-2 mt-4">
                                <a href="<?php echo $target_page; ?>?game_id=<?php echo $game_id; ?>" class="btn btn-primary rounded-pill px-4 fw-bold">
                                    เข้าห้องสร้างชิ้นงาน
                                </a>
                                <button type="button" class="btn btn-light border rounded-pill px-4 fw-bold" data-bs-dismiss="modal">ดูก่อน</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    <?php endif; ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <?php if ($can_create_project && $project_status === null): ?>
        <script>
            const completionModalKey = 'completion-modal-seen-<?php echo $game_id; ?>-<?php echo intval($context['learning_session_id']); ?>';
            const shouldForceCompletionModal = new URLSearchParams(window.location.search).get('completed') === '1';
            if (shouldForceCompletionModal || !sessionStorage.getItem(completionModalKey)) {
                sessionStorage.setItem(completionModalKey, '1');
                const modal = new bootstrap.Modal(document.getElementById('completionModal'));
                modal.show();
            }
        </script>
    <?php endif; ?>
</body>
</html>
