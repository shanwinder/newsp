<?php
// includes/student_navbar.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// เช็คว่า Login หรือยัง
if (!isset($_SESSION['user_id'])) {
    header("Location: ../pages/login.php");
    exit();
}

require_once __DIR__ . '/db.php'; // เรียกใช้ connection
require_once __DIR__ . '/context.php';
require_once __DIR__ . '/assessment.php';
require_once __DIR__ . '/survey.php';
$app = require __DIR__ . '/../config/app.php';

$user_id = $_SESSION['user_id'];

require_once __DIR__ . '/auth.php';

$navbarAssessmentStatus = $assessmentStatus ?? null;
if (!is_visitor_mode() && !is_array($navbarAssessmentStatus)) {
    $navbarAssessmentStatus = assessment_student_status($conn, intval($user_id), session_context());
}

$assessmentButtonClass = 'btn-outline-success';
$assessmentButtonText = 'แบบทดสอบ';
if (is_array($navbarAssessmentStatus)) {
    if (!empty($navbarAssessmentStatus['pretest_blocking'])) {
        $assessmentButtonClass = 'btn-danger assessment-nav-pulse';
        $assessmentButtonText = 'ทำ Pre-test ก่อน';
    } elseif ((!empty($navbarAssessmentStatus['pretest']['available']) && empty($navbarAssessmentStatus['pretest']['submitted']))
        || (!empty($navbarAssessmentStatus['posttest']['available']) && empty($navbarAssessmentStatus['posttest']['submitted']))) {
        $assessmentButtonClass = 'btn-warning text-dark';
        $assessmentButtonText = 'มีแบบทดสอบ';
    } elseif (!empty($navbarAssessmentStatus['pretest']['submitted']) || !empty($navbarAssessmentStatus['posttest']['submitted'])) {
        $assessmentButtonClass = 'btn-success';
    }
}

$navbarSurveyStatus = $surveyStatus ?? null;
if (!is_visitor_mode() && !is_array($navbarSurveyStatus)) {
    $navbarSurveyStatus = survey_student_status($conn, intval($user_id), session_context());
}

$surveyButtonClass = 'btn-outline-secondary';
$surveyButtonText = 'แบบสอบถาม';
$surveyButtonIcon = 'bi-chat-heart-fill';
$surveyButtonUrl = 'survey_start.php';
$surveyButtonTitle = 'ดูสถานะแบบสอบถามความพึงพอใจ';
if (is_array($navbarSurveyStatus)) {
    if (!empty($navbarSurveyStatus['submitted'])) {
        $surveyButtonClass = 'btn-success';
        $surveyButtonText = 'ส่งแบบสอบถามแล้ว';
        $surveyButtonIcon = 'bi-check-circle-fill';
        $surveyButtonUrl = !empty($navbarSurveyStatus['allow_edit']) && !empty($navbarSurveyStatus['available'])
            ? 'survey_start.php'
            : 'survey_thankyou.php';
        $surveyButtonTitle = $navbarSurveyStatus['message'];
    } elseif (!empty($navbarSurveyStatus['available'])) {
        $surveyButtonClass = 'btn-warning text-dark survey-nav-pulse';
        $surveyButtonText = 'ตอบแบบสอบถาม';
        $surveyButtonUrl = 'survey_start.php';
        $surveyButtonTitle = $navbarSurveyStatus['message'];
    } elseif (($navbarSurveyStatus['state'] ?? '') === 'posttest_required') {
        $surveyButtonClass = 'btn-outline-primary';
        $surveyButtonText = 'แบบสอบถาม';
        $surveyButtonIcon = 'bi-clipboard-check-fill';
        $surveyButtonUrl = 'assessment_intro.php?type=posttest';
        $surveyButtonTitle = $navbarSurveyStatus['message'];
    } elseif (($navbarSurveyStatus['state'] ?? '') === 'individual_required') {
        $surveyButtonClass = 'btn-outline-warning text-dark';
        $surveyButtonIcon = 'bi-person-lock';
        $surveyButtonTitle = $navbarSurveyStatus['message'];
    } else {
        $surveyButtonTitle = $navbarSurveyStatus['message'] ?? $surveyButtonTitle;
    }
}

