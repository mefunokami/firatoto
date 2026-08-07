import React, { useState } from 'react';
import whatsappLogo from '../img/whatsapp-color.svg';

const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chassisNumber, setChassisNumber] = useState('');
  const whatsappNumber = "+905439740121";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!chassisNumber.trim()) return;

    const message = `Merhaba, şasi numaram ile uyumlu parça sorgulamak istiyorum. Şasi numaram: ${chassisNumber}`;
    const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    setChassisNumber('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 bg-card rounded-2xl shadow-2xl p-5 w-80 border border-gray-100 dark:border-border transform origin-bottom-right transition-all duration-300 scale-100 opacity-100 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-[#25D366]"></div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <img src={whatsappLogo} alt="WhatsApp" className="w-6 h-6" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Parça Sorgulama</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 focus:outline-none transition-colors"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            Aracınıza en uygun ve uyumlu parçayı bulmamız için <strong>Şasi Numaranızı</strong> girin.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
             <div className="relative">
              <input
                type="text"
                placeholder="Şasi Numaranız (Örn: WBA...)"
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-[#25D366] transition-all bg-gray-50 dark:bg-background uppercase"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
            >
              <span>WhatsApp'a Gönder</span>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Modern Buton - Hover'da Sağa Kayar */}
      <div 
        className="group relative flex items-center justify-start bg-card rounded-full shadow-2xl transition-all duration-300 ease-in-out cursor-pointer hover:pr-5 border border-green-50 z-10 w-[60px] h-[60px] md:w-[64px] md:h-[64px] hover:w-[260px] md:hover:w-[280px]"
        style={{ boxShadow: '0 10px 40px rgba(37, 211, 102, 0.3)' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Yuvarlak Logo Kısmı */}
        <div className="absolute left-0 top-0 flex items-center justify-center w-[60px] h-[60px] md:w-[64px] md:h-[64px] bg-card rounded-full z-20 transition-transform duration-300">
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20"></div>
          {isOpen ? (
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#25D366" strokeWidth="2.5" className="relative z-10 drop-shadow-sm">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <img src={whatsappLogo} alt="WhatsApp" className="w-10 h-10 md:w-11 md:h-11 drop-shadow-md relative z-10" />
          )}
        </div>
        
        {/* Hover'da Çıkan Metin */}
        <div className="absolute left-[64px] flex flex-col items-start whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
          <span className="text-[14px] md:text-[15px] font-bold text-gray-800 dark:text-gray-200 leading-tight">Şasi Numaranızı Gönderin</span>
          <span className="text-[12px] md:text-[13px] text-[#25D366] font-semibold mt-0.5">Uyumlu Parçayı Bulalım</span>
        </div>
        
        {/* Arka plan hover efekti */}
        <div className="absolute inset-0 bg-green-50/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -root"></div>
      </div>
    </div>
  );
};

export default FloatingWhatsApp;
