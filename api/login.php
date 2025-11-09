<?php
// CORS sadece güvenilir domain
header('Access-Control-Allow-Origin: https://www.firatotoyedekparca.com');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS, GET');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // CSRF token döndürme kodunu da kaldırıyorum
    header('Content-Type: application/json');
    echo json_encode(['success' => true]);
    exit;
}

header('Content-Type: application/json');
require_once 'db.php';

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email ve şifre zorunludur.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_log('Geçersiz email: ' . $email . ' IP: ' . $ip);
    http_response_code(400);
    echo json_encode(['error' => 'Geçersiz e-posta adresi']);
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Geçersiz email veya şifre.']);
    exit;
}

// Session'a kullanıcıyı kaydet
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['admin'] = $user['admin'];

unset($user['password']);
echo json_encode(['success' => true, 'user' => $user]); 