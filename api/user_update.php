<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Giriş yapmalısınız.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$first_name = trim($data['first_name'] ?? '');
$last_name = trim($data['last_name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$user_id = $_SESSION['user_id'];

if (!$first_name || !$last_name || !$email || !$phone) {
    http_response_code(400);
    echo json_encode(['error' => 'Tüm alanlar zorunludur.']);
    exit;
}

// Email başka kullanıcıya ait mi kontrol et
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
$stmt->execute([$email, $user_id]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['error' => 'Bu email başka bir kullanıcıya ait.']);
    exit;
}

$stmt = $pdo->prepare('UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE id = ?');
$ok = $stmt->execute([$first_name, $last_name, $email, $phone, $user_id]);

$new_password = $data['new_password'] ?? null;
$new_password2 = $data['new_password2'] ?? null;
$old_password = $data['old_password'] ?? null;

// Şifre güncelleme isteniyorsa
if ($old_password || $new_password || $new_password2) {
    if (!$old_password || !$new_password || !$new_password2) {
        http_response_code(400);
        echo json_encode(['error' => 'Şifre değiştirmek için tüm şifre alanlarını doldurun.']);
        exit;
    }
    // Kullanıcının mevcut şifresini çek
    $stmt = $pdo->prepare('SELECT password FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || !password_verify($old_password, $row['password'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Eski şifre yanlış.']);
        exit;
    }
    if ($new_password !== $new_password2) {
        http_response_code(400);
        echo json_encode(['error' => 'Yeni şifreler eşleşmiyor.']);
        exit;
    }
    if (strlen($new_password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Yeni şifre en az 6 karakter olmalı.']);
        exit;
    }
    $hash = password_hash($new_password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$hash, $user_id]);
}

if ($ok) {
    // Güncellenmiş kullanıcıyı tekrar çek
    $stmt = $pdo->prepare('SELECT id, first_name, last_name, email, phone, admin FROM users WHERE id = ?');
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $_SESSION['user_email'] = $user['email'];
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Güncelleme başarısız.']);
} 