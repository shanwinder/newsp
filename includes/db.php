<?php
// includes/db.php
/*
$host = 'sql303.infinityfree.com'; // localhost
$user = 'if0_41282359'; // root
$pass = 'llNSKSVGiO1ITBD'; // ว่าง หรือ root
$db   = 'if0_41282359_new_learning_game';*/

$host = 'localhost'; // localhost
$user = 'root'; // root
$pass = 'root'; // ว่าง หรือ root
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