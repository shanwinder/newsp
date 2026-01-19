<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/student_navbar.php';

// รับค่า game_id
if (!isset($_GET['game_id'])) {
    header("Location: student_dashboard.php");
    exit();
}

$game_id = intval($_GET['game_id']);
$user_id = $_SESSION['user_id'];

// ดึงข้อมูลเกม (เอาไว้โชว์หัวข้อ)
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
    <link rel="stylesheet" href="../assets/css/game_common.css">

    <style>
        body {
            font-family: 'Kanit', sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
        }

        .instruction-card {
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            border: 4px solid #fff;
        }

        .lesson-section {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 5px solid #0d6efd;
        }

        .example-box {
            background: #fff;
            border: 2px dashed #ccc;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            font-size: 1.5rem;
            margin-top: 10px;
        }

        .logic-badge {
            font-size: 0.9rem;
            padding: 5px 12px;
            border-radius: 20px;
            font-weight: bold;
        }

        .btn-locked {
            background-color: #636e72 !important;
            border-color: #636e72 !important;
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

        .floating-emoji {
            display: inline-block;
            animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
            0% {
                transform: translateY(0px);
            }

            50% {
                transform: translateY(-5px);
            }

            100% {
                transform: translateY(0px);
            }
        }
    </style>
</head>

<body>

    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-lg-10">

                <div class="text-center mb-4 text-white">
                    <span class="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm mb-2">บทเรียนที่ <?php echo $game_id; ?></span>
                    <h1 class="fw-bold display-5"><?php echo $game['learning_topic']; ?></h1>
                </div>

                <div class="instruction-card p-4 p-md-5">

                    <?php if ($game_id == 1): ?>
                        <h3 class="fw-bold text-primary mb-4"><i class="bi bi-lightbulb-fill"></i> สรุปเนื้อหาก่อนเริ่มเกม</h3>

                        <div class="lesson-section" style="border-left-color: #ffc107;">
                            <h5 class="fw-bold"><span class="badge bg-warning text-dark me-2">เรื่องที่ 1</span> แบบรูปและความสัมพันธ์ (Patterns)</h5>
                            <p>แบบรูปคือชุดของสิ่งของที่เรียงต่อกันอย่างมีกฎเกณฑ์ เราต้อง <strong>"สังเกต"</strong> เพื่อหาชุดที่ซ้ำกัน</p>

                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="example-box">
                                        <small class="text-muted d-block mb-2">ตัวอย่างแบบรูปซ้ำ 2</small>
                                        🐶 🐱 🐶 🐱 ❓
                                        <div class="mt-2 text-success fs-6 fw-bold">คำตอบคือ: 🐶</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="example-box">
                                        <small class="text-muted d-block mb-2">ตัวอย่างแบบรูปซ้ำ 3</small>
                                        🟥 🟢 🔵 🟥 🟢 ❓
                                        <div class="mt-2 text-success fs-6 fw-bold">คำตอบคือ: 🔵</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="lesson-section" style="border-left-color: #0dcaf0;">
                            <h5 class="fw-bold"><span class="badge bg-info text-dark me-2">เรื่องที่ 2</span> การจำแนกประเภท (Classification)</h5>
                            <p>คือการแยกสิ่งของออกจากกันตาม <strong>"คุณสมบัติ"</strong> ที่เหมือนกัน</p>
                            <ul class="list-group list-group-flush bg-transparent">
                                <li class="list-group-item bg-transparent">
                                    <i class="bi bi-check-circle-fill text-success me-2"></i> <strong>สิ่งมีชีวิต:</strong> เช่น แมว 🐱, สุนัข 🐶, กระต่าย 🐰
                                </li>
                                <li class="list-group-item bg-transparent">
                                    <i class="bi bi-box-seam-fill text-secondary me-2"></i> <strong>สิ่งไม่มีชีวิต:</strong> เช่น กล่อง 📦, รูปทรงเรขาคณิต 🟥
                                </li>
                            </ul>
                        </div>

                        <div class="lesson-section" style="border-left-color: #dc3545;">
                            <h5 class="fw-bold"><span class="badge bg-danger me-2">เรื่องที่ 3</span> เงื่อนไขเชิงปฏิเสธ (NOT Logic)</h5>
                            <p>บางครั้งเราต้องหาของที่ <strong>"ไม่ใช่"</strong> สิ่งที่กำหนด</p>

                            <div class="alert alert-danger bg-opacity-10 border-danger d-flex align-items-center">
                                <i class="bi bi-exclamation-triangle-fill text-danger fs-3 me-3"></i>
                                <div>
                                    <strong>โจทย์:</strong> จงหาของที่ <span class="text-decoration-underline text-danger fw-bold">ไม่ใช่</span> สีแดง 🔴<br>
                                    <span class="text-muted">✅ สิ่งที่เลือกได้:</span> สีเขียว 🟢, สีฟ้า 🔵, สีเหลือง 🟡
                                </div>
                            </div>
                        </div>

                    <?php else: ?>
                        <div class="fs-5 lh-lg">
                            <?php echo $game['instruction_html']; ?>
                        </div>
                    <?php endif; ?>

                    <hr class="my-5">

                    <div class="text-center">
                        <div id="locked-msg" class="<?php echo ($status == 'unlocked') ? 'd-none' : ''; ?>">
                            <i class="bi bi-lock-fill fs-1 text-secondary mb-2 d-block"></i>
                            <h5 class="text-muted pulse-text">รอคุณครูปลดล็อกสักครู่นะครับ...</h5>
                            <p class="small text-muted">ตั้งใจฟังครูสอนก่อนนะเด็กๆ</p>
                        </div>

                        <a href="game_select.php?game_id=<?php echo $game_id; ?>"
                            id="btn-next"
                            class="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold fs-4 shadow <?php echo ($status == 'locked') ? 'btn-locked' : ''; ?>">
                            <i class="bi bi-rocket-takeoff-fill me-2"></i> พร้อมแล้ว! ไปลุยกันเลย
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <script>
        // Check Status Realtime
        setInterval(() => {
            fetch('../api/check_nav_status.php')
                .then(res => res.json())
                .then(data => {
                    const btnNext = document.getElementById('btn-next');
                    const lockedMsg = document.getElementById('locked-msg');

                    if (data.status === 'unlocked') {
                        btnNext.classList.remove('btn-locked');
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