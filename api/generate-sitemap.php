<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// CORS ayarları
header('Access-Control-Allow-Origin: https://www.firatotoyedekparca.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Veritabanı bağlantısı
require_once 'db.php';

// Güvenlik kontrolü (isteğe bağlı)
$secret_key = isset($_GET['key']) ? $_GET['key'] : '';
$valid_key = 'firatoto2024'; // Bu anahtarı değiştirin

if ($secret_key !== $valid_key) {
    http_response_code(403);
    echo json_encode(['error' => 'Geçersiz anahtar']);
    exit;
}

// Slugify fonksiyonu
function slugify($str) {
    $str = mb_strtolower($str, 'UTF-8');
    $tr = ['ş'=>'s','Ş'=>'s','ı'=>'i','İ'=>'i','ç'=>'c','Ç'=>'c','ü'=>'u','Ü'=>'u','ö'=>'o','Ö'=>'o','ğ'=>'g','Ğ'=>'g'];
    $str = strtr($str, $tr);
    $str = preg_replace('/[^a-z0-9\s_]/u', '', $str);
    $str = preg_replace('/\s+/', '_', $str);
    return trim($str, '_');
}

// Sitemap oluşturma fonksiyonu
function generateSitemap($pdo) {
    $baseUrl = 'https://firatotoyedekparca.com';
    
    // Tüm ürünleri çek
    $sql = "SELECT brand, name FROM products ORDER BY brand, name";
    $stmt = $pdo->query($sql);
    
    if (!$stmt) {
        return ['error' => 'Veritabanı hatası'];
    }
    
    $products = $stmt->fetchAll();
    
    // XML oluştur
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    
    // Ana sayfalar
    $mainPages = [
        ['url' => '/', 'priority' => '1.0'],
        ['url' => '/hakkımızda', 'priority' => '0.8'],
        ['url' => '/iletisim', 'priority' => '0.8'],
        ['url' => '/cart', 'priority' => '0.6'],
        ['url' => '/favorites', 'priority' => '0.6'],
        ['url' => '/account', 'priority' => '0.6'],
        ['url' => '/blog', 'priority' => '0.7']
    ];
    
    foreach ($mainPages as $page) {
        $xml .= "  <url>\n";
        $xml .= "    <loc>{$baseUrl}{$page['url']}</loc>\n";
        $xml .= "    <priority>{$page['priority']}</priority>\n";
        $xml .= "  </url>\n";
    }
    
    // Marka sayfaları kaldırıldı - sadece kategori sayfaları kullanılıyor
    
    // Marka/Model sayfaları
    $brandModels = [];
    $sql = "SELECT brand, model FROM brand_models ORDER BY brand, model";
    $stmt = $pdo->query($sql);
    if ($stmt) {
        $brandModels = $stmt->fetchAll();
        foreach ($brandModels as $brandModel) {
            $brand = $brandModel['brand'];
            $model = $brandModel['model'];
            
            // MERCEDES-BENZ için özel slug
            if ($brand === 'MERCEDES-BENZ') {
                $slugBrand = 'mercedes-benz';
            } elseif ($brand === 'GENEL MARKALAR') {
                $slugBrand = 'genel_markalar';
            } else {
                $slugBrand = slugify($brand);
            }
            
            $slugModel = slugify($model);
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}/kategori/{$slugBrand}/{$slugModel}</loc>\n";
            $xml .= "    <priority>0.7</priority>\n";
            $xml .= "  </url>\n";
        }
    }
    
    // Blog sayfaları
    $blogs = [];
    $sql = "SELECT slug, title FROM blogs ORDER BY created_at DESC";
    $stmt = $pdo->query($sql);
    if ($stmt) {
        $blogs = $stmt->fetchAll();
        foreach ($blogs as $blog) {
            $slug = $blog['slug'];
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$baseUrl}/blog/{$slug}</loc>\n";
            $xml .= "    <priority>0.6</priority>\n";
            $xml .= "  </url>\n";
        }
    }
    
    // Ürün sayfaları
    foreach ($products as $product) {
        $slugBrand = slugify($product['brand']);
        $slugName = slugify($product['name']);
        $xml .= "  <url>\n";
        $xml .= "    <loc>{$baseUrl}/{$slugBrand}/{$slugName}</loc>\n";
        $xml .= "    <priority>0.7</priority>\n";
        $xml .= "  </url>\n";
    }
    
    $xml .= '</urlset>';
    
    // Dosyaya kaydet
    $sitemapPath = __DIR__ . '/../sitemap.xml';
    error_log('Sitemap path: ' . $sitemapPath);
    error_log('XML length: ' . strlen($xml));
    error_log('File exists before: ' . (file_exists($sitemapPath) ? 'YES' : 'NO'));
    error_log('File writable: ' . (is_writable($sitemapPath) ? 'YES' : 'NO'));
    
    // Dosyayı sil ve yeniden oluştur
    if (file_exists($sitemapPath)) {
        unlink($sitemapPath);
        error_log('Old sitemap deleted');
    }
    
    $result = file_put_contents($sitemapPath, $xml);
    
    if ($result === false) {
        error_log('Sitemap yazma hatası: ' . error_get_last()['message']);
        return ['error' => 'Dosya yazma hatası: ' . error_get_last()['message']];
    }
    
    error_log('Sitemap başarıyla yazıldı. Bytes: ' . $result);
    error_log('File exists after: ' . (file_exists($sitemapPath) ? 'YES' : 'NO'));
    error_log('File size: ' . filesize($sitemapPath));
    
    return [
        'success' => true,
        'message' => 'Sitemap başarıyla oluşturuldu',
        'total_products' => count($products),
        'total_brands' => count(array_unique(array_column($products, 'brand'))),
        'total_urls' => count($mainPages) + count($brandModels) + count($blogs) + count($products),
        'file_path' => $sitemapPath,
        'file_size' => filesize($sitemapPath)
    ];
}

// Ana işlem
try {
    $result = generateSitemap($pdo);
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Sunucu hatası: ' . $e->getMessage()]);
}
?> 