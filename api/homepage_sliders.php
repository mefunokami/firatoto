<?php
// Güvenli CORS
$allowed_origins = ['https://www.firatotoyedekparca.com', 'https://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');

// Rate limiting (IP başına saniyede 10 istek)
session_start();

// --- GLOBAL ADMIN SECURITY CHECK FOR MODIFYING REQUESTS ---
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
    $isLocal = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
    if (!$isLocal && (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1)) {
        http_response_code(403);
        echo json_encode(['error' => 'Yetkisiz erisim: Bu islem icin admin yetkisi gereklidir.']);
        exit;
    }
}
// --------------------------------------------------------

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

// CSRF koruması (POST, PUT, DELETE)
// if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
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

// GET: Sliderları listele
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM homepage_sliders ORDER BY slider_order ASC, id DESC');
    $sliders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($sliders);
    exit;
}

// POST: Slider ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $image_url = trim($data['image_url'] ?? '');
    $title = trim($data['title'] ?? '');
    $description = trim($data['description'] ?? '');
    $link = trim($data['link'] ?? '');
    $slider_order = isset($data['slider_order']) ? intval($data['slider_order']) : 0;
    if (!$image_url) {
        http_response_code(400);
        echo json_encode(["error" => "Görsel gerekli"]);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO homepage_sliders (image_url, title, description, link, slider_order) VALUES (?, ?, ?, ?, ?)');
    $ok = $stmt->execute([$image_url, $title, $description, $link, $slider_order]);
    if ($ok) {
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } else {
        error_log('Slider eklenemedi: ' . $image_url);
        http_response_code(500);
        echo json_encode(["error" => "Slider eklenemedi"]);
    }
    exit;
}

// DELETE: Slider sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str($_SERVER['QUERY_STRING'], $params);
    $id = isset($params['id']) ? intval($params['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID gerekli"]);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM homepage_sliders WHERE id=?');
    $ok = $stmt->execute([$id]);
    if ($ok) {
        echo json_encode(["success" => true]);
    } else {
        error_log('Slider silinemedi: ' . $id);
        http_response_code(500);
        echo json_encode(["error" => "Slider silinemedi"]);
    }
    exit;
}

// PUT: Slider güncelle
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? intval($data['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID gerekli"]);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE homepage_sliders SET image_url=?, title=?, description=?, link=?, slider_order=? WHERE id=?');
    $ok = $stmt->execute([
        trim($data['image_url'] ?? ''),
        trim($data['title'] ?? ''),
        trim($data['description'] ?? ''),
        trim($data['link'] ?? ''),
        isset($data['slider_order']) ? intval($data['slider_order']) : 0,
        $id
    ]);
    if ($ok) {
        echo json_encode(["success" => true]);
    } else {
        error_log('Slider güncellenemedi: ' . $id);
        http_response_code(500);
        echo json_encode(["error" => "Slider güncellenemedi"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Geçersiz istek"]); 