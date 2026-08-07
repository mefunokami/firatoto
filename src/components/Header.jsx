import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MessageCircle, 
  User, 
  Heart, 
  ShoppingCart, 
  Search, 
  Menu, 
  ChevronDown, 
  Moon, 
  Sun, 
  LogOut,
  MapPin,
  Settings
} from 'lucide-react';
import logo from '../../logo.png';
import { CartContext } from '@/lib/CartContext.jsx';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/lib/ThemeProvider';
import BrandMenu from './BrandMenu';

const Header = ({ searchTerm, setSearchTerm, onSearch, onLoginClick, user, setUser }) => {
  const navigate = useNavigate();
  const { cart } = useContext(CartContext);
  const { theme, toggleTheme } = useTheme();
  
  const cartCount = cart.length;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2) + ' TL';
  const phone = '0543 974 0121';
  const whatsapp = 'Bize WhatsApp\'tan Ulaşın';

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    });
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md shadow-soft' : 'bg-background'
    }`}>
      {/* Üst Satır - İletişim Bilgileri */}
      <div className="hidden md:flex items-center justify-end w-full h-10 px-8 bg-[#18181b] text-xs">
        
        {/* Sağ Taraf - İletişim */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-gray-400 cursor-default">
            <Phone className="w-3.5 h-3.5 text-primary" />
            <div className="font-bold flex gap-3 tracking-wide text-gray-200">
              <a href="tel:05439740121" className="hover:text-primary transition-colors">0543 974 0121</a>
              <span className="text-gray-700 dark:text-gray-300">•</span>
              <a href="tel:05013530101" className="hover:text-primary transition-colors">0501 353 0101</a>
              <span className="text-gray-700 dark:text-gray-300">•</span>
              <a href="tel:05551786221" className="hover:text-primary transition-colors">0555 178 6221</a>
            </div>
          </div>
          
          <a href="https://wa.me/+905439740121" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all bg-[#25D366]/10 px-3 py-1 rounded-full font-bold">
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Destek</span>
          </a>
          
          <div className="h-4 w-px bg-gray-700 mx-1"></div>
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title={theme === 'dark' ? 'Aydınlık Moda Geç' : 'Karanlık Moda Geç'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Alt Satır - Ana Header */}
      <div className="flex items-center justify-between w-full h-[85px] px-4 md:px-8 py-1 gap-4 bg-[#18181b]">
        
        {/* Sol: Menü ve Logo (Mobil) */}
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <a href="https://firatotoyedekparca.com" className="flex items-center">
            <img src={logo} alt="Logo" className="h-10" />
          </a>
        </div>

        {/* Sol: Logo (Masaüstü) */}
        <div className="hidden md:flex flex-col items-center justify-center flex-shrink-0 mr-4">
          <a href="https://firatotoyedekparca.com" className="flex items-center">
            <img src={logo} alt="Logo" className="h-[74px] drop-shadow-lg" />
          </a>
          <span className="text-gray-400 font-medium tracking-wide text-[10px] uppercase -mt-1.5">
            Fırat Oto Yedek Parça'ya Hoş Geldiniz!
          </span>
        </div>

        {/* Orta: Arama Kutusu */}
        <form onSubmit={handleSearch} className="flex-1 hidden md:flex items-center justify-center max-w-2xl mx-4">
          <div className="flex w-full bg-white dark:bg-card rounded-full overflow-hidden transition-all duration-300 shadow-inner">
            <input
              type="text"
              placeholder="Site içi parça numarası veya ürün arama..."
              className="flex-1 px-5 py-3 outline-none text-sm bg-transparent text-gray-900 dark:text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 text-sm tracking-wide transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              ARA
            </button>
          </div>
        </form>

        {/* Sağ: Aksiyon Butonları */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 text-white">
          
          {/* Mobil Arama İkonu */}
          <button className="md:hidden p-2 text-white hover:bg-white/10 rounded-full">
            <Search className="w-5 h-5" />
          </button>
          
          {/* Dark Mode (Mobil) */}
          <button 
            onClick={toggleTheme}
            className="md:hidden p-2 text-white hover:bg-white/10 rounded-full"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Favoriler */}
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors relative group"
            title="Favoriler"
            onClick={() => navigate('/favorites')}
          >
            <Heart className="w-6 h-6 group-hover:text-primary transition-colors" />
          </button>

          {/* Kullanıcı Menüsü */}
          <div className="relative" ref={dropdownRef}>
            {user ? (
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div className="flex flex-col items-start text-white">
                  <span className="text-xs text-gray-300 font-medium">Hesabım</span>
                  <span className="text-sm font-bold flex items-center gap-1 group-hover:text-primary transition-colors">
                    {user.first_name} <ChevronDown className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ) : (
              <button 
                onClick={onLoginClick} 
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group text-white"
              >
                <User className="w-6 h-6 group-hover:text-primary transition-colors" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-300 font-medium">Giriş Yap</span>
                  <span className="text-sm font-bold group-hover:text-primary transition-colors">veya Üye Ol</span>
                </div>
              </button>
            )}

            {/* Dropdown Menü */}
            {dropdownOpen && user && (
              <div className="absolute right-0 mt-3 w-56 bg-card border border-border rounded-xl shadow-soft z-50 py-2 animate-in fade-in slide-in-from-top-2">
                {user.admin === 1 && (
                  <>
                    <button onClick={() => { setDropdownOpen(false); navigate('/admin'); }} className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-secondary text-primary font-bold text-sm transition-colors">
                      <Settings className="w-4 h-4" /> Yönetim Paneli
                    </button>
                    <div className="h-px bg-border my-1 mx-2"></div>
                  </>
                )}
                <button onClick={() => { setDropdownOpen(false); navigate('/account'); }} className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-secondary text-foreground text-sm transition-colors">
                  <User className="w-4 h-4" /> Hesap Bilgilerim
                </button>
                <button onClick={() => { setDropdownOpen(false); navigate('/addresses'); }} className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-secondary text-foreground text-sm transition-colors">
                  <MapPin className="w-4 h-4" /> Adreslerim
                </button>
                <div className="h-px bg-border my-1 mx-2"></div>
                <button onClick={handleLogout} className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-destructive/10 text-destructive text-sm transition-colors">
                  <LogOut className="w-4 h-4" /> Çıkış Yap
                </button>
              </div>
            )}
          </div>

          {/* Sepet Butonu */}
          <button 
            onClick={() => navigate('/cart')} 
            className="flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-full shadow-glow transition-all hover:scale-105 active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-background text-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-[10px] font-medium opacity-80">Sepetim</span>
              <span className="text-sm font-bold tracking-tight">{cartTotal}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Hamburger Drawer - Mobil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative bg-background w-4/5 max-w-sm h-full shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-left">
            <button className="absolute top-4 right-4 p-2 text-foreground hover:bg-secondary rounded-full transition-colors" onClick={() => setMobileMenuOpen(false)}>
              <span className="text-2xl leading-none">&times;</span>
            </button>
            <div className="p-6 pb-2 border-b border-border bg-[#18181b]">
              <div className="flex items-center mb-6">
                <img src={logo} alt="Logo" className="h-10" />
              </div>
              {!user && (
                 <button onClick={() => { setMobileMenuOpen(false); onLoginClick(); }} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg shadow-sm mb-4">
                   Giriş Yap / Üye Ol
                 </button>
              )}
            </div>
            <div className="p-4">
              <BrandMenu />
            </div>
            {user && (
              <div className="absolute bottom-0 w-full p-4 border-t border-border bg-card">
                 <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-3 text-destructive font-bold rounded-lg hover:bg-destructive/10 transition-colors">
                    <LogOut className="w-5 h-5" /> Çıkış Yap
                 </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;