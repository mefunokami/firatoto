<?php
/**
 * Görsel Proxy (Image Maskeleme)
 * Kullanım: /api/image-proxy.php?url=<URL-encoded-image-url>
 *
 * Karşı sunucudaki şifreli/korumalı görselleri kendi domain'imiz üzerinden sunar.
 * Tarayıcıda 24 saat önbelleğe alınır.
 */

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// URL parametresini al ve doğrula
$rawUrl = isset($_GET['url']) ? $_GET['url'] : '';
if (empty($rawUrl)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'url parametresi gerekli']);
    exit;
}

// URL decode (çift encode edilmiş olabilir)
$url = urldecode($rawUrl);

// Temel URL doğrulama
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Geçersiz URL']);
    exit;
}

// Sadece http/https protokollerine izin ver
$scheme = strtolower(parse_url($url, PHP_URL_SCHEME));
if (!in_array($scheme, ['http', 'https'])) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Sadece http/https destekleniyor']);
    exit;
}

// ETag ile önbellekleme desteği
$etag = '"' . md5($url) . '"';
header('ETag: ' . $etag);
if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) {
    http_response_code(304);
    exit;
}

// Uzak görseli çek
$context = stream_context_create([
    'http' => [
        'method'          => 'GET',
        'timeout'         => 15,
        'ignore_errors'   => true,
        'follow_location' => true,
        'max_redirects'   => 5,
        'header'          => implode("\r\n", [
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept: image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer: https://firatotoyedekparca.com/',
        ]),
    ],
    'ssl' => [
        'verify_peer'      => false,
        'verify_peer_name' => false,
    ],
]);

$imageData = @file_get_contents($url, false, $context);

// Başarısız çekme — placeholder döndür
if ($imageData === false || strlen($imageData) < 100) {
    // 1x1 şeffaf PNG placeholder
    $placeholder = base64_decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    );
    http_response_code(200);
    header('Content-Type: image/png');
    header('Content-Length: ' . strlen($placeholder));
    header('Cache-Control: public, max-age=3600');
    echo $placeholder;
    exit;
}

// Content-Type belirle (HTTP başlıklarından veya uzantıdan)
$contentType = 'image/jpeg';

// HTTP yanıt başlıklarından al
if (isset($http_response_header) && is_array($http_response_header)) {
    foreach ($http_response_header as $h) {
        if (stripos($h, 'Content-Type:') !== false) {
            $parts = explode(':', $h, 2);
            if (isset($parts[1])) {
                $ct = trim(explode(';', $parts[1])[0]);
                if (strpos($ct, 'image/') === 0) {
                    $contentType = $ct;
                }
            }
            break;
        }
    }
}

// URL uzantısından tahmin et (fallback)
if ($contentType === 'image/jpeg') {
    $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
    $mimeMap = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'webp' => 'image/webp',
        'svg'  => 'image/svg+xml',
        'bmp'  => 'image/bmp',
        'avif' => 'image/avif',
    ];
    if (isset($mimeMap[$ext])) {
        $contentType = $mimeMap[$ext];
    }
}

// Yanıtı döndür
header('Content-Type: ' . $contentType);
header('Content-Length: ' . strlen($imageData));
header('Cache-Control: public, max-age=86400'); // 24 saat önbellekle
header('X-Proxied-By: firatoto-image-proxy');

echo $imageData;
exit;
