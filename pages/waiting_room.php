<?php
// pages/waiting_room.php
session_start();
require_once '../includes/db.php';
require_once '../includes/auth.php';

if (!isset($_GET['stage_id'])) {
    header("Location: student_dashboard.php");
    exit();
}

$stage_id = intval($_GET['stage_id']);
$user_id = $_SESSION['user_id'];

// ดึงข้อมูลด่าน
$stage_res = $conn->query("SELECT * FROM stages WHERE id = $stage_id");
$stage = $stage_res->fetch_assoc();

if (is_visitor_mode()) {
    $visitor_score = $_SESSION['visitor_progress'][$stage_id]['score'] ?? 0;
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>สรุปผลคะแนน - <?php echo $stage['title']; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="../assets/css/game_common.css">
    <style>
        body { font-family: 'Kanit', sans-serif; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; min-height: 100vh; }
    </style>
</head>
<body>
<?php require_once '../includes/student_navbar.php'; ?>
<div class="container py-5 text-center">
    <h1 class="display-4 fw-bold mb-4">🏆 ทดลองเล่นสำเร็จ!</h1>
    <h3 class="text-info mb-5"><?php echo $stage['title']; ?></h3>
    
    <div class="card bg-dark text-white shadow-lg border-0 rounded-4 mx-auto mb-5" style="max-width: 500px;">
        <div class="card-body p-5">
            <div class="fs-1 mb-3">⭐ <?php echo $visitor_score; ?></div>
            <h4 class="mb-4">คะแนนนี้เก็บเฉพาะในโหมดทดลองใช้เท่านั้น</h4>
            <div class="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                <a href="game_select.php?game_id=<?php echo $stage['game_id']; ?>" class="btn btn-success rounded-pill px-4 py-2 fw-bold">กลับไปเลือกด่าน</a>
                <a href="student_dashboard.php" class="btn btn-outline-light rounded-pill px-4 py-2 fw-bold">กลับหน้า Dashboard</a>
            </div>
        </div>
    </div>
</div>
</body>
</html>
<?php
    exit();
}
?>

<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>สรุปผลคะแนน - <?php echo $stage['title']; ?></title>
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
        .rank-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: 0.3s;
        }
        .rank-1 { background: linear-gradient(45deg, #FFD700, #FDB931); color: #000; transform: scale(1.05); font-weight: bold; border: none; }
        .rank-2 { background: linear-gradient(45deg, #E0E0E0, #BDBDBD); color: #333; font-weight: bold; border: none; }
        .rank-3 { background: linear-gradient(45deg, #CD7F32, #A0522D); color: #fff; font-weight: bold; border: none; }
        
        .waiting-pulse {
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
    </style>
</head>
<body>
<?php require_once '../includes/student_navbar.php'; ?>

<div class="container py-5">
    <div class="text-center mb-5">
        <h1 class="display-4 fw-bold">🏆 บทสรุปภารกิจ</h1>
        <h3 class="text-info"><?php echo $stage['title']; ?></h3>
    </div>

    <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
            <div class="card bg-dark text-white shadow-lg border-0 rounded-4">
                <div class="card-header bg-transparent text-center py-3 border-bottom border-secondary">
                    <h4 class="m-0"><i class="bi bi-trophy-fill text-warning"></i> กระดานผู้นำ</h4>
                </div>
                <div class="card-body p-4" id="leaderboard-area">
                    Loading Scores...
                </div>
            </div>
        </div>
    </div>

    <div class="fixed-bottom p-4 text-center bg-black bg-opacity-75 backdrop-blur">
        <div id="status-message">
            <div class="spinner-border text-light spinner-border-sm me-2" role="status"></div>
            <span class="fs-4 waiting-pulse">รอสัญญาณจากคุณครู เพื่อไปต่อ...</span>
        </div>
        <a href="game_select.php?game_id=<?php echo $stage['game_id']; ?>" id="btn-next" class="btn btn-success btn-lg px-5 rounded-pill fw-bold d-none">
            ⏩ ไปด่านต่อไป
        </a>
    </div>
</div>

<script>
    const STAGE_ID = <?php echo $stage_id; ?>;

    // 1. ฟังก์ชันโหลด Leaderboard
    function loadLeaderboard() {
        fetch(`../api/get_leaderboard.php?stage_id=${STAGE_ID}`)
            .then(res => res.json())
            .then(data => {
                let html = '<div class="d-flex flex-column gap-2">';
                data.forEach((player, index) => {
                    let rankClass = '';
                    let icon = `<span class="badge bg-secondary rounded-circle" style="width:30px">${index+1}</span>`;
                    
                    if(index === 0) { rankClass = 'rank-1'; icon = '🥇'; }
                    else if(index === 1) { rankClass = 'rank-2'; icon = '🥈'; }
                    else if(index === 2) { rankClass = 'rank-3'; icon = '🥉'; }

                    html += `
                        <div class="d-flex align-items-center p-3 rounded rank-card ${rankClass}">
                            <div class="fs-4 me-3">${icon}</div>
                            <div class="flex-grow-1 text-start">
                                <div class="fw-bold">${player.name}</div>
                                <small style="opacity:0.8">${player.class_level}</small>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold">${player.score} ⭐</div>
                                <small style="font-size:0.75rem">${player.duration}s</small>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
                document.getElementById('leaderboard-area').innerHTML = html;
            });
    }

    // 2. ฟังก์ชันเช็คสถานะการล็อก (Polling)
    function checkNavigationStatus() {
        fetch('../api/check_nav_status.php')
            .then(res => res.json())
            .then(data => {
                const btnNext = document.getElementById('btn-next');
                const statusMsg = document.getElementById('status-message');

                if (data.status === 'unlocked') {
                    // ถ้าครูปลดล็อกแล้ว
                    statusMsg.classList.add('d-none'); // ซ่อนข้อความรอ
                    btnNext.classList.remove('d-none'); // โชว์ปุ่มไปต่อ
                    
                    // Optional: Auto Redirect เลยก็ได้
                    // window.location.href = btnNext.href;
                } else {
                    // ถ้ายังล็อกอยู่
                    statusMsg.classList.remove('d-none');
                    btnNext.classList.add('d-none');
                }
            });
    }

    // ทำงานทุกๆ 3 วินาที
    setInterval(loadLeaderboard, 3000);
    setInterval(checkNavigationStatus, 3000);
    
    // โหลดครั้งแรกทันที
    loadLeaderboard();
</script>

</body>
</html>