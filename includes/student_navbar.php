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
?>

<nav class="navbar navbar-expand-lg sticky-top shadow-sm" style="background: rgba(255, 255, 255, 0.95) !important; backdrop-filter: blur(10px); border-bottom: 4px solid #10b981;">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="student_dashboard.php">
            <span style="font-size: 2rem; margin-right: 12px; animation: wave-farm 2s infinite;">👨‍🌾</span>
            <div>
                <span class="d-block fw-bold text-success" style="line-height: 1.2; font-size: 1.3rem;"><?php echo htmlspecialchars($app['app_name']); ?></span>
                <span class="d-block text-muted" style="font-size: 0.85rem;"><?php echo htmlspecialchars($app['app_short_subtitle']); ?></span>
            </div>
        </a>

        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#studentNav">
            <i class="bi bi-list text-success fs-1"></i>
        </button>

        <div class="collapse navbar-collapse" id="studentNav">
            <ul class="navbar-nav ms-auto align-items-center gap-3 mt-3 mt-lg-0">

                <li class="nav-item manual-nav-item">
                    <a href="manual_student.php" class="btn btn-outline-success manual-nav-button rounded-pill fw-bold px-3 shadow-sm d-flex align-items-center justify-content-center gap-2" title="เปิดคู่มือการเรียนรู้สำหรับนักเรียน">
                        <i class="bi bi-journal-bookmark-fill"></i>
                        <span>คู่มือการเรียนรู้</span>
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

                <li class="nav-item">
                    <div class="d-flex align-items-center px-3 py-1 rounded-pill"
                        style="background: #f0fdf4; border: 2px solid #bbf7d0;">

                        <div class="me-3 text-end">
                            <span class="d-block text-dark fw-bold" style="font-size: 0.95rem;">
                                <?php echo htmlspecialchars($_SESSION['name']); ?>
                            </span>
                            <span class="badge rounded-pill <?php echo $badge_color; ?>" style="font-size: 0.75rem;">
                                <?php echo $current_title; ?>
                            </span>
                        </div>

                        <img src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=<?php echo $_SESSION['student_id']; ?>&backgroundColor=bbf7d0"
                            alt="Avatar" class="rounded-circle border border-2 border-success bg-white" width="45" height="45">
                    </div>
                </li>

                <li class="nav-item">
                    <div class="d-flex align-items-center bg-warning text-dark px-3 py-2 rounded-pill fw-bold shadow-sm" style="border: 2px solid #fbbf24;">
                        <i class="bi bi-star-fill me-2 text-white" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.2);"></i>
                        <span id="nav-star-count" style="font-size: 1.1rem;"><?php echo $total_stars; ?></span>
                    </div>
                </li>

                <li class="nav-item">
                    <a href="../logout.php" class="btn btn-outline-danger btn-sm rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" title="ออกจากระบบ">
                        <i class="bi bi-box-arrow-right fs-5"></i>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<style>
    .manual-nav-button {
        white-space: nowrap;
        background: #fff;
        border-width: 2px;
    }

    .manual-nav-button:hover,
    .manual-nav-button:focus {
        color: #fff;
        background: #198754;
        transform: translateY(-1px);
    }

    .assessment-nav-item {
        position: relative;
    }

    .assessment-nav-details > summary {
        list-style: none;
        cursor: pointer;
        white-space: nowrap;
    }

    .assessment-nav-details > summary::-webkit-details-marker {
        display: none;
    }

    .assessment-nav-chevron {
        font-size: .75rem;
        transition: transform .2s ease;
    }

    .assessment-nav-details[open] .assessment-nav-chevron {
        transform: rotate(180deg);
    }

    .assessment-nav-panel {
        position: absolute;
        z-index: 1100;
        top: calc(100% + 12px);
        right: 0;
        width: min(360px, calc(100vw - 24px));
        padding: 16px;
        border: 1px solid #d1fae5;
        border-radius: 18px;
        background: #fff;
        box-shadow: 0 18px 45px rgba(15, 118, 110, .2);
    }

    .assessment-nav-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 0;
        border-top: 1px solid #e2e8f0;
    }

    .assessment-nav-row:first-of-type {
        border-top: 0;
    }

    .assessment-nav-pulse {
        animation: assessment-nav-pulse 1.8s infinite;
    }

    @keyframes assessment-nav-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, .35); }
        50% { box-shadow: 0 0 0 8px rgba(220, 53, 69, 0); }
    }

    @keyframes wave-farm {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(15deg); }
    }

    @media (max-width: 991.98px) {
        .manual-nav-item {
            width: 100%;
        }

        .manual-nav-button {
            width: 100%;
            min-height: 44px;
        }

        .assessment-nav-item {
            width: 100%;
        }

        .assessment-nav-details > summary {
            width: 100%;
            justify-content: center;
        }

        .assessment-nav-panel {
            position: static;
            width: 100%;
            margin-top: 10px;
            box-shadow: none;
        }
    }
</style>
