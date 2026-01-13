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
    <title>เกมฝึกทักษะการคิดเชิงคำนวณ (Computational Thinking)</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
            color: #333;
            overflow-x: hidden; /* ป้องกันแกน X เลื่อน */
        }

        /* --- Background Animation (Star & Emoji) --- */
        .star-bg {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background: radial-gradient(rgba(255, 255, 255, 0.8) 2px, transparent 2px);
            background-size: 50px 50px;
            opacity: 0.3;
            z-index: -1;
            animation: twinkle 5s infinite;
        }
        @keyframes twinkle {
            0% { opacity: 0.3; }
            50% { opacity: 0.6; }
            100% { opacity: 0.3; }
        }

        .floating-shape {
            position: absolute;
            z-index: -1;
            opacity: 0.6;
            animation: float 10s infinite ease-in-out;
        }

        /* --- Typography & Components --- */
        .hero-title {
            font-weight: 800;
            color: #2c3e50;
            text-shadow: 2px 2px 0px #fff;
        }
        .hero-subtitle {
            font-size: 1.2rem;
            color: #555;
            background: rgba(255, 255, 255, 0.5);
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
        }
        
        /* การ์ดฟีเจอร์ */
        .feature-card {
            border: none;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 30px;
            transition: transform 0.3s, box-shadow 0.3s;
            height: 100%;
            border-bottom: 5px solid transparent;
        }
        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        .feature-card.logic { border-bottom-color: #ff6f61; }
        .feature-card.code { border-bottom-color: #06d6a0; }
        .feature-card.solve { border-bottom-color: #118ab2; }

        .icon-box {
            font-size: 3rem;
            margin-bottom: 15px;
        }

        /* ปุ่ม Action */
        .btn-start {
            background-color: #ff6f61;
            color: white;
            font-size: 1.5rem;
            padding: 15px 40px;
            border-radius: 50px;
            font-weight: bold;
            box-shadow: 0 10px 20px rgba(255, 111, 97, 0.3);
            transition: all 0.3s;
            border: 4px solid white;
        }
        .btn-start:hover {
            background-color: #ff4757;
            transform: scale(1.05);
            color: white;
            box-shadow: 0 15px 25px rgba(255, 111, 97, 0.5);
        }

        /* Navbar */
        .navbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .nav-link {
            font-weight: 600;
            color: #2c3e50 !important;
        }
        .nav-link:hover {
            color: #ff6f61 !important;
        }

        /* Footer */
        footer {
            background: #fff;
            padding: 20px 0;
            margin-top: 50px;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.05);
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
        }
    </style>
</head>
<body>

    <div class="star-bg"></div>
    <div class="floating-shape" style="top: 15%; left: 5%; font-size: 4rem;">🧩</div>
    <div class="floating-shape" style="top: 20%; right: 10%; font-size: 3rem; animation-delay: 1s;">🚀</div>
    <div class="floating-shape" style="bottom: 15%; left: 15%; font-size: 3.5rem; animation-delay: 2s;">🎮</div>
    <div class="floating-shape" style="bottom: 25%; right: 5%; font-size: 2.5rem; animation-delay: 3s;">💡</div>

    <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand d-flex align-items-center" href="#">
                <span style="font-size: 1.8rem;">🦁</span> 
                <span class="ms-2 fw-bold text-primary">CODING HERO P.4</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item"><a class="nav-link" href="#features">เกี่ยวกับเกม</a></li>
                    <li class="nav-item ms-2">
                        <a href="pages/login.php" class="btn btn-outline-primary rounded-pill px-4 fw-bold">
                            <i class="bi bi-box-arrow-in-right"></i> เข้าสู่ระบบ
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <section class="container d-flex flex-column align-items-center justify-content-center" style="min-height: 90vh; padding-top: 80px;">
        <div class="row align-items-center w-100">
            <div class="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
                <span class="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fs-6 shadow-sm">
                    ✨ สื่อการสอนรูปแบบใหม่
                </span>
                <h1 class="hero-title display-3 mb-3">ฝึกคิด เป็นระบบ<br>จบปัญหา ด้วยโค้ดดิ้ง!</h1>
                <p class="hero-subtitle mb-4">
                    เกมผจญภัยฝึกทักษะ <strong>Computational Thinking</strong> <br>
                    สำหรับน้องๆ ชั้นประถมศึกษาปีที่ 4
                </p>
                <div class="d-flex gap-3 justify-content-center justify-content-lg-start">
                    <a href="pages/login.php" class="btn btn-start">
                        🚀 เริ่มภารกิจเลย!
                    </a>
                </div>
            </div>
            <div class="col-lg-6 text-center">
                <div style="font-size: 10rem; animation: float 6s ease-in-out infinite;">
                    👩‍🚀
                </div>
                <div class="mt-3 bg-white p-3 rounded-4 shadow d-inline-block">
                    <div class="d-flex align-items-center gap-2">
                        <div class="bg-success rounded-circle p-1"></div>
                        <span class="fw-bold text-muted">ระบบออนไลน์พร้อมใช้งาน</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="container py-5 mb-5">
        <div class="text-center mb-5">
            <h2 class="fw-bold" style="color: #2c3e50;">ภารกิจที่น้องๆ จะได้เจอ</h2>
            <div style="width: 60px; height: 5px; background: #ff6f61; margin: 10px auto; border-radius: 5px;"></div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-4">
                <div class="feature-card logic text-center">
                    <div class="icon-box">🧩</div>
                    <h4 class="fw-bold text-dark">นักสืบลำดับความคิด</h4>
                    <p class="text-muted">ฝึกการเรียงลำดับขั้นตอน (Algorithm) ผ่านเกมปริศนาที่สนุกและท้าทาย</p>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="feature-card code text-center">
                    <div class="icon-box">🤖</div>
                    <h4 class="fw-bold text-dark">สั่งการหุ่นยนต์</h4>
                    <p class="text-muted">เรียนรู้พื้นฐานการเขียนโปรแกรม (Coding) โดยไม่ต้องพิมพ์โค้ดแม้แต่บรรทัดเดียว</p>
                </div>
            </div>

            <div class="col-md-4">
                <div class="feature-card solve text-center">
                    <div class="icon-box">🏆</div>
                    <h4 class="fw-bold text-dark">สะสมดาวและฉายา</h4>
                    <p class="text-muted">ทำภารกิจให้สำเร็จเพื่อปลดล็อกฉายาสุดเท่ และขึ้นสู่กระดานผู้นำ</p>
                </div>
            </div>
        </div>
    </section>

    <footer>
        <div class="container text-center">
            <p class="mb-1 text-secondary">
                พัฒนาระบบโดย <strong>นายณัฐดนัย สุวรรณไตรย์</strong> (ครูโรงเรียนบ้านนาอุดม)
            </p>
            <small class="text-muted">
                &copy; <?php echo date("Y"); ?> Learning Game Project. All Rights Reserved.
            </small>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>