// --------------------------------------------------------
// 1️⃣ คำนวณดาวรวมทั้งหมด (Live Update)
// --------------------------------------------------------
if (is_visitor_mode()) {
    $total_stars = 0;
    foreach ($_SESSION['visitor_progress'] ?? [] as $progress) {
        $total_stars += intval($progress['score'] ?? 0);
    }
    $current_title = 'โหมดทดลองใช้';
    $badge_color = 'bg-info text-dark';
} else {
    $learning_session_id = intval($_SESSION['learning_session_id'] ?? 0);
    $sql_stars = "SELECT SUM(score) as total_score FROM progress WHERE user_id = ? AND (? = 0 OR learning_session_id = ?)";
    $stmt = $conn->prepare($sql_stars);
    $stmt->bind_param("iii", $user_id, $learning_session_id, $learning_session_id);
    $stmt->execute();
    $res_stars = $stmt->get_result();
    $row_stars = $res_stars->fetch_assoc();

    // ถ้ายังไม่เคยเล่นเลย ให้เป็น 0
    $total_stars = $row_stars['total_score'] ? $row_stars['total_score'] : 0;

    // --------------------------------------------------------
    // 2️⃣ ดึงฉายา (Title) ตามจำนวนดาว
    // --------------------------------------------------------
    $sql_title = "SELECT title_name, css_class FROM titles 
                  WHERE min_stars_required <= ? 
                  ORDER BY min_stars_required DESC LIMIT 1";
    $stmt = $conn->prepare($sql_title);
    $stmt->bind_param("i", $total_stars);
    $stmt->execute();
    $res_title = $stmt->get_result();

    if ($res_title->num_rows > 0) {
        $title_data = $res_title->fetch_assoc();
        $current_title = $title_data['title_name'];
        $badge_color = $title_data['css_class']; // เช่น badge-warning
    } else {
        // ถ้ายังไม่มีฉายา ปรับให้เข้ากับชื่อผู้เรียนใหม่
        $current_title = "นักคิดเริ่มต้น";
        $badge_color = "bg-secondary";
    }
}

$badge_color = preg_replace('/[^a-zA-Z0-9_\-\s]/', '', (string) $badge_color);
?>

