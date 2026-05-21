import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '@/pages/Layout';
import HomePage from '@/pages/HomePage';
import AdminPage from '@/pages/AdminPage';
import UserLoginPage from '@/pages/UserLoginPage';
import CategoriesPage from '@/pages/CategoriesPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from "@/components/ui/toaster";
import ModelManagementPage from '@/pages/ModelManagementPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import AdminSliderPage from '@/pages/AdminSliderPage';
import BrandCategoryPage from '@/pages/BrandCategoryPage';
import CartPage from '@/pages/CartPage';
import RegisterPage from '@/pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminBrandsPage from './pages/AdminBrandsPage';
import Header from '@/components/Header';
import { CartProvider } from '@/lib/CartContext.jsx';
import OrderStep2Page from './pages/OrderStep2Page';
import AccountPage from './pages/AccountPage';
import AddressesPage from './pages/AddressesPage';
import OrdersPage from './pages/OrdersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminBankAccountsPage from './pages/AdminBankAccountsPage';
import AboutPage from './pages/AboutPage';
import ContactInfoPage from "./pages/ContactInfoPage";
import AdminUsersPage from './pages/AdminUsersPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BlogPage from './pages/BlogPage';
import AdminBlogPage from './pages/AdminBlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import AdminFaqPage from './pages/AdminFaqPage';
import AdminXmlImportPage from './pages/AdminXmlImportPage';
import AdminShippedCargosPage from './pages/AdminShippedCargosPage';
import AdminGoogleMapsPage from './pages/AdminGoogleMapsPage';

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
      </Routes>
      <Toaster />
    </CartProvider>
  );
}

export default App;