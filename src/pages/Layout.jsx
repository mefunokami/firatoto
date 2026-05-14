import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Footer from '@/components/Footer';
import BrandMenu from '@/components/BrandMenu';
import UserLoginPage from '@/pages/UserLoginPage';
import Header from '@/components/Header';
import { toast } from '@/components/ui/use-toast';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const Layout = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const popularProductsRef = useRef(null);
  const [brandModelFilter, setBrandModelFilter] = useState({ brand: '', model: '' });
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(() => {
    // Sayfa yenilendiğinde sessionStorage'dan user bilgisini al
    let stored = sessionStorage.getItem('user');
    if (!stored && localStorage.getItem('user')) {
      // Beni Hatırla ile localStorage'dan kopyala
      sessionStorage.setItem('user', localStorage.getItem('user'));
      sessionStorage.setItem('is-authenticated', localStorage.getItem('is-authenticated'));
      stored = localStorage.getItem('user');
    }
    return stored ? JSON.parse(stored) : null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loginOpen) { // Modal kapandıysa
      const stored = sessionStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    }
    // Login popup tetikleme event listener
    const handler = () => setLoginOpen(true);
    window.addEventListener('open-login-popup', handler);
    return () => window.removeEventListener('open-login-popup', handler);
  }, [loginOpen]);

  const handleSearch = () => {
    if (location.pathname !== '/') {
      navigate('/');
      // navigate sonrası HomePage mount olunca searchTerm propunu kullanacak
    }
    setTimeout(() => {
      popularProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBrandModelSelect = (brand, model) => {
    setBrandModelFilter({ brand, model });
    if (brand && model) {
      setTimeout(() => {
        navigate(`/brand-category?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`);
      }, 0);
    }
    setTimeout(() => {
      popularProductsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('is-authenticated');
    sessionStorage.removeItem('user');
    localStorage.removeItem('is-authenticated');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: '',
      description: 'Başarıyla çıkış yapıldı.',
      duration: 5000,
      // Sağ alt için varsayılan viewport kullanılıyor
    });
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        onLoginClick={() => setLoginOpen(true)} 
        user={user} 
        setUser={setUser} 
        onLogout={handleLogout}
      />
      <div className="hidden md:block">
        <BrandMenu onBrandModelSelect={handleBrandModelSelect} />
      </div>
      <main className="flex-grow">
        <div style={{display:'none'}}>
          BMW yedek parça, Mercedes yedek parça, Audi yedek parça, Volkswagen yedek parça, VW yedek parça, orijinal yedek parça, Alman araç yedek parça, OEM yedek parça, online yedek parça, Adana BMW yedek parça, Adana Mercedes yedek parça, Adana Audi yedek parça, Adana VW yedek parça, Adana Volkswagen yedek parça, Seyhan BMW parça, Çukurova Mercedes parça, Adana Alman oto parça, Adana oto yedek parça, BMW turbo hortumu, intercooler, triger seti, yağ filtresi, hava filtresi, far, stop lambası, z rot, rotil, rot, fren balatası, fren diski, amortisör, buji, bobin, kaput amortisörü, şanzıman kulağı, salıncak, sinyal, radyatör, karbüratör, yakıt pompası, manifold, motor kaputu, bagaj kapağı, çamurluk, tampon, m tampon, ızgara, spoiler, karter, piston, braket, sis farı, sis far çerçevesi, çeki kapağı, park sensörü, panjur, Seat yedek parça, Skoda yedek parça, Mini Cooper parça, Opel yedek parça, Ford yedek parça, Peugeot yedek parça, Citroen yedek parça, çıkma parça, motor parçası, oto elektrik, oto mekanik, uygun fiyatlı yedek parça.
          Adana, Ankara, İstanbul, İzmir, Bursa, Antalya, Konya, Gaziantep, Mersin, Kayseri, Diyarbakır, Samsun, Eskişehir, Denizli, Şanlıurfa, Kocaeli, Trabzon, Sakarya, Malatya, Erzurum, Hatay, Balıkesir, Aydın, Manisa, Tekirdağ, Afyon, Van, Ordu, Batman, Elazığ, Çorum, Sivas, Isparta, Muğla, Uşak, Kütahya, Kırşehir, Osmaniye, Adıyaman, Tokat, Rize, Karabük, Giresun, Yozgat, Kars, Siirt, Bitlis, Bilecik, Düzce, Artvin, Nevşehir, Zonguldak, Niğde, Ağrı, Kilis, Tunceli, Bartın, Hakkari, Bayburt, Ardahan, Iğdır, Karaman, Aksaray, Çankırı, Kırıkkale, Bolu, Bingöl, Muş, Gümüşhane, Edirne.
        </div>
        <Outlet context={{ searchTerm, setSearchTerm, popularProductsRef, brandModelFilter, handleBrandModelSelect }} />
      </main>
      <FloatingWhatsApp />
      <Footer />
      <UserLoginPage open={loginOpen} setOpen={setLoginOpen} setUser={setUser} />
    </div>
  );
};

export default Layout;