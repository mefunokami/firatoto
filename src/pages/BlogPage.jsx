import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
// import Header from '../components/Header';
// import Footer from '../components/Footer';

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

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/blog.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        } else {
          setBlogs([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setBlogs([]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Blog | Fırat Oto Yedek Parça</title>
        <meta name="description" content="Fırat Oto Yedek Parça blog yazıları, otomotiv sektörü ve yedek parça hakkında güncel bilgiler." />
        <meta name="keywords" content="blog, firat oto, otomotiv, yedek parça, güncel haberler" />
        <meta property="og:title" content="Blog | Fırat Oto Yedek Parça" />
        <meta property="og:description" content="Fırat Oto Yedek Parça blog yazıları, otomotiv sektörü ve yedek parça hakkında güncel bilgiler." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://firatotoyedekparca.com/blog" />
        <meta property="og:image" content="https://firatotoyedekparca.com/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | Fırat Oto Yedek Parça" />
        <meta name="twitter:description" content="Fırat Oto Yedek Parça blog yazıları, otomotiv sektörü ve yedek parça hakkında güncel bilgiler." />
        <meta name="twitter:image" content="https://firatotoyedekparca.com/logo.png" />
        <link rel="canonical" href="https://firatotoyedekparca.com/blog" />
      </Helmet>
      {/* <Header /> */}
      <div className="max-w-5xl mx-auto py-10 px-2 md:px-4">
        {/* Öne Çıkanlar Kutusu */}
        {blogs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-center text-yellow-700">Araç Marka Rehberleri</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {blogs.slice(0, 4).map(blog => (
                <div key={blog.id} className="bg-white rounded-xl shadow border p-2 flex flex-col items-center hover:shadow-lg transition cursor-pointer" onClick={() => navigate(`/blog/${blog.slug ? blog.slug : slugify(blog.title)}`)}>
                  {blog.image_url && <img src={blog.image_url} alt={blog.title} className="w-full h-24 object-cover rounded mb-2" />}
                  <div className="font-semibold text-base text-gray-900 text-center line-clamp-2 mb-1">{blog.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Blog Yazıları</h1>
          <div className="w-16 h-1 bg-yellow-500 rounded mx-auto mb-2"></div>
          <p className="text-gray-600 text-base">Otomotiv, yedek parça ve güncel haberler hakkında yazılarımızı burada bulabilirsiniz.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <div className="col-span-full text-gray-400">Yükleniyor...</div>}
          {!loading && blogs.length === 0 && <div className="col-span-full text-gray-400">Henüz blog yazısı yok.</div>}
          {blogs.map((blog, idx) => (
            <div key={blog.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col overflow-hidden h-full">
              {blog.image_url && (
                <img src={blog.image_url} alt="Blog görseli" className="w-full h-48 object-cover" />
              )}
              <div className="flex-1 flex flex-col p-5">
                <div className="text-xs text-gray-500 mb-1">{new Date(blog.created_at).toLocaleDateString('tr-TR')}</div>
                <div className="font-bold text-lg mb-2 text-gray-900">{blog.title}</div>
                {openIndex === idx ? (
                  <>
                    <div className="text-gray-700 whitespace-pre-line mb-4 text-base">{blog.content}</div>
                    <button onClick={() => setOpenIndex(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition">Kapat</button>
                  </>
                ) : (
                  <>
                    <div className="text-gray-700 whitespace-pre-line mb-4 text-base line-clamp-4">{blog.content.length > 250 ? blog.content.slice(0, 250) + '...' : blog.content}</div>
                    {blog.content.length > 250 && (
                      <button onClick={() => navigate(`/blog/${blog.slug ? blog.slug : slugify(blog.title)}`)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded transition">Daha Fazla Görüntüle</button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'none'}}>
          BMW yedek parça, Mercedes yedek parça, Volkswagen yedek parça, Audi yedek parça, Skoda yedek parça, Seat yedek parça, Mini Cooper parça, orijinal yedek parça, çıkma parça, motor parçası, oto elektrik, oto mekanik, uygun fiyatlı yedek parça.
          Adana, Ankara, İstanbul, İzmir, Bursa, Antalya, Konya, Gaziantep, Mersin, Kayseri, Diyarbakır, Samsun, Eskişehir, Denizli, Şanlıurfa, Kocaeli, Trabzon, Sakarya, Malatya, Erzurum, Hatay, Balıkesir, Aydın, Manisa, Tekirdağ, Afyon, Van, Ordu, Batman, Elazığ, Çorum, Sivas, Isparta, Muğla, Uşak, Kütahya, Kırşehir, Osmaniye, Adıyaman, Tokat, Rize, Karabük, Giresun, Yozgat, Kars, Siirt, Bitlis, Bilecik, Düzce, Artvin, Nevşehir, Zonguldak, Niğde, Ağrı, Kilis, Tunceli, Bartın, Hakkari, Bayburt, Ardahan, Iğdır, Karaman, Aksaray, Çankırı, Kırıkkale, Bolu, Bingöl, Muş, Gümüşhane, Edirne.
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default BlogPage; 