<?php
// pages/instruction.php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login.php");
    exit();
}

$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;

// 🎯 กำหนดเนื้อหาคู่มือตามด่านที่เลือก
if ($game_id === 1) {
    $game_title = "บทที่ 1: ตรรกะคัดแยก (Logic)";
    $game_theme = "success";
    $mission_desc = "แปลงผักของเรากำลังวุ่นวาย! ภารกิจของคุณคือการใช้ 'ตรรกะ (Logic)' ในการแยกแยะเมล็ดพันธุ์ ปุ๋ย และกำจัดวัชพืชออกจากแปลงให้ถูกต้องตามเงื่อนไขที่กำหนด!";
    
    // กติกาการเล่น บทที่ 1
    $steps = [
        ['icon' => 'bi-search', 'title' => '1. สังเกตเงื่อนไข', 'desc' => 'อ่านป้ายคำสั่งให้ดี! บางด่านอาจมีคำหลอก เช่น "ไม่ใช่สีแดง" หรือ "ใบกลมและสีเขียว"'],
        ['icon' => 'bi-hand-index-thumb', 'title' => '2. ลาก หรือ คลิก', 'desc' => 'ใช้เมาส์ลากไอเทมลงตะกร้าให้ถูกต้อง หรือคลิกกำจัดศัตรูพืชให้สิ้นซาก'],
        ['icon' => 'bi-shield-exclamation', 'title' => '3. ระวังตัวหลอก', 'desc' => 'ถ้าคลิกผิดตัว หรือหยิบของผิดใส่ตะกร้า จะถูกหักคะแนนดาวนะ!']
    ];
    
    // ลิงก์ไปเริ่มด่าน 1 (คุณครูสามารถปรับ URL ให้ตรงกับไฟล์เกมจริงได้เลยครับ)
    $start_link = "../pages/game_select.php?game_id=1"; 
    // ตัวอย่างถ้าคลิกแล้วเข้าเกมเลย: $start_link = "../logic_game/stage1.php";
    
} else if ($game_id === 2) {
    // เผื่อไว้สำหรับอนาคต (บทที่ 2)
    $game_title = "บทที่ 2: เส้นทางรถไถ (Algorithm)";
    $game_theme = "warning";
    $mission_desc = "ถึงเวลาเก็บเกี่ยว! วางแผนเขียนคำสั่ง (Algorithm) แบบเป็นขั้นตอน เพื่อสั่งให้รถไถเดินหน้า เลี้ยวซ้ายขวา ไปเก็บผลผลิตโดยไม่ชนรั้ว!";
    
    $steps = [
        ['icon' => 'bi-signpost-split', 'title' => '1. วางแผนเส้นทาง', 'desc' => 'มองหาเส้นทางที่สั้นและปลอดภัยที่สุดเพื่อไปให้ถึงจุดหมาย'],
        ['icon' => 'bi-puzzle', 'title' => '2. ต่อบล็อกคำสั่ง', 'desc' => 'ลากบล็อกคำสั่ง เดินหน้า, เลี้ยวซ้าย, เลี้ยวขวา มาต่อกันเป็นลำดับขั้น'],
        ['icon' => 'bi-play-circle', 'title' => '3. ทดสอบระบบ', 'desc' => 'กดปุ่มทำงานเพื่อดูรถไถวิ่งตามคำสั่ง หากผิดพลาดให้แก้ไขรหัสใหม่']
    ];
    $start_link = "../pages/game_select.php?game_id=2";
} else {
    header("Location: dashboard.php");
    exit();
}

$mode = $_SESSION['mode'] ?? 'solo';
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>คู่มือการเล่น - Young Smart Farmer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #a8e063 0%, #56ab2f 100%);
            background-image: url('https://www.transparenttextures.com/patterns/cubes.png');
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px 15px;
        }

        .instruction-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 25px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            border: 5px solid #fff;
            max-width: 850px;
            width: 100%;
            overflow: hidden;
            position: relative;
        }

        .card-header-custom {
            background-color: #f8f9fa;
            border-bottom: 3px dashed #e2e8f0;
            padding: 30px;
            text-align: center;
        }

        .mission-box {
            background: #e9f7ef;
            border-left: 5px solid #27ae60;
            padding: 20px;
            border-radius: 0 15px 15px 0;
            font-size: 1.15rem;
            color: #2c3e50;
        }

        .step-card {
            background: #ffffff;
            border-radius: 15px;
            padding: 20px;
            height: 100%;
            border: 2px solid #f1f5f9;
            transition: 0.3s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.02);
            text-align: center;
        }

        .step-card:hover {
            transform: translateY(-5px);
            border-color: #27ae60;
            box-shadow: 0 10px 20px rgba(39, 174, 96, 0.1);
        }

        .icon-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #27ae60;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            margin: 0 auto 15px auto;
            box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
        }

        .btn-start {
            background-color: #d35400;
            color: white;
            font-size: 1.3rem;
            font-weight: bold;
            padding: 15px 40px;
            border-radius: 50px;
            transition: 0.3s;
            border: none;
            box-shadow: 0 8px 20px rgba(211, 84, 0, 0.4);
        }

        .btn-start:hover {
            background-color: #e67e22;
            transform: translateY(-3px);
            box-shadow: 0 12px 25px rgba(230, 126, 34, 0.5);
            color: white;
        }
        
        .floating-element {
            animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
    </style>
</head>
<body>

    <div class="instruction-card">
        <div class="card-header-custom">
            <h5 class="text-secondary fw-bold mb-2">📜 แฟ้มภารกิจ Young Smart Farmer</h5>
            <h1 class="fw-bold text-<?php echo $game_theme; ?> mb-0 display-5 floating-element">
                <?php echo $game_title; ?>
            </h1>
        </div>

        <div class="p-4 p-md-5">
            
            <div class="mission-box mb-5 shadow-sm">
                <div class="d-flex align-items-center">
                    <i class="bi bi-megaphone-fill fs-1 text-success me-3"></i>
                    <div>
                        <strong class="text-success fs-5">ภารกิจของคุณ:</strong><br>
                        <?php echo $mission_desc; ?>
                    </div>
                </div>
            </div>

            <h4 class="fw-bold text-dark mb-4 text-center"><i class="bi bi-controller"></i> วิธีการเล่น</h4>
            <div class="row g-4 mb-5">
                <?php foreach ($steps as $step): ?>
                <div class="col-md-4">
                    <div class="step-card">
                        <div class="icon-circle">
                            <i class="bi <?php echo $step['icon']; ?>"></i>
                        </div>
                        <h5 class="fw-bold text-dark"><?php echo $step['title']; ?></h5>
                        <p class="text-secondary small mb-0"><?php echo $step['desc']; ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>

            <?php if($mode !== 'solo'): ?>
            <div class="alert alert-warning border-0 shadow-sm rounded-4 text-center fw-bold">
                <i class="bi bi-people-fill text-warning fs-4 align-middle me-2"></i> 
                คุณกำลังเล่นใน "โหมดทีม" อย่าลืมปรึกษากันก่อนคลิกเพื่อไม่ให้พลาดถูกหักดาวนะ!
            </div>
            <?php endif; ?>

            <div class="text-center mt-2">
                <a href="<?php echo $start_link; ?>" class="btn btn-start">
                    <i class="bi bi-play-fill me-1"></i> เข้าสู่แปลงเกษตร!
                </a>
                <div class="mt-3">
                    <a href="student_dashboard.php" class="text-muted text-decoration-none small fw-bold">
                        <i class="bi bi-arrow-left"></i> กลับไปหน้าโปรไฟล์
                    </a>
                </div>
            </div>

        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>