<?php
// Şifremi unuttum: E-posta ile sıfırlama linki gönderir
header('Content-Type: application/json');
require_once 'db.php';
// PHPMailer elle include
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';
require_once __DIR__ . '/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'E-posta zorunlu.']);
    exit;
}
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    // Güvenlik için her zaman başarılı dön
    echo json_encode(['success' => true]);
    exit;
}
$token = bin2hex(random_bytes(32));
$expiry = date('Y-m-d H:i:s', time() + 60*60); // 1 saat geçerli
$pdo->prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?')
    ->execute([$token, $expiry, $user['id']]);
$link = 'https://www.firatotoyedekparca.com/reset-password?token=' . $token;
$subject = 'Şifre Sıfırlama';
$message = "Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:<br><a href='$link'>$link</a><br>Bu link 1 saat geçerlidir.";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'bilgi@firatotoyedekparca.com';
    $mail->Password = 'aggXtR?4Z0;';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom('bilgi@firatotoyedekparca.com', 'Fırat Oto Yedek Parça');
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $message;
    $mail->send();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Mail gönderilemedi: ' . $mail->ErrorInfo]);
} 