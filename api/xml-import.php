<?php
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

/**
 * XML Toplu Ürün İçe Aktarma
 * 700.000+ ürün için XMLReader tabanlı, yığın (batch) işleme sistemi.
 *
 * Desteklenen XML formatları (otomatik algılanır):
 *   <products><product>...</product></products>
 *   <Products><Product>...</Product></Products>
 *   <urunler><urun>...</urun></urunler>
 *   <items><item>...</item></items>
 *
 * Eylemler:
 *   POST ?action=upload  — XML dosyasını yükle, toplam ürün sayısını say, dosya ID döndür
 *   GET  ?action=process&file=ID&batch=N — N. grubu işle (her grup 500 ürün), ilerleme döndür
 *   GET  ?action=status&file=ID — Import durumunu sorgula
 */

ini_set('display_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
$allowedOrigins = ['https://www.firatotoyedekparca.com', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: http://localhost:5174');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Zaman ve bellek limitleri
set_time_limit(120);
ini_set('memory_limit', '256M');

// Veritabanı bağlantısı
require_once __DIR__ . '/db.php';
if (!isset($conn) || (isset($conn->connect_error) && $conn->connect_error)) {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
}
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Veritabanı bağlantı hatası']);
    exit;
}
$conn->set_charset('utf8mb4');

// Upload dizini
$uploadDir = __DIR__ . '/xml_imports/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// ================================
//  Yardımcı: Slugify
// ================================
if (!function_exists('slugify')) {
    function slugify($str)
    {
        $str = mb_strtolower((string)$str, 'UTF-8');
        $tr = ['ş' => 's', 'Ş' => 's', 'ı' => 'i', 'İ' => 'i', 'ç' => 'c', 'Ç' => 'c', 'ü' => 'u', 'Ü' => 'u', 'ö' => 'o', 'Ö' => 'o', 'ğ' => 'g', 'Ğ' => 'g'];
        $str = strtr($str, $tr);
        $str = preg_replace('/[^a-z0-9\s_-]/u', '', $str);
        $str = preg_replace('/\s+/', '_', $str);
        return trim($str, '_');
    }
}

// ================================
//  Alan eşleştirme (çok formatlı)
// ================================
function mapField($node, $fields)
{
    $val = null;
    foreach ($fields as $f) {
        $candidates = [
            $f, strtolower($f), strtoupper($f),
            str_replace('_', '', $f), str_replace('-', '_', $f)
        ];
        foreach ($candidates as $c) {
            $v = trim((string)$node->{ $c});
            if ($v !== '') {
                $val = $v;
                break 2;
            }
        }
    }
    return $val ?? '';
}

// ================================
//  XML'den ürün verisini çıkar
// ================================
function extractProduct($xml)
{
    return [
        'name' => mapField($xml, ['name', 'Urun_Adi', 'urun_adi', 'UrunAdi', 'title', 'baslik', 'Baslik', 'ad', 'Ad']),
        'brand' => strtoupper(mapField($xml, ['brand', 'Marka', 'marka', 'make', 'Make'])),
        'model' => mapField($xml, ['model', 'Model', 'model_adi', 'ModelAdi']),
        'year' => mapField($xml, ['year', 'Yil', 'yil', 'Year', 'yillar']),
        'price' => mapField($xml, ['price', 'Fiyat', 'fiyat', 'Price', 'satis_fiyati', 'SatisFiyati']),
        'stock' => mapField($xml, ['stock', 'Stok', 'stok', 'quantity', 'Quantity', 'miktar', 'Miktar']),
        'description' => mapField($xml, ['description', 'Aciklama', 'aciklama', 'Description', 'tanim', 'Tanim', 'ozet']),
        'category' => mapField($xml, ['category', 'Kategori', 'kategori', 'Category', 'tip', 'Tip', 'grup']),
        'partNumber' => mapField($xml, ['partNumber', 'part_number', 'PartNumber', 'Parca_No', 'parca_no', 'ParcaNo', 'oem', 'OEM', 'kod', 'Kod', 'sku', 'SKU']),
        'imageUrl' => mapField($xml, ['imageUrl', 'image_url', 'ImageUrl', 'Gorsel', 'gorsel', 'Resim', 'resim', 'foto', 'Foto', 'image', 'Image']),
        'imageUrl1' => mapField($xml, ['imageUrl1', 'image_url1', 'ImageUrl1', 'Gorsel2', 'gorsel2', 'Resim2']),
        'imageUrl2' => mapField($xml, ['imageUrl2', 'image_url2', 'ImageUrl2', 'Gorsel3', 'gorsel3', 'Resim3']),
        'trendyolUrl' => mapField($xml, ['trendyolUrl', 'trendyol_url', 'TrendyolUrl', 'trendyol', 'Trendyol']),
    ];
}

// ================================
//  XML'deki ürün etiketini bul
// ================================
function detectProductTag($filePath)
{
    $candidates = ['product', 'Product', 'urun', 'Urun', 'item', 'Item', 'row', 'Row', 'kayit', 'Kayit'];
    $reader = new XMLReader();
    if (!$reader->open($filePath))
        return 'product';
    $found = 'product';
    $count = 0;
    while ($reader->read() && $count < 200) {
        if ($reader->nodeType === XMLReader::ELEMENT) {
            $name = $reader->localName;
            if (in_array($name, $candidates)) {
                $found = $name;
                break;
            }
            $count++;
        }
    }
    $reader->close();
    return $found;
}

// ================================
//  Durum dosyası yardımcıları
// ================================
function stateFile($dir, $fileId)
{
    return $dir . $fileId . '.state.json';
}
function readState($dir, $fileId)
{
    $sf = stateFile($dir, $fileId);
    if (!file_exists($sf))
        return null;
    return json_decode(file_get_contents($sf), true);
}
function writeState($dir, $fileId, $data)
{
    file_put_contents(stateFile($dir, $fileId), json_encode($data));
}

// ================================
//  ACTION: upload
// ================================
$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'upload') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'POST gerekli']);
        exit;
    }

    if (!isset($_FILES['xml']) || $_FILES['xml']['error'] !== UPLOAD_ERR_OK) {
        $uploadErrors = [
            UPLOAD_ERR_INI_SIZE => 'Dosya php.ini limitini aşıyor',
            UPLOAD_ERR_FORM_SIZE => 'Dosya form limitini aşıyor',
            UPLOAD_ERR_PARTIAL => 'Dosya kısmen yüklendi',
            UPLOAD_ERR_NO_FILE => 'Dosya seçilmedi',
            UPLOAD_ERR_NO_TMP_DIR => 'Geçici dizin bulunamadı',
            UPLOAD_ERR_CANT_WRITE => 'Dosya yazılamadı',
        ];
        $errCode = $_FILES['xml']['error'] ?? UPLOAD_ERR_NO_FILE;
        echo json_encode(['error' => $uploadErrors[$errCode] ?? 'Yükleme hatası: ' . $errCode]);
        exit;
    }

    // Güvenli dosya adı oluştur
    $fileId = uniqid('import_', true);
    $destPath = $uploadDir . $fileId . '.xml';

    if (!move_uploaded_file($_FILES['xml']['tmp_name'], $destPath)) {
        echo json_encode(['error' => 'Dosya kaydedilemedi']);
        exit;
    }

    // XML ürün etiketini algıla
    $productTag = detectProductTag($destPath);

    // Toplam ürün sayısını say (XMLReader ile hızlı tarama)
    $reader = new XMLReader();
    if (!$reader->open($destPath)) {
        echo json_encode(['error' => 'XML dosyası açılamadı']);
        exit;
    }
    $total = 0;
    while ($reader->read()) {
        if ($reader->nodeType === XMLReader::ELEMENT && $reader->localName === $productTag) {
            $total++;
        }
    }
    $reader->close();

    // Durum kaydet
    writeState($uploadDir, $fileId, [
        'fileId' => $fileId,
        'filePath' => $destPath,
        'productTag' => $productTag,
        'total' => $total,
        'processed' => 0,
        'errors' => 0,
        'batches' => ceil($total / 500),
        'done' => false,
        'startedAt' => date('Y-m-d H:i:s'),
    ]);

    echo json_encode([
        'success' => true,
        'fileId' => $fileId,
        'total' => $total,
        'batches' => ceil($total / 500),
        'productTag' => $productTag,
    ]);
    exit;
}

