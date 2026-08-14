<?php
require_once __DIR__ . '/db.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$messages = [];

// 1. Add product_condition to products
$sql1 = "ALTER TABLE products ADD COLUMN product_condition VARCHAR(50) DEFAULT 'Sıfır'";
if ($conn->query($sql1) === TRUE) {
    $messages[] = "Added 'product_condition' to 'products'.";
} else {
    $messages[] = "Notice for 'product_condition': " . $conn->error;
}

// 2. Add is_weekly_deal to products
$sql2 = "ALTER TABLE products ADD COLUMN is_weekly_deal TINYINT(1) DEFAULT 0";
if ($conn->query($sql2) === TRUE) {
    $messages[] = "Added 'is_weekly_deal' to 'products'.";
} else {
    $messages[] = "Notice for 'is_weekly_deal': " . $conn->error;
}

// 3. Add is_general to productbrands
$sql3 = "ALTER TABLE productbrands ADD COLUMN is_general TINYINT(1) DEFAULT 0";
if ($conn->query($sql3) === TRUE) {
    $messages[] = "Added 'is_general' to 'productbrands'.";
} else {
    $messages[] = "Notice for 'is_general': " . $conn->error;
}

// 4. Add image_url to productbrands
$sql4 = "ALTER TABLE productbrands ADD COLUMN image_url VARCHAR(255) DEFAULT NULL";
if ($conn->query($sql4) === TRUE) {
    $messages[] = "Added 'image_url' to 'productbrands'.";
} else {
    $messages[] = "Notice for 'image_url': " . $conn->error;
}

$conn->close();

echo "<h3>Database Update Results:</h3><ul>";
foreach ($messages as $msg) {
    echo "<li>$msg</li>";
}
echo "</ul><p>Update finished. You can now delete this file.</p>";
?>
