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
    $allUrls = [];
    
    // 1. Ana sayfalar
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
        $allUrls[] = ['loc' => $baseUrl . $page['url'], 'priority' => $page['priority']];
    }
    
    // 2. Marka/Model sayfaları
    $sql = "SELECT brand, model FROM brand_models ORDER BY brand, model";
    $stmt = $pdo->query($sql);
    if ($stmt) {
        $brandModels = $stmt->fetchAll();
        foreach ($brandModels as $brandModel) {
            $brand = $brandModel['brand'];
            $model = $brandModel['model'];
            
            if ($brand === 'MERCEDES-BENZ') {
                $slugBrand = 'mercedes-benz';
            } elseif ($brand === 'GENEL MARKALAR') {
                $slugBrand = 'genel_markalar';
            } else {
                $slugBrand = slugify($brand);
            }
            
            $slugModel = slugify($model);
            $allUrls[] = ['loc' => "{$baseUrl}/kategori/{$slugBrand}/{$slugModel}", 'priority' => '0.7'];
        }
    }
    
    // 3. Blog sayfaları
    $sql = "SELECT slug, title FROM blogs ORDER BY created_at DESC";
    $stmt = $pdo->query($sql);
    if ($stmt) {
        $blogs = $stmt->fetchAll();
        foreach ($blogs as $blog) {
            $allUrls[] = ['loc' => "{$baseUrl}/blog/{$blog['slug']}", 'priority' => '0.6'];
        }
    }
    
    // 4. Ürün sayfaları
    $sql = "SELECT brand, name FROM products ORDER BY brand, name";
    $stmt = $pdo->query($sql);
    $productsCount = 0;
    if ($stmt) {
        $products = $stmt->fetchAll();
        $productsCount = count($products);
        foreach ($products as $product) {
            $slugBrand = slugify($product['brand']);
            $slugName = slugify($product['name']);
            $allUrls[] = ['loc' => "{$baseUrl}/{$slugBrand}/{$slugName}", 'priority' => '0.7'];
        }
    }
    
    // Parçalama işlemi (Maks 40,000 URL per sitemap)
    $chunkSize = 40000;
    $chunks = array_chunk($allUrls, $chunkSize);
    
    $sitemapFiles = [];
    $totalWrittenBytes = 0;
    $publicDir = __DIR__ . '/../';
    
    // Mevcut eski parçaları temizle (sitemap-1.xml vb)
    $existingSitemaps = glob($publicDir . 'sitemap-*.xml');
    if ($existingSitemaps) {
        foreach($existingSitemaps as $file) {
            @unlink($file);
        }
    }
    
    // Yeni sitemap parçalarını oluştur
    foreach ($chunks as $index => $chunk) {
        $partNumber = $index + 1;
        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($chunk as $u) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$u['loc']}</loc>\n";
            $xml .= "    <priority>{$u['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }
        $xml .= '</urlset>';
        $filename = "sitemap-{$partNumber}.xml";
        $path = $publicDir . $filename;
        $bytes = file_put_contents($path, $xml);
        if ($bytes !== false) {
            $sitemapFiles[] = $filename;
            $totalWrittenBytes += $bytes;
        }
    }
    
    // Ana Sitemap Index'i oluştur
    $indexXml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $indexXml .= '<sitemapindex xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    $today = date('c');
    foreach ($sitemapFiles as $file) {
        $indexXml .= "  <sitemap>\n";
        $indexXml .= "    <loc>{$baseUrl}/{$file}</loc>\n";
        $indexXml .= "    <lastmod>{$today}</lastmod>\n";
        $indexXml .= "  </sitemap>\n";
    }
    $indexXml .= '</sitemapindex>';
    
    $indexPath = $publicDir . 'sitemap.xml';
    $indexBytes = file_put_contents($indexPath, $indexXml);
    
    return [
        'success' => true,
        'message' => 'Parçalı Sitemap başarıyla oluşturuldu',
        'total_urls' => count($allUrls),
        'total_products' => $productsCount,
        'sitemap_parts_created' => count($sitemapFiles),
        'index_file' => 'sitemap.xml',
        'files' => $sitemapFiles
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