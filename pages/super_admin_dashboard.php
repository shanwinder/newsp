<?php
session_start();
require_once '../includes/db.php';
require_once '../includes/context.php';
$app = require __DIR__ . '/../config/app.php';

require_super_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $teacher_id = intval($_POST['teacher_id'] ?? 0);
    $action = $_POST['action'] ?? '';
    if ($teacher_id > 0 && in_array($action, ['approve', 'suspend'], true)) {
        $status = $action === 'approve' ? 'active' : 'suspended';
        $school_status = $action === 'approve' ? 'approved' : 'suspended';

        $stmt = $conn->prepare("SELECT school_id FROM users WHERE user_id = ? AND role = 'teacher'");
        $stmt->bind_param("i", $teacher_id);
        $stmt->execute();
        $teacher = $stmt->get_result()->fetch_assoc();

        if ($teacher) {
            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare("UPDATE users SET status = ?, approved_at = IF(? = 'active', NOW(), approved_at), approved_by = ? WHERE user_id = ?");
                $stmt->bind_param("ssii", $status, $status, $_SESSION['user_id'], $teacher_id);
                $stmt->execute();

                $stmt = $conn->prepare("UPDATE schools SET status = ?, updated_at = NOW() WHERE id = ?");
                $stmt->bind_param("si", $school_status, $teacher['school_id']);
                $stmt->execute();
                $conn->commit();
            } catch (Throwable $e) {
                $conn->rollback();
                error_log($e->getMessage());
            }
        }
    }
}

$sql = "SELECT u.user_id, u.name, u.email, u.phone, u.status,
               s.school_name, s.district, s.province, s.affiliation, s.status as school_status,
               (SELECT COUNT(*) FROM classrooms c WHERE c.teacher_id = u.user_id) as classroom_count
        FROM users u
        JOIN schools s ON u.school_id = s.id
        WHERE u.role = 'teacher'
        ORDER BY FIELD(u.status, 'pending', 'active', 'suspended'), u.user_id DESC";
$teachers = $conn->query($sql);
?>
<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>Super Admin - <?php echo htmlspecialchars($app['app_name']); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1">




<?php
$page_styles = array (
  0 => 'pages/super_admin_dashboard.css',
);
require __DIR__ . '/../includes/app_head.php';
?>
</head>
<body class="app-page super-admin-dashboard-page">
    <div class="container py-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="h3 fw-bold text-primary mb-1">Super Admin Dashboard</h1>
                <p class="text-muted mb-0">อนุมัติและกำกับบัญชีครู/โรงเรียน</p>
            </div>
            <a href="dashboard.php" class="btn btn-outline-primary rounded-pill">กลับ Teacher Dashboard</a>
        </div>

        <div class="card border-0 shadow-sm rounded-4">
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>ครู</th>
                            <th>โรงเรียน</th>
                            <th>สถานะ</th>
                            <th>ห้องเรียน</th>
                            <th class="text-end">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while ($teacher = $teachers->fetch_assoc()): ?>
                            <tr>
                                <td>
                                    <div class="fw-bold"><?php echo htmlspecialchars($teacher['name']); ?></div>
                                    <div class="small text-muted"><?php echo htmlspecialchars($teacher['email'] ?: '-'); ?></div>
                                </td>
                                <td>
                                    <div class="fw-bold"><?php echo htmlspecialchars($teacher['school_name']); ?></div>
                                    <div class="small text-muted"><?php echo htmlspecialchars(trim(($teacher['district'] ?? '') . ' ' . ($teacher['province'] ?? '')) ?: '-'); ?></div>
                                </td>
                                <td>
                                    <span class="badge <?php echo $teacher['status'] === 'active' ? 'bg-success' : ($teacher['status'] === 'pending' ? 'bg-warning text-dark' : 'bg-danger'); ?>">
                                        <?php echo htmlspecialchars($teacher['status']); ?>
                                    </span>
                                </td>
                                <td><?php echo intval($teacher['classroom_count']); ?></td>
                                <td class="text-end">
                                    <form method="post" class="d-inline">
                                        <input type="hidden" name="teacher_id" value="<?php echo $teacher['user_id']; ?>">
                                        <button name="action" value="approve" class="btn btn-success btn-sm rounded-pill" <?php echo $teacher['status'] === 'active' ? 'disabled' : ''; ?>>
                                            <i class="bi bi-check-circle"></i> อนุมัติ
                                        </button>
                                        <button name="action" value="suspend" class="btn btn-outline-danger btn-sm rounded-pill" <?php echo $teacher['status'] === 'suspended' ? 'disabled' : ''; ?>>
                                            ระงับ
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
