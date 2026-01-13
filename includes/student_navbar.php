<?php
// includes/student_navbar.php
if (!isset($_SESSION['user_id'])) { header("Location: ../pages/login.php"); exit(); }
?>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top" style="background: rgba(22, 28, 45, 0.9) !important; backdrop-filter: blur(10px); border-bottom: 2px solid #4a5568;">
    <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="student_dashboard.php">
            <span style="font-size: 1.5rem;">👨‍🚀</span>
            <span class="ms-2 fw-bold text-warning">MISSION CONTROL</span>
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#studentNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="studentNav">
            <ul class="navbar-nav ms-auto align-items-center gap-3">
                
                <li class="nav-item">
                    <div class="d-flex align-items-center bg-secondary bg-opacity-25 px-3 py-1 rounded-pill border border-secondary">
                        <div class="me-2 text-end" style="line-height: 1.2;">
                            <span class="d-block text-white fw-bold" style="font-size: 0.9rem;">
                                <?php echo htmlspecialchars($_SESSION['name']); ?>
                            </span>
                            <span class="d-block text-info" style="font-size: 0.75rem;">
                                Class: <?php echo isset($_SESSION['class_level']) ? $_SESSION['class_level'] : 'Rookie'; ?>
                            </span>
                        </div>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=<?php echo $_SESSION['student_id']; ?>" 
                             alt="Avatar" class="rounded-circle bg-white" width="40" height="40">
                    </div>
                </li>

                <li class="nav-item">
                    <div class="d-flex align-items-center text-warning fw-bold">
                        <i class="bi bi-star-fill me-1"></i>
                        <span id="nav-star-count">0</span>
                    </div>
                </li>

                <li class="nav-item">
                    <a href="../logout.php" class="btn btn-outline-danger btn-sm rounded-pill px-3">
                        <i class="bi bi-power"></i> ออกจากระบบ
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>