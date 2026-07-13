<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/assessment.php';
$app = require __DIR__ . '/../config/app.php';

require_student_like();
if (!assessment_is_individual()) {
    header('Location: assessment_intro.php?type=pretest');
    exit();
}

$attemptId = intval($_GET['attempt_id'] ?? 0);
$stmt = $conn->prepare("SELECT aa.*, a.title, a.assessment_type, a.time_limit_minutes FROM assessment_attempts aa JOIN assessments a ON a.id = aa.assessment_id WHERE aa.id = ? AND aa.user_id = ? AND aa.learning_session_id = ? LIMIT 1");
$userId = intval($_SESSION['user_id']);
$sessionId = intval($_SESSION['learning_session_id'] ?? 0);
$stmt->bind_param('iii', $attemptId, $userId, $sessionId);
$stmt->execute();
$attempt = $stmt->get_result()->fetch_assoc();
if (!$attempt) {
    http_response_code(404);
    exit('ไม่พบข้อมูลการสอบ');
}
if ($attempt['status'] === 'submitted') {
    header('Location: assessment_result.php?attempt_id=' . $attemptId);
    exit();
}

$questionStmt = $conn->prepare("SELECT q.id, q.question_no, q.question_text, q.choice_a, q.choice_b, q.choice_c, q.choice_d, ans.selected_choice FROM assessment_questions q LEFT JOIN assessment_answers ans ON ans.question_id = q.id AND ans.attempt_id = ? WHERE q.assessment_id = ? AND q.status = 'active' ORDER BY q.question_no");
$questionStmt->bind_param('ii', $attemptId, $attempt['assessment_id']);
$questionStmt->execute();
$questions = $questionStmt->get_result()->fetch_all(MYSQLI_ASSOC);
$startedAt = strtotime($attempt['started_at']);
$deadline = $startedAt + (intval($attempt['time_limit_minutes']) * 60);
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo htmlspecialchars($attempt['title']); ?></title>




