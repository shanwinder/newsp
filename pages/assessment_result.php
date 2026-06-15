<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$app = require __DIR__ . '/../config/app.php';
require_student_like();

$attemptId = intval($_GET['attempt_id'] ?? 0);
$stmt = $conn->prepare("SELECT aa.*, a.title, a.assessment_type, s.show_score_to_student FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id LEFT JOIN assessment_settings s ON s.learning_session_id = aa.learning_session_id WHERE aa.id = ? AND aa.user_id = ? AND aa.learning_session_id = ? AND aa.status = 'submitted' LIMIT 1");
$userId = intval($_SESSION['user_id']);
$sessionId = intval($_SESSION['learning_session_id'] ?? 0);
$stmt->bind_param('iii', $attemptId, $userId, $sessionId);
$stmt->execute();
$attempt = $stmt->get_result()->fetch_assoc();
if (!$attempt) { http_response_code(404); exit('ไม่พบผลการสอบ'); }
?>
<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ส่งแบบทดสอบเรียบร้อยแล้ว</title>
<?php require '../includes/student_topbar_head.php'; ?><link rel="stylesheet" href="../assets/css/assessment.css"></head>
<body class="assessment-page"><?php require '../includes/student_navbar.php'; ?>
<main class="container assessment-shell py-5"><div class="card assessment-card text-center"><div class="card-body p-5">
<i class="bi bi-check-circle-fill text-success display-1"></i><h1 class="fw-bold mt-3">ส่งแบบทดสอบเรียบร้อยแล้ว</h1>
<p class="text-muted fs-5"><?php echo htmlspecialchars($attempt['title']); ?><br>คุณครูสามารถดูผลคะแนนได้ในระบบ</p>
<?php if (!empty($attempt['show_score_to_student'])): ?><div class="bg-success bg-opacity-10 rounded-4 p-4 mx-auto my-4" style="max-width:360px"><div class="text-muted">คะแนนของนักเรียน</div><div class="display-4 fw-bold text-success"><?php echo intval($attempt['score']); ?>/<?php echo intval($attempt['full_score']); ?></div><div><?php echo number_format((float)$attempt['percent_score'], 2); ?>%</div></div><?php endif; ?>
<p class="fs-5">ขอบคุณที่ตั้งใจทำด้วยความสามารถของตนเอง</p><a href="student_dashboard.php" class="btn btn-success btn-lg rounded-pill px-5">กลับหน้าหลัก</a>
</div></div></main><?php require '../includes/student_topbar_scripts.php'; ?></body></html>
