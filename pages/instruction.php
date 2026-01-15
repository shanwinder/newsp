<?php
// pages/instruction.php
session_start();
require_once '../includes/db.php';
require_once '../includes/student_navbar.php';

// รับค่า game_id เท่านั้น (เพราะยังไม่ได้เลือก stage)
if (!isset($_GET['game_id'])) {
    header("Location: student_dashboard.php");
    exit();
}

$game_id = intval($_GET['game_id']);
$user_id = $_SESSION['user_id'];

// ดึงข้อมูลเนื้อหาการสอนของ Game นั้นๆ
$sql = "SELECT * FROM games WHERE id = $game_id";
$res = $conn->query($sql);
$game = $res->fetch_assoc();

// เช็คสถานะการล็อกของครู
$res_nav = $conn->query("SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'");
$status = $res_nav->fetch_assoc()['setting_value'] ?? 'locked';
?>

<!DOCTYPE html>
<html lang="th">

<head>
    <meta charset="UTF-8">
    <title>ห้องเรียนรู้ - <?php echo $game['title']; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .instruction-card {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 25px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.8s ease-out;
        }

        @keyframes slideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .topic-badge {
            background: #ff9f43;
            color: #2d3436;
            font-weight: 800;
            padding: 5px 20px;
            border-radius: 50px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .btn-locked {
            background-color: #636e72;
            border-color: #636e72;
            cursor: not-allowed;
            pointer-events: none;
            opacity: 0.7;
        }

        .pulse-text {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                opacity: 0.5;
            }

            50% {
                opacity: 1;
            }

            100% {
                opacity: 0.5;
            }
        }
    </style>
</head>

<body>

    <div class="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
        <div class="instruction-card p-5 w-100" style="max-width: 900px;">

            <div class="text-center mb-4">
                <span class="topic-badge shadow">ห้องเรียนรู้ (Pre-Game Briefing)</span>
                <h1 class="display-5 fw-bold mt-3 text-white"><?php echo $game['learning_topic']; ?></h1>
                <div style="height: 4px; width: 100px; background: #fff; margin: 20px auto; border-radius: 2px;"></div>
            </div>

            <div class="fs-5 lh-lg mb-5 text-light">
                <?php echo $game['instruction_html']; ?>
            </div>

            <div class="text-center mt-5">
                <div id="locked-msg" class="<?php echo ($status == 'unlocked') ? 'd-none' : ''; ?>">
                    <i class="bi bi-lock-fill fs-1 text-danger mb-2 d-block"></i>
                    <h4 class="text-warning pulse-text">กรุณาฟังคุณครูสอนก่อนนะครับ...</h4>
                    <p class="text-white-50 small">เมื่อครูสอนเสร็จแล้ว ปุ่มจะปลดล็อกอัตโนมัติ</p>
                </div>

                <a href="game_select.php?game_id=<?php echo $game_id; ?>"
                    id="btn-next"
                    class="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold fs-4 shadow-lg <?php echo ($status == 'locked') ? 'btn-locked' : ''; ?>">
                    <i class="bi bi-grid-fill me-2"></i> ไปเลือกด่านฝึกฝน
                </a>
            </div>
        </div>
    </div>

    <script>
        // Script รอสัญญาณจากครู (เหมือนเดิม)
        setInterval(() => {
            fetch('../api/check_nav_status.php')
                .then(res => res.json())
                .then(data => {
                    const btnNext = document.getElementById('btn-next');
                    const lockedMsg = document.getElementById('locked-msg');

                    if (data.status === 'unlocked') {
                        btnNext.classList.remove('btn-locked');
                        btnNext.classList.remove('btn-secondary');
                        btnNext.classList.add('btn-success');
                        lockedMsg.classList.add('d-none');
                    } else {
                        btnNext.classList.add('btn-locked');
                        lockedMsg.classList.remove('d-none');
                    }
                });
        }, 2000);
    </script>

</body>

</html>