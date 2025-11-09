<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
// CORS sadece güvenilir domain
header('Access-Control-Allow-Origin: https://www.firatotoyedekparca.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Rate limiting (IP başına saniyede 10 istek)
session_start();
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

// --- SLUGIFY FONKSİYONU ---
function slugify($str) {
    $str = mb_strtolower($str, 'UTF-8');
    $tr = ['ş'=>'s','Ş'=>'s','ı'=>'i','İ'=>'i','ç'=>'c','Ç'=>'c','ü'=>'u','Ü'=>'u','ö'=>'o','Ö'=>'o','ğ'=>'g','Ğ'=>'g'];
    $str = strtr($str, $tr);
    // Tire karakterini koru (MERCEDES-BENZ için)
    $str = preg_replace('/[^a-z0-9\s_-]/u', '', $str);
    $str = preg_replace('/\s+/', '_', $str);
    return trim($str, '_');
}

// --- TÜM ÜRÜNLERİN SLUG ALANLARINI GÜNCELLE ---
function updateAllProductSlugs($conn) {
    $result = $conn->query("SELECT id, brand, name FROM products");
    if (!$result) return false;
    while ($row = $result->fetch_assoc()) {
        $slug_brand = slugify($row['brand']);
        $slug_name = slugify($row['name']);
        $id = intval($row['id']);
        $conn->query("UPDATE products SET slug_brand='".$conn->real_escape_string($slug_brand)."', slug_name='".$conn->real_escape_string($slug_name)."' WHERE id=$id");
    }
    return true;
}

// --- TÜM GENEL MARKALAR ÜRÜNLERİNİN MODEL ALANINI DÜZELT ---
if (isset($_GET['fix_models']) && $_GET['fix_models'] == 1) {
    $result = $conn->query("SELECT id, model FROM products WHERE brand = 'GENEL MARKALAR'");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $id = intval($row['id']);
            $model = strtoupper(trim($row['model']));
            $conn->query("UPDATE products SET model='".$conn->real_escape_string($model)."' WHERE id=$id");
        }
        echo json_encode(["success" => true, "message" => "GENEL MARKALAR ürünlerinin model alanları düzeltildi."]);
    } else {
        echo json_encode(["error" => "Sorgu hatası"]);
    }
    exit;
}

// --- GENEL MARKALAR ve CASTROL varyasyonlarını topluca düzelt ---
if (isset($_GET['fix_brand_model']) && $_GET['fix_brand_model'] == 1) {
    $result = $conn->query("SELECT id, brand, model FROM products");
    if ($result) {
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            $id = intval($row['id']);
            $brand = strtoupper(str_replace(['_', '-', 'İ', 'i'], [' ', ' ', 'I', 'I'], trim($row['brand'])));
            $model = strtoupper(trim($row['model']));
            $brand = preg_replace('/\s+/', ' ', $brand);
            $model = preg_replace('/\s+/', ' ', $model);
            $update = false;
            if (in_array($brand, ['GENEL MARKALAR', 'GENELMARKALAR', 'GENEL-MARKALAR', 'GENEL_MARKALAR', 'GENEL MARKALAR ', 'GENEL MARKALAR'])) {
                $brand = 'GENEL MARKALAR';
                $update = true;
            }
            if (in_array($model, ['CASTROL', 'CASTROL ', 'Castrol', 'castrol'])) {
                $model = 'CASTROL';
                $update = true;
            }
            if ($update) {
                $conn->query("UPDATE products SET brand='GENEL MARKALAR', model='CASTROL' WHERE id=$id");
                $count++;
            }
        }
        echo json_encode(["success" => true, "message" => "Toplu düzeltme tamamlandı.", "updated" => $count]);
    } else {
        echo json_encode(["error" => "Sorgu hatası"]);
    }
    exit;
}

// --- MERCEDES-BENZ SLUG'LARINI DÜZELT ---
if (isset($_GET['fix_mercedes_slugs']) && $_GET['fix_mercedes_slugs'] == 1) {
    $result = $conn->query("SELECT id, brand FROM products WHERE brand = 'MERCEDES-BENZ'");
    if ($result) {
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            $id = intval($row['id']);
            $slug_brand = slugify($row['brand']); // mercedes-benz
            $conn->query("UPDATE products SET slug_brand='".$conn->real_escape_string($slug_brand)."' WHERE id=$id");
            $count++;
        }
        echo json_encode(["success" => true, "message" => "MERCEDES-BENZ slug'ları düzeltildi.", "updated" => $count]);
    } else {
        echo json_encode(["error" => "Sorgu hatası"]);
    }
    exit;
}

