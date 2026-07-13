<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$context = assessment_teacher_context($conn);
$message = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!assessment_verify_csrf($_POST['csrf_token'] ?? null)) {
        http_response_code(419); exit('คำขอหมดอายุ');
    }
    $preId = intval($_POST['pretest_assessment_id'] ?? 0) ?: null;
    $postId = intval($_POST['posttest_assessment_id'] ?? 0) ?: null;
    $preStatus = ($_POST['pretest_status'] ?? '') === 'unlocked' ? 'unlocked' : 'locked';
    $postStatus = ($_POST['posttest_status'] ?? '') === 'unlocked' ? 'unlocked' : 'locked';
    $preRequired = isset($_POST['pretest_required']) ? 1 : 0;
    $postRequired = isset($_POST['posttest_required']) ? 1 : 0;
    $showScore = isset($_POST['show_score_to_student']) ? 1 : 0;
    $allowRetake = isset($_POST['allow_retake']) ? 1 : 0;
    $stmt = $conn->prepare("INSERT INTO assessment_settings (learning_session_id, pretest_assessment_id, posttest_assessment_id, pretest_status, posttest_status, pretest_required, posttest_required, show_score_to_student, allow_retake) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE pretest_assessment_id=VALUES(pretest_assessment_id), posttest_assessment_id=VALUES(posttest_assessment_id), pretest_status=VALUES(pretest_status), posttest_status=VALUES(posttest_status), pretest_required=VALUES(pretest_required), posttest_required=VALUES(posttest_required), show_score_to_student=VALUES(show_score_to_student), allow_retake=VALUES(allow_retake)");
    $stmt->bind_param('iiissiiii', $context['learning_session_id'], $preId, $postId, $preStatus, $postStatus, $preRequired, $postRequired, $showScore, $allowRetake);
    $stmt->execute();
    $message = 'บันทึกการตั้งค่าการสอบแล้ว';
}

$settings = assessment_settings($conn, $context['learning_session_id']) ?: [];
if (is_super_admin()) {
    $assessmentStmt = $conn->prepare("SELECT id, assessment_type, title, version_label, total_questions FROM assessments WHERE status='active' ORDER BY assessment_type,id DESC");
} else {
    $assessmentStmt = $conn->prepare("SELECT id, assessment_type, title, version_label, total_questions FROM assessments WHERE status='active' AND (created_by IS NULL OR created_by=?) ORDER BY assessment_type,id DESC");
    $assessmentStmt->bind_param('i', $_SESSION['user_id']);
}
$assessmentStmt->execute();
$assessments = $assessmentStmt->get_result()->fetch_all(MYSQLI_ASSOC);
?>
<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ตั้งค่าการสอบ</title>
<?php
$page_styles = array (
  0 => 'pages/assessment_settings.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head><body class="app-page assessment-settings-page">
<nav class="navbar navbar-dark bg-primary"><div class="container"><span class="navbar-brand fw-bold"><i class="bi bi-sliders"></i> ตั้งค่าการสอบ</span><a class="btn btn-light btn-sm rounded-pill" href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>">กลับ Dashboard</a></div></nav>
<main class="assessment-settings-main container py-4"><div class="mb-4"><h3 class="fw-bold"><?php echo htmlspecialchars($context['classroom']['classroom_name']); ?></h3><div class="text-muted"><?php echo htmlspecialchars($context['learning_session']['session_name']); ?></div></div>
<?php if ($message): ?><div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div><?php endif; ?>
<form method="post" class="card shadow-sm"><div class="card-body p-4 p-md-5"><input type="hidden" name="csrf_token" value="<?php echo assessment_csrf_token(); ?>">
<?php foreach (['pretest'=>'ก่อนเรียน','posttest'=>'หลังเรียน'] as $type=>$thai): ?>
<section class="mb-4 pb-4 border-bottom"><h4 class="fw-bold text-<?php echo $type === 'pretest' ? 'success' : 'primary'; ?>">แบบทดสอบ<?php echo $thai; ?></h4>
<label class="form-label">ชุดข้อสอบ</label><select class="form-select form-select-lg mb-3" name="<?php echo $type; ?>_assessment_id"><option value="">-- ยังไม่กำหนด --</option><?php foreach ($assessments as $a): if ($a['assessment_type'] !== $type) continue; ?><option value="<?php echo $a['id']; ?>" <?php echo intval($settings[$type.'_assessment_id'] ?? 0) === intval($a['id']) ? 'selected' : ''; ?>><?php echo htmlspecialchars($a['title'].' ('.$a['total_questions'].' ข้อ)'); ?></option><?php endforeach; ?></select>
<div class="row"><div class="col-md-6"><label class="form-label">สถานะ</label><select class="form-select" name="<?php echo $type; ?>_status"><option value="locked" <?php echo ($settings[$type.'_status'] ?? '') !== 'unlocked' ? 'selected':''; ?>>ล็อก</option><option value="unlocked" <?php echo ($settings[$type.'_status'] ?? '') === 'unlocked' ? 'selected':''; ?>>เปิดให้ทำ</option></select></div><div class="col-md-6 d-flex align-items-end"><div class="form-check form-switch mb-2"><input class="form-check-input" type="checkbox" name="<?php echo $type; ?>_required" id="<?php echo $type; ?>_required" <?php echo !empty($settings[$type.'_required']) ? 'checked':''; ?>><label class="form-check-label" for="<?php echo $type; ?>_required">กำหนดเป็นงานบังคับ</label></div></div></div>
</section><?php endforeach; ?>
<div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" name="show_score_to_student" id="show_score" <?php echo !empty($settings['show_score_to_student'])?'checked':''; ?>><label class="form-check-label" for="show_score">แสดงคะแนนรวมให้นักเรียนหลังส่ง (ไม่แสดงเฉลย)</label></div>
<div class="form-check form-switch mb-4"><input class="form-check-input" type="checkbox" name="allow_retake" id="retake" <?php echo !empty($settings['allow_retake'])?'checked':''; ?>><label class="form-check-label" for="retake">อนุญาตให้เริ่มสอบครั้งใหม่หลังส่งแล้ว</label></div>
<button class="btn btn-primary btn-lg rounded-pill px-5"><i class="bi bi-save"></i> บันทึกการตั้งค่า</button></div></form></main></body></html>
