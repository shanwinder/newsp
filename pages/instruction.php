<?php
// pages/instruction.php
session_start();
if (!isset($_SESSION['user_id'])) {
    header("Location: ../login.php");
    exit();
}

$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;
$is_under_construction = false; 

// 🎯 กำหนดเนื้อหาคู่มือตามด่านที่เลือก
if ($game_id === 1) {
    $game_title = "บทที่ 1: ตรรกะคัดแยก (Logic)";
    $game_theme = "success";
    $mission_desc = "แปลงผักของเรากำลังวุ่นวาย! ภารกิจของคุณคือการแยกแยะเมล็ดพันธุ์ ปุ๋ย และกำจัดวัชพืชออกจากแปลง ให้ถูกต้องตามเงื่อนไขที่กำหนด!";
    
    $steps = [
        ['icon' => 'bi-search', 'title' => '1. สังเกตเงื่อนไข', 'desc' => 'อ่านป้ายคำสั่งให้ดี! บางด่านอาจมีคำหลอก เช่น "ไม่ใช่สีแดง"'],
        ['icon' => 'bi-hand-index-thumb', 'title' => '2. ลาก หรือ คลิก', 'desc' => 'ใช้เมาส์ลากไอเทมลงตะกร้า หรือคลิกกำจัดศัตรูพืช'],
        ['icon' => 'bi-shield-exclamation', 'title' => '3. ระวังตัวหลอก', 'desc' => 'ถ้าคลิกผิดตัว จะถูกหักคะแนนดาวนะ!']
    ];
    $start_link = "../pages/game_select.php?game_id=1"; 

} else if ($game_id === 2) {
    $game_title = "บทที่ 2: เส้นทางเดินรถไถ (Sequence)";
    $game_theme = "warning";
    $mission_desc = "วางแผนเส้นทางและประกอบบล็อกคำสั่งลูกศร เพื่อพารถไถอัตโนมัติ (🚜) ไปเก็บเกี่ยวตะกร้าผลผลิต (🧺) ให้สำเร็จอย่างปลอดภัย";
    
    $steps = [
        ['icon' => 'bi-map', 'title' => '1. สังเกตแผนที่', 'desc' => 'เริ่มด้วยการดูจุดเริ่มต้นของรถไถ ตำแหน่งตะกร้า และเช็คดูโขดหิน (🪨) สิ่งกีดขวางให้ดี'],
        ['icon' => 'bi-puzzle', 'title' => '2. ประกอบบล็อก', 'desc' => 'จินตนาการเส้นทางล่วงหน้า แล้วเรียงลูกศรทิศทาง ⬆️ ⬇️ ⬅️ ➡️ แบบทีละช่อง'],
        ['icon' => 'bi-play-circle', 'title' => '3. สั่งรถไถวิ่ง!', 'desc' => 'ตรวจสอบความถูกต้อง เมื่อเรียงเสร็จแล้วให้กด "รันคำสั่ง" เพื่อดูรถไถวิ่งตามที่คุณเขียนอังกอริทึม!']
    ];
    $start_link = "../pages/game_select.php?game_id=2"; 
    $is_under_construction = false; 

} else if ($game_id === 3) {
    $game_title = "บทที่ 3: ตามล่าหาศัตรูพืช (Debugging)";
    $game_theme = "info";
    $is_under_construction = true; 

} else if ($game_id === 4) {
    $game_title = "บทที่ 4: วนลูปเก็บเกี่ยว (Loop)";
    $game_theme = "danger";
    $is_under_construction = true; 

} else {
    header("Location: student_dashboard.php");
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

        /* 🟢 สไตล์สำหรับใบความรู้ */
        .knowledge-sheet {
            background-color: #fffbeb;
            border: 2px solid #fde68a;
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            position: relative;
            box-shadow: 0 5px 15px rgba(245, 158, 11, 0.1);
        }
        .knowledge-title {
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: #f59e0b;
            color: white;
            padding: 5px 20px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 1rem;
            white-space: nowrap;
            box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
        }
        .logic-term {
            background: white;
            padding: 10px 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            border-left: 4px solid #f59e0b;
            font-size: 0.95rem;
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
        
        .floating-element { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }

        .bouncing-cone { animation: bounce 2s infinite; display: inline-block; }
        @keyframes bounce { 
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 
            40% {transform: translateY(-20px);} 
            60% {transform: translateY(-10px);} 
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
            
            <?php if ($is_under_construction): ?>
                <div class="text-center py-4">
                    <div class="mb-4">
                        <i class="bi bi-cone-striped text-warning bouncing-cone" style="font-size: 5rem; text-shadow: 0 10px 15px rgba(0,0,0,0.1);"></i>
                    </div>
                    <h2 class="fw-bold text-dark mb-3">กำลังเตรียมพื้นที่แปลงเกษตร!</h2>
                    <p class="text-muted fs-5 mb-4">
                        ภารกิจนี้ <strong>อยู่ระหว่างการพัฒนา</strong> <br>
                        คุณครูกำลังเตรียมความสนุกให้พวกเราอยู่ อดใจรออีกนิดนะ!
                    </p>
                    <a href="student_dashboard.php" class="btn btn-secondary btn-lg rounded-pill px-5 shadow-sm fw-bold">
                        <i class="bi bi-arrow-left-circle me-2"></i> กลับหน้าหลัก
                    </a>
                </div>

            <?php else: ?>
                
                <?php if ($game_id === 1): ?>
                <div class="knowledge-sheet mt-3">
                    <div class="knowledge-title"><i class="bi bi-lightbulb-fill"></i> เกร็ดความรู้: การใช้เหตุผลเชิงตรรกะ</div>
                    <p class="text-dark fw-bold mb-2 mt-2">การแก้ปัญหาอย่างเป็นขั้นตอน เริ่มจากการเข้าใจ "เงื่อนไข" (Conditions)</p>
                    <p class="text-secondary small mb-3">ในภาษาคอมพิวเตอร์ เรามักจะเจอคำสั่งที่ช่วยในการตัดสินใจ 3 รูปแบบหลักๆ คือ:</p>
                    
                    <div class="row g-2">
                        <div class="col-md-4">
                            <div class="logic-term shadow-sm h-100">
                                <span class="badge bg-primary mb-1">และ (AND)</span><br>
                                ต้องเป็นจริง <strong>ทั้ง 2 อย่าง</strong><br>
                                <span class="text-muted small">เช่น ต้องเป็น "สีแดง" <u>และ</u> "ใบกลม" เท่านั้นถึงจะคลิกได้</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="logic-term shadow-sm h-100">
                                <span class="badge bg-success mb-1">หรือ (OR)</span><br>
                                เป็นจริง <strong>อย่างใดอย่างหนึ่ง</strong> ก็ได้<br>
                                <span class="text-muted small">เช่น เลือกเก็บ "แมลงสีแดง" <u>หรือ</u> "แมลงสีฟ้า" ก็ได้</span>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="logic-term shadow-sm h-100">
                                <span class="badge bg-danger mb-1">ไม่ใช่ (NOT)</span><br>
                                คือสิ่งที่ <strong>ตรงกันข้าม</strong><br>
                                <span class="text-muted small">เช่น ให้เก็บพืชที่ <u>ไม่ใช่</u> สีเหลือง (แปลว่าเก็บสีอื่นได้หมด)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <?php elseif ($game_id === 2): ?>
                <div class="knowledge-sheet mt-3" style="border-color: #fcd34d; background-color: #fffbeb;">
                    <div class="knowledge-title" style="background: #f59e0b;"><i class="bi bi-code-square"></i> เกร็ดความรู้: การทำงานตามลำดับขั้นตอน (Sequential Algorithm)</div>
                    <p class="text-dark fw-bold mb-2 mt-2">ยินดีต้อนรับยุวเกษตรกร! ในภารกิจนี้เราจะมาฝึกทักษะการเป็นนักเขียนโปรแกรมเบื้องต้น</p>
                    <p class="text-secondary small mb-0">รู้หรือไม่? คอมพิวเตอร์หรือหุ่นยนต์รถไถของเรา <strong>ไม่สามารถคิดเองได้</strong> มันจะทำงานตามคำสั่งที่เราป้อนให้ "ทีละคำสั่ง" เรียงจากคำสั่งแรกไปจนถึงคำสั่งสุดท้ายอย่างเคร่งครัด ถ้าเราวางคำสั่งสลับกันแม้แต่ขั้นตอนเดียว รถไถก็อาจจะวิ่งชนหินหรือหลงทางได้เลยนะ!</p>
                </div>
                <?php endif; ?>

                <div class="mission-box mb-5 shadow-sm">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-megaphone-fill fs-1 text-success me-3"></i>
                        <div>
                            <strong class="text-success fs-5">เป้าหมายภารกิจ:</strong><br>
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

                <?php if ($game_id === 2): ?>
                <h5 class="fw-bold text-danger mb-3"><i class="bi bi-exclamation-triangle-fill"></i> กฎเหล็กของแปลงเกษตร (ข้อควรระวัง)</h5>
                <div class="row g-3 mb-5">
                    <div class="col-md-4">
                        <div class="p-3 border rounded shadow-sm bg-white h-100" style="border-left: 4px solid #dc3545 !important;">
                            <b class="text-danger fs-6">💥 ห้ามชนสิ่งกีดขวาง</b>
                            <p class="small text-muted mb-0 mt-2">ถ้ารถไถวิ่งไปชนโขดหินปั๊ก เครื่องยนต์จะเสียหาย และต้องเริ่มทำภารกิจใหม่ทั้งหมด</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded shadow-sm bg-white h-100" style="border-left: 4px solid #fd7e14 !important;">
                            <b class="fs-6" style="color: #d35400;">🚧 ห้ามตกขอบแปลง</b>
                            <p class="small text-muted mb-0 mt-2">ต้องนับช่องตารางให้แม่นยำ ถ้ารถไถวิ่งทะลุขอบแปลงเกษตรออกไป จะถือว่าทำภารกิจพลาด</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-3 border rounded shadow-sm bg-white h-100" style="border-left: 4px solid #198754 !important;">
                            <b class="text-success fs-6">🎯 หยุดให้ตรงเป้า</b>
                            <p class="small text-muted mb-0 mt-2">ชุดคำสั่งของคุณ ต้องพารถไถไปหยุดที่ช่องตะกร้าผลผลิตพอดีเป๊ะ ห้ามขาดและเกิน!</p>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <?php if($mode !== 'solo'): ?>
                <div class="alert alert-warning border-0 shadow-sm rounded-4 text-center fw-bold">
                    <i class="bi bi-people-fill text-warning fs-4 align-middle me-2"></i> 
                    คุณกำลังเล่นใน "โหมดทีม" อย่าลืมปรึกษากันก่อนคลิกเพื่อฝึกทักษะการทำงานร่วมกันนะ!
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
            <?php endif; ?>

        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>