<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/student_navbar.php';

// 1. รับค่า Stage ID
if (!isset($_GET['stage_id'])) {
    header("Location: student_dashboard.php");
    exit();
}

$stage_id = intval($_GET['stage_id']);
$user_id = $_SESSION['user_id'];

// 2. ดึงข้อมูลด่าน และ Game ID
$sql = "SELECT s.*, g.title as game_title 
        FROM stages s 
        JOIN games g ON s.game_id = g.id 
        WHERE s.id = $stage_id";
$result = $conn->query($sql);

if ($result->num_rows == 0) {
    die("ไม่พบด่านนี้");
}

$stage = $result->fetch_assoc();
$game_id = $stage['game_id'];
$stage_num = $stage['stage_number'];

// 3. LOGIC เลือกไฟล์เกม
$game_script = "stage{$stage_num}.js"; // Default

if ($game_id == 2) {
    $game_script = "stage{$stage_num}_algo.js";
} elseif ($game_id == 3) {
    $game_script = "stage{$stage_num}_code.js";
}
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title><?php echo $stage['title']; ?> - <?php echo $stage['game_title']; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../assets/css/game_common.css">

    <style>
        body {
            background-color: #f0f9ff;
            background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
            min-height: 100vh;
        }

        /* กล่องเกม */
        .game-wrapper {
            background: white;
            border-radius: 25px;
            /* เงาฟุ้งๆ ให้ดูลอยออกมา */
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
            padding: 20px;

            /* ✅ จัดกึ่งกลางหน้าจอ */
            margin: 0 auto;
            max-width: 1000px;
            /* จำกัดความกว้างไม่ให้ยืดจนน่าเกลียด */
            width: fit-content;
            /* ให้กว้างเท่าเนื้อหาเกม */

            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            border: 6px solid #fff;
            outline: 2px dashed #dceeff;
            /* เส้นประตกแต่ง */
        }

        #game-container canvas {
            border-radius: 15px;
            box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
        }

        /* หัวข้อด่าน */
        .stage-header {
            text-align: center;
            margin-bottom: 2rem;
            position: relative;
        }

        .stage-title {
            font-weight: 800;
            color: #2c3e50;
            text-shadow: 2px 2px 0px rgba(255, 255, 255, 1);
            position: relative;
            display: inline-block;
            z-index: 1;
        }

        /* เส้นขีดหลังชื่อด่าน */
        .stage-title::after {
            content: '';
            display: block;
            width: 100%;
            height: 10px;
            background: #ffeaa7;
            position: absolute;
            bottom: 5px;
            left: 0;
            z-index: -1;
            opacity: 0.6;
            border-radius: 5px;
        }

        /* ปุ่มย้อนกลับ */
        .btn-back-float {
            transition: all 0.2s;
            background: white;
            border: 2px solid #e0e0e0;
            color: #555;
            font-weight: bold;
        }

        .btn-back-float:hover {
            transform: translateX(-5px);
            border-color: #333;
            color: #333;
        }
    </style>
</head>

<body>

    <div class="container py-4">

        <div class="row align-items-center mb-4">

            <div class="col-md-3 text-start">
                <a href="game_select.php?game_id=<?php echo $game_id; ?>" class="btn rounded-pill px-4 py-2 btn-back-float shadow-sm">
                    <i class="bi bi-arrow-left me-2"></i> ออกจากด่าน
                </a>
            </div>

            <div class="col-md-6 text-center">
                <span class="badge bg-primary bg-opacity-10 text-primary mb-2 rounded-pill px-3">
                    <i class="bi bi-controller me-1"></i> <?php echo $stage['game_title']; ?>
                </span>
                <h2 class="display-6 stage-title m-0"><?php echo $stage['title']; ?></h2>
            </div>

            <div class="col-md-3"></div>
        </div>

        <div class="game-wrapper">
            <div id="game-container"></div>
        </div>

    </div>

    <script>
        window.STAGE_ID = <?php echo $stage_id; ?>;
        window.GAME_ID = <?php echo $game_id; ?>;

        window.sendResult = function(stageId, stars, duration, attempts) {
            fetch('../api/submit_score.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        stage_id: stageId,
                        score: stars,
                        time_taken: duration,
                        attempts: attempts
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = 'waiting_room.php?stage_id=' + stageId;
                    } else {
                        alert('เกิดข้อผิดพลาดในการบันทึกคะแนน');
                    }
                });
        };
    </script>

    <?php if ($game_id == 2): ?>
        <script src="../assets/js/logic_game/asset_generator.js"></script>
    <?php endif; ?>

    <script src="../assets/js/logic_game/<?php echo $game_script; ?>"></script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>