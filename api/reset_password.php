<?php
// Şifre sıfırlama: Token ve yeni şifre ile şifreyi günceller
header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$token = trim($data['token'] ?? '');
$password = $data['password'] ?? '';
if (!$token || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Token ve yeni şifre zorunlu.']);
    exit;
}
$stmt = $pdo->prepare('SELECT id, reset_token_expiry FROM users WHERE reset_token = ?');
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user || strtotime($user['reset_token_expiry']) < time()) {
    http_response_code(400);
    echo json_encode(['error' => 'Token geçersiz veya süresi dolmuş.']);
    exit;
}
$hash = password_hash($password, PASSWORD_DEFAULT);
$pdo->prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?')
    ->execute([$hash, $user['id']]);
echo json_encode(['success' => true]); 