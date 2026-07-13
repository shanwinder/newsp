<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$app = require __DIR__ . '/../config/app.php';
require_student_like();
$status = survey_student_status($conn, intval($_SESSION['user_id']), session_context());
if (!$status['submitted']) { header('Location: survey_start.php'); exit(); }
?>
<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ขอบคุณสำหรับความคิดเห็น | <?php echo htmlspecialchars($app['app_name']); ?></title>
<?php
$page_styles = array (
  0 => 'components/rank_badges.css',
  1 => 'components/student_topbar.css',
  2 => 'modules/survey.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="survey-page app-page survey-thankyou-page"><?php require '../includes/student_navbar.php'; ?>
<main class="container survey-shell py-5"><div class="card survey-card text-center"><div class="card-body p-5">
<i class="bi bi-balloon-heart-fill text-success display-1"></i><h1 class="fw-bold mt-3">ขอบคุณสำหรับความคิดเห็นของนักเรียน</h1>
<p class="text-muted fs-5">ความคิดเห็นของนักเรียนจะช่วยให้ครูปรับปรุงเกมให้ดียิ่งขึ้น<br><small>ส่งเมื่อ <?php echo htmlspecialchars(date('d/m/Y H:i', strtotime($status['response']['submitted_at']))); ?> น.</small></p>
<div class="d-flex flex-wrap justify-content-center gap-2 mt-4"><a href="student_dashboard.php" class="btn btn-success btn-lg rounded-pill px-5"><i class="bi bi-house-fill"></i> กลับหน้าหลัก</a><a href="../logout.php" class="btn btn-outline-secondary btn-lg rounded-pill px-4">ออกจากระบบ</a></div>
</div></div></main><?php require __DIR__ . '/../includes/app_scripts.php'; ?></body></html>
