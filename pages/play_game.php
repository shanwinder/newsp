<?php
// pages/play_game.php - หน้าจอหลักสำหรับเล่นเกม
session_start();
require_once '../includes/db.php';

// --- 🛡️ GATEKEEPER SYSTEM (เพิ่มใหม่) ---
// เช็คว่าระบบล็อกอยู่หรือไม่? (ยกเว้น Admin เข้าได้เสมอ)
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    $sql_check = "SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'";
    $res_check = $conn->query($sql_check);
    $status = $res_check->fetch_assoc()['setting_value'] ?? 'locked';

    if ($status === 'locked') {
        // ถ้าล็อกอยู่ ให้เด้งไปหน้าแจ้งเตือน หรือกลับหน้าเดิม
        echo "<script>
            alert('⛔ ยังไม่ได้รับอนุญาต!\\nคุณครูยังไม่เปิดให้เข้าเล่นด่านนี้ครับ รอสัญญาณนะครับ');
            window.location.href = 'student_dashboard.php';
        </script>";
        exit(); // หยุดการทำงานทันที ห้ามโหลดเกม
    }
}

// 1. ตรวจสอบว่าส่ง stage_id มาหรือไม่
if (!isset($_GET['stage_id'])) {
    die("Error: Missing stage_id");
}

$stage_id = intval($_GET['stage_id']);
$user_id = $_SESSION['user_id'];

// 2. ดึงข้อมูลด่าน (และตรวจสอบว่ามีสิทธิ์เล่นไหม เช่น ต้องผ่านด่านก่อนหน้าก่อน)
// ในที่นี้เราดึงข้อมูลง่ายๆ ก่อน
$sql = "SELECT s.*, g.code as game_code 
        FROM stages s 
        JOIN games g ON s.game_id = g.id 
        WHERE s.id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $stage_id);
$stmt->execute();
$stage = $stmt->get_result()->fetch_assoc();

if (!$stage) {
    die("ไม่พบด่านนี้ในระบบ");
}

// (Optional) Logic ป้องกันการข้ามด่าน สามารถเพิ่มตรงนี้ได้
?>
<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $stage['title']; ?> - Coding Hero</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600&display=swap" rel="stylesheet">

    <script src="https://cdn.jsdelivr.net/npm/phaser@3.60.0/dist/phaser.min.js"></script>

<style>
        html, body {
            height: 100%;       /* ต้องสูงเต็มจอ 100% */
            margin: 0;
            padding: 0;
            overflow: hidden;   /* ห้าม Scroll */
            background-color: #202c33; 
        }

        body {
            display: flex;
            flex-direction: column; /* เรียงบนลงล่าง */
        }
        
        /* 1. ส่วนหัว (สูง 60px) */
        .game-header {
            height: 60px;       /* ความสูงตายตัว */
            flex-shrink: 0;     /* ห้ามหด */
            background: #ffffff;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            position: relative;
            z-index: 10;
        }

        /* 2. พื้นที่เกม (สูงเต็มที่ - 60px ของหัว) */
        #game-container {
            width: 100vw;
            height: calc(100vh - 60px); /* คำนวณความสูงที่เหลือเป๊ะๆ */
            display: flex;              /* เปิดโหมดจัดระเบียบ */
            justify-content: center;    /* จัดกึ่งกลางแนวนอน */
            align-items: center;        /* จัดกึ่งกลางแนวตั้ง */
            background-color: #2b3a42;
            overflow: hidden;
        }
        
        /* สไตล์ปุ่มกด */
        .btn-exit {
            background-color: #ef4444;
            color: white;
            border-radius: 20px;
            padding: 5px 15px;
            text-decoration: none;
            font-weight: bold;
            font-size: 0.9rem;
            transition: 0.3s;
        }
        .btn-exit:hover { background-color: #dc2626; color: white; }
    </style>
</head>

<body>

    <div class="game-header">
        <div class="d-flex align-items-center">
            <a href="game_select.php?game_id=<?php echo $stage['game_id']; ?>" class="btn-exit me-3">
                < ออก
                    </a>
                    <div>
                        <h5 class="m-0 fw-bold text-primary"><?php echo $stage['title']; ?></h5>
                        <small class="text-muted">ด่านที่ <?php echo $stage['stage_number']; ?></small>
                    </div>
        </div>
        <div>
            <span class="badge bg-warning text-dark">⭐ เป้าหมาย: 3 ดาว</span>
        </div>
    </div>

    <div id="game-container"></div>

    <script>
        // ตัวแปร Global ที่รับค่าจาก PHP
        const STAGE_ID = <?php echo $stage_id; ?>;
        const USER_ID = <?php echo $user_id; ?>;

        // ฟังก์ชันสำหรับส่งคะแนน (เรียกใช้เมื่อจบเกมใน Phaser)
        window.sendResult = function(stageId, stars, duration, attempts) {
            console.log("Sending Result...", {
                stageId,
                stars,
                duration,
                attempts
            });

            fetch('../api/submit_score.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        stage_id: stageId,
                        score: stars,
                        duration: duration,
                        attempts: attempts
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Success:", data);
                    if (data.status === 'success') {
                        // รอ 1.5 วินาที แล้วเด้งกลับหน้าเลือกด่าน
                        setTimeout(() => {
                           window.location.href = `waiting_room.php?stage_id=${STAGE_ID}`;
                        }, 1500);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert("เกิดข้อผิดพลาดในการบันทึกคะแนน");
                });
        };
    </script>

    <script src="../assets/js/logic_game/stage<?php echo $stage['stage_number']; ?>.js"></script>
<?php include '../includes/class_control_script.php'; ?>
</body>

</html>