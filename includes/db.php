<?php
// includes/db.php
$host = 'localhost';
$user = 'root';
$pass = 'root'; // ⚠️ เปลี่ยนให้ตรงกับ Server ของคุณ
$db   = 'new_learning_game';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // เปิด Strict Mode เพื่อให้จับ Error ได้ง่ายขึ้น

try {
    $conn = new mysqli($host, $user, $pass, $db);
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    // ใน Production เราจะไม่ echo error ออกไปตรงๆ แต่จะเก็บลง log
    error_log($e->getMessage());
    die("ขออภัย ระบบฐานข้อมูลกำลังมีปัญหา โปรดลองใหม่ภายหลัง");
}
?>