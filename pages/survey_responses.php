<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$app = require __DIR__ . '/../config/app.php';
$context = survey_teacher_context($conn);
$report = survey_report_data($conn, $context);
?>
<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>สถานะการตอบแบบสอบถาม | <?php echo htmlspecialchars($app['app_name']); ?></title><?php
$page_styles = array (
  0 => 'pages/survey_responses.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page survey-responses-page"><nav class="navbar navbar-dark bg-success"><div class="container"><span class="navbar-brand fw-bold"><i class="bi bi-people-fill"></i> สถานะการตอบแบบสอบถาม</span><a class="btn btn-light btn-sm rounded-pill" href="survey_report.php?classroom_id=<?php echo $context['classroom_id']; ?>">กลับรายงาน</a></div></nav><main class="container py-4"><div class="card shadow-sm"><div class="card-body p-0"><div class="p-4"><h3 class="fw-bold mb-1"><?php echo htmlspecialchars($context['classroom']['classroom_name']); ?></h3><div class="text-muted">ตอบแล้ว <?php echo $report['summary']['responded']; ?> จาก <?php echo $report['summary']['total_students']; ?> คน</div></div><div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead class="table-light"><tr><th class="ps-4">รหัสนักเรียน</th><th>ชื่อ-นามสกุล</th><th>สถานะ</th><th>เวลาส่ง</th><th>เฉลี่ย</th><th class="text-end pe-4">จัดการ</th></tr></thead><tbody><?php foreach($report['students'] as $student): ?><tr><td class="ps-4 fw-bold text-primary"><?php echo htmlspecialchars($student['student_id']); ?></td><td><?php echo htmlspecialchars($student['name']); ?></td><td><?php if($student['response_id']): ?><span class="badge bg-success">ส่งแล้ว</span><?php else: ?><span class="badge bg-secondary">ยังไม่ส่ง</span><?php endif; ?></td><td><?php echo $student['submitted_at'] ? htmlspecialchars(date('d/m/Y H:i',strtotime($student['submitted_at']))) : '-'; ?></td><td><?php echo $student['response_id'] ? number_format($student['average'],2) : '-'; ?></td><td class="text-end pe-4"><?php if($student['response_id']): ?><button class="btn btn-outline-danger btn-sm rounded-pill" onclick="resetResponse(<?php echo intval($student['response_id']); ?>, <?php echo json_encode($student['name']); ?>)"><i class="bi bi-arrow-counterclockwise"></i> Reset</button><?php else: ?>-<?php endif; ?></td></tr><?php endforeach; ?></tbody></table></div></div></div></main>
<script>async function resetResponse(id,name){if(!confirm(`ยืนยัน Reset คำตอบของ ${name}? นักเรียนจะสามารถตอบใหม่ได้`))return;const response=await fetch('../api/reset_survey_response.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({response_id:id,csrf_token:<?php echo json_encode(survey_csrf_token()); ?>})});const data=await response.json();if(data.success)location.reload();else alert(data.message||'Reset ไม่สำเร็จ');}</script></body></html>
