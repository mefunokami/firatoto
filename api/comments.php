<?php
header('Content-Type: application/json');
require_once 'db.php';

// Yorum ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_id = intval($data['product_id'] ?? 0);
    $user_id = intval($data['user_id'] ?? 0);
    $user_name = trim($data['user_name'] ?? '');
    $user_surname = trim($data['user_surname'] ?? '');
    $rating = intval($data['rating'] ?? 0);
    $comment = trim($data['comment'] ?? '');
    if (!$product_id || !$user_id || !$user_name || !$user_surname || !$rating || !$comment) {
        http_response_code(400);
        echo json_encode(['error' => 'Eksik bilgi']);
        exit;
    }
    $stmt = $pdo->prepare('INSERT INTO comments (product_id, user_id, user_name, user_surname, rating, comment) VALUES (?, ?, ?, ?, ?, ?)');
    $ok = $stmt->execute([$product_id, $user_id, $user_name, $user_surname, $rating, $comment]);
    if ($ok) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Yorum eklenemedi']);
    }
    exit;
}

// Ürüne ait yorumları listele
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['product_id'])) {
    $product_id = intval($_GET['product_id']);
    $stmt = $pdo->prepare('SELECT user_name, user_surname, rating, comment, created_at FROM comments WHERE product_id = ? ORDER BY created_at DESC');
    $stmt->execute([$product_id]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['comments' => $comments]);
    exit;
}

// Yorum sil
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $product_id = intval($data['product_id'] ?? 0);
    $user_id = intval($data['user_id'] ?? 0);
    $created_at = $data['created_at'] ?? '';
    if (!$product_id || !$user_id || !$created_at) {
        http_response_code(400);
        echo json_encode(['error' => 'Eksik bilgi']);
        exit;
    }
    $stmt = $pdo->prepare('DELETE FROM comments WHERE product_id = ? AND user_id = ? AND created_at = ?');
    $ok = $stmt->execute([$product_id, $user_id, $created_at]);
    if ($ok && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(403);
        echo json_encode(['error' => 'Yorum silinemedi veya yetkiniz yok']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Geçersiz istek']); 