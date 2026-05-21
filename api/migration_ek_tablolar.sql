-- ============================================================
-- Fırat Oto Yedek Parça — Ek tablolar (migration)
-- phpMyAdmin veya MySQL konsolunda firatoto veritabanında çalıştırın.
-- Güvenli: CREATE TABLE IF NOT EXISTS (var olan tabloyu silmez)
-- ============================================================

USE firatoto;

-- Anasayfa hero slider (yönetim paneli: /admin/sliders)
-- Zaten varsa atlanır.
CREATE TABLE IF NOT EXISTS homepage_sliders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(500) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  link VARCHAR(500),
  slider_order INT DEFAULT 0
);

-- Anasayfa "Gönderilen Kargolar" bölümü (yönetim paneli: /admin/shipped-cargos)
CREATE TABLE IF NOT EXISTS shipped_cargos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(1000) NOT NULL,
  title VARCHAR(255),
  display_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- İsteğe bağlı: örnek kargo kaydı (test için — kullanmayacaksanız silin)
-- INSERT INTO shipped_cargos (image_url, title, display_order)
-- VALUES ('/uploads/ornek-kargo.jpg', 'Örnek kargo', 0);
