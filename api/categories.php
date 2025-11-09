<?php
// Güvenli CORS
$allowed_origins = ['https://www.firatotoyedekparca.com', 'https://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

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

header('Content-Type: application/json');
require_once 'db.php';

// CSRF koruması (POST)
// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//     $csrf_token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
//     if (empty($_SESSION['csrf_token'])) {
//         $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
//     }
//     if ($csrf_token !== $_SESSION['csrf_token']) {
//         error_log('CSRF token hatası: ' . $ip);
//         http_response_code(403);
//         echo json_encode(['error' => 'Geçersiz CSRF token']);
//         exit;
//     }
// }

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $result = $pdo->query('SELECT * FROM categories ORDER BY id DESC');
    echo json_encode($result->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = trim($data['name'] ?? '');
    if (!$name || !preg_match('/^[\p{L}0-9\s-]{2,50}$/u', $name)) {
        http_response_code(400);
        echo json_encode(['error' => 'Kategori adı zorunlu ve geçerli olmalı.']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO categories (name) VALUES (?)');
    $ok = $stmt->execute([$name]);
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        error_log('Kategori eklenemedi: ' . $name);
        http_response_code(500);
        echo json_encode(['error' => 'Kategori eklenemedi.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // JSON veya query string ile id alınabilir
    $id = null;
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
    } else {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz kategori ID']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM categories WHERE id = ?');
    $ok = $stmt->execute([$id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Kategori silinemedi.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek']); 