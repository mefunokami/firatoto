<?php
require_once __DIR__ . '/db.php';
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$sql = "ALTER TABLE products ADD COLUMN product_condition VARCHAR(50) DEFAULT 'Sıfır'";
if ($conn->query($sql) === TRUE) {
    echo "Column added successfully";
} else {
    echo "Error adding column: " . $conn->error;
}
$conn->close();
?>
