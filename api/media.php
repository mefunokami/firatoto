<?php
$allowed_origins = ['https://www.firatotoyedekparca.com', 'http://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();
// Güvenlik: Normalde burada admin kontrolü yapılır
// if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1) { ... }

$upload_dir = __DIR__ . '/../product-images/';
$base_url = 'https://www.firatotoyedekparca.com/product-images/'; // Canlı sunucu adresi
// Yerel sunucu için base_url dinamik ayarlanabilir
if (in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'])) {
    $base_url = 'http://localhost/product-images/';
}

// GET: Dosyaları listele
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $files = [];
    if (is_dir($upload_dir)) {
        $dir = opendir($upload_dir);
        while (($file = readdir($dir)) !== false) {
            if ($file != '.' && $file != '..' && !is_dir($upload_dir . $file)) {
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
                    $files[] = [
                        'name' => $file,
                        'url' => $base_url . $file,
                        'size' => filesize($upload_dir . $file),
                        'date' => filemtime($upload_dir . $file)
                    ];
                }
            }
        }
        closedir($dir);
    }
    // Tarihe göre yeniler en üstte
    usort($files, function($a, $b) {
        return $b['date'] - $a['date'];
    });
    
    header('Content-Type: application/json');
    echo json_encode($files);
    exit;
}

// POST: Dosya yükle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    header('Content-Type: application/json');
    
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Dosya yüklenemedi veya seçilmedi.']);
        exit;
    }

    $file = $_FILES['file'];
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Sadece resim dosyaları yüklenebilir.']);
        exit;
    }

    // Rastgele isim üret
    $new_name = uniqid('img_') . '.' . $ext;
    $target_file = $upload_dir . $new_name;

    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }

    if (move_uploaded_file($file['tmp_name'], $target_file)) {
        echo json_encode([
            'success' => true,
            'url' => $base_url . $new_name,
            'name' => $new_name
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Dosya kaydedilemedi.']);
    }
    exit;
}

// DELETE: Dosya sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    header('Content-Type: application/json');
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';

    if (empty($name) || strpos($name, '..') !== false || strpos($name, '/') !== false) {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz dosya adı.']);
        exit;
    }

    $target_file = $upload_dir . $name;
    if (file_exists($target_file)) {
        unlink($target_file);
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Dosya bulunamadı.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek.']);
