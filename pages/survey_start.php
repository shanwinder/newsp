<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$app = require __DIR__ . '/../config/app.php';

require_student_like();
$status = survey_student_status($conn, intval($_SESSION['user_id']), session_context());
$settings = $status['settings'] ?? [];
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>แบบสอบถามความพึงพอใจ | <?php echo htmlspecialchars($app['app_name']); ?></title>
    <?php require '../includes/student_topbar_head.php'; ?>
    <link rel="stylesheet" href="../assets/css/survey.css">
</head>
<body class="survey-page">
<?php require '../includes/student_navbar.php'; ?>
<main class="container survey-shell py-5">
    <section class="survey-hero p-4 p-md-5 mb-4 text-center">
        <i class="bi bi-chat-heart-fill display-3"></i>
        <h1 class="fw-bold mt-2"><?php echo htmlspecialchars($settings['title'] ?? 'แบบสอบถามความพึงพอใจของผู้เรียน'); ?></h1>
        <p class="fs-5 mb-0">ช่วยบอกครูหน่อยว่าเกมนี้ช่วยให้หนูเรียนรู้ได้ดีแค่ไหน</p>
    </section>

    <div class="card survey-card">
        <div class="card-body p-4 p-md-5">
            <?php if (!$status['configured']): ?>
                <div class="alert alert-secondary fs-5 mb-4"><?php echo htmlspecialchars($status['message']); ?></div>
                <a href="student_dashboard.php" class="btn btn-outline-secondary rounded-pill px-4">กลับหน้าหลัก</a>
            <?php elseif (!$status['individual']): ?>
                <div class="alert alert-warning fs-5"><i class="bi bi-person-lock me-2"></i><?php echo htmlspecialchars($status['message']); ?></div>
                <a href="login.php" class="btn btn-warning rounded-pill px-4">เข้าสู่ระบบรายบุคคล</a>
            <?php elseif ($status['submitted'] && !$status['allow_edit']): ?>
                <div class="alert alert-success fs-5"><i class="bi bi-check-circle-fill me-2"></i><?php echo htmlspecialchars($status['message']); ?></div>
                <a href="survey_thankyou.php" class="btn btn-success rounded-pill px-4">ดูหน้าขอบคุณ</a>
            <?php elseif (!$status['available']): ?>
                <div class="alert alert-secondary fs-5"><i class="bi bi-lock-fill me-2"></i><?php echo htmlspecialchars($status['message']); ?></div>
                <?php if ($status['state'] === 'posttest_required'): ?>
                    <a href="assessment_intro.php?type=posttest" class="btn btn-primary rounded-pill px-4">ไปทำ Post-test</a>
                <?php else: ?>
                    <a href="student_dashboard.php" class="btn btn-outline-secondary rounded-pill px-4">กลับหน้าหลัก</a>
                <?php endif; ?>
            <?php else: ?>
                <p class="fs-5">แบบสอบถามฉบับนี้ใช้สอบถามความพึงพอใจที่มีต่อระบบเกม ขอให้นักเรียนตอบตามความคิดเห็นของตนเอง ไม่มีคำตอบถูกหรือผิด ข้อมูลจะนำไปใช้ปรับปรุงสื่อการเรียนรู้ให้ดียิ่งขึ้น</p>
                <div class="row g-3 my-3">
                    <div class="col-md-4"><div class="bg-light rounded-4 p-3 text-center h-100"><i class="bi bi-list-check fs-2 text-success"></i><div class="fw-bold fs-5"><?php echo intval($settings['rating_questions'] ?? 15); ?> ข้อ</div><small class="text-muted">คำถามแบบระดับคะแนน</small></div></div>
                    <div class="col-md-4"><div class="bg-light rounded-4 p-3 text-center h-100"><i class="bi bi-chat-left-text fs-2 text-primary"></i><div class="fw-bold fs-5"><?php echo intval($settings['open_questions'] ?? 2); ?> ข้อ</div><small class="text-muted">ความคิดเห็นเพิ่มเติม ไม่บังคับ</small></div></div>
                    <div class="col-md-4"><div class="bg-light rounded-4 p-3 text-center h-100"><i class="bi bi-person fs-2 text-warning"></i><div class="fw-bold fs-5">รายบุคคล</div><small class="text-muted">ตอบจากความรู้สึกของตนเอง</small></div></div>
                </div>
                <div class="alert alert-success bg-success bg-opacity-10 border-0">
                    <strong>ระดับคะแนน:</strong> 5 เห็นด้วยมากที่สุด, 4 เห็นด้วยมาก, 3 ปานกลาง, 2 เห็นด้วยน้อย, 1 เห็นด้วยน้อยที่สุด
                </div>
                <ul class="fs-5 lh-lg">
                    <li>อ่านแต่ละข้อความแล้วเลือกระดับที่ตรงกับความคิดเห็นมากที่สุด</li>
                    <li>คำถามคะแนนทั้ง 15 ข้อต้องตอบให้ครบ</li>
                    <li>คำถามปลายเปิดตอบหรือเว้นไว้ได้</li>
                    <li>ตรวจคำตอบก่อนกดส่งแบบสอบถาม</li>
                </ul>
                <div class="d-flex flex-wrap gap-2 mt-4">
                    <button id="start-btn" class="btn btn-success btn-lg rounded-pill px-5"><i class="bi bi-play-fill"></i> <?php echo $status['submitted'] ? 'แก้ไขคำตอบ' : 'เริ่มตอบแบบสอบถาม'; ?></button>
                    <a href="student_dashboard.php" class="btn btn-outline-secondary btn-lg rounded-pill px-4">กลับหน้าหลัก</a>
                </div>
                <div id="start-error" class="text-danger mt-3"></div>
            <?php endif; ?>
        </div>
    </div>
</main>
<?php require '../includes/student_topbar_scripts.php'; ?>
<script>
const startButton = document.getElementById('start-btn');
if (startButton) {
    startButton.addEventListener('click', async () => {
        startButton.disabled = true;
        try {
            const response = await fetch('../api/start_survey.php', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({csrf_token: <?php echo json_encode(survey_csrf_token()); ?>})
            });
            const data = await response.json();
            if (data.success) location.href = data.url;
            else throw new Error(data.message || 'ไม่สามารถเริ่มแบบสอบถามได้');
        } catch (error) {
            document.getElementById('start-error').textContent = error.message;
            startButton.disabled = false;
        }
    });
}
</script>
</body>
</html>