// --- SLUG GÜNCELLEMEYİ EN BAŞA AL ---
$host = "localhost";
$user = "u926623781_firatotoyedek";
$pass = "b4T]5fObI7";
$db   = "u926623781_firatoto";
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Veritabanı bağlantı hatası"]);
    exit;
}

// --- TÜM ÜRÜNLERİN SLUG_MODEL ALANINI GÜNCELLE ---
if (isset($_GET['fix_slug_models']) && $_GET['fix_slug_models'] == 1) {
    $result = $conn->query("SELECT id, model FROM products");
    if ($result) {
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            $id = intval($row['id']);
            $model = $row['model'];
            $slug_model = slugify($model);
            $conn->query("UPDATE products SET slug_model='".$conn->real_escape_string($slug_model)."' WHERE id=$id");
            $count++;
        }
        echo json_encode(["success" => true, "message" => "Tüm ürünlerin slug_model alanı güncellendi.", "updated" => $count]);
    } else {
        echo json_encode(["error" => "Sorgu hatası"]);
    }
    exit;
}

// --- GENEL MARKALAR markalı TÜM ürünlerin brand ve model alanlarını topluca düzelt ---
if (isset($_GET['fix_brand_models_all']) && $_GET['fix_brand_models_all'] == 1) {
    $result = $conn->query("SELECT id, brand, model FROM products");
    if ($result) {
        $count = 0;
        while ($row = $result->fetch_assoc()) {
            $id = intval($row['id']);
            $brand = strtoupper(str_replace(['_', '-', 'İ', 'i'], [' ', ' ', 'I', 'I'], trim($row['brand'])));
            $brand = preg_replace('/\s+/', ' ', $brand);
            if (in_array($brand, ['GENEL MARKALAR', 'GENELMARKALAR', 'GENEL-MARKALAR', 'GENEL_MARKALAR', 'GENEL MARKALAR ', 'GENEL MARKALAR'])) {
                $model = strtoupper(trim($row['model']));
                $model = preg_replace('/\s+/', ' ', $model);
                $conn->query("UPDATE products SET brand='GENEL MARKALAR', model='".$conn->real_escape_string($model)."' WHERE id=$id");
                $count++;
            }
        }
        echo json_encode(["success" => true, "message" => "GENEL MARKALAR markalı tüm ürünlerin brand ve model alanları düzeltildi.", "updated" => $count]);
    } else {
        echo json_encode(["error" => "Sorgu hatası"]);
    }
    exit;
}

// --- TÜM ÜRÜNLERİN SLUG ALANLARINI GÜNCELLE (manuel tetikleme) ---
if (isset($_GET['update_slugs']) && $_GET['update_slugs'] == 1) {
    if (updateAllProductSlugs($conn)) {
        echo json_encode(["success" => true, "message" => "Tüm ürünlerin slug_brand ve slug_name alanları güncellendi."]);
    } else {
        echo json_encode(["error" => "Güncelleme başarısız."]);
    }
    exit;
}

// Test endpoint - veritabanı yapısını kontrol et
if (isset($_GET['debug']) && $_GET['debug'] == 1) {
    $result = $conn->query("SHOW COLUMNS FROM products");
    $columns = [];
    while ($row = $result->fetch_assoc()) {
        $columns[] = $row;
    }
    echo json_encode([
        "success" => true,
        "columns" => $columns,
        "message" => "Veritabanı tablo yapısı"
    ]);
    exit;
}

// GET: Belirli bir ürünü id ile getir
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();
    echo json_encode($product);
    exit;
}
// GET: Ürünleri listele
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id']) && !isset($_GET['weekly_deal'])) {
    $brand = isset($_GET['brand']) ? $_GET['brand'] : null;
    $model = isset($_GET['model']) ? $_GET['model'] : null;
    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];
    $types = '';
    if ($brand) {
        $sql .= " AND (brand = ? OR slug_brand = ?)";
        $params[] = $brand;
        $params[] = slugify($brand);
        $types .= 'ss';
    }
    if ($model) {
        $sql .= " AND (model = ? OR slug_model = ?)";
        $params[] = $model;
        $params[] = slugify($model);
        $types .= 'ss';
    }
    $sql .= " ORDER BY createdAt DESC";
    if (count($params) > 0) {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $result = $conn->query($sql);
    }
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // slug_brand ve slug_name alanlarını ekle
        $row['slug_brand'] = slugify($row['brand']);
        $row['slug_name'] = slugify($row['name']);
        $products[] = $row;
    }
    echo json_encode($products);
    exit;
}

