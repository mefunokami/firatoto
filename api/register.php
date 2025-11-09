<?php
header('Content-Type: application/json');
require_once 'db.php'; // db bağlantısı için ayrı bir dosya varsayalım

// CORS sadece güvenilir domain
header('Access-Control-Allow-Origin: https://www.firatotoyedekparca.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Rate limiting (IP başına saniyede 10 istek)
session_start();
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!isset($_SESSION['rate_limit'])) $_SESSION['rate_limit'] = [];
$now = time();
if (!isset($_SESSION['rate_limit'][$ip])) {
    $_SESSION['rate_limit'][$ip] = ['time' => $now, 'count' => 1];
} else {
    if ($now == $_SESSION['rate_limit'][$ip]['time']) {
        $_SESSION['rate_limit'][$ip]['count']++;
        if ($_SESSION['rate_limit'][$ip]['count'] > 10) {
            error_log('Rate limit aşıldı: ' . $ip);
            http_response_code(429);
            echo json_encode(['error' => 'Çok fazla istek!']);
            exit;
        }
    } else {
        $_SESSION['rate_limit'][$ip] = ['time' => $now, 'count' => 1];
    }
}

// CSRF koruması (POST)
// $csrf_token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
// if (empty($_SESSION['csrf_token'])) {
//     $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
// }
// if ($csrf_token !== $_SESSION['csrf_token']) {
//     error_log('CSRF token hatası: ' . $ip);
//     http_response_code(403);
//     echo json_encode(['error' => 'Geçersiz CSRF token']);
//     exit;
// }

$data = json_decode(file_get_contents('php://input'), true);
$first_name = trim($data['first_name'] ?? '');
$last_name = trim($data['last_name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$first_name || !$last_name || !$phone || !$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Tüm alanlar zorunludur.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_log('Geçersiz email: ' . $email . ' IP: ' . $ip);
    http_response_code(400);
    echo json_encode(['error' => 'Geçersiz e-posta adresi']);
    exit;
}
if ($phone && !preg_match('/^[0-9]{10,15}$/', $phone)) {
    error_log('Geçersiz telefon: ' . $phone . ' IP: ' . $ip);
    http_response_code(400);
    echo json_encode(['error' => 'Geçersiz telefon numarası']);
    exit;
}

$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Bu email ile kayıtlı kullanıcı var.']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO users (first_name, last_name, phone, email, password, admin) VALUES (?, ?, ?, ?, ?, 0)');
$ok = $stmt->execute([$first_name, $last_name, $phone, $email, $hash]);
if ($ok) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Kayıt başarısız.']);
} 