<?php
// Güvenli CORS
$allowed_origins = ['https://www.firatotoyedekparca.com', 'https://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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

// MERCEDES-BENZ modellerini ekle
if (isset($_GET['add_mercedes_models']) && $_GET['add_mercedes_models'] == 1) {
    $mercedesModels = [
        'A SERİSİ W168 1997-2004',
        'A SERİSİ W169 2004-2011',
        'A SERİSİ W176 2012-2017',
        'A SERİSİ W177 2018-',
        'B SERİSİ W245 2005-2011',
        'B SERİSİ W246 2012-2017',
        'C SERİSİ W202 1993-1999',
        'C SERİSİ W203 2000-2007',
        'C SERİSİ W204 2007-2013',
        'C SERİSİ W205 2015-2020',
        'C SERİSİ W206 2020-',
        'CLA SERİSİ W117 2013-2017',
        'CLK SERİSİ W208 1997-2002',
        'CLK SERİSİ W209 2003-2009',
        'CLS SERİSİ W218 2011-2017',
        'CLS SERİSİ W219 2004-2011',
        'E SERİSİ W210 1996-2002',
        'E SERİSİ W211 2002-2009',
        'E SERİSİ W212 2009-2016',
        'E SERİSİ W213 2016-2023',
        'S SERİSİ W220 1998-2005',
        'S SERİSİ W221 2005-2013',
        'S SERİSİ W222 2013-2020',
        'S SERİSİ W223 2020-',
        'G SERİSİ W463 1979-',
        'GLA SERİSİ X156 2013-2020',
        'GLA SERİSİ H247 2020-',
        'GLB SERİSİ X247 2019-',
        'GLC SERİSİ X253 2015-2022',
        'GLC SERİSİ X254 2022-',
        'GLE SERİSİ W166 2015-2019',
        'GLE SERİSİ W167 2019-',
        'GLS SERİSİ X166 2015-2019',
        'GLS SERİSİ X167 2019-',
        'SLK SERİSİ R170 1996-2004',
        'SLK SERİSİ R171 2004-2011',
        'SLK SERİSİ R172 2011-2016',
        'SLC SERİSİ R172 2016-2020',
        'SL SERİSİ R230 2001-2011',
        'SL SERİSİ R231 2012-2020',
        'SL SERİSİ R232 2021-',
        'AMG GT SERİSİ C190 2014-',
        'AMG GT SERİSİ R190 2021-'
    ];
    
    $count = 0;
    foreach ($mercedesModels as $model) {
        $stmt = $pdo->prepare("INSERT IGNORE INTO brand_models (brand, model) VALUES (?, ?)");
        if ($stmt->execute(['MERCEDES-BENZ', $model])) {
            $count++;
        }
    }
    
    echo json_encode(["success" => true, "message" => "MERCEDES-BENZ modelleri eklendi.", "added" => $count]);
    exit;
}

// CSRF koruması (POST, DELETE)
// if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'DELETE'])) {
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

// GET: Belirli markanın modellerini listele
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $brand = $_GET['brand'] ?? null;
    
    if (!$brand || !preg_match('/^[\p{L}0-9\s-]{2,50}$/u', $brand)) {
        http_response_code(400);
        echo json_encode(["error" => "Marka gerekli ve geçerli olmalı"]);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM brand_models WHERE brand = ?");
    $stmt->execute([$brand]);
    $models = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($models);
    exit;
}

// POST: Model ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $brand = trim($data['brand'] ?? '');
    $model = trim($data['model'] ?? '');
    $image_url = $data['image_url'] ?? null;
    if (!$brand || !$model || !preg_match('/^[\p{L}0-9\s-]{2,50}$/u', $brand) || !preg_match('/^[\p{L}0-9\s-]{1,50}$/u', $model)) {
        http_response_code(400);
        echo json_encode(["error" => "Marka ve model gerekli ve geçerli olmalı"]);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO brand_models (brand, model, image_url) VALUES (?, ?, ?)");
    $ok = $stmt->execute([$brand, $model, $image_url]);
    if ($ok) {
        echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
    } else {
        error_log('Model eklenemedi: ' . $brand . ' - ' . $model);
        http_response_code(500);
        echo json_encode(["error" => "Model eklenemedi"]);
    }
    exit;
}

// DELETE: Model sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str($_SERVER['QUERY_STRING'], $params);
    $id = isset($params['id']) ? intval($params['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID gerekli"]);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM brand_models WHERE id=?");
    $ok = $stmt->execute([$id]);
    if ($ok) {
        echo json_encode(["success" => true]);
    } else {
        error_log('Model silinemedi: ' . $id);
        http_response_code(500);
        echo json_encode(["error" => "Model silinemedi"]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Geçersiz istek"]); 