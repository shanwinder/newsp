<?php
// includes/student_navbar.php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// เช็คว่า Login หรือยัง
if (!isset($_SESSION['user_id'])) {
    header("Location: ../pages/login.php");
    exit();
}

require_once 'db.php'; // เรียกใช้ connection (ถ้าไฟล์แม่เรียกแล้ว บรรทัดนี้จะไม่ทำงานซ้ำ)

$user_id = $_SESSION['user_id'];

// --------------------------------------------------------
// 1️⃣ คำนวณดาวรวมทั้งหมด (Live Update)
// --------------------------------------------------------
$sql_stars = "SELECT SUM(score) as total_score FROM progress WHERE user_id = ?";
$stmt = $conn->prepare($sql_stars);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res_stars = $stmt->get_result();
$row_stars = $res_stars->fetch_assoc();

// ถ้ายังไม่เคยเล่นเลย ให้เป็น 0
$total_stars = $row_stars['total_score'] ? $row_stars['total_score'] : 0;


// --------------------------------------------------------
// 2️⃣ ดึงฉายา (Title) ตามจำนวนดาว
// --------------------------------------------------------
// เลือกฉายาที่ min_stars_required น้อยกว่าหรือเท่ากับดาวที่มี (เอาอันที่มากที่สุด)
$sql_title = "SELECT title_name, css_class FROM titles 
              WHERE min_stars_required <= ? 
              ORDER BY min_stars_required DESC LIMIT 1";
$stmt = $conn->prepare($sql_title);
$stmt->bind_param("i", $total_stars);
$stmt->execute();
$res_title = $stmt->get_result();

if ($res_title->num_rows > 0) {
    $title_data = $res_title->fetch_assoc();
    $current_title = $title_data['title_name'];
    $badge_color = $title_data['css_class']; // เช่น badge-warning
} else {
    // ถ้ายังไม่มีฉายา (เผื่อไว้)
    $current_title = "นักสำรวจมือใหม่";
    $badge_color = "bg-secondary";
}
?>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style="background: rgba(22, 28, 45, 0.95) !important; backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="student_dashboard.php">
            <span style="font-size: 1.8rem; margin-right: 10px;">🦁</span>
            <div>
                <span class="d-block fw-bold text-white" style="line-height: 1;">แบบฝึกทักษะวิทยาการคำนวณ ป.4</span>
            </div>
        </a>

        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#studentNav">
            <i class="bi bi-list text-white fs-2"></i>
        </button>

        <div class="collapse navbar-collapse" id="studentNav">
            <ul class="navbar-nav ms-auto align-items-center gap-3">

                <li class="nav-item">
                    <div class="d-flex align-items-center px-3 py-1 rounded-pill"
                        style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">

                        <div class="me-3 text-end">
                            <span class="d-block text-white fw-bold" style="font-size: 0.9rem;">
                                <?php echo htmlspecialchars($_SESSION['name']); ?>
                            </span>
                            <span class="badge rounded-pill <?php echo $badge_color; ?>" style="font-size: 0.7rem;">
                                <?php echo $current_title; ?>
                            </span>
                        </div>

                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=<?php echo $_SESSION['student_id']; ?>&backgroundColor=b6e3f4"
                            alt="Avatar" class="rounded-circle border border-2 border-white" width="45" height="45">
                    </div>
                </li>

                <li class="nav-item">
                    <div class="d-flex align-items-center bg-warning text-dark px-3 py-2 rounded-pill fw-bold shadow-sm">
                        <i class="bi bi-star-fill me-2 text-white"></i>
                        <span id="nav-star-count" style="font-size: 1.1rem;"><?php echo $total_stars; ?></span>
                    </div>
                </li>

                <li class="nav-item">
                    <a href="../logout.php" class="btn btn-outline-danger btn-sm rounded-circle p-2" title="ออกจากระบบ">
                        <i class="bi bi-power fs-6"></i>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>