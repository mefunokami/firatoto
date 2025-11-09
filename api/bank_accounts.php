<?php
// Güvenli CORS
$allowed_origins = ['https://www.firatotoyedekparca.com', 'https://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// Sadece admin erişebilir
if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Yetkisiz erişim.']);
    exit;
}

// CSRF koruması (POST, PUT, DELETE)

// GET: Tüm banka hesaplarını listele
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM bank_accounts ORDER BY is_active DESC, bank_name ASC');
    echo json_encode(['success' => true, 'accounts' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// POST: Yeni banka hesabı ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $bank_name = trim($data['bank_name'] ?? '');
    $iban = trim($data['iban'] ?? '');
    $account_holder = trim($data['account_holder'] ?? '');
    if (!$bank_name || !$iban || !$account_holder) {
        http_response_code(400);
        echo json_encode(['error' => 'Tüm alanlar zorunlu.']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO bank_accounts (bank_name, iban, account_holder, is_active) VALUES (?, ?, ?, 1)');
    $ok = $stmt->execute([$bank_name, $iban, $account_holder]);
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        error_log('Banka hesabı eklenemedi: ' . $bank_name);
        http_response_code(500);
        echo json_encode(['error' => 'Banka hesabı eklenemedi.']);
    }
    exit;
}

// PUT: Banka hesabı güncelle
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    $bank_name = trim($data['bank_name'] ?? '');
    $iban = trim($data['iban'] ?? '');
    $account_holder = trim($data['account_holder'] ?? '');
    $is_active = isset($data['is_active']) ? intval($data['is_active']) : 1;
    if (!$id || !$bank_name || !$iban || !$account_holder) {
        http_response_code(400);
        echo json_encode(['error' => 'Tüm alanlar zorunlu.']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE bank_accounts SET bank_name=?, iban=?, account_holder=?, is_active=? WHERE id=?');
    $ok = $stmt->execute([$bank_name, $iban, $account_holder, $is_active, $id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        error_log('Banka hesabı güncellenemedi: ' . $id);
        http_response_code(500);
        echo json_encode(['error' => 'Banka hesabı güncellenemedi.']);
    }
    exit;
}

// DELETE: Banka hesabı sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str($_SERVER['QUERY_STRING'], $params);
    $id = isset($params['id']) ? intval($params['id']) : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID gerekli.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM bank_accounts WHERE id=?');
    $ok = $stmt->execute([$id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        error_log('Banka hesabı silinemedi: ' . $id);
        http_response_code(500);
        echo json_encode(['error' => 'Banka hesabı silinemedi.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek']); 