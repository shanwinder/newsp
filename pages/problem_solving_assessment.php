<?php

session_start();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/problem_solving_assessment.php';

require_teacher_or_admin();
ensure_active_account($conn);

$requestedClassroomId = isset($_GET['classroom_id']) ? (int) $_GET['classroom_id'] : null;
$context = problem_solving_teacher_context($conn, $requestedClassroomId);
if (!$context) {
    header('Location: classrooms.php');
    exit;
}

$lessons = require __DIR__ . '/../config/lessons.php';
$rubric = problem_solving_rubric();
$students = problem_solving_students_with_statuses($conn, $context, $rubric['version']);
$lessonId = isset($lessons[(int) ($_GET['lesson_id'] ?? 1)]) ? (int) ($_GET['lesson_id'] ?? 1) : 1;
$requestedStudentId = (int) ($_GET['student_id'] ?? 0);
$studentIds = array_column($students, 'id');
$studentId = in_array($requestedStudentId, $studentIds, true) ? $requestedStudentId : (int) ($studentIds[0] ?? 0);

function problem_solving_page_h(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>ประเมินทักษะการแก้ปัญหา</title>
<?php
$page_styles = ['pages/problem_solving_assessment.css'];
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page problem-solving-assessment-page">
    <nav class="navbar navbar-dark bg-primary shadow-sm sticky-top">
        <div class="container-fluid px-lg-4">
            <a class="navbar-brand fw-bold" href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>">
                <i class="bi bi-clipboard2-heart-fill me-2"></i>ประเมินทักษะ
            </a>
            <div class="d-flex gap-2">
                <a class="btn btn-light btn-sm rounded-pill fw-bold text-primary" href="problem_solving_report.php?classroom_id=<?php echo $context['classroom_id']; ?>">
                    <i class="bi bi-graph-up-arrow"></i> รายงาน
                </a>
                <a class="btn btn-outline-light btn-sm rounded-pill" href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>">Dashboard</a>
            </div>
        </div>
    </nav>

    <header class="assessment-context border-bottom bg-white">
        <div class="container-fluid px-lg-4 py-3">
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <div class="text-muted small"><?php echo problem_solving_page_h($context['classroom']['school_name']); ?></div>
                    <h1 class="h4 fw-bold text-primary mb-1"><?php echo problem_solving_page_h($context['classroom']['classroom_name']); ?></h1>
                    <div class="small text-secondary"><?php echo problem_solving_page_h($context['learning_session']['session_name'] ?? ''); ?> · รูบริกเวอร์ชัน <?php echo problem_solving_page_h($rubric['version']); ?></div>
                </div>
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <button class="btn btn-outline-primary d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#studentOffcanvas">
                        <i class="bi bi-people-fill"></i> เลือกนักเรียน
                    </button>
                    <label for="lesson-select" class="fw-bold mb-0">บทเรียน</label>
                    <select id="lesson-select" class="form-select lesson-select" aria-label="เลือกบทเรียน">
                        <?php foreach ($lessons as $id => $lesson): ?>
                            <option value="<?php echo $id; ?>" <?php echo $id === $lessonId ? 'selected' : ''; ?>>บทที่ <?php echo $id; ?>: <?php echo problem_solving_page_h($lesson['title']); ?></option>
                        <?php endforeach; ?>
                    </select>
                    <span id="completion-count" class="badge rounded-pill text-bg-success">0/<?php echo count($students); ?> ยืนยันแล้ว</span>
                </div>
            </div>
        </div>
    </header>

    <div class="assessment-layout">
        <aside class="student-sidebar d-none d-lg-flex" aria-label="รายชื่อนักเรียน">
            <div class="sidebar-title"><i class="bi bi-people-fill"></i> รายชื่อนักเรียน</div>
            <div id="desktop-student-list" class="student-list"></div>
        </aside>

        <main class="assessment-main">
            <?php if ($students === []): ?>
                <div class="alert alert-warning m-4">ยังไม่มีนักเรียนที่ใช้งานอยู่ในห้องเรียนนี้</div>
            <?php else: ?>
                <div id="loading-state" class="text-center py-5" role="status">
                    <div class="spinner-border text-primary mb-3"></div>
                    <div>กำลังโหลดแบบประเมิน...</div>
                </div>

                <div id="assessment-content" class="d-none">
                    <section class="student-heading card border-0 shadow-sm rounded-4 mb-3">
                        <div class="card-body d-flex flex-wrap justify-content-between align-items-start gap-3">
                            <div>
                                <div class="small text-muted">กำลังประเมิน</div>
                                <h2 id="student-name" class="h3 fw-bold text-primary mb-1"></h2>
                                <div id="student-meta" class="text-secondary"></div>
                            </div>
                            <div class="text-end">
                                <div id="status-badge" class="status-badge status-not-started"><i class="bi bi-circle"></i> ยังไม่เริ่ม</div>
                                <div id="evaluation-time" class="small text-muted mt-2"></div>
                            </div>
                        </div>
                    </section>

                    <section class="evidence-panel card border-0 shadow-sm rounded-4 mb-4" aria-labelledby="evidence-title">
                        <div class="card-header bg-white border-0 pt-3 px-3 px-lg-4">
                            <h2 id="evidence-title" class="h5 fw-bold mb-0"><i class="bi bi-search text-info"></i> หลักฐานประกอบการพิจารณา</h2>
                            <div class="small text-muted">ข้อมูลต่อไปนี้เป็นหลักฐานประกอบ ครูยังเป็นผู้ตัดสินคะแนนตามรูบริก</div>
                        </div>
                        <div class="card-body px-3 px-lg-4">
                            <div class="evidence-grid">
                                <div class="evidence-stat"><span>ดาวจากเกม</span><strong id="game-score">0</strong></div>
                                <div class="evidence-stat"><span>ด่านที่จบ</span><strong id="stages-completed">0</strong></div>
                                <div class="evidence-stat"><span>จำนวนครั้งที่ลอง</span><strong id="attempts">0</strong></div>
                                <div class="evidence-stat"><span>สถานะชิ้นงาน</span><strong id="work-status">ยังไม่ส่ง</strong></div>
                            </div>
                            <div class="row g-3 mt-1">
                                <div class="col-md-6"><div class="evidence-text"><span>คำอธิบายชิ้นงาน</span><p id="work-description">-</p></div></div>
                                <div class="col-md-6"><div class="evidence-text"><span>ข้อเสนอแนะเดิมของครู</span><p id="teacher-feedback">-</p></div></div>
                            </div>
                        </div>
                    </section>

                    <div id="save-message" class="save-message" aria-live="polite"></div>
                    <form id="assessment-form" novalidate>
                        <?php $domainNo = 0; ?>
                        <?php foreach ($rubric['domains'] as $domainKey => $domain): $domainNo++; ?>
                            <section class="rubric-domain card border-0 shadow-sm rounded-4 mb-4" data-domain="<?php echo problem_solving_page_h($domainKey); ?>">
                                <div class="card-header border-0 domain-header">
                                    <div class="domain-number"><?php echo $domainNo; ?></div>
                                    <div><div class="small opacity-75">ด้านที่ <?php echo $domainNo; ?></div><h2 class="h5 fw-bold mb-0"><?php echo problem_solving_page_h($domain['label']); ?></h2></div>
                                    <div class="domain-live-mean ms-auto"><span>ค่าเฉลี่ย</span><strong data-domain-mean="<?php echo problem_solving_page_h($domainKey); ?>">-</strong></div>
                                </div>
                                <div class="card-body p-0">
                                    <?php $itemNo = 0; ?>
                                    <?php foreach ($domain['items'] as $itemKey => $itemLabel): $itemNo++; ?>
                                        <fieldset class="rubric-item p-3 p-lg-4" data-item="<?php echo problem_solving_page_h($itemKey); ?>" data-domain="<?php echo problem_solving_page_h($domainKey); ?>">
                                            <legend class="item-legend"><span><?php echo $domainNo; ?>.<?php echo $itemNo; ?></span><?php echo problem_solving_page_h($itemLabel); ?></legend>
                                            <div class="score-options" role="radiogroup" aria-label="คะแนนข้อ <?php echo $domainNo; ?>.<?php echo $itemNo; ?>">
                                                <?php foreach ([4, 3, 2, 1] as $score): ?>
                                                    <input class="btn-check rubric-control score-radio" type="radio" name="score_<?php echo problem_solving_page_h($itemKey); ?>" id="score_<?php echo problem_solving_page_h($itemKey); ?>_<?php echo $score; ?>" value="<?php echo $score; ?>" data-item="<?php echo problem_solving_page_h($itemKey); ?>" autocomplete="off">
                                                    <label class="btn score-button score-<?php echo $score; ?>" for="score_<?php echo problem_solving_page_h($itemKey); ?>_<?php echo $score; ?>" aria-label="ข้อ <?php echo $domainNo; ?>.<?php echo $itemNo; ?> ระดับ <?php echo $score; ?> คะแนน">
                                                        <strong><?php echo $score; ?></strong><span>คะแนน</span>
                                                    </label>
                                                <?php endforeach; ?>
                                            </div>
                                            <div class="selected-descriptor" data-descriptor-for="<?php echo problem_solving_page_h($itemKey); ?>" aria-live="polite">เลือกคะแนนเพื่อดูคำอธิบายระดับพฤติกรรม</div>
                                            <label class="form-label small fw-bold mt-3" for="note_<?php echo problem_solving_page_h($itemKey); ?>">หลักฐานหรือข้อสังเกตรายข้อ (ไม่บังคับ)</label>
                                            <textarea class="form-control rubric-control evidence-note" id="note_<?php echo problem_solving_page_h($itemKey); ?>" data-note-for="<?php echo problem_solving_page_h($itemKey); ?>" rows="2" maxlength="5000" placeholder="เช่น อธิบายเป้าหมายได้ทันที หรือ ต้องถามกระตุ้น 2 ครั้ง"></textarea>
                                        </fieldset>
                                    <?php endforeach; ?>
                                </div>
                            </section>
                        <?php endforeach; ?>

                        <section class="card border-0 shadow-sm rounded-4 mb-4">
                            <div class="card-body p-3 p-lg-4">
                                <label for="overall-note" class="form-label h5 fw-bold">ข้อสังเกตภาพรวม</label>
                                <textarea id="overall-note" class="form-control rubric-control" rows="4" maxlength="10000" placeholder="สรุปจุดเด่น สิ่งที่ควรพัฒนา และบริบทที่ใช้ประกอบการตัดสิน"></textarea>
                                <div class="calculation-summary mt-4">
                                    <div><span>ให้คะแนนแล้ว</span><strong id="completed-score-count">0/<?php echo count(problem_solving_item_map($rubric['version'])); ?></strong></div>
                                    <div><span>คะแนนรวม</span><strong id="total-score">0</strong></div>
                                    <div><span>ค่าเฉลี่ยรวม</span><strong id="overall-mean">-</strong></div>
                                    <div><span>ระดับทักษะ</span><strong id="skill-level">ข้อมูลไม่ครบ</strong></div>
                                </div>
                            </div>
                        </section>
                    </form>

                    <div class="assessment-actions shadow-lg">
                        <div class="d-flex gap-2">
                            <button id="previous-student" type="button" class="btn btn-outline-secondary" aria-label="นักเรียนคนก่อนหน้า"><i class="bi bi-chevron-left"></i><span class="d-none d-sm-inline"> ก่อนหน้า</span></button>
                            <button id="next-student" type="button" class="btn btn-outline-secondary"><span class="d-none d-sm-inline">ถัดไป </span><i class="bi bi-chevron-right"></i></button>
                        </div>
                        <div class="d-flex gap-2 flex-wrap justify-content-end">
                            <button id="reset-unsaved" type="button" class="btn btn-outline-danger">ล้างการแก้ไข</button>
                            <button id="unlock-button" type="button" class="btn btn-warning d-none"><i class="bi bi-unlock-fill"></i> เปิดล็อก</button>
                            <button id="save-draft" type="button" class="btn btn-outline-primary fw-bold"><i class="bi bi-save"></i> บันทึกฉบับร่าง</button>
                            <button id="save-final" type="button" class="btn btn-success fw-bold"><i class="bi bi-check2-circle"></i> ยืนยันผล</button>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </main>
    </div>

    <div class="offcanvas offcanvas-start" tabindex="-1" id="studentOffcanvas" aria-labelledby="studentOffcanvasLabel">
        <div class="offcanvas-header">
            <h2 class="offcanvas-title h5 fw-bold" id="studentOffcanvasLabel">เลือกนักเรียน</h2>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="ปิด"></button>
        </div>
        <div id="mobile-student-list" class="student-list offcanvas-body p-0"></div>
    </div>

    <div class="modal fade" id="unlockModal" tabindex="-1" aria-labelledby="unlockModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow">
                <div class="modal-header">
                    <h2 class="modal-title h5 fw-bold" id="unlockModalLabel"><i class="bi bi-unlock-fill text-warning"></i> เปิดล็อกผลประเมิน</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="ปิด"></button>
                </div>
                <div class="modal-body">
                    <p class="text-secondary">คะแนนเดิมจะยังคงอยู่และระบบจะเก็บผู้ดำเนินการ เหตุผล และเวลาไว้ในประวัติ</p>
                    <label for="unlock-reason" class="form-label fw-bold">เหตุผลในการเปิดล็อก <span class="text-danger">*</span></label>
                    <textarea id="unlock-reason" class="form-control" rows="4" maxlength="5000" placeholder="เช่น ยืนยันผิดนักเรียน หรือต้องแก้คะแนนหลังตรวจหลักฐานเพิ่มเติม"></textarea>
                    <div id="unlock-error" class="text-danger small mt-2" aria-live="polite"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                    <button id="confirm-unlock" type="button" class="btn btn-warning fw-bold"><i class="bi bi-unlock-fill"></i> ยืนยันเปิดล็อก</button>
                </div>
            </div>
        </div>
    </div>

<?php if ($students !== []): ?>
<script>
    const classroomId = <?php echo (int) $context['classroom_id']; ?>;
    const rubricVersion = <?php echo json_encode($rubric['version']); ?>;
    const descriptors = <?php echo json_encode(array_map(static fn(array $domain): array => $domain['descriptors'], $rubric['domains']), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
    const levels = <?php echo json_encode($rubric['levels'], JSON_UNESCAPED_UNICODE); ?>;
    const expectedItems = <?php echo json_encode(array_keys(problem_solving_item_map($rubric['version']))); ?>;
    let students = <?php echo json_encode($students, JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;
    let currentStudentId = <?php echo $studentId; ?>;
    let currentLessonId = <?php echo $lessonId; ?>;
    let csrfToken = <?php echo json_encode(problem_solving_csrf_token()); ?>;
    let lastKnownUpdatedAt = null;
    let loadedAssessment = null;
    let dirty = false;

    const statusLabels = {
        not_started: ['ยังไม่เริ่ม', 'status-not-started', 'bi-circle'],
        draft: ['ฉบับร่าง', 'status-draft', 'bi-pencil-fill'],
        unlocked: ['เปิดล็อกเพื่อแก้ไข', 'status-unlocked', 'bi-unlock-fill'],
        final: ['ยืนยันแล้ว', 'status-final', 'bi-check-circle-fill']
    };
    const workStatusLabels = {not_submitted: 'ยังไม่ส่ง', pending: 'กำลังทำ', submitted: 'รอตรวจ', reviewed: 'ตรวจแล้ว', revision: 'รอแก้ไข'};

    function setMessage(message, type = 'success') {
        const box = document.getElementById('save-message');
        box.textContent = message;
        box.className = `save-message is-visible message-${type}`;
        window.setTimeout(() => box.classList.remove('is-visible'), 5000);
    }

    function makeStudentButton(student, mobile = false) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'student-list-item' + (Number(student.id) === Number(currentStudentId) ? ' active' : '');
        const identity = document.createElement('span');
        identity.className = 'student-identity';
        const name = document.createElement('strong');
        name.textContent = student.name;
        const code = document.createElement('small');
        code.textContent = student.student_id;
        identity.append(name, code);
        const state = student.statuses[String(currentLessonId)] || student.statuses[currentLessonId] || 'not_started';
        const badge = document.createElement('span');
        badge.className = `mini-status mini-${state}`;
        badge.textContent = statusLabels[state]?.[0] || 'ยังไม่เริ่ม';
        button.append(identity, badge);
        button.addEventListener('click', () => {
            if (dirty && !window.confirm('มีข้อมูลที่ยังไม่บันทึก ต้องการเปลี่ยนนักเรียนและละทิ้งการแก้ไขหรือไม่?')) return;
            loadAssessment(Number(student.id), currentLessonId);
            if (mobile) bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('studentOffcanvas')).hide();
        });
        return button;
    }

    function renderStudentLists() {
        ['desktop-student-list', 'mobile-student-list'].forEach((id, index) => {
            const list = document.getElementById(id);
            list.replaceChildren(...students.map(student => makeStudentButton(student, index === 1)));
        });
        const finalCount = students.filter(student => (student.statuses[String(currentLessonId)] || student.statuses[currentLessonId]) === 'final').length;
        document.getElementById('completion-count').textContent = `${finalCount}/${students.length} ยืนยันแล้ว`;
    }

    function updateDescriptor(itemKey) {
        const fieldset = document.querySelector(`[data-item="${CSS.escape(itemKey)}"].rubric-item`);
        const selected = fieldset.querySelector('.score-radio:checked');
        const domain = fieldset.dataset.domain;
        const target = fieldset.querySelector(`[data-descriptor-for="${CSS.escape(itemKey)}"]`);
        target.textContent = selected ? `ระดับ ${selected.value}: ${descriptors[domain][selected.value]}` : 'เลือกคะแนนเพื่อดูคำอธิบายระดับพฤติกรรม';
        target.classList.toggle('has-score', Boolean(selected));
    }

    function levelFor(mean) {
        if (!Number.isFinite(mean)) return 'ข้อมูลไม่ครบ';
        const level = levels.find(entry => mean >= Number(entry.min) && mean <= Number(entry.max));
        return level ? level.label : 'ข้อมูลไม่ครบ';
    }

    function updateCalculation() {
        const byDomain = {};
        let total = 0;
        let count = 0;
        document.querySelectorAll('.rubric-item').forEach(fieldset => {
            const selected = fieldset.querySelector('.score-radio:checked');
            if (!selected) return;
            const score = Number(selected.value);
            const domain = fieldset.dataset.domain;
            byDomain[domain] ||= [];
            byDomain[domain].push(score);
            total += score;
            count++;
        });
        document.querySelectorAll('[data-domain-mean]').forEach(element => {
            const values = byDomain[element.dataset.domainMean] || [];
            element.textContent = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '-';
        });
        const mean = count ? total / count : NaN;
        document.getElementById('completed-score-count').textContent = `${count}/${expectedItems.length}`;
        document.getElementById('total-score').textContent = total;
        document.getElementById('overall-mean').textContent = count ? mean.toFixed(2) : '-';
        document.getElementById('skill-level').textContent = count ? levelFor(mean) : 'ข้อมูลไม่ครบ';
    }

    function setLocked(locked) {
        document.querySelectorAll('.rubric-control').forEach(control => control.disabled = locked);
        document.getElementById('save-draft').classList.toggle('d-none', locked);
        document.getElementById('save-final').classList.toggle('d-none', locked);
        document.getElementById('reset-unsaved').classList.toggle('d-none', locked);
        document.getElementById('unlock-button').classList.toggle('d-none', !locked);
    }

    function renderAssessment(data) {
        loadedAssessment = data;
        csrfToken = data.csrf_token;
        lastKnownUpdatedAt = data.updated_at;
        students = data.students;
        currentStudentId = Number(data.student.id);
        currentLessonId = Number(data.lesson.id);
        document.getElementById('lesson-select').value = String(currentLessonId);
        document.getElementById('student-name').textContent = data.student.name;
        document.getElementById('student-meta').textContent = `รหัสนักเรียน ${data.student.student_id}${data.student.class_level ? ` · ${data.student.class_level}` : ''}`;
        const status = statusLabels[data.status] || statusLabels.not_started;
        const badge = document.getElementById('status-badge');
        badge.className = `status-badge ${status[1]}`;
        badge.innerHTML = `<i class="bi ${status[2]}"></i> ${status[0]}`;
        document.getElementById('evaluation-time').textContent = data.finalized_at ? `ยืนยันเมื่อ ${data.finalized_at}` : (data.evaluated_at ? `บันทึกล่าสุด ${data.updated_at}` : 'ยังไม่มีการบันทึก');

        document.getElementById('assessment-form').reset();
        Object.entries(data.scores || {}).forEach(([itemKey, entry]) => {
            const radio = document.querySelector(`input[name="score_${CSS.escape(itemKey)}"][value="${Number(entry.score)}"]`);
            if (radio) radio.checked = true;
            const note = document.querySelector(`[data-note-for="${CSS.escape(itemKey)}"]`);
            if (note) note.value = entry.note || '';
        });
        document.getElementById('overall-note').value = data.overall_note || '';
        expectedItems.forEach(updateDescriptor);
        updateCalculation();

        const evidence = data.evidence;
        document.getElementById('game-score').textContent = evidence.game_score;
        document.getElementById('stages-completed').textContent = evidence.stages_completed;
        document.getElementById('attempts').textContent = evidence.attempts;
        document.getElementById('work-status').textContent = workStatusLabels[evidence.work_status] || evidence.work_status;
        document.getElementById('work-description').textContent = evidence.work_description || '-';
        document.getElementById('teacher-feedback').textContent = evidence.teacher_feedback || '-';

        setLocked(data.database_status === 'final');
        renderStudentLists();
        document.getElementById('loading-state').classList.add('d-none');
        document.getElementById('assessment-content').classList.remove('d-none');
        dirty = false;
        const query = new URLSearchParams({classroom_id: classroomId, lesson_id: currentLessonId, student_id: currentStudentId});
        history.replaceState(null, '', `problem_solving_assessment.php?${query}`);
    }

    async function loadAssessment(studentId, lessonId) {
        document.getElementById('loading-state').classList.remove('d-none');
        document.getElementById('assessment-content').classList.add('d-none');
        try {
            const query = new URLSearchParams({classroom_id: classroomId, lesson_id: lessonId, student_id: studentId});
            const response = await fetch(`../api/get_problem_solving_assessment.php?${query}`, {headers: {'Accept': 'application/json'}});
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'โหลดข้อมูลไม่สำเร็จ');
            renderAssessment(data);
        } catch (error) {
            document.getElementById('loading-state').innerHTML = `<div class="alert alert-danger">${String(error.message).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}</div>`;
        }
    }

    function collectScores() {
        const scores = {};
        expectedItems.forEach(itemKey => {
            const selected = document.querySelector(`input[name="score_${CSS.escape(itemKey)}"]:checked`);
            if (selected) {
                scores[itemKey] = {
                    score: Number(selected.value),
                    note: document.querySelector(`[data-note-for="${CSS.escape(itemKey)}"]`).value
                };
            }
        });
        return scores;
    }

    async function saveAssessment(status) {
        const scores = collectScores();
        if (status === 'final' && Object.keys(scores).length !== expectedItems.length) {
            setMessage(`กรุณาให้คะแนนให้ครบอีก ${expectedItems.length - Object.keys(scores).length} ข้อก่อนยืนยัน`, 'danger');
            return;
        }
        if (status === 'final' && !window.confirm(`ยืนยันผลของ ${loadedAssessment.student.name} บทที่ ${currentLessonId} หรือไม่? หลังยืนยันจะไม่สามารถแก้ไขได้จนกว่าจะเปิดล็อก`)) return;
        const button = document.getElementById(status === 'final' ? 'save-final' : 'save-draft');
        const original = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังบันทึก';
        try {
            const response = await fetch('../api/save_problem_solving_assessment.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                body: JSON.stringify({
                    csrf_token: csrfToken,
                    classroom_id: classroomId,
                    student_id: currentStudentId,
                    lesson_id: currentLessonId,
                    rubric_version: rubricVersion,
                    status,
                    overall_note: document.getElementById('overall-note').value,
                    last_known_updated_at: lastKnownUpdatedAt,
                    scores
                })
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'บันทึกไม่สำเร็จ');
            dirty = false;
            setMessage(data.message);
            await loadAssessment(currentStudentId, currentLessonId);
        } catch (error) {
            setMessage(error.message, 'danger');
        } finally {
            button.disabled = false;
            button.innerHTML = original;
        }
    }

    function unlockAssessment() {
        document.getElementById('unlock-reason').value = '';
        document.getElementById('unlock-error').textContent = '';
        bootstrap.Modal.getOrCreateInstance(document.getElementById('unlockModal')).show();
    }

    async function submitUnlock() {
        const reason = document.getElementById('unlock-reason').value.trim();
        const errorBox = document.getElementById('unlock-error');
        if (!reason) {
            errorBox.textContent = 'กรุณาระบุเหตุผลในการเปิดล็อก';
            return;
        }
        errorBox.textContent = '';
        const button = document.getElementById('confirm-unlock');
        const original = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> กำลังเปิดล็อก';
        try {
            const response = await fetch('../api/unlock_problem_solving_assessment.php', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                body: JSON.stringify({csrf_token: csrfToken, classroom_id: classroomId, student_id: currentStudentId, lesson_id: currentLessonId, rubric_version: rubricVersion, last_known_updated_at: lastKnownUpdatedAt, reason})
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || 'เปิดล็อกไม่สำเร็จ');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('unlockModal')).hide();
            setMessage(data.message);
            await loadAssessment(currentStudentId, currentLessonId);
        } catch (error) {
            errorBox.textContent = error.message;
        } finally {
            button.disabled = false;
            button.innerHTML = original;
        }
    }

    function moveStudent(offset) {
        const index = students.findIndex(student => Number(student.id) === Number(currentStudentId));
        const target = students[index + offset];
        if (!target) return;
        if (dirty && !window.confirm('มีข้อมูลที่ยังไม่บันทึก ต้องการละทิ้งการแก้ไขหรือไม่?')) return;
        loadAssessment(Number(target.id), currentLessonId);
    }

    document.getElementById('assessment-form').addEventListener('input', event => {
        dirty = true;
        if (event.target.classList.contains('score-radio')) updateDescriptor(event.target.dataset.item);
        updateCalculation();
    });
    document.getElementById('lesson-select').addEventListener('change', event => {
        if (dirty && !window.confirm('มีข้อมูลที่ยังไม่บันทึก ต้องการเปลี่ยนบทเรียนและละทิ้งการแก้ไขหรือไม่?')) {
            event.target.value = String(currentLessonId);
            return;
        }
        loadAssessment(currentStudentId, Number(event.target.value));
    });
    document.getElementById('save-draft').addEventListener('click', () => saveAssessment('draft'));
    document.getElementById('save-final').addEventListener('click', () => saveAssessment('final'));
    document.getElementById('unlock-button').addEventListener('click', unlockAssessment);
    document.getElementById('confirm-unlock').addEventListener('click', submitUnlock);
    document.getElementById('reset-unsaved').addEventListener('click', () => {
        if (window.confirm('ล้างเฉพาะการแก้ไขที่ยังไม่บันทึกหรือไม่?')) renderAssessment(loadedAssessment);
    });
    document.getElementById('previous-student').addEventListener('click', () => moveStudent(-1));
    document.getElementById('next-student').addEventListener('click', () => moveStudent(1));
    window.addEventListener('beforeunload', event => {
        if (!dirty) return;
        event.preventDefault();
        event.returnValue = '';
    });

    renderStudentLists();
    loadAssessment(currentStudentId, currentLessonId);
</script>
<?php endif; ?>
<?php require __DIR__ . '/../includes/app_scripts.php'; ?>
</body>
</html>
