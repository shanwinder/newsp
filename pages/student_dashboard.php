<?php
// pages/student_dashboard.php
session_start();
require_once '../includes/db.php';

// ตรวจสอบสิทธิ์ (ต้องเป็นนักเรียนเท่านั้น)
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    header("Location: login.php");
    exit();
}

// ดึงข้อมูลเกมทั้งหมดจาก Database
$sql = "SELECT * FROM games ORDER BY id ASC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>ห้องบัญชาการ - Student Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background-color: #0f172a; /* Dark Blue Space Theme */
            background-image: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 20%),
                              radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 20%);
            color: #fff;
            min-height: 100vh;
        }

        .mission-card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
            backdrop-filter: blur(10px);
        }

        .mission-card:hover {
            transform: translateY(-10px) scale(1.02);
            border-color: #6366f1; /* Indigo glow */
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.3);
            background: rgba(30, 41, 59, 0.9);
        }

        .mission-icon {
            font-size: 3.5rem;
            margin-bottom: 15px;
            text-shadow: 0 0 20px rgba(255,255,255,0.3);
        }

        .btn-play {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            border: none;
            border-radius: 50px;
            padding: 10px 25px;
            font-weight: bold;
            width: 100%;
            transition: all 0.3s;
        }
        .btn-play:hover {
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
            transform: scale(1.05);
        }

        .progress-bar-custom {
            height: 8px;
            border-radius: 10px;
            background-color: #334155;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #10b981; /* Emerald Green */
            width: 0%; /* จะแก้ด้วย PHP ภายหลัง */
            transition: width 1s ease-in-out;
        }
    </style>
</head>
<body>

    <?php require_once '../includes/student_navbar.php'; ?>

    <div class="container py-5">
        <div class="text-center mb-5">
            <h1 class="display-5 fw-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400" 
                style="background: linear-gradient(to right, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                เลือกภารกิจของคุณ
            </h1>
            <p class="text-gray-400 fs-5">สะสมดาวให้ครบเพื่อเป็นสุดยอด Coding Hero!</p>
        </div>

        <div class="row g-4">
            <?php 
            $icons = ['logic'=>'🧩', 'algorithm'=>'🤖', 'text_algo'=>'📝', 'pseudocode'=>'🧪', 'flowchart'=>'🔌'];
            
            if ($result->num_rows > 0):
                while($row = $result->fetch_assoc()):
                    $gameCode = $row['code'];
                    $icon = isset($icons[$gameCode]) ? $icons[$gameCode] : '🎮';
            ?>
            <div class="col-md-6 col-lg-4">
                <div class="mission-card p-4 h-100 d-flex flex-column">
                    <div class="text-center">
                        <div class="mission-icon"><?php echo $icon; ?></div>
                        <h3 class="fw-bold mb-2"><?php echo $row['title']; ?></h3>
                        <p class="text-secondary small mb-3" style="min-height: 40px;">
                            <?php echo $row['description']; ?>
                        </p>
                    </div>

                    <div class="mt-auto">
                        <div class="d-flex justify-content-between small text-muted mb-1">
                            <span>ความคืบหน้า</span>
                            <span>0/10 ดาว</span>
                        </div>
                        <div class="progress-bar-custom mb-4">
                            <div class="progress-fill" style="width: 0%;"></div>
                        </div>

                        <a href="game_select.php?game_id=<?php echo $row['id']; ?>" class="btn btn-play text-white">
                            🚀 เริ่มภารกิจ
                        </a>
                    </div>
                </div>
            </div>
            <?php endwhile; ?>
            <?php else: ?>
                <div class="col-12 text-center text-muted py-5">
                    <h3>ยังไม่มีภารกิจในระบบครับครู!</h3>
                    <p>รบกวน Seed Data ลง Database ก่อนนะครับ</p>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>