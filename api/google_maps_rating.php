<?php
$allowed_origins = ['https://www.firatotoyedekparca.com', 'http://localhost:5173', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

if (in_array($_SERVER['REQUEST_METHOD'], ['PUT'])) {
    $isLocal = in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1']);
    if (!$isLocal && (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1)) {
        http_response_code(403);
        echo json_encode(['error' => 'Yetkisiz erişim']);
        exit;
    }
}

header('Content-Type: application/json; charset=utf-8');

$dataDir = __DIR__ . '/data';
$configFile = $dataDir . '/google_maps.json';

$defaults = [
    'rating' => 5.0,
    'review_count' => 0,
    'maps_url' => 'https://share.google/Sq5zO5TC6BcGLN7v6',
    'business_name' => 'Fırat Oto Yedek Parça',
];

if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

function readConfig($file, $defaults)
{
    if (!file_exists($file)) {
        file_put_contents($file, json_encode($defaults, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        return $defaults;
    }
    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return $defaults;
    }
    return array_merge($defaults, $data);
}

function writeConfig($file, $data)
{
    return file_put_contents(
        $file,
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    ) !== false;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $config = readConfig($configFile, $defaults);
    $config['rating'] = round(floatval($config['rating']), 1);
    $config['review_count'] = intval($config['review_count']);
    echo json_encode(['success' => true, ...$config]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['error' => 'Geçersiz veri']);
        exit;
    }
    $config = readConfig($configFile, $defaults);
    if (isset($input['rating'])) {
        $r = floatval($input['rating']);
        $config['rating'] = max(0, min(5, round($r, 1)));
    }
    if (isset($input['review_count'])) {
        $config['review_count'] = max(0, intval($input['review_count']));
    }
    if (isset($input['maps_url'])) {
        $config['maps_url'] = trim($input['maps_url']);
    }
    if (isset($input['business_name'])) {
        $config['business_name'] = trim($input['business_name']);
    }
    if (!writeConfig($configFile, $config)) {
        http_response_code(500);
        echo json_encode(['error' => 'Kaydedilemedi']);
        exit;
    }
    echo json_encode(['success' => true, ...$config]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek']);
