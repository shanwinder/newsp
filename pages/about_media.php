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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            min-height: 100vh;
            margin: 0;
            font-family: 'Kanit', sans-serif;
            color: #163124;
            background:
                linear-gradient(135deg, rgba(240,253,244,.94), rgba(255,251,235,.92)),
                url('../assets/img/bg_farm.webp') center/cover fixed;
        }

        .about-hero {
            background: linear-gradient(135deg, #14532d, #22c55e);
            color: #fff;
            border-radius: 26px;
            padding: clamp(28px, 5vw, 54px);
            box-shadow: 0 24px 70px rgba(20, 83, 45, .22);
        }

        .about-card {
            border: 0;
            border-radius: 18px;
            box-shadow: 0 16px 46px rgba(15, 23, 42, .08);
        }

        .info-row {
            display: grid;
            grid-template-columns: minmax(170px, .34fr) 1fr;
            gap: 14px;
            padding: 14px 0;
            border-bottom: 1px solid rgba(20, 83, 45, .10);
        }

        .info-row:last-child {
            border-bottom: 0;
        }

        .info-label {
            color: #166534;
            font-weight: 800;
        }

        .copyright-box {
            white-space: pre-line;
            background: #f0fdf4;
            border: 1px solid rgba(22, 101, 52, .18);
            border-left: 6px solid #16a34a;
            border-radius: 16px;
            padding: 20px;
            color: #14532d;
            line-height: 1.8;
        }

        @media (max-width: 720px) {
            .info-row {
                grid-template-columns: 1fr;
                gap: 4px;
            }
        }
    </style>
</head>
<body>
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
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
