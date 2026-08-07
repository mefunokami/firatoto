import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react'; // Diğer markalar ikonu için

const SABIT_MARKALAR = [
  { name: 'VOLKSWAGEN', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg' },
  { name: 'AUDİ', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg' },
  { name: 'SEAT', logo: 'https://www.google.com/s2/favicons?domain=seat.com&sz=128' },
  { name: 'SKODA', logo: 'https://www.google.com/s2/favicons?domain=skoda-auto.com&sz=128' },
  { name: 'BMW', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg', isMain: true },
  { name: 'MERCEDES-BENZ', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg', isMain: true },
  { name: 'PORSCHE', logo: 'https://www.google.com/s2/favicons?domain=porsche.com&sz=128' },
  { name: 'MİNİ COOPER', logo: 'https://www.google.com/s2/favicons?domain=mini.com&sz=128' },
  { name: 'DİĞER MARKALAR', logo: 'other' }
];

const DIGER_MARKALAR_LISTESI = [
  'TESLA', 'PEUGEOT', 'CİTROEN', 'FORD', 'OPEL', 'CHEVROLET', 'GENEL MARKALAR'
];

const BrandMenu = () => {
  const [openBrand, setOpenBrand] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  // slugify fonksiyonu
  function slugify(str) {
    return (str || "")
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ı/g, 'i')
      .replace(/ç/g, 'c')
      .replace(/ş/g, 's')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9_\-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  // Markaya tıklanınca yönlendir
  const handleBrandClick = (brand) => {
    if (brand === 'DİĞER MARKALAR') {
      if (openBrand === brand) {
        setOpenBrand(null);
        setModels([]);
      } else {
        setOpenBrand(brand);
        const digerModeller = DIGER_MARKALAR_LISTESI.map(b => ({
          id: b,
          model: b,
          isBrand: true
        }));
        setModels(digerModeller);
      }
      return;
    }

    // Diğer tüm markalar için doğrudan kategori sayfasına git
    setOpenBrand(brand); // Aktif markayı vurgulamak için
    setModels([]); // Modelleri temizle ki kutu açılmasın
    setMobileOpen(false);
    navigate(`/kategori/${getBrandSlug(brand)}/tumu`);
  };

  const getBrandSlug = (brand) => {
    const normalizedBrand = brand.trim().toUpperCase();
    if (normalizedBrand === 'MERCEDES-BENZ') return 'mercedes-benz';
    if (normalizedBrand === 'GENEL MARKALAR') return 'genel_markalar';
    return slugify(normalizedBrand);
  };

  const getBrandLabel = (brand) => {
    if (brand === 'MERCEDES-BENZ') return 'Mercedes';
    if (brand === 'VOLKSWAGEN') return 'Volkswagen';
    if (brand === 'AUDİ') return 'Audi';
    if (brand === 'GENEL MARKALAR') return 'Genel Markalar';
    if (brand === 'DİĞER MARKALAR') return 'Diğer Markalar';
    return brand.charAt(0) + brand.slice(1).toLowerCase();
  };

  const handleViewAllBrand = (brand) => {
    setOpenBrand(null);
    setModels([]);
    setMobileOpen(false);
    navigate(`/kategori/${getBrandSlug(brand)}/tumu`);
  };

  const handleModelSelect = (brand, model) => {
    if (brand && model) {
      const normalizedModel = model.trim().toUpperCase();
      setOpenBrand(null);
      setModels([]);
      setMobileOpen(false);
      navigate(`/kategori/${getBrandSlug(brand)}/${slugify(normalizedModel)}`);
    }
  };

  return (
    <nav className="w-full shadow relative z-40 bg-[linear-gradient(to_right,#ffc107_0%,#ffc107_15%,#18181b_40%,#18181b_60%,#ffc107_85%,#ffc107_100%)] max-md:bg-[#ffc107]">
      {/* Mobilde Markalar başlığı ve açılır menü */}
      <div className="md:hidden block">
        <button
          className="w-full flex justify-between items-center px-4 py-3 font-bold text-lg bg-[#ffc107] text-black border-b border-yellow-300"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span>Markalar</span>
          <svg className={`w-5 h-5 transition-transform ${mobileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
        </button>
        {mobileOpen && (
          <div className="bg-card border-b border-yellow-200">
            <div className="flex flex-col gap-1 py-2">
              {SABIT_MARKALAR.map(brandObj => (
                <button
                  key={brandObj.name}
                  className={`w-full flex items-center gap-3 px-4 py-3 font-bold uppercase transition-colors ${
                    openBrand === brandObj.name 
                      ? 'bg-black text-[#ffc107]' 
                      : brandObj.isMain 
                        ? 'bg-gray-900 text-white hover:bg-black' 
                        : 'text-black hover:bg-yellow-100'
                  }`}
                  onClick={() => handleBrandClick(brandObj.name)}
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-white dark:bg-card rounded-full p-0.5 shadow-sm">
                    {brandObj.logo === 'other' ? (
                      <LayoutGrid className="w-4 h-4 text-black" />
                    ) : (
                      <img src={brandObj.logo} alt={brandObj.name} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <span className={brandObj.isMain ? 'text-base tracking-wide text-[#ffc107]' : ''}>{brandObj.name}</span>
                </button>
              ))}
            </div>
            {openBrand === 'DİĞER MARKALAR' && models.length > 0 && (
              <div className="bg-gray-50 dark:bg-background border-t border-yellow-100 px-4 py-3 shadow-inner">
                <div className="grid grid-cols-2 gap-2">
                  {models.map(model => (
                    <button
                      key={model.id || model.model}
                      className="bg-card border border-yellow-200 rounded p-2 text-xs font-semibold hover:bg-yellow-50 shadow-sm"
                      onClick={() => {
                        handleViewAllBrand(model.model);
                      }}
                    >
                      {model.model}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Ekstra linkler - Her zaman görünür */}
        <div className="bg-card border-b border-yellow-200 flex flex-col gap-1 py-2 shadow-sm">
          <button onClick={() => { setMobileOpen(false); navigate('/blog'); }} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">Blog</button>
          <a href="/#faq" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">Sık Sorulanlar</a>
          <button onClick={() => { setMobileOpen(false); navigate('/hakkımızda'); }} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">Hakkımızda</button>
          <button onClick={() => { setMobileOpen(false); navigate('/iletisim'); }} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">İletişim</button>
        </div>
      </div>
      
      {/* Masaüstü */}
      <div className="max-w-[1400px] mx-auto px-2 py-3 hidden md:flex flex-wrap justify-center items-center gap-2 lg:gap-4 relative">
        {SABIT_MARKALAR.map(brandObj => {
          const isMain = brandObj.isMain;
          const isActive = openBrand === brandObj.name;
          
          let baseClasses = "";
          
          if (isMain) {
            // Siyah arka plan üzerine oturan Sarı VIP Kapsüller
            baseClasses = "relative flex items-center rounded-full font-extrabold uppercase transition-all duration-300 shadow-2xl pl-14 pr-5 h-11 mx-3 overflow-visible ";
            if (isActive) {
               baseClasses += "bg-white dark:bg-card text-black scale-110 z-50 ring-2 ring-white";
            } else {
               baseClasses += "bg-gradient-to-r from-[#e0a800] to-[#ffc107] text-black hover:scale-110 hover:shadow-[0_0_20px_rgba(255,193,7,0.5)] z-40 border border-[#ffc107]/50 ";
            }
          } else {
            // Sarı arka plan üzerine oturan siyah/şeffaf normal butonlar
            baseClasses = "flex items-center gap-2 rounded-full font-bold uppercase transition-all duration-300 py-1.5 px-3 text-[11px] lg:text-xs ";
            if (isActive) {
               baseClasses += "bg-black text-[#ffc107] scale-105 shadow-md";
            } else {
               baseClasses += "bg-black/80 text-white hover:bg-black hover:text-[#ffc107] hover:scale-105";
            }
          }

          return (
            <button
              key={brandObj.name}
              className={baseClasses}
              onClick={() => handleBrandClick(brandObj.name)}
            >
              {isMain ? (
                <>
                  <div className="absolute -left-6 -top-2.5 w-16 h-16 flex items-center justify-center bg-black rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.6)] border-2 border-[#ffc107] transition-transform duration-500 hover:rotate-6">
                    <img src={brandObj.logo} alt={brandObj.name} className="w-10 h-10 object-contain drop-shadow-md" />
                  </div>
                  <span className="tracking-wider ml-1">{brandObj.name}</span>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center bg-white dark:bg-card rounded-full shadow-sm shrink-0 transition-all w-5 h-5 p-1">
                    {brandObj.logo === 'other' ? (
                      <LayoutGrid className="w-3 h-3 text-black" />
                    ) : (
                      <img src={brandObj.logo} alt={brandObj.name} className="w-full h-full object-contain" />
                    )}
                  </div>
                  <span className="tracking-wide font-semibold">{brandObj.name}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Açılır Kutu (Masaüstü) - Sadece Diğer Markalar için */}
      {openBrand === 'DİĞER MARKALAR' && models.length > 0 && (
        <div className="w-full bg-card border-t border-yellow-200 shadow-xl md:block hidden absolute left-0 right-0 z-50 rounded-b-xl border-b pb-2">
          <div className="max-w-[1400px] mx-auto px-4 pt-6 pb-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4 justify-center">
            {models.map(model => (
              <button
                key={model.id || model.model}
                className="group flex flex-col items-center justify-center bg-background hover:bg-yellow-50 border border-border hover:border-primary rounded-xl p-3 shadow-sm hover:shadow-md transition-all focus:outline-none"
                style={{height: 120}}
                onClick={() => {
                  handleViewAllBrand(model.model);
                }}
              >
                <div className="h-12 flex items-center justify-center w-full mb-2 bg-white dark:bg-card rounded-lg border border-gray-100 dark:border-border shadow-inner group-hover:scale-105 transition-transform p-1">
                  {model.image_url ? (
                    <img src={model.image_url} alt={model.model} className="object-contain w-full h-full mix-blend-multiply" />
                  ) : (
                    <span className="text-gray-400 text-xs text-center font-bold">Markaya Git</span>
                  )}
                </div>
                <span className="text-xs font-bold text-center w-full line-clamp-2 text-foreground group-hover:text-primary transition-colors">{model.model}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default BrandMenu;