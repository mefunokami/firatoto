<?php
/**
 * Sosyal medya önizlemesi (WhatsApp, Facebook vb.) için ürün OG meta etiketleri.
 * SPA yalnızca JS ile meta güncellediğinden crawler'lar index.html logosunu görür;
 * bu endpoint gerçek ürün görselini döner.
 */
require_once __DIR__ . '/db.php';

function og_slugify($str)
{
    $str = mb_strtolower($str, 'UTF-8');
    $tr = ['ş' => 's', 'Ş' => 's', 'ı' => 'i', 'İ' => 'i', 'ç' => 'c', 'Ç' => 'c', 'ü' => 'u', 'Ü' => 'u', 'ö' => 'o', 'Ö' => 'o', 'ğ' => 'g', 'Ğ' => 'g'];
    $str = strtr($str, $tr);
    $str = preg_replace('/\s+/', '_', $str);
    $str = preg_replace('/[^a-z0-9_\-]/', '', $str);
    $str = preg_replace('/_+/', '_', $str);
    return trim($str, '_');
}

function og_absolute_image($url)
{
    $base = 'https://www.firatotoyedekparca.com';
    if (empty($url) || strpos($url, 'data:') === 0) {
        return $base . '/logo.png';
    }
    if (preg_match('#^https?://#i', $url)) {
        return $url;
    }
    if (strpos($url, '//') === 0) {
        return 'https:' . $url;
    }
    return $base . (strpos($url, '/') === 0 ? $url : '/' . $url);
}

function og_h($s)
{
    return htmlspecialchars($s ?? '', ENT_QUOTES, 'UTF-8');
}

$brandSlug = trim($_GET['brand'] ?? '');
$productSlug = trim($_GET['product'] ?? '');

if (!$brandSlug || !$productSlug) {
    http_response_code(404);
    echo 'Ürün bulunamadı';
    exit;
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$conn->set_charset('utf8mb4');
if ($conn->connect_error) {
    http_response_code(500);
    echo 'Veritabanı hatası';
    exit;
}

$stmt = $conn->prepare(
    'SELECT id, name, brand, description, imageUrl, imageUrl1, price, category, partNumber, model
     FROM products
     WHERE slug_brand = ? AND slug_name = ?
     LIMIT 1'
);
$stmt->bind_param('ss', $brandSlug, $productSlug);
$stmt->execute();
$product = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$product) {
    $stmt = $conn->prepare(
        'SELECT id, name, brand, description, imageUrl, imageUrl1, price, category, partNumber, model
         FROM products
         WHERE slug_brand = ? AND slug_name LIKE ?
         LIMIT 1'
    );
    $like = $productSlug . '%';
    $stmt->bind_param('ss', $brandSlug, $like);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();
    $stmt->close();
}

$conn->close();

$pageUrl = 'https://www.firatotoyedekparca.com/' . rawurlencode($brandSlug) . '/' . rawurlencode($productSlug);

if (!$product) {
    header('Location: ' . $pageUrl, true, 302);
    exit;
}

$imageUrl = og_absolute_image($product['imageUrl'] ?: $product['imageUrl1']);
$title = $product['name'] . ' | ' . $product['brand'] . ' Yedek Parça | Fırat Oto Yedek Parça';
$desc = trim($product['description'] ?? '') !== ''
    ? mb_substr(strip_tags($product['description']), 0, 200)
    : ($product['name'] . ', ' . $product['brand'] . ' yedek parça. Orijinal ve uygun fiyatlı ürün. Hızlı kargo.');

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title><?= og_h($title) ?></title>
  <meta name="description" content="<?= og_h($desc) ?>" />
  <link rel="canonical" href="<?= og_h($pageUrl) ?>" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Fırat Oto Yedek Parça" />
  <meta property="og:locale" content="tr_TR" />
  <meta property="og:title" content="<?= og_h($title) ?>" />
  <meta property="og:description" content="<?= og_h($desc) ?>" />
  <meta property="og:url" content="<?= og_h($pageUrl) ?>" />
  <meta property="og:image" content="<?= og_h($imageUrl) ?>" />
  <meta property="og:image:secure_url" content="<?= og_h($imageUrl) ?>" />
  <meta property="og:image:width" content="800" />
  <meta property="og:image:height" content="800" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="<?= og_h($title) ?>" />
  <meta name="twitter:description" content="<?= og_h($desc) ?>" />
  <meta name="twitter:image" content="<?= og_h($imageUrl) ?>" />
  <meta http-equiv="refresh" content="0;url=<?= og_h($pageUrl) ?>" />
</head>
<body>
  <p><a href="<?= og_h($pageUrl) ?>"><?= og_h($product['name']) ?></a></p>
  <img src="<?= og_h($imageUrl) ?>" alt="<?= og_h($product['name']) ?>" width="400" />
</body>
</html>
