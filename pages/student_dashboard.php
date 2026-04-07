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
$mode = $_SESSION['mode'] ?? 'solo';
$team_members = $_SESSION['team_members'] ?? [$user_id];
$display_name = $_SESSION['name'] ?? 'นักเรียน';

// ดึงชื่อและบทบาทของสมาชิกในทีมทุกคนมาเพื่อแสดงผล
$team_data = [];
if (!empty($team_members)) {
    // แปลง Array ของ ID ให้เป็น String เพื่อใช้ใน SQL IN()
    $ids = implode(',', array_map('intval', $team_members));
    
    // เรียงลำดับตามคนที่ล็อกอินเข้ามาก่อน
    $sql_names = "SELECT name, team_role FROM users WHERE user_id IN ($ids) ORDER BY FIELD(user_id, $ids)";
    $res_names = $conn->query($sql_names);
    
    if ($res_names) {
        while ($row = $res_names->fetch_assoc()) {
            $team_data[] = $row;
        }
    }
}

// ดึงข้อมูลเกมทั้งหมด (ตอนนี้มี 4 บทเรียนแล้ว)
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
            background-color: #f0fdf4;
            background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
            color: #334155;
            min-height: 100vh;
        }

        .pair-status-banner {
            background: white;
            border-radius: 20px;
            padding: 20px 30px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            border: 3px dashed #a7f3d0;
            display: inline-block;
            margin-bottom: 2rem;
            min-width: 50%;
        }
        .pair-status-banner.mode-solo { border-color: #86efac; }
        .pair-status-banner.mode-pair { border-color: #93c5fd; }
        .pair-status-banner.mode-group { border-color: #fcd34d; }

        .farm-card {
            background: #ffffff;
            border: 2px solid #e2e8f0;
            border-bottom: 8px solid #8b4513;
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

        .heartbeat-badge {
            animation: pulse-danger 1.5s infinite;
        }
        @keyframes pulse-danger {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
    </style>
</head>

<body>

    <?php require_once '../includes/student_navbar.php'; ?>

    <div class="container py-4 text-center">
        
        <div class="pair-status-banner mode-<?php echo $mode; ?>">
            <h6 class="mb-2 text-secondary fw-bold">รูปแบบการเรียนรู้ปัจจุบัน</h6>
            
            <?php if ($mode === 'solo'): ?>
                <h3 class="fw-bold text-success mb-3">🧑‍🌾 <?php echo htmlspecialchars($display_name); ?></h3>
                <span class="badge bg-success rounded-pill px-4 py-2 fs-6 shadow-sm">
                    <i class="bi bi-person-fill"></i> เกษตรกรฉายเดี่ยว (Solo)
                </span>
                
            <?php elseif ($mode === 'group'): ?>
                <h3 class="fw-bold mb-3" style="color:#d35400;">👨‍👩‍👧‍👦 ทีมเกษตรกร <?php echo htmlspecialchars($display_name); ?></h3>
                <span class="badge bg-warning text-dark rounded-pill px-4 py-2 fs-6 shadow-sm mb-3">
                    <i class="bi bi-diagram-3-fill"></i> ทำงานเป็นกลุ่ม (Group)
                </span>
                <div class="d-flex justify-content-center gap-2 flex-wrap">
                    <?php 
                    foreach($team_data as $index => $member) {
                        echo "<div class='bg-light px-3 py-1 rounded-pill border'><i class='bi bi-person-check-fill text-success'></i> <span class='fw-bold'>{$member['name']}</span></div>";
                    }
                    ?>
                </div>
            <?php endif; ?>
        </div>

        <div class="mb-5">
            <h1 class="display-5 fw-bold" style="color: #166534;">
                เลือกแปลงเกษตรของคุณ
            </h1>
            <p class="text-muted fs-5">สะสมดาวผลผลิตให้ครบเพื่อเป็นสุดยอด Young Smart Farmer!</p>
        </div>

        <div class="row g-4 text-start justify-content-center">
            <?php
            // อัปเดตไอคอนให้ตรงกับ 4 เกมใหม่
            $icons = [
                'logic' => '🌾',       // บทที่ 1 คัดแยกผลผลิต
                'algorithm' => '🚜',   // บทที่ 2 เส้นทางเดินรถไถ
                'condition' => '💧',   // บทที่ 3 เครื่องรดน้ำอัจฉริยะ
                'debugging' => '🕵️‍♂️'   // บทที่ 4 กู้วิกฤตฟาร์ม
            ];

            if ($result->num_rows > 0):
                while ($row = $result->fetch_assoc()):
                    $gameCode = $row['code'];
                    $gameId = $row['id'];
                    $icon = isset($icons[$gameCode]) ? $icons[$gameCode] : '🌻';

                    // หาจำนวนด่านทั้งหมดของเกมนี้
                    $sql_total = "SELECT COUNT(*) as total FROM stages WHERE game_id = $gameId";
                    $res_total = $conn->query($sql_total);
                    $total_stages = $res_total->fetch_assoc()['total'];
                    $max_score = $total_stages * 3; 

                    // หาคะแนนที่ทำได้ (ดึงเฉพาะคนที่ล็อกอินหลัก)
                    $sql_score = "SELECT SUM(p.score) as earned 
                                  FROM progress p 
                                  JOIN stages s ON p.stage_id = s.id 
                                  WHERE p.user_id = $user_id AND s.game_id = $gameId";
                    $res_score = $conn->query($sql_score);
                    $current_score = $res_score->fetch_assoc()['earned'];
                    if (!$current_score) $current_score = 0;

                    $percent = ($max_score > 0) ? ($current_score / $max_score) * 100 : 0;

                    // 🟢 เช็คสถานะการสร้างชิ้นงานว่าครูส่งกลับหรือไม่
                    $sql_work = "SELECT status FROM student_works WHERE user_id = $user_id AND game_id = $gameId LIMIT 1";
                    $res_work = $conn->query($sql_work);
                    $project_status = ($res_work && $res_work->num_rows > 0) ? $res_work->fetch_assoc()['status'] : null;
            ?>
                    <div class="col-md-6 col-lg-5">
                        <div class="farm-card p-4 h-100 d-flex flex-column <?php echo ($project_status === 'revision') ? 'border-danger border-3 bg-danger bg-opacity-10' : ''; ?>">
                            
                            <?php if ($project_status === 'revision'): ?>
                            <div class="position-absolute top-0 end-0 mt-3 me-3 z-3">
                                <span class="badge bg-danger fs-6 shadow heartbeat-badge"><i class="bi bi-exclamation-triangle-fill"></i> ครูส่งกลับให้แก้ไข</span>
                            </div>
                            <?php endif; ?>

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

                                <?php
                                $btn_text = "🚀 เข้าสู่ฟาร์ม";
                                $btn_class = "btn-play";
                                
                                if ($project_status === 'revision') {
                                    $btn_text = "⚠️ เข้าไปแก้ไขงานด่วน";
                                    $btn_class = "btn btn-danger w-100 rounded-pill py-2 fw-bold shadow heartbeat-badge text-white";
                                } elseif ($project_status === 'submitted' || $project_status === 'reviewed') {
                                    $btn_text = "✅ เข้าสู่ฟาร์ม (มีผลงานแล้ว)";
                                }
                                ?>
                                <a href="instruction.php?game_id=<?php echo $row['id']; ?>" class="<?php echo strpos($btn_class, 'btn ') !== false ? $btn_class : 'btn ' . $btn_class . ' w-100 d-block text-white text-decoration-none'; ?>">
                                    <?php echo $btn_text; ?>
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