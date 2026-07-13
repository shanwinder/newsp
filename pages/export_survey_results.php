<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$app = require __DIR__ . '/../config/app.php';
require_once '../includes/media_credit.php';
$context = survey_teacher_context($conn);
?>
<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Export แบบสอบถาม | <?php echo htmlspecialchars($app['app_name']); ?></title><?php
$page_styles = array (
  0 => 'pages/export_survey_results.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page export-survey-results-page"><nav class="navbar navbar-dark bg-success"><div class="container"><span class="navbar-brand fw-bold"><i class="bi bi-filetype-csv"></i> Export ผลแบบสอบถาม</span><a class="btn btn-light btn-sm rounded-pill" href="survey_report.php?classroom_id=<?php echo $context['classroom_id']; ?>">กลับรายงาน</a></div></nav><main class="container py-5"><h2 class="fw-bold mb-1">เลือกชุดข้อมูลที่ต้องการ</h2><p class="text-muted mb-4"><?php echo htmlspecialchars($context['classroom']['classroom_name']); ?> ไฟล์ CSV รองรับการเปิดด้วย Excel</p><?php render_media_credit_notice(); ?><div class="row g-4">
<?php foreach([['individual','รายงานรายบุคคล','คะแนนข้อ 1-15 ค่าเฉลี่ย ระดับ และความคิดเห็น','bi-person-lines-fill','primary'],['category','รายงานรายด้าน','ค่าเฉลี่ย S.D. ระดับ และจำนวนผู้ตอบทั้ง 5 ด้าน','bi-bar-chart-fill','success'],['comments','ความคิดเห็นปลายเปิด','รหัส ชื่อ สิ่งที่ชอบ และสิ่งที่ควรปรับปรุง','bi-chat-quote-fill','warning']] as $item): ?><div class="col-md-4"><div class="card export-card shadow-sm h-100"><div class="card-body p-4"><i class="bi <?php echo $item[3]; ?> display-4 text-<?php echo $item[4]; ?>"></i><h4 class="fw-bold mt-3"><?php echo $item[1]; ?></h4><p class="text-muted"><?php echo $item[2]; ?></p><a class="btn btn-<?php echo $item[4]; ?> rounded-pill px-4" href="../api/export_survey_results.php?classroom_id=<?php echo $context['classroom_id']; ?>&type=<?php echo $item[0]; ?>"><i class="bi bi-download"></i> ดาวน์โหลด CSV</a></div></div></div><?php endforeach; ?>
</div><?php render_media_credit_footer('about_media.php'); ?></main></body></html>
