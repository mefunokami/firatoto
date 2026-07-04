<?php
// Veritabanı bağlantı ayarları
//define('DB_HOST', 'localhost');
//define('DB_NAME', 'firatoto');
//define('DB_USER', 'root');
//define('DB_PASS', '');
define('DB_HOST', 'localhost');
define('DB_NAME', 'u882012653_firatoto');
define('DB_USER', 'u882012653_firatotoyedek');
define('DB_PASS', 'Xi;YpC::0');

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı bağlantı hatası: ' . $e->getMessage()]);
    exit;
}