<?php
session_start();
$is_visitor = !empty($_SESSION['visitor_mode']);
session_destroy();

if ($is_visitor) {
    header("Location: index.php");
} else {
    header("Location: pages/login.php");
}
?>