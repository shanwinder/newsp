<?php

session_start();
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/problem_solving_assessment.php';

require_teacher_or_admin();
ensure_active_account($conn);
$context = problem_solving_teacher_context($conn, isset($_GET['classroom_id']) ? (int) $_GET['classroom_id'] : null);
if (!$context) {
    header('Location: classrooms.php');
    exit;
}

$lessons = require __DIR__ . '/../config/lessons.php';
$lessonFilter = isset($_GET['lesson_id']) && $_GET['lesson_id'] !== '' && isset($lessons[(int) $_GET['lesson_id']])
    ? (int) $_GET['lesson_id']
    : null;
$includeDrafts = ($_GET['include_drafts'] ?? '') === '1';
$report = problem_solving_report_data($conn, $context, $lessonFilter, $includeDrafts);
$rubric = $report['rubric'];

function problem_solving_report_h(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function problem_solving_report_number(?float $value): string
{
    return $value === null ? '-' : number_format($value, 2);
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>รายงานทักษะการแก้ปัญหา</title>
<?php
$page_styles = ['pages/problem_solving_report.css'];
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page problem-solving-report-page">
    <nav class="navbar navbar-dark bg-primary shadow-sm">
        <div class="container">
            <a class="navbar-brand fw-bold" href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>"><i class="bi bi-graph-up-arrow me-2"></i>รายงานทักษะ</a>
            <div class="d-flex gap-2">
                <a class="btn btn-warning btn-sm rounded-pill fw-bold" href="problem_solving_assessment.php?classroom_id=<?php echo $context['classroom_id']; ?>"><i class="bi bi-clipboard2-check"></i> ประเมินทักษะ</a>
                <a class="btn btn-outline-light btn-sm rounded-pill report-dashboard-link" href="dashboard.php?classroom_id=<?php echo $context['classroom_id']; ?>">Dashboard</a>
            </div>
        </div>
    </nav>

    <main class="container py-4">
        <section class="report-heading card border-0 shadow-sm rounded-4 mb-4">
            <div class="card-body p-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                    <div class="text-muted small"><?php echo problem_solving_report_h($context['classroom']['school_name']); ?></div>
                    <h1 class="h3 fw-bold text-primary mb-1"><?php echo problem_solving_report_h($context['classroom']['classroom_name']); ?></h1>
                    <div class="text-secondary"><?php echo problem_solving_report_h($context['learning_session']['session_name'] ?? ''); ?> · รูบริกเวอร์ชัน <?php echo problem_solving_report_h($report['rubric_version']); ?></div>
                </div>
                <div class="d-flex flex-wrap gap-2">
                    <a class="btn btn-outline-success" href="../api/export_problem_solving_scores.php?classroom_id=<?php echo $context['classroom_id']; ?>&amp;mode=raw<?php echo $includeDrafts ? '&amp;include_drafts=1' : ''; ?>"><i class="bi bi-filetype-csv"></i> Raw CSV</a>
                    <a class="btn btn-success" href="../api/export_problem_solving_scores.php?classroom_id=<?php echo $context['classroom_id']; ?>&amp;mode=summary<?php echo $includeDrafts ? '&amp;include_drafts=1' : ''; ?>"><i class="bi bi-filetype-csv"></i> Summary CSV</a>
                </div>
            </div>
            <div class="card-footer bg-white border-0 px-4 pb-4">
                <form method="get" class="report-filters">
                    <input type="hidden" name="classroom_id" value="<?php echo $context['classroom_id']; ?>">
                    <div><label class="form-label fw-bold" for="lesson-filter">กรองบทเรียน</label><select class="form-select" id="lesson-filter" name="lesson_id"><option value="">ทุกบทเรียน</option><?php foreach ($lessons as $id => $lesson): ?><option value="<?php echo $id; ?>" <?php echo $lessonFilter === $id ? 'selected' : ''; ?>>บทที่ <?php echo $id; ?>: <?php echo problem_solving_report_h($lesson['title']); ?></option><?php endforeach; ?></select></div>
                    <div class="form-check form-switch align-self-end mb-2"><input class="form-check-input" type="checkbox" role="switch" id="include-drafts" name="include_drafts" value="1" <?php echo $includeDrafts ? 'checked' : ''; ?>><label class="form-check-label" for="include-drafts">รวมฉบับร่างเพื่อตรวจความครบถ้วน</label></div>
                    <button class="btn btn-primary align-self-end" type="submit">แสดงรายงาน</button>
                </form>
                <?php if ($includeDrafts): ?><div class="alert alert-warning mt-3 mb-0 py-2"><i class="bi bi-exclamation-triangle-fill"></i> มุมมองนี้รวมฉบับร่าง ค่าสถิติจึงใช้ตรวจสอบชั่วคราวและไม่ควรนำไปอ้างอิงเป็นผลหลัก</div><?php endif; ?>
            </div>
        </section>

        <section aria-labelledby="summary-title" class="mb-4">
            <h2 id="summary-title" class="h4 fw-bold mb-3">ภาพรวมชั้นเรียน</h2>
            <div class="summary-grid">
                <div class="summary-card"><span>นักเรียนทั้งหมด</span><strong><?php echo $report['summary']['total_students']; ?></strong><small>คน</small></div>
                <div class="summary-card summary-success"><span>ประเมินครบ 4 ครั้ง</span><strong><?php echo $report['summary']['complete_students']; ?></strong><small>คน</small></div>
                <div class="summary-card summary-warning"><span>ประเมินยังไม่ครบ</span><strong><?php echo $report['summary']['incomplete_students']; ?></strong><small>คน</small></div>
                <div class="summary-card"><span>ค่าเฉลี่ยรวม</span><strong><?php echo problem_solving_report_number($report['summary']['overall_mean']); ?></strong><small>S.D. <?php echo number_format($report['summary']['sd'], 2); ?></small></div>
                <div class="summary-card summary-level"><span>ระดับทักษะภาพรวม</span><strong><?php echo problem_solving_report_h($report['summary']['level']); ?></strong><small><?php echo $report['summary']['evaluation_count']; ?> ผลประเมิน</small></div>
            </div>
        </section>

        <section class="card border-0 shadow-sm rounded-4 mb-4" aria-labelledby="domain-title">
            <div class="card-body p-0">
                <div class="p-3 p-lg-4 pb-2"><h2 id="domain-title" class="h4 fw-bold mb-0">รายงานรายด้าน</h2></div>
                <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>ด้าน</th><th class="text-end">ค่าเฉลี่ย</th><th class="text-end">S.D.</th><th>ระดับ</th><th class="text-end">n</th></tr></thead><tbody>
                <?php foreach ($report['domains'] as $domain): ?><tr><td class="fw-bold"><?php echo problem_solving_report_h($domain['label']); ?></td><td class="text-end score-value"><?php echo problem_solving_report_number($domain['mean']); ?></td><td class="text-end"><?php echo number_format($domain['sd'], 2); ?></td><td><span class="badge text-bg-primary"><?php echo problem_solving_report_h($domain['level']); ?></span></td><td class="text-end"><?php echo $domain['n']; ?></td></tr><?php endforeach; ?>
                </tbody></table></div>
            </div>
        </section>

        <section class="card border-0 shadow-sm rounded-4 mb-4" aria-labelledby="lesson-title">
            <div class="card-body p-0">
                <div class="p-3 p-lg-4 pb-2"><h2 id="lesson-title" class="h4 fw-bold mb-0">รายงานรายบทเรียน</h2></div>
                <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>บทเรียน</th><?php foreach ($rubric['domains'] as $domain): ?><th class="text-end"><span class="domain-short" title="<?php echo problem_solving_report_h($domain['label']); ?>"><?php echo problem_solving_report_h($domain['label']); ?></span></th><?php endforeach; ?><th class="text-end">ภาพรวม</th><th class="text-end">S.D.</th><th class="text-end">n</th></tr></thead><tbody>
                <?php foreach ($report['lessons'] as $lesson): ?><tr><td><strong>บทที่ <?php echo $lesson['id']; ?>: <?php echo problem_solving_report_h($lesson['title']); ?></strong><small class="d-block text-muted"><?php echo problem_solving_report_h($lesson['topic']); ?></small></td><?php foreach (array_keys($rubric['domains']) as $domainKey): ?><td class="text-end"><?php echo problem_solving_report_number($lesson['domains'][$domainKey]); ?></td><?php endforeach; ?><td class="text-end score-value"><?php echo problem_solving_report_number($lesson['overall_mean']); ?></td><td class="text-end"><?php echo number_format($lesson['sd'], 2); ?></td><td class="text-end"><?php echo $lesson['n']; ?></td></tr><?php endforeach; ?>
                </tbody></table></div>
            </div>
        </section>

        <section class="card border-0 shadow-sm rounded-4 mb-4" aria-labelledby="completion-title">
            <div class="card-body p-0">
                <div class="p-3 p-lg-4 pb-2 d-flex flex-wrap justify-content-between gap-2"><div><h2 id="completion-title" class="h4 fw-bold mb-1">ความครบถ้วนของการประเมิน</h2><div class="small text-muted">สถานะนักเรียน × บทเรียน (สีและข้อความแสดงสถานะร่วมกัน)</div></div></div>
                <div class="table-responsive"><table class="table completion-table align-middle mb-0"><thead><tr><th>นักเรียน</th><?php foreach ($lessons as $id => $lesson): ?><th class="text-center">บทที่ <?php echo $id; ?></th><?php endforeach; ?></tr></thead><tbody>
                <?php foreach ($report['students'] as $student): ?><tr><td><strong><?php echo problem_solving_report_h($student['name']); ?></strong><small class="d-block text-muted"><?php echo problem_solving_report_h($student['student_id']); ?></small></td><?php foreach ($lessons as $id => $lesson): $status = $student['statuses'][$id]; ?><td class="text-center"><a class="matrix-status matrix-<?php echo problem_solving_report_h($status); ?>" href="problem_solving_assessment.php?classroom_id=<?php echo $context['classroom_id']; ?>&amp;lesson_id=<?php echo $id; ?>&amp;student_id=<?php echo $student['id']; ?>"><?php echo ['not_started' => 'ยังไม่เริ่ม', 'draft' => 'ฉบับร่าง', 'final' => 'ยืนยันแล้ว'][$status] ?? $status; ?></a></td><?php endforeach; ?></tr><?php endforeach; ?>
                <?php if ($report['students'] === []): ?><tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีนักเรียนในห้องเรียน</td></tr><?php endif; ?>
                </tbody></table></div>
            </div>
        </section>

        <section aria-labelledby="individual-title">
            <h2 id="individual-title" class="h4 fw-bold mb-3">รายงานรายบุคคล</h2>
            <div class="accordion" id="individual-report">
                <?php foreach ($report['individuals'] as $index => $individual): ?>
                    <div class="accordion-item border-0 shadow-sm rounded-3 mb-3 overflow-hidden">
                        <h3 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#student-report-<?php echo $individual['id']; ?>"><span><strong><?php echo problem_solving_report_h($individual['name']); ?></strong><small class="d-block text-muted"><?php echo problem_solving_report_h($individual['student_id']); ?> · ค่าเฉลี่ย <?php echo problem_solving_report_number($individual['overall_mean']); ?> · <?php echo problem_solving_report_h($individual['level']); ?></small></span></button></h3>
                        <div id="student-report-<?php echo $individual['id']; ?>" class="accordion-collapse collapse" data-bs-parent="#individual-report"><div class="accordion-body">
                            <h4 class="h6 fw-bold">แนวโน้มคะแนนระหว่างบทเรียน</h4>
                            <div class="trend-grid mb-4"><?php foreach ($lessons as $lessonId => $lesson): $evaluation = $individual['lessons'][$lessonId] ?? null; $mean = $evaluation['calculation']['overall_mean'] ?? null; ?><div class="trend-item"><span>บทที่ <?php echo $lessonId; ?></span><div class="trend-track"><i style="width: <?php echo $mean === null ? 0 : min(100, ($mean / 4) * 100); ?>%"></i></div><strong><?php echo problem_solving_report_number($mean); ?></strong></div><?php endforeach; ?></div>
                            <div class="table-responsive"><table class="table table-sm align-middle"><thead><tr><th>บทเรียน</th><?php foreach ($rubric['domains'] as $domain): ?><th class="text-end"><?php echo problem_solving_report_h($domain['label']); ?></th><?php endforeach; ?><th class="text-end">ภาพรวม</th><th>ผู้ประเมิน/เวลา</th></tr></thead><tbody>
                            <?php foreach ($lessons as $lessonId => $lesson): $evaluation = $individual['lessons'][$lessonId] ?? null; ?><tr><td>บทที่ <?php echo $lessonId; ?></td><?php foreach (array_keys($rubric['domains']) as $domainKey): ?><td class="text-end"><?php echo problem_solving_report_number($evaluation['calculation']['domains'][$domainKey]['mean'] ?? null); ?></td><?php endforeach; ?><td class="text-end fw-bold"><?php echo problem_solving_report_number($evaluation['calculation']['overall_mean'] ?? null); ?></td><td><?php if ($evaluation): ?><?php echo problem_solving_report_h($evaluation['evaluator_name']); ?><small class="d-block text-muted"><?php echo problem_solving_report_h($evaluation['finalized_at'] ?: $evaluation['evaluated_at']); ?> · <?php echo problem_solving_report_h($evaluation['status']); ?></small><?php else: ?>-<?php endif; ?></td></tr><?php endforeach; ?></tbody></table></div>
                            <?php foreach ($individual['lessons'] as $evaluation): ?>
                                <?php $notes = array_filter($evaluation['scores'], static fn(array $score): bool => trim((string) ($score['note'] ?? '')) !== ''); ?>
                                <?php if ($evaluation['overall_note'] || $notes !== []): ?><div class="individual-notes mt-3"><h4 class="h6 fw-bold">บทที่ <?php echo $evaluation['lesson_id']; ?> — หลักฐานและข้อสังเกต</h4><?php if ($evaluation['overall_note']): ?><p class="mb-2"><strong>ภาพรวม:</strong> <?php echo nl2br(problem_solving_report_h($evaluation['overall_note'])); ?></p><?php endif; ?><?php foreach ($notes as $itemKey => $score): ?><p class="small mb-1"><strong><?php echo problem_solving_report_h($rubric['domains'][$score['domain_key']]['items'][$itemKey] ?? $itemKey); ?>:</strong> <?php echo nl2br(problem_solving_report_h($score['note'])); ?></p><?php endforeach; ?></div><?php endif; ?>
                            <?php endforeach; ?>
                        </div></div>
                    </div>
                <?php endforeach; ?>
            </div>
        </section>
    </main>
<?php require __DIR__ . '/../includes/app_scripts.php'; ?>
</body>
</html>
