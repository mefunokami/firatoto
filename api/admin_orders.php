<?php
session_start();
header('Access-Control-Allow-Origin: https://firatotoyedekparca.com');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Yetkisiz erişim.']);
    exit;
}

$stmt = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC');
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($orders as &$order) {
    $order['cart'] = json_decode($order['cart_json'], true);
    // Adres detayını çek
    $addrStmt = $pdo->prepare('SELECT * FROM addresses WHERE id = ?');
    $addrStmt->execute([$order['address_id']]);
    $order['address'] = $addrStmt->fetch(PDO::FETCH_ASSOC);
}

echo json_encode(['success' => true, 'orders' => $orders]); 