// ================================
//  ACTION: process
// ================================
if ($action === 'process') {
    $fileId = $_GET['file'] ?? '';
    $batchNum = max(0, intval($_GET['batch'] ?? 0));
    $batchSize = 500;

    if (empty($fileId)) {
        echo json_encode(['error' => 'file parametresi gerekli']);
        exit;
    }

    $state = readState($uploadDir, $fileId);
    if (!$state) {
        echo json_encode(['error' => 'Import oturumu bulunamadı']);
        exit;
    }
    if ($state['done']) {
        echo json_encode(['success' => true, 'done' => true, 'processed' => $state['processed'], 'total' => $state['total']]);
        exit;
    }

    $filePath = $state['filePath'];
    $productTag = $state['productTag'];
    $skipCount = $batchNum * $batchSize;

    if (!file_exists($filePath)) {
        echo json_encode(['error' => 'XML dosyası bulunamadı']);
        exit;
    }

    // XMLReader ile belirli pozisyona atla
    $reader = new XMLReader();
    if (!$reader->open($filePath)) {
        echo json_encode(['error' => 'XML dosyası açılamadı']);
        exit;
    }

    $skipped = 0;
    $batch = [];
    $readErrors = 0;

    while ($reader->read()) {
        if ($reader->nodeType !== XMLReader::ELEMENT || $reader->localName !== $productTag)
            continue;

        if ($skipped < $skipCount) {
            $skipped++;
            // Eleman içeriğini atla
            $reader->next();
            continue;
        }

        try {
            $node = new SimpleXMLElement($reader->readOuterXML());
            $pData = extractProduct($node);

            // Boş isim varsa atla
            if (empty(trim($pData['name']))) {
                $reader->next();
                continue;
            }

            $batch[] = $pData;
        }
        catch (Exception $e) {
            $readErrors++;
        }

        if (count($batch) >= $batchSize)
            break;
        $reader->next();
    }
    $reader->close();

    // Batch INSERT (çok satırlı, çok hızlı)
    $inserted = 0;
    if (!empty($batch)) {
        // Değerleri gruplar halinde ekle (50'şerli)
        $chunkSize = 50;
        $chunks = array_chunk($batch, $chunkSize);

        foreach ($chunks as $chunk) {
            $placeholders = [];
            $values = [];
            $types = '';

            foreach ($chunk as $p) {
                $placeholders[] = '(?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?,?)';
                $name = substr((string)$p['name'], 0, 255);
                $brand = strtoupper(substr((string)$p['brand'], 0, 100));
                $model = substr((string)$p['model'], 0, 100);
                $year = substr((string)$p['year'], 0, 20);
                $price = floatval(str_replace(',', '.', preg_replace('/[^0-9.,]/', '', $p['price'])));
                $stock = intval($p['stock']) ?: 0;
                $desc = substr((string)$p['description'], 0, 10000);
                $cat = substr((string)$p['category'], 0, 100);
                $partNum = substr((string)$p['partNumber'], 0, 100);
                $imgUrl = substr((string)$p['imageUrl'], 0, 500);
                $imgUrl1 = substr((string)$p['imageUrl1'], 0, 500);
                $imgUrl2 = substr((string)$p['imageUrl2'], 0, 500);
                $trendyol = substr((string)$p['trendyolUrl'], 0, 500);
                $isWeekly = 0;
                $slugBrand = slugify($brand);
                $slugName = slugify($name);

                array_push($values, $name, $brand, $model, $year, $price, $stock, $desc, $cat, $partNum, $imgUrl, $imgUrl1, $imgUrl2, $trendyol, $isWeekly, $slugBrand, $slugName);
                $types .= 'ssssdisssssssiss';
            }

            $sql = "INSERT INTO products (name,brand,model,year,price,stock,description,category,partNumber,imageUrl,imageUrl1,imageUrl2,trendyolUrl,createdAt,is_weekly_deal,slug_brand,slug_name) VALUES " . implode(',', $placeholders);
            $stmt = $conn->prepare($sql);
            if ($stmt) {
                $stmt->bind_param($types, ...$values);
                if ($stmt->execute()) {
                    $inserted += $stmt->affected_rows;
                }
                $stmt->close();
            }
        }
    }

    // Durum güncelle
    $newProcessed = $state['processed'] + count($batch);
    $isDone = ($newProcessed >= $state['total']) || empty($batch);

    $state['processed'] = $newProcessed;
    $state['errors'] += $readErrors;
    $state['done'] = $isDone;
    writeState($uploadDir, $fileId, $state);

    echo json_encode([
        'success' => true,
        'done' => $isDone,
        'batch' => $batchNum,
        'processed' => $newProcessed,
        'total' => $state['total'],
        'inserted' => $inserted,
        'errors' => $readErrors,
        'percent' => $state['total'] > 0 ? round(($newProcessed / $state['total']) * 100, 1) : 100,
    ]);
    exit;
}

// ================================
//  ACTION: status
// ================================
if ($action === 'status') {
    $fileId = $_GET['file'] ?? '';
    if (empty($fileId)) {
        echo json_encode(['error' => 'file parametresi gerekli']);
        exit;
    }
    $state = readState($uploadDir, $fileId);
    if (!$state) {
        echo json_encode(['error' => 'Import oturumu bulunamadı']);
        exit;
    }
    echo json_encode($state);
    exit;
}

// ================================
//  Bilinmeyen eylem
// ================================
echo json_encode(['error' => 'Geçersiz action. Kullanım: upload, process, status']);
exit;