// GET: Haftanın fırsatı ürünleri
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['weekly_deal'])) {
    $stmt = $conn->prepare("SELECT * FROM products WHERE is_weekly_deal = 1");
    $stmt->execute();
    $result = $stmt->get_result();
    $products = [];
    while ($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
    echo json_encode($products);
    exit;
}

// POST: Ürün güncelle (PUT alternatifi, sadece admin için)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_GET['id']) && intval($_GET['id']) > 0) {
    file_put_contents(__DIR__.'/debug.log', 'POST id: ' . print_r($_GET['id'], true) . PHP_EOL, FILE_APPEND);
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
        http_response_code(403);
        echo json_encode(['error' => 'Yetkisiz erişim.']);
        exit;
    }
    $id = intval($_GET['id']);
    $data = json_decode(file_get_contents('php://input'), true);
    $is_weekly_deal = isset($data['is_weekly_deal']) && $data['is_weekly_deal'] ? 1 : 0;
    $trendyolUrl = isset($data['trendyolUrl']) ? $data['trendyolUrl'] : '';
    $description = isset($data['description']) ? trim($data['description']) : '';
    // Açıklama boşsa null olarak kaydet
    if ($description === '' || strtolower($description) === 'null') {
        $description = '';
    }
    $slug_brand = slugify($data['brand']);
    $slug_name = slugify($data['name']);
    $imageUrl1 = isset($data['imageUrl1']) ? $data['imageUrl1'] : '';
    $imageUrl2 = isset($data['imageUrl2']) ? $data['imageUrl2'] : '';
    $stmt = $conn->prepare("UPDATE products SET name=?, brand=?, model=?, year=?, price=?, stock=?, description=?, category=?, partNumber=?, imageUrl=?, imageUrl1=?, imageUrl2=?, trendyolUrl=?, is_weekly_deal=?, slug_brand=?, slug_name=? WHERE id=?");
    $stmt->bind_param(
        "ssssdissssssssssi",
        $data['name'], $data['brand'], $data['model'], $data['year'],
        $data['price'], $data['stock'], $description, $data['category'],
        $data['partNumber'], $data['imageUrl'], $imageUrl1, $imageUrl2, $trendyolUrl, $is_weekly_deal, $slug_brand, $slug_name, $id
    );
    if ($stmt->execute()) {
        // Yeni sitemap generator'ı çağır
        $sitemapUrl = 'https://firatotoyedekparca.com/api/generate-sitemap.php?key=firatoto2024';
        $context = stream_context_create([
            'http' => [
                'timeout' => 30,
                'ignore_errors' => true
            ]
        ]);
        $response = file_get_contents($sitemapUrl, false, $context);
        
        echo json_encode(["success" => true, "sitemap_updated" => !empty($response)]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Ürün güncellenemedi"]);
    }
    exit;
}
// POST: Ürün ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (!isset($_GET['id']) || empty($_GET['id']) || intval($_GET['id']) <= 0) && !isset($_GET['set_weekly_deal'])) {
    file_put_contents(__DIR__.'/debug.log', 'EKLEME ÇALIŞTI' . PHP_EOL, FILE_APPEND);
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Debug: Gelen veriyi logla
    file_put_contents(__DIR__.'/debug.log', 'Gelen data: ' . print_r($data, true) . PHP_EOL, FILE_APPEND);
    
    $is_weekly_deal = isset($data['is_weekly_deal']) && $data['is_weekly_deal'] ? 1 : 0;
    $description = isset($data['description']) ? trim($data['description']) : '';
    // Açıklama boşsa null olarak kaydet
    if ($description === '' || strtolower($description) === 'null') {
        $description = '';
    }
    $slug_brand = slugify($data['brand']);
    $slug_name = slugify($data['name']);
    $imageUrl1 = isset($data['imageUrl1']) ? $data['imageUrl1'] : '';
    $imageUrl2 = isset($data['imageUrl2']) ? $data['imageUrl2'] : '';
    
    // Debug: imageUrl1 ve imageUrl2 değerlerini logla
    file_put_contents(__DIR__.'/debug.log', 'imageUrl1: ' . $imageUrl1 . PHP_EOL, FILE_APPEND);
    file_put_contents(__DIR__.'/debug.log', 'imageUrl2: ' . $imageUrl2 . PHP_EOL, FILE_APPEND);
    
    $stmt = $conn->prepare("INSERT INTO products (name, brand, model, year, price, stock, description, category, partNumber, imageUrl, imageUrl1, imageUrl2, trendyolUrl, createdAt, is_weekly_deal, slug_brand, slug_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)");
    $stmt->bind_param(
        "ssssdissssssssss",
        $data['name'], $data['brand'], $data['model'], $data['year'],
        $data['price'], $data['stock'], $description, $data['category'],
        $data['partNumber'], $data['imageUrl'], $imageUrl1, $imageUrl2, $data['trendyolUrl'], $is_weekly_deal, $slug_brand, $slug_name
    );
    if ($stmt->execute()) {
        // Yeni sitemap generator'ı çağır
        $sitemapUrl = 'https://firatotoyedekparca.com/api/generate-sitemap.php?key=firatoto2024';
        $context = stream_context_create([
            'http' => [
                'timeout' => 30,
                'ignore_errors' => true
            ]
        ]);
        $response = file_get_contents($sitemapUrl, false, $context);
        
        echo json_encode(["success" => true, "id" => $stmt->insert_id, "sitemap_updated" => !empty($response)]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Ürün eklenemedi"]);
    }
    exit;
}