<?php
$page_styles = array (
  0 => 'modules/assessment.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="assessment-page app-page assessment-take-page">
<main class="container assessment-shell py-3 py-md-4">
    <div class="card assessment-card sticky-top mb-3">
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center gap-3">
                <div><div class="fw-bold text-success"><?php echo htmlspecialchars($attempt['title']); ?></div><small id="page-label" class="text-muted"></small></div>
                <div class="badge bg-dark fs-6 rounded-pill px-3 py-2"><i class="bi bi-clock"></i> <span id="timer">--:--</span></div>
            </div>
            <div class="progress assessment-progress mt-3"><div id="progress-bar" class="progress-bar bg-success"></div></div>
        </div>
    </div>

    <form id="assessment-form" class="card assessment-card">
        <div class="card-body p-4 p-md-5">
            <?php foreach ($questions as $index => $question): ?>
                <section class="question-panel mb-5" data-index="<?php echo $index; ?>" data-question-id="<?php echo intval($question['id']); ?>">
                    <div class="question-number mb-2">ข้อ <?php echo intval($question['question_no']); ?> จาก <?php echo count($questions); ?></div>
                    <h2 class="question-text fw-semibold mb-4"><?php echo htmlspecialchars($question['question_text']); ?></h2>
                    <div class="d-grid gap-3">
                        <?php foreach (['A' => 'ก', 'B' => 'ข', 'C' => 'ค', 'D' => 'ง'] as $key => $thai): $field = 'choice_' . strtolower($key); ?>
                            <label class="assessment-option <?php echo $question['selected_choice'] === $key ? 'selected' : ''; ?>">
                                <input class="visually-hidden" type="radio" name="answer[<?php echo intval($question['id']); ?>]" value="<?php echo $key; ?>" <?php echo $question['selected_choice'] === $key ? 'checked' : ''; ?>>
                                <span class="choice-letter"><?php echo $thai; ?></span>
                                <span><?php echo htmlspecialchars($question[$field]); ?></span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </section>
            <?php endforeach; ?>
            <div class="border-top pt-4 mt-2">
                <div class="d-flex justify-content-between align-items-center gap-2">
                    <button type="button" id="prev-btn" class="btn btn-outline-secondary assessment-nav-btn"><i class="bi bi-arrow-left"></i> ย้อนกลับ</button>
                    <div class="small text-muted text-center"><span id="save-dot" class="status-dot saved"></span> <span id="save-text">บันทึกแล้ว</span></div>
                    <button type="button" id="next-btn" class="btn btn-success assessment-nav-btn">ถัดไป <i class="bi bi-arrow-right"></i></button>
                    <button type="button" id="submit-btn" class="btn btn-primary assessment-nav-btn d-none"><i class="bi bi-send-fill"></i> ส่งคำตอบ</button>
                </div>
                <div id="form-error" class="alert alert-danger mt-3 d-none"></div>
            </div>
        </div>
    </form>
</main>
<script>
const attemptId = <?php echo $attemptId; ?>;
const csrfToken = <?php echo json_encode(assessment_csrf_token()); ?>;
const deadline = <?php echo $deadline * 1000; ?>;
const panels = [...document.querySelectorAll('.question-panel')];
let page = 0;
let submitting = false;
const pageSize = () => window.matchMedia('(max-width: 575.98px)').matches ? 1 : 5;
const answers = () => Object.fromEntries([...document.querySelectorAll('input[type=radio]:checked')].map(input => [input.name.match(/\d+/)[0], input.value]));

function renderPage() {
    const size = pageSize();
    const pages = Math.max(1, Math.ceil(panels.length / size));
    page = Math.min(page, pages - 1);
    panels.forEach((panel, index) => panel.classList.toggle('active', index >= page * size && index < (page + 1) * size));
    document.getElementById('prev-btn').disabled = page === 0;
    document.getElementById('next-btn').classList.toggle('d-none', page >= pages - 1);
    document.getElementById('submit-btn').classList.toggle('d-none', page < pages - 1);
    document.getElementById('page-label').textContent = `ส่วนที่ ${page + 1} จาก ${pages}`;
    const answered = Object.keys(answers()).length;
    document.getElementById('progress-bar').style.width = `${(answered / panels.length) * 100}%`;
}
window.addEventListener('resize', renderPage);
document.getElementById('prev-btn').addEventListener('click', () => { page--; renderPage(); scrollTo({top:0, behavior:'smooth'}); });
document.getElementById('next-btn').addEventListener('click', () => { page++; renderPage(); scrollTo({top:0, behavior:'smooth'}); });

document.querySelectorAll('.assessment-option input').forEach(input => input.addEventListener('change', async event => {
    const panel = event.target.closest('.question-panel');
    panel.querySelectorAll('.assessment-option').forEach(option => option.classList.remove('selected'));
    event.target.closest('.assessment-option').classList.add('selected');
    document.getElementById('save-dot').classList.remove('saved');
    document.getElementById('save-text').textContent = 'กำลังบันทึก...';
    renderPage();
    try {
        const response = await fetch('../api/save_assessment_answer.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({attempt_id:attemptId, question_id:Number(panel.dataset.questionId), selected_choice:event.target.value, csrf_token:csrfToken})});
        if (!response.ok) throw new Error();
        document.getElementById('save-dot').classList.add('saved');
        document.getElementById('save-text').textContent = 'บันทึกแล้ว';
    } catch (_) { document.getElementById('save-text').textContent = 'บันทึกไม่สำเร็จ กรุณาเลือกใหม่'; }
}));

async function submitAssessment(autoSubmit = false) {
    if (submitting) return;
    const currentAnswers = answers();
    const missing = panels.length - Object.keys(currentAnswers).length;
    const error = document.getElementById('form-error');
    if (missing > 0 && !autoSubmit) {
        error.textContent = `ยังไม่ได้ตอบ ${missing} ข้อ กรุณาตอบให้ครบก่อนส่ง`;
        error.classList.remove('d-none'); return;
    }
    if (missing > 0 && autoSubmit) {
        error.textContent = 'หมดเวลาแล้ว แต่ยังตอบไม่ครบ กรุณาเลือกคำตอบที่เหลือก่อนส่ง';
        error.classList.remove('d-none'); return;
    }
    if (!autoSubmit && !confirm('ยืนยันส่งแบบทดสอบหรือไม่? เมื่อส่งแล้วจะแก้ไขคำตอบไม่ได้')) return;
    submitting = true;
    document.querySelectorAll('button').forEach(button => button.disabled = true);
    const response = await fetch('../api/submit_assessment.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({attempt_id:attemptId, answers:currentAnswers, csrf_token:csrfToken})});
    const data = await response.json();
    if (data.success) location.href = data.url;
    else {
        submitting = false; document.querySelectorAll('button').forEach(button => button.disabled = false);
        error.textContent = data.message || 'ส่งแบบทดสอบไม่สำเร็จ'; error.classList.remove('d-none');
    }
}
document.getElementById('submit-btn').addEventListener('click', () => submitAssessment(false));
setInterval(() => {
    const left = Math.max(0, deadline - Date.now());
    const minutes = Math.floor(left / 60000), seconds = Math.floor((left % 60000) / 1000);
    document.getElementById('timer').textContent = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
    if (left === 0) submitAssessment(true);
}, 1000);
renderPage();
</script>
</body>
</html>
