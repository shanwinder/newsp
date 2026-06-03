<?php
$classroom_id = isset($_GET['classroom_id']) ? intval($_GET['classroom_id']) : 0;
header("Location: dashboard.php" . ($classroom_id > 0 ? "?classroom_id={$classroom_id}" : ""));
exit();
