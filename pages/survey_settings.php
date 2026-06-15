<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$app = require __DIR__ . '/../config/app.php';
$context = survey_teacher_context($conn);
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!survey_verify_csrf($_POST['csrf_token'] ?? null)) { http_response_code(419); exit('คำขอหมดอายุ'); }
    $surveyId = intval($_POST['survey_id'] ?? 0) ?: null;
    $surveyStatus = in_array($_POST['survey_status'] ?? '', ['locked','open','closed'], true) ? $_POST['survey_status'] : 'locked';
    $requiredAfterPosttest = isset($_POST['required_after_posttest']) ? 1 : 0;
    $allowEdit = isset($_POST['allow_edit']) ? 1 : 0;
    $showSummary = isset($_POST['show_summary_to_student']) ? 1 : 0;
    $stmt = $conn->prepare(
        "INSERT INTO survey_settings (learning_session_id,survey_id,survey_status,required_after_posttest,allow_edit,show_summary_to_student)
         VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE survey_id=VALUES(survey_id),survey_status=VALUES(survey_status),required_after_posttest=VALUES(required_after_posttest),allow_edit=VALUES(allow_edit),show_summary_to_student=VALUES(show_summary_to_student)"
    );
    $stmt->bind_param('iisiii', $context['learning_session_id'], $surveyId, $surveyStatus, $requiredAfterPosttest, $allowEdit, $showSummary);
    $stmt->execute();
    $message = 'บันทึกการตั้งค่าแบบสอบถามเรียบร้อยแล้ว';
}

$settings = survey_settings($conn, $context['learning_session_id']) ?: [];
$surveys = $conn->query("SELECT s.*, (SELECT COUNT(*) FROM survey_questions q WHERE q.survey_id=s.id AND q.status='active') question_count, (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id=s.id AND r.status='submitted') response_count FROM surveys s WHERE s.status IN ('active','draft') ORDER BY s.survey_type,s.id DESC")->fetch_all(MYSQLI_ASSOC);
?>
<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ตั้งค่าแบบสอบถาม | <?php echo htmlspecialchars($app['app_name']); ?></title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"><link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet"><style>body{font-family:Kanit,sans-serif;background:#f1f5f9}.rounded-4{border-radius:1rem!important}</style></head>
<body><nav class="navbar navbar-dark bg-success"><div class="container"><span class="navbar-brand fw-bold"><i class="bi bi-sliders"></i> ตั้งค่าแบบสอบถาม</span><a class="btn btn-light btn-sm rounded-pill" href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>">กลับ Dashboard</a></div></nav>
<main class="container py-4"><div class="mb-4"><h3 class="fw-bold mb-1"><?php echo htmlspecialchars($context['classroom']['classroom_name']); ?></h3><div class="text-muted"><?php echo htmlspecialchars($context['learning_session']['session_name'] ?? 'รอบการเรียนรู้หลัก'); ?></div></div>
<?php if ($message): ?><div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div><?php endif; ?>
<form method="post" class="card border-0 shadow-sm rounded-4"><div class="card-body p-4 p-md-5"><input type="hidden" name="csrf_token" value="<?php echo survey_csrf_token(); ?>">
<div class="mb-4"><label class="form-label fw-bold">ชุดแบบสอบถาม</label><select name="survey_id" class="form-select form-select-lg" required><option value="">เลือกแบบสอบถาม</option><?php foreach($surveys as $survey): ?><option value="<?php echo $survey['id']; ?>" <?php echo intval($settings['survey_id'] ?? 0) === intval($survey['id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($survey['title'].' '.$survey['version_label'].' ('.$survey['question_count'].' ข้อ)'); ?></option><?php endforeach; ?></select></div>
<div class="mb-4"><label class="form-label fw-bold">สถานะรับคำตอบ</label><div class="row g-2"><?php foreach(['locked'=>['ล็อก','ยังไม่เปิดให้นักเรียนตอบ','secondary'],'open'=>['เปิดรับ','นักเรียนที่ผ่านเงื่อนไขตอบได้','success'],'closed'=>['ปิดรับ','สิ้นสุดการเก็บข้อมูล','danger']] as $value=>$option): ?><div class="col-md-4"><input class="btn-check" type="radio" name="survey_status" id="status-<?php echo $value; ?>" value="<?php echo $value; ?>" <?php echo ($settings['survey_status'] ?? 'locked') === $value ? 'checked' : ''; ?>><label class="btn btn-outline-<?php echo $option[2]; ?> w-100 text-start p-3 rounded-4" for="status-<?php echo $value; ?>"><strong><?php echo $option[0]; ?></strong><br><small><?php echo $option[1]; ?></small></label></div><?php endforeach; ?></div></div>
<div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" name="required_after_posttest" id="required" <?php echo !empty($settings['required_after_posttest']) ? 'checked' : ''; ?>><label class="form-check-label fw-semibold" for="required">ให้ตอบได้หลังส่ง Post-test แล้วเท่านั้น</label></div>
<div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" name="allow_edit" id="allow-edit" <?php echo !empty($settings['allow_edit']) ? 'checked' : ''; ?>><label class="form-check-label fw-semibold" for="allow-edit">อนุญาตให้นักเรียนแก้ไขคำตอบหลังส่ง</label></div>
<div class="form-check form-switch mb-4"><input class="form-check-input" type="checkbox" name="show_summary_to_student" id="show-summary" <?php echo !empty($settings['show_summary_to_student']) ? 'checked' : ''; ?>><label class="form-check-label fw-semibold" for="show-summary">บันทึกตัวเลือกแสดงสรุปให้นักเรียน (ค่าเริ่มต้นยังแสดงเฉพาะสถานะ)</label></div>
<button class="btn btn-success btn-lg rounded-pill px-5"><i class="bi bi-save"></i> บันทึกการตั้งค่า</button></div></form></main></body></html>
