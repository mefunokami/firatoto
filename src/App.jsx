import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/pages/Layout';
import HomePage from '@/pages/HomePage';
import UserLoginPage from '@/pages/UserLoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/lib/CartContext.jsx';

const AdminPage = lazy(() => import('@/pages/AdminPage'));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage'));
const ModelManagementPage = lazy(() => import('@/pages/ModelManagementPage'));
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const AdminSliderPage = lazy(() => import('@/pages/AdminSliderPage'));
const BrandCategoryPage = lazy(() => import('@/pages/BrandCategoryPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminBrandsPage = lazy(() => import('./pages/AdminBrandsPage'));
const OrderStep2Page = lazy(() => import('./pages/OrderStep2Page'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminBankAccountsPage = lazy(() => import('./pages/AdminBankAccountsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactInfoPage = lazy(() => import('./pages/ContactInfoPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const AdminBlogPage = lazy(() => import('./pages/AdminBlogPage'));
const BlogDetailPage = lazy(() => import('./pages/BlogDetailPage'));
const AdminFaqPage = lazy(() => import('./pages/AdminFaqPage'));
const AdminXmlImportPage = lazy(() => import('./pages/AdminXmlImportPage'));
const AdminShippedCargosPage = lazy(() => import('./pages/AdminShippedCargosPage'));
const AdminGoogleMapsPage = lazy(() => import('./pages/AdminGoogleMapsPage'));
const AdminAboutImagesPage = lazy(() => import('./pages/AdminAboutImagesPage'));
const AdminWeeklyDealPage = lazy(() => import('./pages/AdminWeeklyDealPage'));

function App() {
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [user, setUser] = React.useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/login') {
      setLoginOpen(true);
    }
    window.setLoginOpen = setLoginOpen;
    window.setUser = setUser;
  }, [location.pathname]);

  return (
    <CartProvider>
      <UserLoginPage open={loginOpen} setOpen={setLoginOpen} setUser={setUser} />
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Yükleniyor...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="kategori/:brand/:model" element={<BrandCategoryPage />} />
            <Route path="brand-category" element={<BrandCategoryPage />} />
            <Route path=":brand/:productName" element={<ProductDetailPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="order/step2" element={<OrderStep2Page />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="addresses" element={<AddressesPage />} />
            <Route path="hakkımızda" element={<AboutPage />} />
            <Route path="iletisim" element={<ContactInfoPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogDetailPage />} />
          </Route>
          {/* /login route'u tamamen kaldırıldı */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={<AdminCategoriesPage />} />
          <Route path="/admin/models" element={
            <ProtectedRoute>
              <ModelManagementPage />
            </ProtectedRoute>
          } />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin/sliders" element={
            <ProtectedRoute>
              <AdminSliderPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/brands" element={<AdminBrandsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/bank-accounts" element={<AdminBankAccountsPage />} />
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/blog" element={<AdminBlogPage />} />
          <Route path="/admin/faq" element={
            <ProtectedRoute>
              <AdminFaqPage />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin/xml-import" element={<AdminXmlImportPage />} />
          <Route path="/admin/shipped-cargos" element={
            <ProtectedRoute>
              <AdminShippedCargosPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/google-maps" element={
            <ProtectedRoute>
              <AdminGoogleMapsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/about-images" element={
            <ProtectedRoute>
              <AdminAboutImagesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/weekly-deal" element={
            <ProtectedRoute>
              <AdminWeeklyDealPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
      <Toaster />
    </CartProvider>
  );
}

export default App;