// POST: Haftanın fırsatı olarak işaretle
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['set_weekly_deal'])) {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = isset($data['id']) ? intval($data['id']) : null;
    $is_weekly_deal = isset($data['is_weekly_deal']) ? intval($data['is_weekly_deal']) : 0;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID gerekli"]);
        exit;
    }
    $stmt = $conn->prepare("UPDATE products SET is_weekly_deal=? WHERE id=?");
    $stmt->bind_param("ii", $is_weekly_deal, $id);
    if ($stmt->execute()) {
        // Yeni sitemap generator'ı çağır
        $sitemapUrl = 'https://firatotoyedekparca.com/api/generate-sitemap.php?key=firatoto2024';
        $context = stream_context_create([
            'http' => [
                'timeout' => 30,
                'ignore_errors' => true
            ]
        ]);
        $response = file_get_contents($sitemapUrl, false, $context);
        
        echo json_encode(["success" => true, "sitemap_updated" => !empty($response)]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Güncellenemedi"]);
    }
    exit;
}

// DELETE: Ürün sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str($_SERVER['QUERY_STRING'], $params);
    $id = isset($params['id']) ? intval($params['id']) : null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "ID gerekli"]);
        exit;
    }
    $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        // Yeni sitemap generator'ı çağır
        $sitemapUrl = 'https://firatotoyedekparca.com/api/generate-sitemap.php?key=firatoto2024';
        $context = stream_context_create([
            'http' => [
                'timeout' => 30,
                'ignore_errors' => true
            ]
        ]);
        $response = file_get_contents($sitemapUrl, false, $context);
        
        echo json_encode(["success" => true, "sitemap_updated" => !empty($response)]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Ürün silinemedi"]);
    }
    exit;
}

echo json_encode(["error" => "Geçersiz istek"]); 

// --- SİTE HARİTASI GÜNCELLEME FONKSİYONU ---
function updateSitemap($conn) {
    $sql = "SELECT brand, name FROM products";
    $result = $conn->query($sql);
    $urls = [];
    while ($row = $result->fetch_assoc()) {
        $brand = slugify($row['brand']);
        $name = slugify($row['name']);
        $urls[] = "    <url>\n      <loc>https://firatotoyedekparca.com/$brand/$name</loc>\n      <priority>0.7</priority>\n    </url>";
    }
    $sitemap = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"https://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url>\n    <loc>https://firatotoyedekparca.com/</loc>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://firatotoyedekparca.com/about</loc>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://firatotoyedekparca.com/contact-info</loc>\n    <priority>0.8</priority>\n  </url>\n" . implode("\n", $urls) . "\n</urlset>\n";
    file_put_contents(__DIR__ . '/../public/sitemap.xml', $sitemap);
} 