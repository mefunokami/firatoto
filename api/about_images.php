<?php
$allowed_origins = ['https://www.firatotoyedekparca.com', 'http://localhost:5173', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

session_start();

// Admin kontrolü (POST/DELETE/PUT)
if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE'])) {
    $isLocal = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
    if (!$isLocal && (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1)) {
        http_response_code(403);
        echo json_encode(['error' => 'Yetkisiz erişim']);
        exit;
    }
}

header('Content-Type: application/json');
require_once 'db.php';

// Tabloyu oluştur (yoksa)
$pdo->exec("CREATE TABLE IF NOT EXISTS about_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(1000) NOT NULL,
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// GET: Listele
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM about_images ORDER BY display_order ASC, id DESC');
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Eğer tablo boşsa, varsayılan resimleri seed et (kullanıcının sitesindeki eski resimler)
    if (count($images) === 0) {
        $defaults = [
            '/isyeri1.webp',
            '/isyeri2.webp',
            '/isyeri3.jpeg',
            '/isyeri4.jpeg'
        ];
        foreach ($defaults as $i => $url) {
            $stmt = $pdo->prepare('INSERT INTO about_images (image_url, display_order) VALUES (?, ?)');
            $stmt->execute([$url, $i]);
        }
        $stmt = $pdo->query('SELECT * FROM about_images ORDER BY display_order ASC, id DESC');
        $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode($images);
    exit;
}

// POST: Ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $image_url = trim($data['image_url'] ?? '');
    $display_order = isset($data['display_order']) ? intval($data['display_order']) : 0;
    if (!$image_url) {
        http_response_code(400);
        echo json_encode(['error' => 'Görsel gerekli']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO about_images (image_url, display_order) VALUES (?, ?)');
    $ok = $stmt->execute([$image_url, $display_order]);
    echo json_encode(['success' => $ok, 'id' => $pdo->lastInsertId()]);
    exit;
}

// DELETE: Sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str($_SERVER['QUERY_STRING'] ?? '', $params);
    $id = intval($params['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID gerekli']); exit; }
    
    // Dosya yolunu çek
    $stmt = $pdo->prepare('SELECT image_url FROM about_images WHERE id=?');
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $imgUrl = $row['image_url'];
        if (str_starts_with($imgUrl, '/about-images/')) {
            $filePath = __DIR__ . '/..' . $imgUrl;
            if (file_exists($filePath)) {
                @unlink($filePath);
            }
        }
    }
    
    $stmt = $pdo->prepare('DELETE FROM about_images WHERE id=?');
    $ok = $stmt->execute([$id]);
    echo json_encode(['success' => $ok]);
    exit;
}

// PUT: Güncelle
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID gerekli']); exit; }
    $stmt = $pdo->prepare('UPDATE about_images SET image_url=?, display_order=? WHERE id=?');
    $ok = $stmt->execute([
        trim($data['image_url'] ?? ''),
        intval($data['display_order'] ?? 0),
        $id
    ]);
    echo json_encode(['success' => $ok]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek']);
