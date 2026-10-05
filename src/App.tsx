import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { CartDrawer } from './components/cart/CartDrawer';
import { useLenis } from './hooks/useLenis';
import { LoadingState } from './components/ui/LoadingState';

// Lazy loaded page components for optimal load performance
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const RoomsPage = lazy(() => import('./pages/RoomsPage').then((m) => ({ default: m.RoomsPage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then((m) => ({ default: m.MenuPage })));
const OrderPage = lazy(() => import('./pages/OrderPage').then((m) => ({ default: m.OrderPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Inner component to activate Lenis smooth scrolling inside router context
function AppContent() {
  useLenis();

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F0] text-[#121211] font-sans">
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Suspense fallback={<LoadingState message="Loading sanctuary experience..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/order" element={<OrderPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
