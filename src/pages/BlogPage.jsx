import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight, Clock, BookOpen } from 'lucide-react';
// import Header from '../components/Header';

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
      <div className="bg-gray-50 dark:bg-background min-h-screen pb-20">
        {/* Hero Section */}
        <div className="bg-[#18181b] relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10"></div>
            <div className="w-full h-full opacity-10" style={{ backgroundImage: 'linear-gradient(#374151 1px, transparent 1px), linear-gradient(90deg, #374151 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-yellow-500 font-semibold text-sm mb-6">
                <BookOpen className="w-4 h-4" />
                <span>Fırat Oto Blog</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
                Otomotiv <span className="text-[#ffc107]">Rehberiniz</span>
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                Otomotiv sektörü, yedek parça seçim rehberleri, bakım ipuçları ve güncel haberleri uzman ekibimizin kaleminden okuyun.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-30">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-card rounded-2xl shadow-xl">
              <div className="w-12 h-12 border-4 border-yellow-200 border-t-[#ffc107] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Yazılar Yükleniyor...</p>
            </div>
          )}

          {!loading && blogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-card rounded-2xl shadow-xl border border-gray-100 dark:border-border">
              <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-2">Henüz Yazı Yok</h3>
              <p className="text-gray-500 dark:text-gray-400">Yakında yepyeni içeriklerle karşınızda olacağız.</p>
            </div>
          )}

          {!loading && blogs.length > 0 && (
            <div className="space-y-12">
              {/* Featured Blog (First Item) */}
              <div 
                onClick={() => navigate(`/blog/${blogs[0].slug ? blogs[0].slug : slugify(blogs[0].title)}`)}
                className="bg-white dark:bg-card rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-border overflow-hidden flex flex-col lg:flex-row group cursor-pointer hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300"
              >
                <div className="lg:w-1/2 relative overflow-hidden h-64 lg:h-auto">
                  {blogs[0].image_url ? (
                    <img src={blogs[0].image_url} alt={blogs[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-muted flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-[#ffc107] text-black text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-sm">
                    Öne Çıkan
                  </div>
                </div>
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="w-4 h-4 text-yellow-500" />
                    {new Date(blogs[0].created_at).toLocaleDateString('tr-TR')}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-foreground mb-4 group-hover:text-yellow-600 transition-colors line-clamp-2">
                    {blogs[0].title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 line-clamp-3">
                    {blogs[0].content}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-yellow-600 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                    Yazıyı Oku <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Grid for Rest of Blogs */}
              {blogs.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.slice(1).map((blog) => (
                    <div 
                      key={blog.id} 
                      onClick={() => navigate(`/blog/${blog.slug ? blog.slug : slugify(blog.title)}`)}
                      className="bg-white dark:bg-card rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 dark:border-border overflow-hidden flex flex-col group cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative h-56 overflow-hidden">
                        {blog.image_url ? (
                          <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-muted flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:p-8 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-3">
                          <Clock className="w-3.5 h-3.5 text-yellow-500" />
                          {new Date(blog.created_at).toLocaleDateString('tr-TR')}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-3 group-hover:text-yellow-600 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                          {blog.content}
                        </p>
                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-border flex items-center justify-between text-sm">
                          <span className="font-bold text-gray-900 dark:text-foreground group-hover:text-yellow-600 transition-colors">İncele</span>
                          <ArrowRight className="w-4 h-4 text-yellow-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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