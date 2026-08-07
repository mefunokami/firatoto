import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '@/lib/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const sampleCart = [
  {
    id: 1,
    name: 'SNR KB65517 | Renault Megane 2 Tüm Modeller Ön Amortisör Takoz Kiti',
    brand: 'SNR',
    price: 1129.47,
    qty: 1,
    image: 'https://www.onlineyedekparca.com/image/cache/catalog/urunler/snrrenaultamortisor-800x800.jpg',
  },
  {
    id: 2,
    name: 'Bmw F30 Kasa 320d N47 Motor Zincir Seti Komple Alt-Üst Febi Marka',
    brand: 'FEBI BILSTEIN',
    price: 5858.39,
    qty: 1,
    image: 'https://www.onlineyedekparca.com/image/cache/catalog/urunler/bmwzincirseti-800x800.jpg',
  },
];

function calcTotals(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || item.qty || 1), 0);
  // KDV tamamen kaldırıldı
  // Kargo hesaplama
  const kargoUcreti = subtotal >= 5000 ? 0 : cart.reduce((sum, item) => sum + 350 * (item.quantity || item.qty || 1), 0);
  const total = subtotal + kargoUcreti;
  return { subtotal, kargoUcreti, total };
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const { subtotal, kargoUcreti, total } = calcTotals(cart);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setShowToast(true);
    const timer = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCheckout = () => {
    const isAuthenticated = sessionStorage.getItem('is-authenticated') === 'true';
    if (!isAuthenticated) {
      if (typeof window.setLoginOpen === 'function') {
        window.setLoginOpen(true);
      } else {
        // Fallback: route ile login sayfasına yönlendir
        navigate('/login');
      }
      return;
    }
    navigate('/order/step2');
  };

  return (
    <div className="bg-gray-50 dark:bg-background min-h-screen py-8 px-2">
      {/* Toast Bildirimi */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#1a1a1a',
            color: '#fff',
            padding: '14px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: '500',
            minWidth: '280px',
            maxWidth: '90vw',
            animation: 'fadeInUp 0.4s ease',
          }}
        >
          <span style={{ fontSize: '20px' }}>🚚</span>
          <span><strong>5.000 TL ve üzeri</strong> siparişlerinizde kargo <strong style={{ color: '#4ade80' }}>ÜCRETSİZ!</strong></span>
          <button
            onClick={() => setShowToast(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}
          >✕</button>
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sepet Detayı */}
        <div className="md:col-span-2">
          <div className="bg-card rounded shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <span className="border-b-4 border-yellow-500 pb-1">SEPET DETAYI</span>
            </h2>
            {cart.map(item => (
              <div key={item.id} className="flex flex-col md:flex-row items-center gap-3 md:gap-4 border-b py-4 last:border-b-0">
                <img src={item.image || item.imageUrl || ''} alt={item.name} className="w-24 h-24 md:w-20 md:h-20 object-contain rounded bg-gray-100 mb-2 md:mb-0" />
                <div className="flex-1 min-w-0 w-full text-center md:text-left">
                  <div className="font-semibold text-base md:text-sm truncate mb-1">{item.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{item.brand}</div>
                  <div className="flex justify-center md:justify-start items-center gap-2 mb-2 md:mb-0">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || item.qty || 1) - 1))} className="border rounded px-3 py-1 text-lg font-bold text-gray-500 dark:text-gray-400">-</button>
                    <span className="px-3">{item.quantity || item.qty}</span>
                    <button onClick={() => updateQuantity(item.id, (item.quantity || item.qty || 1) + 1)} className="border rounded px-3 py-1 text-lg font-bold text-gray-500 dark:text-gray-400">+</button>
                    <span className="text-xs text-gray-400 ml-2">Adet</span>
                  </div>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-end w-full md:w-auto mt-2 md:mt-0">
                  <div className="font-bold text-lg md:text-base text-center md:text-right w-full md:w-auto">{Number(item.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} <span className="text-xs text-green-600">(KDV Dahil)</span></div>
                  <button onClick={() => removeFromCart(item.id)} className="mt-2 md:mt-4 px-4 py-2 bg-red-100 text-red-500 rounded flex items-center gap-1 hover:bg-red-200 w-full md:w-auto justify-center md:justify-end">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" /></svg>
                    <span className="hidden md:inline">Sepetten Sil</span>
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4 flex justify-between items-center gap-2">
              <button onClick={() => navigate('/')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 px-4 py-2 rounded flex items-center gap-2">
                ← ALIŞVERİŞE DEVAM ET
              </button>
              <button onClick={clearCart} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded">
                Tüm Sepeti Sil
              </button>
            </div>
          </div>
        </div>
        {/* Sepet Özeti */}
        <div>
          <div className="bg-card rounded shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <span className="border-b-4 border-yellow-500 pb-1">SEPET ÖZETİ</span>
            </h2>
            <div className="flex justify-between mb-2">
              <span>Ara Toplam</span>
              <span>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
            </div>
            {/* KDV satırı kaldırıldı */}
            <div className="flex justify-between mb-2">
              <span>Kargo</span>
              <span>
                {subtotal >= 5000 ? (
                  <span className="text-green-600 font-bold flex items-center gap-1">0,00 TL <span title="5000 TL ve üzeri ücretsiz kargo">★</span></span>
                ) : (
                  kargoUcreti.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
                )}
              </span>
            </div>
            <div className="flex justify-between mb-4 font-bold text-lg">
              <span>Toplam</span>
              <span>{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
            </div>
            <button onClick={handleCheckout} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded text-base">ALIŞVERİŞİ TAMAMLA</button>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              This site is SSL SECURED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 