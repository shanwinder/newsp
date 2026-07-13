<?php
// pages/student_dashboard.php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
require_once '../includes/assessment.php';
$app = require __DIR__ . '/../config/app.php';
require_once '../includes/media_credit.php';

require_once '../includes/auth.php';

// ตรวจสอบสิทธิ์
require_student_like();

$is_visitor = is_visitor_mode();

$user_id = $_SESSION['user_id'];
$mode = $_SESSION['mode'] ?? 'solo';
$team_members = $_SESSION['team_members'] ?? [$user_id];
$display_name = $_SESSION['name'] ?? 'นักเรียน';
$context = session_context();
$assessmentStatus = assessment_student_status($conn, intval($user_id), $context);

// ดึงชื่อและบทบาทของสมาชิกในทีมทุกคนมาเพื่อแสดงผล
$team_data = [];
if (!empty($team_members)) {
    // แปลง Array ของ ID ให้เป็น String เพื่อใช้ใน SQL IN()
    $ids = implode(',', array_map('intval', $team_members));

    // เรียงลำดับตามคนที่ล็อกอินเข้ามาก่อน
    $sql_names = "SELECT name, team_role FROM users WHERE user_id IN ($ids) AND classroom_id = {$context['classroom_id']} ORDER BY FIELD(user_id, $ids)";
    $res_names = $conn->query($sql_names);

    if ($res_names) {
        while ($row = $res_names->fetch_assoc()) {
            $team_data[] = $row;
        }
    }
}

// ดึงข้อมูลเกมทั้งหมด (ตอนนี้มี 4 บทเรียนแล้ว)
$sql = "SELECT * FROM games ORDER BY id ASC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ศูนย์ฝึกทักษะการแก้ปัญหา - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">




