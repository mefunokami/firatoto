# Fırat Oto Yedek Parça

## Proje Hakkında
Modern ve hızlı bir e-ticaret platformu. React, Vite ve PHP backend ile geliştirilmiştir.

## Kullanılan Teknolojiler
- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS
- **Backend:** PHP (REST API)
- **UI Components:** Radix UI
- **State Management:** React Context API

## Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- PHP 7.4 veya üzeri
- MySQL/MariaDB

### Adımlar

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Veritabanı ayarlarını yapın:
```bash
# api/db.php.example dosyasını api/db.php olarak kopyalayın
# Veritabanı bilgilerinizi girin
```

3. Veritabanını oluşturun:
```bash
# api/database.sql dosyasını MySQL'de çalıştırın
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Production build:
```bash
npm run build
```

## Proje Yapısı
```
├── api/                 # PHP backend API
├── src/                 # React kaynak kodları
│   ├── components/      # React bileşenleri
│   ├── pages/          # Sayfa bileşenleri
│   └── lib/            # Yardımcı fonksiyonlar
├── public/             # Statik dosyalar
└── dist/               # Build çıktıları
```

## Özellikler
- Ürün yönetimi
- Sepet işlemleri
- Kullanıcı yönetimi
- Sipariş takibi
- Admin paneli
- Blog sistemi
- SEO optimizasyonu

## Lisans
Private - Tüm hakları saklıdır.
