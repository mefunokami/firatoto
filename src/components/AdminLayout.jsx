import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

/**
 * Admin sayfaları için sol menü + içerik düzeni
 */
export default function AdminLayout({ children, activeTab, showForm, onNewProduct, onProductList, title = 'Yönetim Paneli' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-secondary flex overflow-x-hidden">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        showForm={showForm}
        onNewProduct={onNewProduct}
        onProductList={onProductList}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-neutral-900 border-b border-neutral-700">
          <button
            type="button"
            className="p-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-white truncate">{title}</h1>
        </header>

        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
