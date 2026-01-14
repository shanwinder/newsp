<?php
// api/check_nav_status.php
header('Content-Type: application/json');
require_once '../includes/db.php';

$sql = "SELECT setting_value FROM system_settings WHERE setting_key = 'navigation_status'";
$result = $conn->query($sql);
$status = ($result->num_rows > 0) ? $result->fetch_assoc()['setting_value'] : 'locked';

echo json_encode(['status' => $status]);
?>