<?php
$page_styles = array (
  0 => 'components/rank_badges.css',
  1 => 'components/student_topbar.css',
  2 => 'components/class_control.css',
  3 => 'pages/student_dashboard.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>

<body class="app-page student-dashboard-page">

    <?php require_once '../includes/student_navbar.php'; ?>

    <div class="container py-4 text-center">

        <?php if ($is_visitor): ?>
        <div class="visitor-mode-notice alert alert-info text-center shadow-sm fw-bold border-0 mb-4">
            <i class="bi bi-info-circle-fill me-2"></i> โหมดผู้เยี่ยมชม: คุณสามารถทดลองเล่นได้ แต่คะแนนและผลงานจะไม่ถูกบันทึกถาวร
        </div>
        <?php endif; ?>

        <div class="pair-status-banner mode-<?php echo $mode; ?>">
            <h6 class="mb-2 text-secondary fw-bold">รูปแบบการเรียนรู้ปัจจุบัน</h6>

            <?php if ($is_visitor): ?>
                <h3 class="fw-bold text-info mb-3">👋 <?php echo htmlspecialchars($display_name); ?></h3>
                <span class="badge bg-info rounded-pill px-4 py-2 fs-6 shadow-sm text-dark">
                    <i class="bi bi-eye-fill"></i> โหมดทดลองใช้งาน
                </span>
            <?php elseif ($mode === 'solo'): ?>
                <h3 class="fw-bold text-success mb-3">🧑‍🌾 <?php echo htmlspecialchars($display_name); ?></h3>
                <span class="badge bg-success rounded-pill px-4 py-2 fs-6 shadow-sm">
                    <i class="bi bi-person-fill"></i> เรียนรู้รายบุคคล (Solo)
                </span>

            <?php elseif ($mode === 'group'): ?>
                <h3 class="student-team-title fw-bold mb-3">👨‍👩‍👧‍👦 ทีม<?php echo htmlspecialchars($app['student_role']); ?> <?php echo htmlspecialchars($display_name); ?></h3>
                <span class="badge bg-warning text-dark rounded-pill px-4 py-2 fs-6 shadow-sm mb-3">
                    <i class="bi bi-diagram-3-fill"></i> ทำงานเป็นกลุ่ม (Group)
                </span>
                <div class="d-flex justify-content-center gap-2 flex-wrap">
                    <?php
                    foreach($team_data as $index => $member) {
                        echo "<div class='bg-light px-3 py-1 rounded-pill border'><i class='bi bi-person-check-fill text-success'></i> <span class='fw-bold'>{$member['name']}</span></div>";
                    }
                    ?>
                </div>
            <?php endif; ?>
        </div>

        <div class="mb-5">
            <h1 class="student-dashboard-title display-5 fw-bold">
                เลือกภารกิจการเรียนรู้
            </h1>
            <p class="text-muted fs-5">สะสม<?php echo htmlspecialchars($app['mission_stars']); ?>เพื่อเป็นนักแก้ปัญหาอย่างเป็นขั้นตอน</p>
        </div>

        <div class="row g-4 text-start justify-content-center">
            <?php
            // อัปเดตไอคอนให้ตรงกับ 4 เกมใหม่
            $icons = [
                'logic' => '🌾',       // บทที่ 1 คัดแยกผลผลิต
                'algorithm' => '🚜',   // บทที่ 2 เส้นทางเดินรถไถ
                'condition' => '🧩',   // บทที่ 3 ผู้จัดการฟาร์มอัจฉริยะ
                'debugging' => '🛠️'     // บทที่ 4 ซ่อมกฎฟาร์มอัจฉริยะ
            ];

            if ($result->num_rows > 0):
                while ($row = $result->fetch_assoc()):
                    $gameCode = $row['code'];
                    $gameId = $row['id'];
                    $icon = isset($icons[$gameCode]) ? $icons[$gameCode] : '🌻';

                    // หาจำนวนด่านทั้งหมดของเกมนี้
                    $sql_total = "SELECT COUNT(*) as total FROM stages WHERE game_id = $gameId";
                    $res_total = $conn->query($sql_total);
                    $total_stages = $res_total->fetch_assoc()['total'];
                    $max_score = $total_stages * 3;

                    // หาคะแนนที่ทำได้
                    if ($is_visitor) {
                        $sql_stages = "SELECT id FROM stages WHERE game_id = $gameId";
                        $res_stages = $conn->query($sql_stages);
                        $current_score = 0;
                        while($s = $res_stages->fetch_assoc()){
                            $current_score += $_SESSION['visitor_progress'][$s['id']]['score'] ?? 0;
                        }
                    } else {
                        $sql_score = "SELECT SUM(p.score) as earned
                                      FROM progress p
                                      JOIN stages s ON p.stage_id = s.id
                                      WHERE p.user_id = $user_id AND s.game_id = $gameId AND p.learning_session_id = {$context['learning_session_id']}";
                        $res_score = $conn->query($sql_score);
                        $current_score = $res_score->fetch_assoc()['earned'];
                        if (!$current_score) $current_score = 0;
                    }

                    $percent = ($max_score > 0) ? ($current_score / $max_score) * 100 : 0;

                    // 🟢 เช็คสถานะการสร้างชิ้นงานว่าครูส่งกลับหรือไม่
                    if ($is_visitor) {
                        $project_status = null;
                    } else {
                        $sql_work = "SELECT status FROM student_works WHERE user_id = $user_id AND game_id = $gameId AND learning_session_id = {$context['learning_session_id']} LIMIT 1";
                        $res_work = $conn->query($sql_work);
                        $project_status = ($res_work && $res_work->num_rows > 0) ? $res_work->fetch_assoc()['status'] : null;
                    }
            ?>
                    <div class="col-md-6 col-lg-5">
                        <div class="farm-card p-4 h-100 d-flex flex-column <?php echo ($project_status === 'revision') ? 'border-danger border-3 bg-danger bg-opacity-10' : ''; ?>">

                            <?php if ($project_status === 'revision'): ?>
                            <div class="position-absolute top-0 end-0 mt-3 me-3 z-3">
                                <span class="badge bg-danger fs-6 shadow heartbeat-badge"><i class="bi bi-exclamation-triangle-fill"></i> ครูส่งกลับให้แก้ไข</span>
                            </div>
                            <?php endif; ?>

                            <div class="text-center">
                                <div class="mission-icon"><?php echo $icon; ?></div>
                                <h4 class="fw-bold mb-2 text-dark"><?php echo htmlspecialchars($row['title']); ?></h4>
                                <p class="mission-description text-muted small mb-3">
                                    <?php echo htmlspecialchars($row['description']); ?>
                                </p>
                            </div>

                            <div class="mt-auto">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="small fw-bold text-secondary"><?php echo htmlspecialchars($app['mission_stars']); ?>ที่ได้</span>
                                    <span class="star-score">⭐ <?php echo $current_score; ?>/<?php echo $max_score; ?></span>
                                </div>

                                <div class="progress-bar-custom mb-4" title="<?php echo number_format($percent, 0); ?>%">
                                    <div class="progress-fill" style="width: <?php echo $percent; ?>%;"></div>
                                </div>

                                <?php
                                $btn_text = "▶️ เข้าสู่บทเรียน";
                                $btn_class = "btn-play";

                                if ($project_status === 'revision') {
                                    $btn_text = "⚠️ เข้าไปแก้ไขงานด่วน";
                                    $btn_class = "btn btn-danger w-100 rounded-pill py-2 fw-bold shadow heartbeat-badge text-white";
                                } elseif ($project_status === 'submitted' || $project_status === 'reviewed') {
                                    $btn_text = "✅ เข้าสู่บทเรียน (มีผลงานแล้ว)";
                                }
                                ?>
                                <a href="<?php echo $assessmentStatus['pretest_blocking'] ? 'assessment_intro.php?type=pretest&required=1' : 'instruction.php?game_id=' . intval($row['id']); ?>" class="<?php echo strpos($btn_class, 'btn ') !== false ? $btn_class : 'btn ' . $btn_class . ' w-100 d-block text-white text-decoration-none'; ?> <?php echo $assessmentStatus['pretest_blocking'] ? 'opacity-75' : ''; ?>">
                                    <?php echo $assessmentStatus['pretest_blocking'] ? '🔒 ทำ Pre-test ก่อน' : $btn_text; ?>
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="col-12 text-center text-muted py-5">
                    <h3>ยังไม่มีภารกิจการเรียนรู้ในระบบครับ!</h3>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <?php render_media_credit_footer('about_media.php'); ?>

    <?php require __DIR__ . '/../includes/app_scripts.php'; ?>
    <?php include '../includes/class_control_script.php'; ?>
</body>
</html>
