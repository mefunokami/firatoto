import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../logo.png';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';
import BrandMenu from './BrandMenu';

const Header = ({ searchTerm, setSearchTerm, onSearch, onLoginClick, user, setUser }) => {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2) + ' TL';
  const phone = '0543 974 0121';
  const whatsapp = 'Bize WhatsApp\'tan Ulaşın';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <header className="w-full bg-[#232428] md:bg-white border-b-[2px] border-yellow-400 sticky top-0 z-50" style={{borderTop: 'none'}}>
      {/* Üst Satır */}
      <div className="flex items-center w-full" style={{minHeight:'36px'}}>
        {/* Sol: Siyah alan (clip-path ile) */}
        <div className="bg-[#232428] min-w-[420px] h-[36px] px-10 hidden md:block" style={{clipPath:'polygon(0% 0, 94.85% 0, 92.012% 100%, 0% 100%)'}}></div>
        {/* Sağ: Telefon ve WhatsApp bilgisi beyaz alanda */}
        <div className="flex items-center gap-6 flex-1 h-[36px] bg-white pl-6">
          <span className="flex items-center gap-2 text-gray-800 font-medium hidden md:flex">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.36 11.36 0 003.54.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.54 1 1 0 01-.21 1.11l-2.2 2.2z" stroke="#FFC107" strokeWidth="2"/></svg>
            <span className="font-semibold">{phone}</span>
          </span>
          <span className="flex items-center gap-2 text-gray-800 font-medium hidden md:flex">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#25D366"/><path d="M16.71 15.29l-2.54-.73a1 1 0 00-.95.26l-.45.46a7.07 7.07 0 01-3.32-3.32l.46-.45a1 1 0 00.26-.95l-.73-2.54A1 1 0 008.1 7H6.5A1.5 1.5 0 005 8.5 10.5 10.5 0 0015.5 19a1.5 1.5 0 001.5-1.5v-1.6a1 1 0 00-.29-.71z" fill="#fff"/></svg>
            <a href="https://wa.me/+905439740121" target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-semibold hover:underline">{whatsapp}</a>
          </span>
        </div>
      </div>
      {/* Alt Satır */}
      <div className="flex items-center w-full" style={{minHeight:'90px'}}>
        {/* Sol: Logo ve siyah alan */}
        <div className="flex items-center justify-center bg-[#232428] min-w-[420px] h-[90px] px-10 hidden md:flex" style={{clipPath:'polygon(0 0, 92% 0, 85% 100%, 0% 100%)'}}>
          <a href="https://firatotoyedekparca.com" target="_self" className="flex items-center">
            <img src={logo} alt="Logo" className="h-20" />
          </a>
        </div>
        {/* Mobilde Logo */}
        <div className="flex items-center justify-between w-full md:hidden px-4 py-2">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2"><svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#ffc107" strokeWidth="2" strokeLinecap="round"/></svg></button>
          <a href="https://firatotoyedekparca.com" target="_self" className="flex items-center mx-auto"><img src={logo} alt="Logo" className="h-12" /></a>
          <div className="w-8"></div>
        </div>
        {/* Orta: Arama Kutusu */}
        <form onSubmit={handleSearch} className="flex-1 flex items-center justify-center px-8 hidden md:flex">
          <div className="flex flex-1 border-2 border-gray-200 rounded overflow-hidden bg-white max-w-2xl shadow-sm">
            <span className="flex items-center px-4 text-gray-400"><svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg></span>
            <input
              type="text"
              placeholder="Site içi ürün arama"
              className="flex-1 px-3 py-4 outline-none text-base bg-white"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-10 text-lg tracking-wide">ARA</button>
          </div>
        </form>
        {/* Sağ: Favori, Giriş, Sepet */}
        <div className="flex items-center gap-2 md:gap-6 w-full justify-center px-2 md:min-w-[420px] md:justify-end md:px-10 md:w-auto">
          {/* Favori: Hem mobilde hem masaüstünde */}
          {/* Mobilde sarı arka plan, beyaz yıldız; masaüstünde de aynı */}
          <button
            className="bg-yellow-400 hover:bg-yellow-500 rounded w-10 h-10 flex items-center justify-center text-2xl shadow md:hidden"
            title="Favoriler"
            onClick={() => navigate('/favorites')}
            style={{marginRight: 8}}
          >
            <span role="img" aria-label="heart" style={{color:'#fff'}}>★</span>
          </button>
          <button
            className="hidden md:inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 rounded w-10 h-10 text-2xl shadow"
            title="Favoriler"
            onClick={() => navigate('/favorites')}
            style={{marginRight: 8}}
          >
            <span role="img" aria-label="heart" style={{color:'#fff'}}>★</span>
          </button>
          <div className="flex flex-col items-center px-1 md:px-2">
            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(v => !v)} className="flex items-center gap-2 text-gray-700 hover:text-yellow-500 focus:outline-none">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M16 20v-2a4 4 0 0 0-8 0v2" /></svg>
                  <span className="font-semibold hidden md:inline">{user.first_name} {user.last_name}</span>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="hidden md:inline"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 animate-fade-in">
                    {user.admin === 1 && (
                      <button onClick={() => { setDropdownOpen(false); navigate('/admin'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 font-bold text-yellow-600">Yönetim Paneli</button>
                    )}
                    <button onClick={() => { setDropdownOpen(false); navigate('/account'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Hesap Bilgilerim</button>
                    <button onClick={() => { setDropdownOpen(false); navigate('/addresses'); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Adreslerim</button>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">Çıkış yap</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button onClick={onLoginClick} className="flex items-center gap-2 text-gray-700 hover:text-yellow-500">
                  <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M16 20v-2a4 4 0 0 0-8 0v2" /></svg>
                  <span className="font-semibold hidden md:inline">Giriş Yapın</span>
                </button>
                <span className="text-xs text-gray-400 hidden md:inline">veya Üye Ol</span>
              </>
            )}
          </div>
          <button onClick={() => navigate('/cart')} className="bg-gray-900 rounded flex flex-col items-center px-3 py-2 min-w-[80px] md:px-7 md:py-2 md:min-w-[130px] shadow">
            <div className="flex items-center gap-1">
              <span className="relative">
                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-white rounded-full px-1">{cartCount}</span>
              </span>
              <span className="font-bold text-white ml-2 hidden md:inline">Sepetim</span>
            </div>
            <span className="text-xs text-yellow-400 font-bold hidden md:inline">{cartTotal}</span>
          </button>
        </div>
      </div>
      {/* Hamburger Drawer - Mobil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setMobileMenuOpen(false)}></div>
          {/* Drawer */}
          <div className="relative bg-white w-4/5 max-w-xs h-full shadow-xl z-50 animate-slide-in-left overflow-y-auto">
            <button className="absolute top-4 right-4 text-2xl" onClick={() => setMobileMenuOpen(false)}>&times;</button>
            <BrandMenu />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;