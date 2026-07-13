<?php
$app = require __DIR__ . '/../config/app.php';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>รออนุมัติบัญชี - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">



<?php
$page_styles = array (
  0 => 'pages/pending_approval.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page pending-approval-page">
    <div class="container">
        <div class="pending-card mx-auto bg-white rounded-4 shadow-sm p-5 text-center">
            <h1 class="fw-bold text-success mb-3">ส่งคำขอสมัครเรียบร้อยแล้ว</h1>
            <p class="fs-5 text-secondary mb-4">บัญชีครูและข้อมูลโรงเรียนของคุณอยู่ระหว่างรอผู้ดูแลระบบอนุมัติ เมื่ออนุมัติแล้วจึงจะเข้าสู่ Dashboard และสร้างห้องเรียนได้</p>
            <a href="login.php" class="btn btn-success rounded-pill px-4 fw-bold">กลับหน้าเข้าสู่ระบบ</a>
        </div>
    </div>
</body>
</html>
