<?php
// index.php - หน้าแรกของเว็บไซต์ (Landing Page)
session_start();
require_once 'includes/db.php';

// 1. ตรวจสอบว่า Login อยู่แล้วหรือไม่? ถ้าใช่ ให้เด้งไป Dashboard เลย
if (isset($_SESSION['user_id'])) {
    if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
        header("Location: pages/dashboard.php");
    } else {
        header("Location: pages/student_dashboard.php");
    }
    exit();
}
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Young Smart Farmer - เกมฝึกทักษะการแก้ปัญหาอย่างเป็นขั้นตอน</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        :root {
            --primary-green: #2ecc71;
            --dark-green: #27ae60;
            --accent-orange: #e67e22;
            --light-bg: #f4fdf8;
        }

        body {
            font-family: 'Kanit', sans-serif;
            background-color: var(--light-bg);
            color: #2c3e50;
            overflow-x: hidden;
        }

        /* --- Hero Section (อลังการด้วย Gradient & วงกลมแสง) --- */
        .hero-section {
            position: relative;
            background: linear-gradient(135deg, #1e8449 0%, #2ecc71 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            overflow: hidden;
            z-index: 1;
        }

        /* วงกลมแสงด้านหลังให้ดูมีมิติ */
        .glow-circle {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%);
            z-index: -1;
        }
        .glow-1 { width: 600px; height: 600px; top: -10%; left: -10%; animation: pulse 6s infinite alternate; }
        .glow-2 { width: 800px; height: 800px; bottom: -20%; right: -10%; animation: pulse 8s infinite alternate-reverse; }

        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            100% { transform: scale(1.2); opacity: 0.8; }
        }

        /* คลื่นด้านล่าง Hero (SVG Wave) */
        .custom-shape-divider-bottom {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            overflow: hidden;
            line-height: 0;
            transform: rotate(180deg);
        }
        .custom-shape-divider-bottom svg {
            position: relative;
            display: block;
            width: calc(100% + 1.3px);
            height: 120px;
        }
        .custom-shape-divider-bottom .shape-fill { fill: var(--light-bg); }

        /* --- Typography --- */
        .hero-title {
            font-weight: 900;
            color: #ffffff;
            font-size: 4.5rem;
            text-shadow: 0 10px 20px rgba(0,0,0,0.2);
            line-height: 1.1;
            margin-bottom: 20px;
        }
        .hero-subtitle {
            font-size: 1.5rem;
            color: #ecf0f1;
            font-weight: 300;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        /* --- Glassmorphism Elements --- */
        .glass-badge {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            color: white;
            padding: 10px 25px;
            border-radius: 50px;
            font-weight: 600;
            letter-spacing: 1px;
            display: inline-block;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(15px);
            border-radius: 30px;
            padding: 40px;
            border: 1px solid rgba(255,255,255,0.8);
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            height: 100%;
            position: relative;
            z-index: 2;
        }
        .glass-card:hover {
            transform: translateY(-15px);
            box-shadow: 0 30px 60px rgba(39, 174, 96, 0.15);
            border-color: var(--primary-green);
        }

        /* --- Buttons & Animations --- */
        .btn-grand {
            background: linear-gradient(45deg, #f39c12, #d35400);
            color: white;
            font-size: 1.6rem;
            padding: 18px 50px;
            border-radius: 50px;
            font-weight: 800;
            border: none;
            box-shadow: 0 15px 30px rgba(211, 84, 0, 0.4);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
        }
        .btn-grand::after {
            content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: 0.5s;
        }
        .btn-grand:hover::after { left: 100%; }
        .btn-grand:hover { transform: scale(1.05); color: white; box-shadow: 0 20px 40px rgba(211, 84, 0, 0.6); }

        .floating-emoji {
            font-size: 5rem;
            position: absolute;
            animation: float-grand 6s ease-in-out infinite;
            filter: drop-shadow(0 15px 15px rgba(0,0,0,0.2));
        }
        @keyframes float-grand {
            0%, 100% { transform: translateY(0) rotate(-5deg) scale(1); }
            50% { transform: translateY(-30px) rotate(5deg) scale(1.1); }
        }

        .icon-wrapper {
            width: 90px; height: 90px;
            background: linear-gradient(135deg, #e8f8f5, #a3e4d7);
            border-radius: 25px;
            display: flex; align-items: center; justify-content: center;
            font-size: 3rem; margin: 0 auto 25px auto;
            transform: rotate(-5deg); transition: 0.3s;
        }
        .glass-card:hover .icon-wrapper { transform: rotate(0deg) scale(1.1); }

        /* Navbar */
        .navbar-grand {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255,255,255,0.2);
            transition: 0.3s;
        }
        .navbar-grand.scrolled {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .nav-link { font-weight: 600; color: white !important; }
        .navbar-grand.scrolled .nav-link { color: var(--dark-green) !important; }
        .navbar-brand-text { color: white; transition: 0.3s; }
        .navbar-grand.scrolled .navbar-brand-text { color: var(--dark-green); }

        /* Media Query for Mobile */
        @media (max-width: 768px) {
            .hero-title { font-size: 2.8rem; }
            .hero-subtitle { font-size: 1.2rem; }
            .hero-section { text-align: center; }
        }
    </style>
</head>
<body>

    <nav class="navbar navbar-expand-lg fixed-top navbar-grand" id="mainNav">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center" href="#">
                <span style="font-size: 2.2rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));">🏡</span> 
                <span class="ms-2 fw-bold navbar-brand-text fs-3">Young Smart Farmer</span>
            </a>
            <button class="navbar-toggler border-0 bg-light opacity-75" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item"><a class="nav-link px-4" href="#features">เกี่ยวกับฟาร์ม</a></li>
                    <li class="nav-item ms-lg-2 mt-3 mt-lg-0">
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
        
        <div class="floating-emoji" style="top: 20%; left: 10%;">🚜</div>
        <div class="floating-emoji" style="top: 15%; right: 15%; animation-delay: 1s; font-size: 4rem;">🌻</div>
        <div class="floating-emoji" style="bottom: 30%; left: 20%; animation-delay: 2s; font-size: 3.5rem;">🌽</div>
        <div class="floating-emoji" style="bottom: 25%; right: 10%; animation-delay: 1.5s;">🍅</div>

        <div class="container position-relative z-3">
            <div class="row align-items-center">
                <div class="col-lg-8 mx-auto text-center">
                    <div class="glass-badge mb-4">
                        <i class="bi bi-stars text-warning"></i> Game-Based Learning รูปแบบใหม่
                    </div>
                    <h1 class="hero-title">ฝึกแก้ปัญหา เป็นขั้นตอน<br>ปลูกความรู้ ด้วยโค้ดดิ้ง!</h1>
                    <p class="hero-subtitle mb-5 px-lg-5">
                        สวมบทบาทเกษตรกรยุคใหม่ ตะลุยภารกิจฝึกทักษะ <strong>Computational Thinking</strong> สนุกไปกับการใช้ตรรกะและอัลกอริทึม
                    </p>
                    <a href="pages/login.php" class="btn-grand">
                        <i class="bi bi-play-circle-fill me-2 fs-3"></i> เริ่มผจญภัยในฟาร์ม
                    </a>
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
            <h2 class="fw-bold display-5" style="color: #2c3e50;">กิจกรรมในแปลงเกษตร</h2>
            <div style="width: 80px; height: 6px; background: var(--primary-green); margin: 15px auto; border-radius: 10px;"></div>
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
                    <p class="text-secondary fs-6 mb-0">เปิดพื้นที่สร้างสรรค์ให้น้องๆ สร้างโจทย์ปริศนาในฟาร์มของตัวเอง เพื่อนำไปท้าทายเพื่อนๆ และรับยอดไลก์สะสม</p>
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
                <span class="fw-bold text-muted small">&copy; <?php echo date("Y"); ?> Young Smart Farmer Project. All Rights Reserved.</span>
            </div>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
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