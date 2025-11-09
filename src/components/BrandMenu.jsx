import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SABIT_MARKALAR = [
  'BMW', 'MERCEDES-BENZ', 'VOLKSWAGEN', 'AUDİ', 'TESLA', 'SEAT', 'SKODA', 'PEUGEOT', 'CİTROEN', 'FORD', 'OPEL', 'CHEVROLET',
  'GENEL MARKALAR'
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

  // Markaya tıklanınca modelleri çek
  const handleBrandClick = (brand) => {
    if (openBrand === brand) {
      setOpenBrand(null);
      setModels([]);
      setError(null);
      return;
    }
    setOpenBrand(brand);
    setLoading(true);
    setError(null);
    fetch(`/api/brand_models.php?brand=${encodeURIComponent(brand)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setModels(data);
          setError(null);
        } else {
          setModels([]);
          setError('Model bulunamadı');
        }
        setLoading(false);
      })
      .catch(() => {
        setModels([]);
        setError('API Hatası');
        setLoading(false);
      });
  };

  // Model seçilince yönlendirme
  const handleModelSelect = (brand, model) => {
    if (brand && model) {
      const normalizedBrand = brand.trim().toUpperCase();
      const normalizedModel = model.trim().toUpperCase();
      setOpenBrand(null);
      setModels([]);
      
      // MERCEDES-BENZ için özel URL oluştur
      let brandSlug;
      if (normalizedBrand === 'MERCEDES-BENZ') {
        brandSlug = 'mercedes-benz';
      } else if (normalizedBrand === 'GENEL MARKALAR') {
        brandSlug = 'genel_markalar';
      } else {
        brandSlug = slugify(normalizedBrand);
      }
      
      navigate(`/kategori/${brandSlug}/${slugify(normalizedModel)}`);
    }
  };

  return (
    <nav className="w-full bg-[#ffc107] shadow">
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
          <div className="bg-white border-b border-yellow-200">
            <div className="flex flex-col gap-1 py-2">
              {SABIT_MARKALAR.map(brand => (
                <button
                  key={brand}
                  className={`w-full text-left px-4 py-2 font-semibold uppercase text-black hover:bg-yellow-100 ${openBrand === brand ? 'bg-black text-[#ffc107]' : ''}`}
                  onClick={() => handleBrandClick(brand)}
                >
                  {brand}
                </button>
              ))}
            </div>
            {openBrand && (
              <div className="bg-gray-50 border-t border-yellow-100 px-4 py-2">
                {loading ? (
                  <span className="text-gray-500">Yükleniyor...</span>
                ) : error ? (
                  <span className="text-red-500 font-bold">{error}</span>
                ) : models.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {models.map(model => (
                      <button
                        key={model.id || model.model}
                        className="bg-white border border-yellow-200 rounded p-2 text-xs font-semibold hover:bg-yellow-50"
                        onClick={() => handleModelSelect(openBrand, model.model)}
                      >
                        {model.model}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">Model bulunamadı</span>
                )}
              </div>
            )}
            {/* Ekstra linkler - Sadece markalar açıkken görünür */}
          </div>
        )}
        {/* Ekstra linkler - Her zaman görünür */}
        <div className="bg-white border-b border-yellow-200 flex flex-col gap-1 py-2">
          <button onClick={() => { setMobileOpen(false); navigate('/blog'); }} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">Blog</button>
          <a href="/#faq" onClick={() => setMobileOpen(false)} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">Sık Sorulanlar</a>
          <button onClick={() => { setMobileOpen(false); navigate('/hakkımızda'); }} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">Hakkımızda</button>
                      <button onClick={() => { setMobileOpen(false); navigate('/iletisim'); }} className="w-full text-left px-4 py-2 font-semibold text-black hover:bg-yellow-100">İletişim</button>
        </div>
      </div>
      {/* Masaüstü için eski yapı */}
      <div className="max-w-7xl mx-auto px-2 py-2 flex flex-col md:flex-row flex-nowrap md:justify-center items-stretch md:items-center gap-1 md:block hidden">
        {SABIT_MARKALAR.map(brand => (
          <button
            key={brand}
            className={
              `w-full py-3 text-base text-center rounded px-2 md:w-auto md:py-2 md:text-sm md:text-left md:px-3 md:rounded font-bold uppercase transition ` +
              (openBrand === brand
                ? 'bg-black text-[#ffc107] shadow font-extrabold'
                : 'bg-[#ffc107] text-black hover:bg-black hover:text-[#ffc107]')
            }
            style={{minWidth: 0, letterSpacing: 0.5, border: 'none', boxShadow: 'none'}}
            onClick={() => handleBrandClick(brand)}
          >
            {brand}
          </button>
        ))}
      </div>
      {openBrand && (
        <div className="w-full bg-white border-t border-yellow-200 shadow-inner md:block hidden">
          <div className="max-w-7xl mx-auto px-2 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 justify-center">
            {loading ? (
              <span className="col-span-full text-gray-500">Yükleniyor...</span>
            ) : error ? (
              <span className="col-span-full text-red-500 font-bold">{error}</span>
            ) : models.length > 0 ? (
              models.map(model => (
                <button
                  key={model.id || model.model}
                  className="flex flex-col items-center justify-center bg-gray-50 hover:bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm transition focus:outline-none"
                  style={{minHeight: 110, height: 110, fontSize: '1rem'}}
                  onClick={() => handleModelSelect(openBrand, model.model)}
                >
                  <div style={{height:'40px', display:'flex', alignItems:'center', justifyContent:'center', width:'100%'}}>
                    {model.image_url ? (
                      <img src={model.image_url} alt={model.model} className="object-contain border rounded bg-white mx-auto" style={{maxWidth:'80px',maxHeight:'40px'}} />
                    ) : (
                      <span className="text-gray-400 text-xs">Görsel yok</span>
                    )}
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-center mt-2 w-full truncate">{model.model}</span>
                </button>
              ))
            ) : (
              <span className="col-span-full text-gray-400">Model bulunamadı</span>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default BrandMenu; 