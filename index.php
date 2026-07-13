<?php
// index.php - หน้าแรกของเว็บไซต์ (Landing Page)
session_start();
require_once 'includes/db.php';
$app = require __DIR__ . '/config/app.php';

// 1. ตรวจสอบว่า Login อยู่แล้วหรือไม่? ถ้าใช่ ให้เด้งไป Dashboard เลย
if (isset($_SESSION['user_id'])) {
    if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
        header("Location: pages/dashboard.php");
    } else {
        header("Location: pages/student_dashboard.php");
    }
    exit();
}

// 2. นับผู้เข้าชม Landing Page แบบ 1 session ต่อ 1 วัน
$total_visits = 0;
$today_visits = 0;

try {
    $visitor_session_key = session_id();
    $visitor_ip_hash = hash('sha256', $_SERVER['REMOTE_ADDR'] ?? '');
    $visitor_agent_hash = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');

    $stmt_visit = $conn->prepare("
        INSERT IGNORE INTO site_visits
            (session_key, ip_hash, user_agent_hash, page, visited_at)
        VALUES
            (?, ?, ?, 'landing', NOW())
    ");
    $stmt_visit->bind_param("sss", $visitor_session_key, $visitor_ip_hash, $visitor_agent_hash);
    $stmt_visit->execute();

    $res_total = $conn->query("SELECT COUNT(*) AS total FROM site_visits WHERE page = 'landing'");
    if ($res_total) {
        $total_visits = (int)($res_total->fetch_assoc()['total'] ?? 0);
    }

    $res_today = $conn->query("
        SELECT COUNT(*) AS total
        FROM site_visits
        WHERE page = 'landing' AND visit_date = CURDATE()
    ");
    if ($res_today) {
        $today_visits = (int)($res_today->fetch_assoc()['total'] ?? 0);
    }
} catch (Throwable $e) {
    error_log('Visitor counter error: ' . $e->getMessage());
    $total_visits = 0;
    $today_visits = 0;
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($app['app_name'] . ' - ' . $app['app_subtitle']); ?></title>






<?php
$asset_prefix = '.';
$page_styles = array (
  0 => 'pages/landing.css',
);
require __DIR__ . '/includes/app_head.php';
?>
</head>
<body class="app-page landing-page">

    <nav class="navbar navbar-expand-lg fixed-top navbar-grand" id="mainNav">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center" href="#">
                <span class="brand-farm-icon">🏡</span>
                <span class="ms-2 fw-bold navbar-brand-text fs-3"><?php echo htmlspecialchars($app['app_name']); ?></span>
            </a>
            <button class="navbar-toggler border-0 bg-light opacity-75" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item"><a class="nav-link px-4" href="#features">เกี่ยวกับบทเรียน</a></li>
                    <li class="nav-item ms-lg-2 mt-3 mt-lg-0">
                        <a href="pages/guest_start.php" class="btn btn-outline-success bg-white rounded-pill px-4 py-2 fw-bold shadow-sm me-2">
                            👀 ทดลองใช้งาน
                        </a>
                        <a href="pages/login.php" class="btn btn-light text-success rounded-pill px-4 py-2 fw-bold shadow-sm border-0">
                            <i class="bi bi-door-open-fill"></i> เข้าสู่ระบบ
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <section class="hero-section">
        <div class="glow-circle glow-1"></div>
        <div class="glow-circle glow-2"></div>

        <div class="floating-emoji floating-tractor">🚜</div>
        <div class="floating-emoji floating-sunflower">🌻</div>
        <div class="floating-emoji floating-corn">🌽</div>
        <div class="floating-emoji floating-tomato">🍅</div>

        <div class="container position-relative z-3">
            <div class="row align-items-center">
                <div class="col-lg-8 mx-auto text-center">
                    <div class="glass-badge mb-4">
                        <i class="bi bi-stars text-warning"></i> Game-Based Learning รูปแบบใหม่
                    </div>
                    <h1 class="hero-title">ยินดีต้อนรับสู่<br><?php echo htmlspecialchars($app['app_name']); ?></h1>
                    <p class="hero-subtitle mb-5 px-lg-5">
                        <?php echo htmlspecialchars($app['app_subtitle']); ?><br>
                        เรียนรู้ผ่านภารกิจเกม สนุก คิดเป็นขั้นตอน และแก้ปัญหาอย่างมีเหตุผล
                    </p>
                    <div class="d-flex justify-content-center gap-3 flex-wrap">
                        <a href="pages/login.php" class="btn-grand">
                            <i class="bi bi-play-circle-fill me-2 fs-3"></i> เข้าสู่บทเรียน
                        </a>
                        <a href="pages/guest_start.php" class="btn-grand btn-grand-guest">
                            👀 ทดลองใช้งาน
                        </a>
                    </div>
                    <div class="visitor-stats mt-4 d-flex justify-content-center gap-3 flex-wrap">
                        <div class="visitor-pill">
                            <i class="bi bi-eye-fill me-1"></i>
                            ผู้เข้าชมทั้งหมด
                            <strong><?php echo number_format($total_visits); ?></strong>
                            ครั้ง
                        </div>
                        <div class="visitor-pill">
                            <i class="bi bi-calendar-check-fill me-1"></i>
                            วันนี้
                            <strong><?php echo number_format($today_visits); ?></strong>
                            ครั้ง
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="custom-shape-divider-bottom">
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
            </svg>
        </div>
    </section>

    <section id="features" class="container py-5 mt-5">
        <div class="text-center mb-5">
            <h6 class="text-warning fw-bold tracking-wide text-uppercase">ภารกิจหลัก</h6>
            <h2 class="landing-section-title fw-bold display-5">กิจกรรมภารกิจการเรียนรู้</h2>
            <div class="landing-section-divider"></div>
        </div>

        <div class="row g-5 px-lg-4">
            <div class="col-lg-4 col-md-6">
                <div class="glass-card text-center">
                    <div class="icon-wrapper text-success">🧐</div>
                    <h3 class="fw-bold text-dark mb-3">แยกแยะด้วยตรรกะ</h3>
                    <p class="text-secondary fs-6 mb-0">ฝึกทักษะการใช้เหตุผล (Logic) สังเกตเงื่อนไขเพื่อคัดแยกผลผลิตและกำจัดศัตรูพืชออกจากแปลงให้ถูกต้องแม่นยำ</p>
                </div>
            </div>

            <div class="col-lg-4 col-md-6">
                <div class="glass-card text-center">
                    <div class="icon-wrapper text-warning">🚜</div>
                    <h3 class="fw-bold text-dark mb-3">วางแผนเส้นทาง</h3>
                    <p class="text-secondary fs-6 mb-0">เรียนรู้การเขียนลำดับขั้นตอน (Algorithm) สั่งให้รถไถเดินหน้า เลี้ยวซ้ายขวา เพื่อเก็บเกี่ยวผลผลิตโดยไม่ชนสิ่งกีดขวาง</p>
                </div>
            </div>

            <div class="col-lg-4 col-md-6 mx-auto">
                <div class="glass-card text-center">
                    <div class="icon-wrapper text-primary">🏆</div>
                    <h3 class="fw-bold text-dark mb-3">ลานโชว์ผลงาน</h3>
                    <p class="text-secondary fs-6 mb-0">เปิดพื้นที่สร้างสรรค์ให้น้องๆ สร้างโจทย์ปริศนาในภารกิจของตัวเอง เพื่อนำไปท้าทายเพื่อนๆ และรับยอดไลก์สะสม</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="text-center py-5 mt-5 bg-white border-top">
        <div class="container">
            <h4 class="fw-bold text-success mb-2"><i class="bi bi-tree-fill"></i> โรงเรียนบ้านนาอุดม</h4>
            <p class="text-secondary fs-6 mb-1">
                ออกแบบและพัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong>
            </p>
            <p class="text-muted small mb-4">สำนักงานเขตพื้นที่การศึกษาประถมศึกษามุกดาหาร</p>

            <div class="d-inline-flex align-items-center justify-content-center px-4 py-2 bg-light rounded-pill border">
                <span class="fw-bold text-muted small">&copy; <?php echo date("Y"); ?> <?php echo htmlspecialchars($app['app_name']); ?>. All Rights Reserved.</span>
            </div>
        </div>
    </footer>

    <?php $asset_prefix = '.'; require __DIR__ . '/includes/app_scripts.php'; ?>
    <script>
        // สคริปต์เปลี่ยนสี Navbar เวลากรอเลื่อนจอ (Scroll)
        window.addEventListener('scroll', function() {
            const nav = document.getElementById('mainNav');
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    </script>
</body>
</html>
