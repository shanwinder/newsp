<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/survey.php';
$app = require __DIR__ . '/../config/app.php';

require_student_like();
$userId = intval($_SESSION['user_id']);
$context = session_context();
$status = survey_student_status($conn, $userId, $context);
if (!$status['individual']) {
    header('Location: survey_start.php');
    exit();
}
if (!$status['available'] || ($status['submitted'] && !$status['allow_edit'])) {
    header('Location: ' . ($status['submitted'] ? 'survey_thankyou.php' : 'survey_start.php'));
    exit();
}

$questions = survey_questions($conn, intval($status['survey_id']));
$savedAnswers = [];
if ($status['response']) {
    $answerStmt = $conn->prepare("SELECT question_id, rating_value, text_answer FROM survey_answers WHERE response_id=?");
    $answerStmt->bind_param('i', $status['response']['id']);
    $answerStmt->execute();
    $answerRows = $answerStmt->get_result();
    while ($answer = $answerRows->fetch_assoc()) $savedAnswers[intval($answer['question_id'])] = $answer;
}

$sections = [];
foreach ($questions as $question) {
    $key = $question['question_type'] === 'open_text' ? 'open_feedback' : $question['category_key'];
    if (!isset($sections[$key])) {
        $sections[$key] = ['name' => $question['category_name'], 'questions' => []];
    }
    $sections[$key]['questions'][] = $question;
}
$ratingLabels = [1 => 'เห็นด้วยน้อยที่สุด', 2 => 'เห็นด้วยน้อย', 3 => 'ปานกลาง', 4 => 'เห็นด้วยมาก', 5 => 'เห็นด้วยมากที่สุด'];
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ตอบแบบสอบถามความพึงพอใจ | <?php echo htmlspecialchars($app['app_name']); ?></title>




