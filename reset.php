<?php
require 'api/db.php';
$hash = password_hash('123456', PASSWORD_DEFAULT);
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = 'firat.cengzz@gmail.com'");
$stmt->execute([$hash]);
echo "Password updated!";
