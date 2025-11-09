<?php
// admin_users.php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

// Sadece admin erişebilir
if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Yetkisiz erişim.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT id, first_name, last_name, phone, email FROM users ORDER BY created_at DESC');
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'users' => $users]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek.']); 