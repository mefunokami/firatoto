import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Key Middleware (Güvenlik için)
const requireApiKey = (req, res, next) => {
  // GET isteklerine (listeleme) izin verebiliriz veya hepsini kapatabiliriz.
  // Şu anlık veri değiştirme işlemleri (POST, PUT, DELETE) için API Key zorunlu kılıyoruz.
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const validApiKey = process.env.API_KEY || 'gizli-sifrem-12345'; // .env dosyasından okur veya varsayılanı kullanır

    if (!apiKey || apiKey !== validApiKey) {
      return res.status(401).json({ error: 'Yetkisiz erişim: API Anahtarı eksik veya geçersiz.' });
    }
  }
  next();
};

app.use(requireApiKey);

// MySQL bağlantısı
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ürünleri listele
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Ürün ekle
app.post('/api/products', async (req, res) => {
  const { name, brand, model, year, price, stock, description, category, partNumber, imageUrl, trendyolUrl } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO products (name, brand, model, year, price, stock, description, category, partNumber, imageUrl, trendyolUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, brand, model, year, price, stock, description, category, partNumber, imageUrl, trendyolUrl]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Ürün eklenemedi' });
  }
});

// Ürün sil
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ürün silinemedi' });
  }
});

// Ürün güncelle
app.put('/api/products/:id', async (req, res) => {
  const { name, brand, model, year, price, stock, description, category, partNumber, imageUrl, trendyolUrl } = req.body;
  try {
    await pool.query(
      `UPDATE products SET name=?, brand=?, model=?, year=?, price=?, stock=?, description=?, category=?, partNumber=?, imageUrl=?, trendyolUrl=? WHERE id=?`,
      [name, brand, model, year, price, stock, description, category, partNumber, imageUrl, trendyolUrl, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ürün güncellenemedi' });
  }
});

// Belirli bir markanın modellerini getir
app.get('/api/brand-models', async (req, res) => {
  const { brand } = req.query;
  if (!brand) return res.status(400).json({ error: 'Marka belirtilmeli' });
  try {
    const [rows] = await pool.query('SELECT * FROM brand_models WHERE brand = ?', [brand]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Yeni model ekle
app.post('/api/brand-models', async (req, res) => {
  const { brand, model } = req.body;
  if (!brand || !model) return res.status(400).json({ error: 'Marka ve model zorunlu' });
  try {
    const [result] = await pool.query('INSERT INTO brand_models (brand, model) VALUES (?, ?)', [brand, model]);
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Model eklenemedi' });
  }
});

// Model sil
app.delete('/api/brand-models/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM brand_models WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Model silinemedi' });
  }
});

app.listen(port, () => {
  console.log(`API sunucusu https://localhost:${port} adresinde çalışıyor.`);
}); 