<?php
// Güvenli CORS
$allowed_origins = ['https://www.firatotoyedekparca.com', 'https://localhost:5173'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
header('Content-Type: application/json');

require_once 'db.php';
session_start();
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// GET: SSS listele (herkes erişebilir)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM faq ORDER BY faq_order ASC, created_at ASC');
    echo json_encode(['success' => true, 'faqs' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

// Sadece admin erişebilir (POST, PUT, DELETE)
if (!isset($_SESSION['user_id']) || !isset($_SESSION['admin']) || $_SESSION['admin'] != 1) {
    http_response_code(403);
    echo json_encode(['error' => 'Yetkisiz erişim.']);
    exit;
}

// POST: SSS ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $question = trim($data['question'] ?? '');
    $answer = trim($data['answer'] ?? '');
    $faq_order = intval($data['faq_order'] ?? 0);
    if (!$question || !$answer) {
        http_response_code(400);
        echo json_encode(['error' => 'Soru ve cevap zorunlu.']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO faq (question, answer, faq_order) VALUES (?, ?, ?)');
    $ok = $stmt->execute([$question, $answer, $faq_order]);
    if ($ok) {
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'SSS eklenemedi.']);
    }
    exit;
}

// PUT: SSS güncelle
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    $question = trim($data['question'] ?? '');
    $answer = trim($data['answer'] ?? '');
    $faq_order = intval($data['faq_order'] ?? 0);
    if (!$id || !$question || !$answer) {
        http_response_code(400);
        echo json_encode(['error' => 'ID, soru ve cevap zorunlu.']);
        exit;
    }
    $stmt = $pdo->prepare('UPDATE faq SET question=?, answer=?, faq_order=? WHERE id=?');
    $ok = $stmt->execute([$question, $answer, $faq_order, $id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'SSS güncellenemedi.']);
    }
    exit;
}

// DELETE: SSS sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID zorunlu.']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM faq WHERE id=?');
    $ok = $stmt->execute([$id]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'SSS silinemedi.']);
    }
    exit;
} 