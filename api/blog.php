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
header('Content-Type: application/json');

require_once 'db.php';
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

function slugify($str) {
    $str = mb_strtolower($str, 'UTF-8');
    $tr = ['ş'=>'s','ı'=>'i','ç'=>'c','ü'=>'u','ö'=>'o','ğ'=>'g'];
    $str = strtr($str, $tr);
    $str = preg_replace('/[^a-z0-9\s-]/u', '', $str);
    $str = preg_replace('/\s+/', '-', $str);
    $str = preg_replace('/-+/', '-', $str);
    return trim($str, '-');
}

// GET: Tüm blogları getir (herkes erişebilir)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM blogs ORDER BY created_at DESC');
    echo json_encode(['success' => true, 'blogs' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// Sadece admin erişebilir (POST, PUT, DELETE)
if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Yetkisiz erişim.']);
    exit;
}

// POST: Yeni blog ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $title = trim($data['title'] ?? '');
    $content = trim($data['content'] ?? '');
    $image_url = trim($data['image_url'] ?? '');
    $slug = slugify($title);
    if (!$title || !$content) {
        http_response_code(400);
        echo json_encode(['error' => 'Başlık ve içerik zorunlu.']);
        exit;
    }
    // Slug benzersiz mi kontrol et
    $stmt = $pdo->prepare('SELECT id FROM blogs WHERE slug = ?');
    $stmt->execute([$slug]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Aynı başlıkla başka bir blog var. Lütfen başlığı değiştirin.']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO blogs (title, slug, content, image_url) VALUES (?, ?, ?, ?)');
    $ok = $stmt->execute([$title, $slug, $content, $image_url]);
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'slug' => $slug]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Blog eklenemedi.']);
    }
    exit;
}

// PUT: Blog güncelle
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    $title = trim($data['title'] ?? '');
    $content = trim($data['content'] ?? '');
    $image_url = trim($data['image_url'] ?? '');
    $slug = slugify($title);
    if (!$id || !$title || !$content) {
        http_response_code(400);
        echo json_encode(['error' => 'ID, başlık ve içerik zorunlu.']);
        exit;
    }
    // Slug benzersiz mi kontrol et (güncellenen hariç)
    $stmt = $pdo->prepare('SELECT id FROM blogs WHERE slug = ? AND id != ?');
    $stmt->execute([$slug, $id]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Aynı başlıkla başka bir blog var. Lütfen başlığı değiştirin.']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE blogs SET title=?, slug=?, content=?, image_url=? WHERE id=?');
    $ok = $stmt->execute([$title, $slug, $content, $image_url, $id]);
    if ($ok) {
        echo json_encode(['success' => true, 'slug' => $slug]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Blog güncellenemedi.']);
    }
    exit;
}

// DELETE: Blog sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = null;
    if (isset($_GET['id'])) {
        $id = intval($_GET['id']);
    } else {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
    }
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz blog ID']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM blogs WHERE id = ?');
    $ok = $stmt->execute([$id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Blog silinemedi.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek']); 