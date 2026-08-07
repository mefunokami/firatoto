import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '@/lib/CartContext.jsx';

const sampleCart = [
  {
    id: 1,
    name: 'SNR KB65517 | Renault Megane 2 Tüm Modeller Ön Amortisör Takoz Kiti',
    brand: 'SNR',
    price: 1355.36,
    qty: 1,
    image: 'https://www.onlineyedekparca.com/image/cache/catalog/urunler/snrrenaultamortisor-800x800.jpg',
  },
  {
    id: 2,
    name: 'Bmw F30 Kasa 320d N47 Motor Zincir Seti Komple Alt-Üst Febi Marka',
    brand: 'FEBI BILSTEIN',
    price: 7030.07,
    qty: 1,
    image: 'https://www.onlineyedekparca.com/image/cache/catalog/urunler/bmwzincirseti-800x800.jpg',
  },
];

export default function CartDrawer({ open, onClose }) {
  const { cart } = useContext(CartContext);
  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.quantity || item.qty || 1), 0);
  const kargoUcreti = subtotal >= 5000 ? 0 : cart.reduce((sum, item) => sum + 350 * (item.quantity || item.qty || 1), 0);
  const total = subtotal + kargoUcreti;
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (open) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleBuy = () => {
    onClose && onClose();
    navigate('/cart');
  };

  return (
    <>
      {/* Toast Bildirimi */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99999,
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ minWidth: 350 }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-lg">ALIŞVERİŞ SEPETİ</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-700 dark:text-gray-300">×</button>
        </div>
        <div className="px-6 py-2 text-sm text-gray-600 dark:text-gray-400">
          Sepetinizde {cart.length} ürün var.
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {cart.map(item => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center gap-3 sm:gap-3 border-b py-4 px-2 sm:px-4 group"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-full sm:w-auto mb-2 sm:mb-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 sm:w-14 sm:h-14 object-contain rounded bg-gray-100 cursor-pointer hover:opacity-80"
                  onClick={() => { onClose && onClose(); navigate(`/product/${item.id}`); }}
                />
              </div>
              <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                <div
                  className="font-semibold text-sm sm:text-xs truncate cursor-pointer hover:text-yellow-600 mb-1"
                  onClick={() => { onClose && onClose(); navigate(`/product/${item.id}`); }}
                >
                  {item.name}
                </div>
                <div className="text-xs text-gray-400 mb-1">{item.brand}</div>
                <div className="text-xs mb-1">{item.qty} Adet - <span className="font-bold">{Number(item.price).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span></div>
              </div>
              <button
                className="text-gray-400 hover:text-red-500 p-2 sm:p-1 mt-2 sm:mt-0"
                title="Ürünü kaldır"
                onClick={e => { e.stopPropagation(); /* burada ürünü kaldırma fonksiyonu çağrılabilir */ }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6l12 12M6 18L18 6" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span>Ara Toplam</span>
            <span>{subtotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
          </div>
          <div className="flex justify-between items-center mb-3 text-sm">
            <span>Kargo</span>
            <span>
              {subtotal >= 5000 ? (
                <span className="text-green-600 font-bold">ÜCRETSİZ ★</span>
              ) : (
                kargoUcreti.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
              )}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Sepet Toplamı</span>
            <span className="font-bold text-lg">{total.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
          </div>
          <button onClick={handleBuy} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded mb-2 text-base">SATIN AL</button>
          <button onClick={() => { onClose && onClose(); navigate('/'); }} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 dark:text-gray-300 font-bold py-3 rounded text-base">ALIŞVERİŞE DEVAM ET</button>
        </div>
      </aside>
    </>
  );
} 