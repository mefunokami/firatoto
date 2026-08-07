import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

function slugify(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const POPULAR_BRANDS = [
  'BMW', 'MERCEDES', 'VOLKSWAGEN', 'AUDİ', 'TESLA', 'SEAT', 'SKODA', 'PEUGEOT', 'CİTROEN', 'FORD', 'OPEL', 'CHEVROLET'
];

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBlogs, setAllBlogs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/blog.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.blogs)) {
          setAllBlogs(data.blogs);
          const found = data.blogs.find(b => (b.slug ? b.slug : slugify(b.title)) === slug);
          setBlog(found || null);
        } else {
          setBlog(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setBlog(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>;
  if (!blog) return <div className="text-center py-20 text-red-600 font-bold text-xl">Blog yazısı bulunamadı.</div>;

  // Marka tespiti (başlıkta geçen popüler markalardan biri)
  const detectedBrand = POPULAR_BRANDS.find(brand =>
    blog.title.toUpperCase().includes(brand) || (blog.content && blog.content.toUpperCase().includes(brand))
  );

  // Benzer bloglar (aynı markadan veya başlık benzerliği)
  const similarBlogs = allBlogs
    .filter(b => b.id !== blog.id && (
      (detectedBrand && (b.title.toUpperCase().includes(detectedBrand) || (b.content && b.content.toUpperCase().includes(detectedBrand)))) ||
      b.title.split(' ').some(word => blog.title.split(' ').includes(word))
    ))
    .slice(0, 3);

  // WhatsApp mesajı için hazır metin
  const whatsappMsg = encodeURIComponent(`Merhaba, bu blog yazısı hakkında bilgi almak istiyorum: ${window.location.href}`);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Helmet>
        <title>{blog.title} | Blog | Fırat Oto Yedek Parça</title>
        <meta name="description" content={blog.content.slice(0, 160)} />
      </Helmet>
      {/* Kategoriye dönüş */}
      <button onClick={() => navigate('/blog')} className="mb-6 text-gray-600 dark:text-gray-400 hover:text-yellow-500 font-semibold flex items-center gap-2">
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        Tüm Bloglar
      </button>
      {blog.image_url && (
        <img src={blog.image_url} alt={blog.title} className="w-full h-64 object-cover rounded-2xl mb-6" />
      )}
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{new Date(blog.created_at).toLocaleDateString('tr-TR')}</div>
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-foreground">{blog.title}</h1>
      <div className="text-gray-800 dark:text-gray-200 whitespace-pre-line text-lg leading-8 mb-6">{blog.content}</div>
      {/* WhatsApp'a yönlendirme ve ilgili ürünler butonu */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a
          href={`https://wa.me/905439740121?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded shadow flex items-center gap-2"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#25D366"/><path d="M16.71 15.29l-2.54-.73a1 1 0 00-.95.26l-.45.46a7.07 7.07 0 01-3.32-3.32l.46-.45a1 1 0 00.26-.95l-.73-2.54A1 1 0 008.1 7H6.5A1.5 1.5 0 005 8.5 10.5 10.5 0 0015.5 19a1.5 1.5 0 001.5-1.5v-1.6a1 1 0 00-.29-.71z" fill="#fff"/></svg>
          WhatsApp'tan Sor
        </a>
        {detectedBrand && (
          <button
            onClick={() => navigate(`/brand-category?brand=${encodeURIComponent(detectedBrand)}`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded shadow flex items-center gap-2"
          >
            İlgili {detectedBrand} Ürünleri
          </button>
        )}
      </div>
      {/* Benzer bloglar kutusu */}
      {similarBlogs.length > 0 && (
        <div className="bg-gray-50 dark:bg-background border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="font-bold text-lg mb-2 text-gray-900 dark:text-foreground">Benzer Bloglar</div>
          <div className="flex flex-col gap-2">
            {similarBlogs.map(b => (
              <button
                key={b.id}
                onClick={() => navigate(`/blog/${b.slug ? b.slug : slugify(b.title)}`)}
                className="flex items-center gap-3 p-2 rounded hover:bg-yellow-50 transition text-left"
              >
                {b.image_url && <img src={b.image_url} alt={b.title} className="w-16 h-12 object-cover rounded" />}
                <span className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">{b.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 