<nav class="student-topbar navbar navbar-expand-xl sticky-top shadow-sm">
    <div class="container-fluid px-3 px-xxl-4">
        <a class="navbar-brand d-flex align-items-center" href="student_dashboard.php">
            <span class="student-brand-icon">👨‍🌾</span>
            <div>
                <span class="student-brand-name d-block fw-bold text-success"><?php echo htmlspecialchars($app['app_name']); ?></span>
                <span class="student-brand-subtitle d-block text-muted"><?php echo htmlspecialchars($app['app_short_subtitle']); ?></span>
            </div>
        </a>

        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#studentNav">
            <i class="bi bi-list text-success fs-1"></i>
        </button>

        <div class="collapse navbar-collapse" id="studentNav">
            <ul class="navbar-nav ms-auto align-items-center gap-2 mt-3 mt-xl-0">

                <li class="nav-item manual-nav-item">
                    <a href="manual_student.php" class="btn btn-outline-success manual-nav-button rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center justify-content-center gap-2" title="เปิดคู่มือการเรียนรู้สำหรับนักเรียน">
                        <i class="bi bi-journal-bookmark-fill"></i>
                        <span>คู่มือการเรียนรู้</span>
                    </a>
                </li>

                <li class="nav-item manual-nav-item">
                    <a href="about_media.php" class="btn btn-outline-primary manual-nav-button rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center justify-content-center gap-2" title="ข้อมูลผู้พัฒนาและลิขสิทธิ์สื่อ">
                        <i class="bi bi-info-circle-fill"></i>
                        <span>เกี่ยวกับสื่อ</span>
                    </a>
                </li>

                <?php if (!is_visitor_mode() && !empty($navbarAssessmentStatus['configured'])): ?>
                <li class="nav-item assessment-nav-item">
                    <details class="assessment-nav-details">
                        <summary class="btn <?php echo $assessmentButtonClass; ?> rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center gap-2">
                            <i class="bi bi-clipboard2-check-fill"></i>
                            <span><?php echo htmlspecialchars($assessmentButtonText); ?></span>
                            <i class="bi bi-chevron-down assessment-nav-chevron"></i>
                        </summary>
                        <div class="assessment-nav-panel">
                            <div class="fw-bold text-success mb-2"><i class="bi bi-clipboard2-check-fill me-1"></i> ระบบแบบทดสอบ</div>
                            <?php if (empty($navbarAssessmentStatus['individual'])): ?>
                                <div class="alert alert-warning small mb-0 py-2">
                                    แบบทดสอบต้องทำเป็นรายบุคคล กรุณาเข้าสู่ระบบใหม่ในโหมดรายบุคคล
                                </div>
                            <?php else: ?>
                                <?php foreach (['pretest' => 'ก่อนเรียน', 'posttest' => 'หลังเรียน'] as $assessmentType => $thaiLabel):
                                    $assessmentItem = $navbarAssessmentStatus[$assessmentType];
                                    $submitted = !empty($assessmentItem['submitted']);
                                    $available = !empty($assessmentItem['available']);
                                ?>
                                <div class="assessment-nav-row">
                                    <div>
                                        <div class="fw-semibold">แบบทดสอบ<?php echo $thaiLabel; ?></div>
                                        <small class="text-<?php echo $submitted ? 'success' : ($available ? 'warning' : 'secondary'); ?>">
                                            <?php echo $submitted ? 'ทำแล้ว' : ($available ? (!empty($assessmentItem['in_progress']) ? 'กำลังทำ' : 'เปิดให้ทำ') : 'ยังไม่เปิด'); ?>
                                        </small>
                                    </div>
                                    <?php if ($available || $submitted): ?>
                                        <a href="assessment_intro.php?type=<?php echo $assessmentType; ?>" class="btn btn-sm btn-<?php echo $assessmentType === 'pretest' ? 'success' : 'primary'; ?> rounded-pill px-3">
                                            <?php echo $submitted ? 'ดูผล' : (!empty($assessmentItem['in_progress']) ? 'ทำต่อ' : 'เริ่มทำ'); ?>
                                        </a>
                                    <?php else: ?>
                                        <span class="badge bg-secondary-subtle text-secondary rounded-pill"><i class="bi bi-lock-fill"></i> ล็อก</span>
                                    <?php endif; ?>
                                </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    </details>
                </li>
                <?php endif; ?>

                <?php if (!is_visitor_mode() && !empty($navbarSurveyStatus['configured'])): ?>
                <li class="nav-item survey-nav-item">
                    <a href="<?php echo htmlspecialchars($surveyButtonUrl); ?>"
                       class="btn <?php echo $surveyButtonClass; ?> survey-nav-button rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                       title="<?php echo htmlspecialchars($surveyButtonTitle); ?>">
                        <i class="bi <?php echo $surveyButtonIcon; ?>"></i>
                        <span><?php echo htmlspecialchars($surveyButtonText); ?></span>
                    </a>
                </li>
                <?php endif; ?>

                <li class="nav-item student-profile-item">
                    <div class="student-profile-card d-flex align-items-center px-3 py-1 rounded-pill">

                        <div class="student-profile-text me-3 text-end">
                            <strong class="student-profile-name d-block text-dark">
                                <?php echo htmlspecialchars($_SESSION['name']); ?>
                            </strong>
                            <span class="student-profile-title badge rounded-pill <?php echo htmlspecialchars($badge_color); ?>">
                                <?php echo htmlspecialchars($current_title); ?>
                            </span>
                        </div>

                        <img src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=<?php echo $_SESSION['student_id']; ?>&backgroundColor=bbf7d0"
                            alt="Avatar" class="rounded-circle border border-2 border-success bg-white" width="45" height="45">
                    </div>
                </li>

                <li class="nav-item">
                    <div class="student-star-counter d-flex align-items-center bg-warning text-dark px-3 py-2 rounded-pill fw-bold shadow-sm">
                        <i class="student-star-icon bi bi-star-fill me-2 text-white"></i>
                        <span id="nav-star-count" class="student-star-count"><?php echo $total_stars; ?></span>
                    </div>
                </li>

                <li class="nav-item">
                    <a href="../logout.php" class="student-logout-button btn btn-outline-danger btn-sm rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" title="ออกจากระบบ">
                        <i class="bi bi-box-arrow-right fs-5"></i>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>
