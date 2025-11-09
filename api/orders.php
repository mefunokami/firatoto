<?php
session_start();
header('Access-Control-Allow-Origin: https://firatotoyedekparca.com');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Giriş yapmalısınız.']);
    exit;
}

$user_id = $_SESSION['user_id'];

$stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([$user_id]);
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Adres ve ürünleri ayrıştır
foreach ($orders as &$order) {
    $order['cart'] = json_decode($order['cart_json'], true);
    // Adres detayını çek
    $addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE id = ?');
    $addrStmt->execute([$order['address_id']]);
    $order['address'] = $addrStmt->fetch(PDO::FETCH_ASSOC);
}

echo json_encode(['success' => true, 'orders' => $orders]); 