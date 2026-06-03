<?php
$app = require __DIR__ . '/../config/app.php';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>รออนุมัติบัญชี - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Kanit', sans-serif; min-height: 100vh; background: #f0fdf4; display: flex; align-items: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="mx-auto bg-white rounded-4 shadow-sm p-5 text-center" style="max-width: 620px;">
            <h1 class="fw-bold text-success mb-3">ส่งคำขอสมัครเรียบร้อยแล้ว</h1>
            <p class="fs-5 text-secondary mb-4">บัญชีครูและข้อมูลโรงเรียนของคุณอยู่ระหว่างรอผู้ดูแลระบบอนุมัติ เมื่ออนุมัติแล้วจึงจะเข้าสู่ Dashboard และสร้างห้องเรียนได้</p>
            <a href="login.php" class="btn btn-success rounded-pill px-4 fw-bold">กลับหน้าเข้าสู่ระบบ</a>
        </div>
    </div>
</body>
</html>
