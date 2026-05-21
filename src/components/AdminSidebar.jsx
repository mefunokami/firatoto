import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  FileSpreadsheet,
  Settings,
  Wrench,
  Users,
  FileText,
  HelpCircle,
  Image,
  Truck,
  Star,
  ArrowLeft,
  X,
} from 'lucide-react';

function NavItem({ active, onClick, icon: Icon, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
        active
          ? 'bg-yellow-400 text-neutral-900 shadow-sm'
          : 'text-gray-300 hover:bg-neutral-800 hover:text-white'
      } ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0 opacity-90" />}
      <span className="truncate">{children}</span>
    </button>
  );
}

function NavSection({ title, children }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-3 mb-2">
        {title}
      </p>
      <div className="space-y-1 px-2">{children}</div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {boolean} props.open - mobil drawer açık
 * @param {() => void} props.onClose
 * @param {string} [props.activeTab] - sadece /admin için
 * @param {boolean} [props.showForm]
 * @param {() => void} [props.onNewProduct]
 * @param {() => void} [props.onProductList]
 */
export default function AdminSidebar({ open, onClose, activeTab, showForm, onNewProduct, onProductList }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const isAdminHome = path === '/admin';

  const go = (to) => {
    navigate(to);
    onClose?.();
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-neutral-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center shrink-0">
            <Wrench className="h-5 w-5 text-neutral-900" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate">Fırat Oto</p>
            <p className="text-xs text-gray-400">Yönetim Paneli</p>
          </div>
          <button
            type="button"
            className="md:hidden ml-auto p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800"
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 overscroll-contain">
        <NavSection title="Ürünler">
          <NavItem
            active={isAdminHome && activeTab === 'list' && !showForm}
            onClick={() => {
              if (isAdminHome && onProductList) {
                onProductList();
                onClose?.();
              } else {
                go('/admin');
              }
            }}
            icon={Package}
          >
            Ürün Listesi
          </NavItem>
          <NavItem
            active={isAdminHome && (activeTab === 'add' || showForm)}
            onClick={() => {
              if (isAdminHome && onNewProduct) {
                onNewProduct();
                onClose?.();
              } else {
                go('/admin');
              }
            }}
            icon={Plus}
          >
            Yeni Ürün Ekle
          </NavItem>
          <NavItem active={path === '/admin/xml-import'} onClick={() => go('/admin/xml-import')} icon={FileSpreadsheet}>
            Toplu İçe Aktar
          </NavItem>
        </NavSection>

        <NavSection title="Katalog">
          <NavItem active={path === '/admin/categories'} onClick={() => go('/admin/categories')} icon={Settings}>
            Kategoriler
          </NavItem>
          <NavItem active={path === '/admin/models'} onClick={() => go('/admin/models')} icon={Wrench}>
            Modeller
          </NavItem>
          <NavItem active={path === '/admin/brands'} onClick={() => go('/admin/brands')} icon={Plus}>
            Markalar
          </NavItem>
          <NavItem active={path === '/admin/users'} onClick={() => go('/admin/users')} icon={Users}>
            Kullanıcılar
          </NavItem>
        </NavSection>

        <NavSection title="Site İçeriği">
          <NavItem active={path === '/admin/blog'} onClick={() => go('/admin/blog')} icon={FileText}>
            Blog
          </NavItem>
          <NavItem active={path === '/admin/faq'} onClick={() => go('/admin/faq')} icon={HelpCircle}>
            SSS
          </NavItem>
          <NavItem active={path === '/admin/sliders'} onClick={() => go('/admin/sliders')} icon={Image}>
            Hero Slider
          </NavItem>
          <NavItem active={path === '/admin/shipped-cargos'} onClick={() => go('/admin/shipped-cargos')} icon={Truck}>
            Gönderilen Kargolar
          </NavItem>
          <NavItem active={path === '/admin/about-images'} onClick={() => go('/admin/about-images')} icon={Image}>
            Hakkımızda Fotoğrafları
          </NavItem>
          <NavItem active={path === '/admin/google-maps'} onClick={() => go('/admin/google-maps')} icon={Star}>
            Google Maps
          </NavItem>
        </NavSection>
      </nav>

      <div className="p-3 border-t border-neutral-700 shrink-0">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:text-yellow-400 hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Siteye Dön
        </Link>
      </div>
    </>
  );

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          aria-label="Menüyü kapat"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-30
          h-screen w-[260px] shrink-0
          bg-neutral-900 border-r border-neutral-700
          flex flex-col
          transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
