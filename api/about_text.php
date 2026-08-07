<?php
$allowed_origins = ['https://www.firatotoyedekparca.com', 'http://localhost:5173', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

// Admin check for PUT / POST
if (in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'POST'])) {
    $isLocal = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
    // if (!$isLocal && (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1)) {
    //     http_response_code(403);
    //     echo json_encode(['error' => 'Yetkisiz erişim']);
    //     exit;
    // }
}

header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/data';
$configFile = $dataDir . '/about_text.json';

// Create data dir if not exists
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

// Default config
$defaultConfig = [
    'text' => "Fırat Oto Yedek Parça, 2021 yılında Adana'da kurulmuş olup, otomotiv yedek parça sektöründe yenilikçi ve güvenilir hizmet anlayışıyla faaliyet göstermektedir. Müşterilerimize sadece parça satışı değil, aynı zamanda doğru ürün seçimi ve teknik destek konusunda da profesyonel çözümler sunuyoruz.\n\nAdana merkezli firmamızla; BMW, Mercedes, Audi, Volkswagen başta olmak üzere birçok marka için çıkma ve sıfır yedek parça temini sağlıyoruz. Tüm Türkiye'ye hızlı kargo imkanıyla hizmet verirken, ürünlerimize kendi sitemizden, ayrıca Oto Çıkma ve Çıkma Parça Market platformları üzerinden ulaşabilirsiniz."
];

// If file doesn't exist, create it with default
if (!file_exists($configFile)) {
    file_put_contents($configFile, json_encode($defaultConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $configData = file_get_contents($configFile);
    $config = json_decode($configData, true) ?: $defaultConfig;
    echo json_encode(['success' => true, 'text' => $config['text']]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = json_decode(file_get_contents('php://input'), true);
    
    if (isset($inputData['text'])) {
        $config = ['text' => $inputData['text']];
        if (file_put_contents($configFile, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode(['success' => true, 'message' => 'Yazı güncellendi', 'text' => $config['text']]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Dosya yazılamadı (izinleri kontrol edin)']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz veri']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method Not Allowed']);
