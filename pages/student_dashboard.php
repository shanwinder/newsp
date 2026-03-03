<?php
// pages/student_dashboard.php
session_start();
require_once '../includes/db.php';

// ตรวจสอบสิทธิ์
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION['user_id'];
$pair_name = $_SESSION['name'] ?? 'นักเรียน';
$current_role = $_SESSION['current_role'] ?? 'driver';
$is_solo = !isset($_SESSION['partner_id']);

// ดึงข้อมูลเกมทั้งหมด
$sql = "SELECT * FROM games ORDER BY id ASC";
$result = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ศูนย์ฟาร์มอัจฉริยะ - Young Smart Farmer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../assets/css/game_common.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background-color: #f0fdf4; /* พื้นหลังสีเขียวอ่อนสบายตา */
            background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
            color: #334155;
            min-height: 100vh;
        }

        /* ป้ายบอกสถานะคู่หู */
        .pair-status-banner {
            background: white;
            border-radius: 20px;
            padding: 15px 30px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            border: 3px dashed #a7f3d0;
            display: inline-block;
            margin-bottom: 2rem;
        }

        .farm-card {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-bottom: 8px solid #8b4513; /* ขอบล่างสีน้ำตาลเหมือนดิน/ไม้ */
            border-radius: 20px;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
        }

        .farm-card:hover {
            transform: translateY(-8px);
            border-color: #34d399;
            box-shadow: 0 15px 30px rgba(16, 185, 129, 0.2);
        }

        .mission-icon {
            font-size: 4rem;
            margin-bottom: 10px;
            animation: bounce 2s infinite ease-in-out;
        }

        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }

        .btn-play {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: none;
            border-radius: 50px;
            padding: 12px 25px;
            font-weight: bold;
            width: 100%;
            transition: all 0.3s;
            color: white !important;
            font-size: 1.1rem;
            box-shadow: 0 4px 6px rgba(217, 119, 6, 0.3);
        }

        .btn-play:hover {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            transform: scale(1.05);
            box-shadow: 0 8px 15px rgba(217, 119, 6, 0.4);
        }

        .progress-bar-custom {
            height: 12px;
            border-radius: 10px;
            background-color: #e2e8f0;
            overflow: hidden;
            position: relative;
            border: 1px solid #cbd5e1;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #34d399, #10b981);
            width: 0%;
            transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .star-score {
            color: #eab308;
            font-weight: 800;
            font-size: 1.1rem;
        }
    </style>
</head>

<body>

    <?php require_once '../includes/student_navbar.php'; ?>

    <div class="container py-4 text-center">
        
        <div class="pair-status-banner">
            <h5 class="mb-1 text-secondary">ทีมเกษตรกรปัจจุบัน</h5>
            <h3 class="fw-bold text-success mb-2">🧑‍🌾 <?php echo htmlspecialchars($pair_name); ?></h3>
            <?php if(!$is_solo): ?>
                <span class="badge bg-primary rounded-pill px-3 py-2 fs-6">
                    <i class="bi bi-controller"></i> สิทธิ์คุมหน้าจอตอนนี้: 
                    <?php echo ($current_role === 'driver') ? "ผู้คุมรถไถ (Driver)" : "ผู้วางแผน (Navigator)"; ?>
                </span>
            <?php else: ?>
                <span class="badge bg-secondary rounded-pill px-3 py-2 fs-6">
                    <i class="bi bi-person-fill"></i> โหมดลุยเดี่ยว (Solo)
                </span>
            <?php endif; ?>
        </div>

        <div class="mb-5">
            <h1 class="display-5 fw-bold" style="color: #166534;">
                เลือกแปลงเกษตรของคุณ
            </h1>
            <p class="text-muted fs-5">สะสมดาวผลผลิตให้ครบเพื่อเป็นสุดยอด Young Smart Farmer!</p>
        </div>

        <div class="row g-4 text-start">
            <?php
            // ปรับไอคอนให้เข้ากับธีมเกษตร
            $icons = [
                'logic' => '🌾',       // คัดแยกผลผลิต
                'algorithm' => '🚜',   // รถไถเดินตามสั่ง
                'text_algo' => '📋',   // จัดลำดับงานฟาร์ม
                'pseudocode' => '💧',  // รดน้ำมีเงื่อนไข
                'flowchart' => '🗺️'    // วางแผนผังฟาร์ม
            ];

            if ($result->num_rows > 0):
                while ($row = $result->fetch_assoc()):
                    $gameCode = $row['code'];
                    $gameId = $row['id'];
                    $icon = isset($icons[$gameCode]) ? $icons[$gameCode] : '🌻';

                    // 1. หาจำนวนด่านทั้งหมดของเกมนี้
                    $sql_total = "SELECT COUNT(*) as total FROM stages WHERE game_id = $gameId";
                    $res_total = $conn->query($sql_total);
                    $total_stages = $res_total->fetch_assoc()['total'];
                    $max_score = $total_stages * 3; // คะแนนเต็ม (3 ดาวต่อด่าน)

                    // 2. หาคะแนนที่เด็กคนนี้ทำได้ในเกมนี้
                    $sql_score = "SELECT SUM(p.score) as earned 
                                  FROM progress p 
                                  JOIN stages s ON p.stage_id = s.id 
                                  WHERE p.user_id = $user_id AND s.game_id = $gameId";
                    $res_score = $conn->query($sql_score);
                    $current_score = $res_score->fetch_assoc()['earned'];
                    if (!$current_score) $current_score = 0;

                    // 3. คิดเป็นเปอร์เซ็นต์
                    $percent = ($max_score > 0) ? ($current_score / $max_score) * 100 : 0;
            ?>
                    <div class="col-md-6 col-lg-4">
                        <div class="farm-card p-4 h-100 d-flex flex-column">
                            <div class="text-center">
                                <div class="mission-icon"><?php echo $icon; ?></div>
                                <h4 class="fw-bold mb-2 text-dark"><?php echo htmlspecialchars($row['title']); ?></h4>
                                <p class="text-muted small mb-3" style="min-height: 48px;">
                                    <?php echo htmlspecialchars($row['description']); ?>
                                </p>
                            </div>

                            <div class="mt-auto">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span class="small fw-bold text-secondary">ผลผลิตที่ได้</span>
                                    <span class="star-score">⭐ <?php echo $current_score; ?>/<?php echo $max_score; ?></span>
                                </div>

                                <div class="progress-bar-custom mb-4" title="<?php echo number_format($percent, 0); ?>%">
                                    <div class="progress-fill" style="width: <?php echo $percent; ?>%;"></div>
                                </div>

                                <a href="instruction.php?game_id=<?php echo $row['id']; ?>" class="btn btn-play">
                                    🚀 เข้าสู่ฟาร์ม
                                </a>
                            </div>
                        </div>
                    </div>
                <?php endwhile; ?>
            <?php else: ?>
                <div class="col-12 text-center text-muted py-5">
                    <h3>ยังไม่มีแปลงเกษตรในระบบครับ!</h3>
                </div>
            <?php endif; ?>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <?php include '../includes/class_control_script.php'; ?>
</body>

</html>