<?php
$page_styles = array (
  0 => 'modules/survey.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="survey-page app-page survey-take-page">
<main class="container survey-shell py-3 py-md-4">
    <div class="card survey-card sticky-top mb-3">
        <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center gap-3">
                <div><div class="fw-bold text-success">แบบสอบถามความพึงพอใจ</div><small id="section-label" class="text-muted"></small></div>
                <div class="badge bg-success fs-6 rounded-pill px-3 py-2"><span id="answered-count">0</span>/15 ข้อ</div>
            </div>
            <div class="progress survey-progress mt-3"><div id="progress-bar" class="progress-bar bg-success"></div></div>
        </div>
    </div>

    <form id="survey-form" class="card survey-card">
        <div class="card-body p-4 p-md-5">
            <?php foreach (array_values($sections) as $sectionIndex => $section): ?>
                <section class="survey-section" data-index="<?php echo $sectionIndex; ?>">
                    <div class="mb-4">
                        <span class="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2">ส่วนที่ <?php echo $sectionIndex + 1; ?> จาก <?php echo count($sections); ?></span>
                        <h2 class="fw-bold mt-3 mb-1"><?php echo htmlspecialchars($section['name']); ?></h2>
                        <p class="text-muted"><?php echo $sectionIndex < 5 ? 'เลือกคะแนนที่ตรงกับความคิดเห็นของนักเรียนมากที่สุด' : 'เขียนความคิดเห็นเพิ่มเติมได้ตามต้องการ'; ?></p>
                    </div>
                    <div class="d-grid gap-4">
                    <?php foreach ($section['questions'] as $question): $questionId = intval($question['id']); $saved = $savedAnswers[$questionId] ?? null; ?>
                        <div class="survey-question" data-question-id="<?php echo $questionId; ?>" data-required="<?php echo intval($question['required']); ?>" data-type="<?php echo htmlspecialchars($question['question_type']); ?>">
                            <div class="fw-semibold fs-5 mb-3"><?php echo $question['question_type'] === 'rating' ? 'ข้อ ' . intval($question['question_no']) . '. ' : ''; ?><?php echo htmlspecialchars($question['question_text']); ?></div>
                            <?php if ($question['question_type'] === 'rating'): ?>
                                <div class="rating-grid">
                                    <?php foreach ($ratingLabels as $value => $label): ?>
                                        <label class="rating-choice <?php echo intval($saved['rating_value'] ?? 0) === $value ? 'selected' : ''; ?>">
                                            <input class="visually-hidden" type="radio" name="rating[<?php echo $questionId; ?>]" value="<?php echo $value; ?>" <?php echo intval($saved['rating_value'] ?? 0) === $value ? 'checked' : ''; ?>>
                                            <span class="rating-score"><?php echo $value; ?></span><span class="rating-label"><?php echo htmlspecialchars($label); ?></span>
                                        </label>
                                    <?php endforeach; ?>
                                </div>
                            <?php else: ?>
                                <textarea name="text[<?php echo $questionId; ?>]" class="form-control rounded-4" rows="5" maxlength="3000" placeholder="เขียนความคิดเห็นของนักเรียนที่นี่ (ไม่บังคับ)"><?php echo htmlspecialchars($saved['text_answer'] ?? ''); ?></textarea>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                    </div>
                </section>
            <?php endforeach; ?>

            <div class="border-top pt-4 mt-4">
                <div class="d-flex justify-content-between gap-2">
                    <button type="button" id="prev-btn" class="btn btn-outline-secondary survey-nav-btn"><i class="bi bi-arrow-left"></i> ย้อนกลับ</button>
                    <button type="button" id="next-btn" class="btn btn-success survey-nav-btn">ถัดไป <i class="bi bi-arrow-right"></i></button>
                    <button type="button" id="submit-btn" class="btn btn-primary survey-nav-btn d-none"><i class="bi bi-send-fill"></i> ส่งแบบสอบถาม</button>
                </div>
                <div id="form-error" class="alert alert-danger mt-3 d-none"></div>
            </div>
        </div>
    </form>
</main>
<script>
const csrfToken = <?php echo json_encode(survey_csrf_token()); ?>;
const sections = [...document.querySelectorAll('.survey-section')];
const requiredQuestions = [...document.querySelectorAll('[data-type="rating"][data-required="1"]')];
let currentSection = 0;
let submitting = false;

function selectedRatings() {
    return Object.fromEntries([...document.querySelectorAll('input[type=radio]:checked')].map(input => [input.name.match(/\d+/)[0], Number(input.value)]));
}
function render() {
    sections.forEach((section, index) => section.classList.toggle('active', index === currentSection));
    document.getElementById('prev-btn').disabled = currentSection === 0;
    document.getElementById('next-btn').classList.toggle('d-none', currentSection === sections.length - 1);
    document.getElementById('submit-btn').classList.toggle('d-none', currentSection !== sections.length - 1);
    document.getElementById('section-label').textContent = `ส่วนที่ ${currentSection + 1} จาก ${sections.length}`;
    const answered = Object.keys(selectedRatings()).length;
    document.getElementById('answered-count').textContent = answered;
    document.getElementById('progress-bar').style.width = `${(answered / requiredQuestions.length) * 100}%`;
}
document.querySelectorAll('.rating-choice input').forEach(input => input.addEventListener('change', event => {
    const grid = event.target.closest('.rating-grid');
    grid.querySelectorAll('.rating-choice').forEach(choice => choice.classList.remove('selected'));
    event.target.closest('.rating-choice').classList.add('selected');
    document.getElementById('form-error').classList.add('d-none');
    render();
}));
document.getElementById('prev-btn').addEventListener('click', () => { currentSection--; render(); scrollTo({top:0, behavior:'smooth'}); });
document.getElementById('next-btn').addEventListener('click', () => {
    const currentMissing = [...sections[currentSection].querySelectorAll('[data-type="rating"][data-required="1"]')]
        .filter(question => !question.querySelector('input:checked'));
    if (currentMissing.length) {
        const error = document.getElementById('form-error');
        error.textContent = `กรุณาตอบคำถามในส่วนนี้ให้ครบอีก ${currentMissing.length} ข้อ`;
        error.classList.remove('d-none');
        currentMissing[0].scrollIntoView({behavior:'smooth', block:'center'});
        return;
    }
    currentSection++; render(); scrollTo({top:0, behavior:'smooth'});
});
document.getElementById('submit-btn').addEventListener('click', async () => {
    if (submitting) return;
    const ratings = selectedRatings();
    const missing = requiredQuestions.length - Object.keys(ratings).length;
    const error = document.getElementById('form-error');
    if (missing > 0) {
        error.textContent = `ยังไม่ได้ตอบ ${missing} ข้อ กรุณาตอบให้ครบก่อนส่ง`;
        error.classList.remove('d-none'); return;
    }
    if (!confirm('ยืนยันส่งแบบสอบถามหรือไม่?')) return;
    submitting = true;
    document.querySelectorAll('button').forEach(button => button.disabled = true);
    const textAnswers = Object.fromEntries([...document.querySelectorAll('textarea[name^="text"]')].map(input => [input.name.match(/\d+/)[0], input.value.trim()]));
    try {
        const response = await fetch('../api/submit_survey.php', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ratings, text_answers:textAnswers, csrf_token:csrfToken})});
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'ส่งแบบสอบถามไม่สำเร็จ');
        location.href = data.url;
    } catch (submitError) {
        submitting = false;
        document.querySelectorAll('button').forEach(button => button.disabled = false);
        error.textContent = submitError.message; error.classList.remove('d-none');
    }
});
render();
</script>
</body>
</html>
