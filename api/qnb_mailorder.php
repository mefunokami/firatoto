<?php
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

// Gerekli alanları kontrol et
$cardName = $data['name'] ?? '';
$cardNumber = $data['number'] ?? '';
$cardMonth = $data['month'] ?? '';
$cardYear = $data['year'] ?? '';
$cardCVV = $data['cvv'] ?? '';
$amount = 100.00; // Sepet toplamı (backend'den alınmalı!)

if (!$cardName || !$cardNumber || !$cardMonth || !$cardYear || !$cardCVV) {
    echo json_encode(['error' => 'Tüm alanlar zorunlu']);
    exit;
}

require_once 'db.php';
session_start();
$user_id = $_SESSION['user_id'] ?? null;

// Ek sipariş verileri
$address_id = $data['address_id'] ?? null;
$cart_json = $data['cart_json'] ?? null;
$total = $data['total'] ?? null;
$note = $data['note'] ?? '';
$payment_type = 'card';

// QNB API endpoint ve authentication bilgileri (örnek, banka ile güncellenecek)
$apiUrl = 'https://api.qnbfinansbank.com/mailorder'; // Gerçek endpointi bankadan alın!
$apiUser = 'API_KULLANICI_ADI';
$apiPass = 'API_SIFRE';

// QNB API’ye istek gönder
$postData = [
    'cardHolderName' => $cardName,
    'cardNumber' => $cardNumber,
    'expireMonth' => $cardMonth,
    'expireYear' => $cardYear,
    'cvv' => $cardCVV,
    'amount' => $amount,
    // Diğer gerekli alanlar...
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n" .
                     "Authorization: Basic " . base64_encode("$apiUser:$apiPass") . "\r\n",
        'method'  => 'POST',
        'content' => json_encode($postData),
        'timeout' => 30
    ]
];
$context  = stream_context_create($options);
$result = @file_get_contents($apiUrl, false, $context);

if ($result === FALSE) {
    echo json_encode(['error' => 'Banka bağlantı hatası']);
    exit;
}

$response = json_decode($result, true);
if ($response['status'] === 'success') {
    // Siparişi kaydet
    if ($user_id && $address_id && $cart_json && $total) {
        $stmt = $pdo->prepare('INSERT INTO orders (user_id, address_id, cart_json, total, status, payment_type, note) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$user_id, $address_id, $cart_json, $total, 'paid', $payment_type, $note]);
    }
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['error' => $response['errorMessage'] ?? 'Ödeme reddedildi']);
} 