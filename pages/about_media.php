<?php
session_start();
$app = require __DIR__ . '/../config/app.php';
require_once '../includes/media_credit.php';

$backHref = 'login.php';
$backLabel = 'กลับหน้าเข้าสู่ระบบ';
if (isset($_SESSION['user_id'])) {
    if (in_array($_SESSION['role'] ?? '', ['admin', 'super_admin', 'teacher'], true)) {
        $backHref = 'dashboard.php';
        $backLabel = 'กลับ Dashboard ครู';
    } elseif (($_SESSION['role'] ?? '') === 'student' || !empty($_SESSION['visitor_mode'])) {
        $backHref = 'student_dashboard.php';
        $backLabel = 'กลับ Dashboard ผู้เรียน';
    }
}

$mediaRows = [
    'ชื่อสื่อ' => $app['app_name'] . ' - ' . $app['app_short_subtitle'],
    'ชื่อผลงานนวัตกรรม' => $app['innovation_title'],
    'ผู้พัฒนา' => $app['developer_name'],
    'ตำแหน่ง' => $app['developer_position'],
    'โรงเรียน' => $app['school_name'],
    'สังกัด' => $app['developer_affiliation'],
    'กลุ่มสาระ/รายวิชา' => $app['subject_area'],
    'ระดับชั้น' => $app['grade_level'],
    'เทคโนโลยีที่ใช้' => $app['technology_stack'],
    'เวอร์ชันระบบ' => $app['system_version'],
    'ปีลิขสิทธิ์' => $app['release_year_th'],
];
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>เกี่ยวกับสื่อ | <?php echo media_credit_html($app['app_name']); ?></title>




<?php
$page_styles = array (
  0 => 'pages/about_media.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page about-media-page">
    <main class="container py-4 py-lg-5">
        <section class="about-hero mb-4">
            <div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                    <div class="badge bg-warning text-dark rounded-pill px-3 py-2 mb-3">About Media</div>
                    <h1 class="display-5 fw-bold mb-3"><?php echo media_credit_html($app['app_name']); ?></h1>
                    <p class="fs-5 mb-0"><?php echo media_credit_html($app['app_subtitle']); ?></p>
                </div>
                <a href="<?php echo media_credit_html($backHref); ?>" class="btn btn-light rounded-pill fw-bold px-4">
                    <i class="bi bi-arrow-left-circle-fill"></i> <?php echo media_credit_html($backLabel); ?>
                </a>
            </div>
        </section>

        <div class="row g-4">
            <div class="col-lg-7">
                <section class="card about-card h-100">
                    <div class="card-body p-4">
                        <h2 class="h4 fw-bold text-success mb-3"><i class="bi bi-info-circle-fill"></i> ข้อมูลสื่อ</h2>
                        <?php foreach ($mediaRows as $label => $value): ?>
                            <div class="info-row">
                                <div class="info-label"><?php echo media_credit_html($label); ?></div>
                                <div><?php echo media_credit_html($value); ?></div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </section>
            </div>

            <div class="col-lg-5">
                <section class="card about-card h-100">
                    <div class="card-body p-4">
                        <h2 class="h4 fw-bold text-success mb-3"><i class="bi bi-shield-check"></i> ข้อมูลลิขสิทธิ์</h2>
                        <div class="copyright-box"><?php echo media_credit_html(media_credit_full_notice($app)); ?></div>
                    </div>
                </section>
            </div>
        </div>
    </main>

    <?php render_media_credit_footer('about_media.php'); ?>
    <?php require __DIR__ . '/../includes/app_scripts.php'; ?>
</body>
</html>
