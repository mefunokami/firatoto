<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

// CORS sadece güvenilir domain
header('Access-Control-Allow-Origin: https://www.firatotoyedekparca.com');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Rate limiting (IP başına saniyede 10 istek)
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

// CSRF koruması (POST, PATCH, DELETE)
// if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PATCH', 'DELETE'])) {
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

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Giriş yapmalısınız.']);
    exit;
}

$user_id = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC');
    $stmt->execute([$user_id]);
    $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'addresses' => $addresses]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $title = trim($data['title'] ?? '');
    $name = trim($data['name'] ?? '');
    $surname = trim($data['surname'] ?? '');
    $country = trim($data['country'] ?? '');
    $city = trim($data['city'] ?? '');
    $district = trim($data['district'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $mobile = trim($data['mobile'] ?? '');
    $tc = trim($data['tc'] ?? '');
    $address = trim($data['address'] ?? '');
    $type = trim($data['type'] ?? 'bireysel');
    $company_title = trim($data['company_title'] ?? '');
    $tax_no = trim($data['tax_no'] ?? '');
    $tax_office = trim($data['tax_office'] ?? '');
    $efatura = !empty($data['efatura']) ? 1 : 0;
    // Regex ile doğrulama
    if ($tc && !preg_match('/^[0-9]{11}$/', $tc)) {
        error_log('Geçersiz TC: ' . $tc . ' IP: ' . $ip);
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz TC Kimlik No']);
        exit;
    }
    if ($phone && !preg_match('/^[0-9]{10,15}$/', $phone)) {
        error_log('Geçersiz telefon: ' . $phone . ' IP: ' . $ip);
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz telefon numarası']);
        exit;
    }
    if ($mobile && !preg_match('/^[0-9]{10,15}$/', $mobile)) {
        error_log('Geçersiz cep telefonu: ' . $mobile . ' IP: ' . $ip);
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz cep telefonu']);
        exit;
    }
    if (!$title || !$name || !$surname || !$country || !$city || !$district || !$mobile || !$address) {
        http_response_code(400);
        echo json_encode(['error' => 'Zorunlu alanları doldurun.']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO addresses (user_id, title, name, surname, country, city, district, phone, mobile, tc, address, type, company_title, tax_no, tax_office, efatura) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $ok = $stmt->execute([$user_id, $title, $name, $surname, $country, $city, $district, $phone, $mobile, $tc, $address, $type, $company_title, $tax_no, $tax_office, $efatura]);
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Adres eklenemedi.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz istek.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?');
    $ok = $stmt->execute([$id, $user_id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'İşlem başarısız.']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz istek.']);
        exit;
    }
    // Sadece beklenen alanları işle
    $title = trim($data['title'] ?? '');
    $name = trim($data['name'] ?? '');
    $surname = trim($data['surname'] ?? '');
    $country = trim($data['country'] ?? '');
    $city = trim($data['city'] ?? '');
    $district = trim($data['district'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $mobile = trim($data['mobile'] ?? '');
    $tc = trim($data['tc'] ?? '');
    $address = trim($data['address'] ?? '');
    $type = trim($data['type'] ?? 'bireysel');
    $company_title = trim($data['company_title'] ?? '');
    $tax_no = trim($data['tax_no'] ?? '');
    $tax_office = trim($data['tax_office'] ?? '');
    $efatura = !empty($data['efatura']) ? 1 : 0;
    // Regex ile doğrulama
    if ($tc && !preg_match('/^[0-9]{11}$/', $tc)) {
        error_log('Geçersiz TC: ' . $tc . ' IP: ' . $ip);
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz TC Kimlik No']);
        exit;
    }
    if ($phone && !preg_match('/^[0-9]{10,15}$/', $phone)) {
        error_log('Geçersiz telefon: ' . $phone . ' IP: ' . $ip);
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz telefon numarası']);
        exit;
    }
    if ($mobile && !preg_match('/^[0-9]{10,15}$/', $mobile)) {
        error_log('Geçersiz cep telefonu: ' . $mobile . ' IP: ' . $ip);
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz cep telefonu']);
        exit;
    }
    if (!$title || !$name || !$surname || !$country || !$city || !$district || !$mobile || !$address) {
        http_response_code(400);
        echo json_encode(['error' => 'Zorunlu alanlar eksik.']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE addresses SET title=?, name=?, surname=?, country=?, city=?, district=?, phone=?, mobile=?, tc=?, address=?, type=?, company_title=?, tax_no=?, tax_office=?, efatura=? WHERE id=? AND user_id=?');
    $ok = $stmt->execute([$title, $name, $surname, $country, $city, $district, $phone, $mobile, $tc, $address, $type, $company_title, $tax_no, $tax_office, $efatura, $id, $user_id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'İşlem başarısız.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek.']); 