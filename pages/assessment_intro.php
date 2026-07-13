<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$app = require __DIR__ . '/../config/app.php';

require_student_like();
$type = ($_GET['type'] ?? '') === 'posttest' ? 'posttest' : 'pretest';
$status = assessment_student_status($conn, intval($_SESSION['user_id']), session_context());
$item = $status[$type];
$label = assessment_type_label($type);
$attempt = $item['attempt'] ?? null;
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo htmlspecialchars($label); ?> | <?php echo htmlspecialchars($app['app_name']); ?></title>


<?php
$page_styles = array (
  0 => 'components/rank_badges.css',
  1 => 'components/student_topbar.css',
  2 => 'modules/assessment.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="assessment-page app-page assessment-intro-page">
<?php require '../includes/student_navbar.php'; ?>
<main class="container assessment-shell py-5">
    <section class="assessment-hero p-4 p-md-5 mb-4 text-center">
        <i class="bi bi-clipboard2-check display-3"></i>
        <h1 class="fw-bold mt-2"><?php echo htmlspecialchars($item['title'] ?: $label); ?></h1>
        <p class="fs-5 mb-0"><?php echo $type === 'pretest'
            ? 'วัดความรู้พื้นฐานก่อนเริ่มภารกิจ คะแนนนี้ใช้ดูพัฒนาการ ไม่ใช่การแข่งขัน'
            : 'วัดผลการเรียนรู้หลังจากฝึกทักษะผ่านภารกิจทั้ง 4 บทเรียน'; ?></p>
    </section>

    <div class="card assessment-card">
        <div class="card-body p-4 p-md-5">
            <?php if (!$status['configured'] || empty($item['assessment_id'])): ?>
                <div class="alert alert-secondary mb-0">คุณครูยังไม่ได้กำหนดชุดข้อสอบสำหรับรอบการเรียนรู้นี้</div>
            <?php elseif (!$status['individual']): ?>
                <div class="alert alert-warning fs-5">
                    <i class="bi bi-person-lock me-2"></i>
                    แบบทดสอบก่อนเรียน–หลังเรียนเป็นการวัดผลรายบุคคล กรุณาเข้าสู่ระบบแบบรายบุคคลเพื่อทำแบบทดสอบ
                </div>
                <a href="login.php" class="btn btn-warning rounded-pill px-4">กลับไปเข้าสู่ระบบรายบุคคล</a>
            <?php elseif (!empty($item['submitted'])): ?>
                <div class="alert alert-success fs-5"><i class="bi bi-check-circle-fill me-2"></i>ส่ง<?php echo htmlspecialchars($label); ?>เรียบร้อยแล้ว</div>
                <a href="assessment_result.php?attempt_id=<?php echo intval($attempt['id']); ?>" class="btn btn-success rounded-pill px-4">ดูสถานะการส่ง</a>
            <?php elseif (empty($item['available'])): ?>
                <div class="alert alert-secondary fs-5"><i class="bi bi-lock-fill me-2"></i><?php echo htmlspecialchars($label); ?>ยังไม่เปิด กรุณารอคุณครูแจ้ง</div>
                <a href="student_dashboard.php" class="btn btn-outline-secondary rounded-pill px-4">กลับหน้าหลัก</a>
            <?php else: ?>
                <div class="row g-3 mb-4">
                    <div class="col-md-4"><div class="bg-light rounded-4 p-3 text-center h-100"><i class="bi bi-list-ol fs-2 text-success"></i><div class="fw-bold fs-5"><?php echo intval($item['questions']); ?> ข้อ</div><small class="text-muted">ปรนัย 4 ตัวเลือก</small></div></div>
                    <div class="col-md-4"><div class="bg-light rounded-4 p-3 text-center h-100"><i class="bi bi-clock fs-2 text-primary"></i><div class="fw-bold fs-5"><?php echo intval($item['minutes']); ?> นาที</div><small class="text-muted">ระบบบันทึกคำตอบระหว่างทำ</small></div></div>
                    <div class="col-md-4"><div class="bg-light rounded-4 p-3 text-center h-100"><i class="bi bi-person fs-2 text-warning"></i><div class="fw-bold fs-5">รายบุคคล</div><small class="text-muted">ตอบด้วยความสามารถของตนเอง</small></div></div>
                </div>
                <ul class="fs-5 lh-lg">
                    <li>อ่านคำถามและตัวเลือกให้ครบก่อนตอบ</li>
                    <li>ย้อนกลับไปแก้คำตอบได้ก่อนกดส่ง</li>
                    <li>ต้องตอบครบทุกข้อจึงจะส่งแบบทดสอบได้</li>
                    <li>หากหน้าเว็บปิด สามารถกลับมาทำต่อจากคำตอบที่บันทึกไว้</li>
                </ul>
                <div class="d-flex flex-wrap gap-2 mt-4">
                    <button id="start-btn" class="btn btn-success btn-lg rounded-pill px-5">
                        <i class="bi bi-play-fill"></i> <?php echo !empty($item['in_progress']) ? 'ทำแบบทดสอบต่อ' : 'เริ่มทำแบบทดสอบ'; ?>
                    </button>
                    <a href="student_dashboard.php" class="btn btn-outline-secondary btn-lg rounded-pill px-4">กลับหน้าหลัก</a>
                </div>
                <div id="start-error" class="text-danger mt-3"></div>
            <?php endif; ?>
        </div>
    </div>
</main>
<?php require __DIR__ . '/../includes/app_scripts.php'; ?>
<script>
const startButton = document.getElementById('start-btn');
if (startButton) {
    startButton.addEventListener('click', async () => {
        startButton.disabled = true;
        const response = await fetch('../api/start_assessment.php', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({type: <?php echo json_encode($type); ?>, csrf_token: <?php echo json_encode(assessment_csrf_token()); ?>})
        });
        const data = await response.json();
        if (data.success) location.href = data.url;
        else {
            document.getElementById('start-error').textContent = data.message || 'ไม่สามารถเริ่มแบบทดสอบได้';
            startButton.disabled = false;
        }
    });
}
</script>
</body>
</html>
