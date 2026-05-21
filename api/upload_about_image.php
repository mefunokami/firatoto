<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Sadece POST kabul edilir.']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $code = isset($_FILES['image']) ? $_FILES['image']['error'] : 'yok';
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dosya alınamadı. Kod: ' . $code]);
    exit;
}

$file = $_FILES['image'];

// Gerçek MIME kontrolü
$allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime  = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Geçersiz dosya türü. JPG, PNG, WEBP veya GIF yükleyin.']);
    exit;
}

// Max 10MB
if ($file['size'] > 10 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dosya 10MB sınırını aşıyor.']);
    exit;
}

$uploadDir = __DIR__ . '/../about-images/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$ext = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
    default      => 'jpg'
};

$filename = 'about_' . uniqid('', true) . '.' . $ext;
$dest     = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Dosya kaydedilemedi.']);
    exit;
}

echo json_encode(['success' => true, 'url' => '/about-images/' . $filename]);
