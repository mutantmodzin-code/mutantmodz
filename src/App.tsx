import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import ProductDetails from './pages/ProductDetails';
import Blog from './pages/Blog';
import Combos from './pages/Combos';
import GarageSale from './pages/GarageSale';
import Category from './pages/Category';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import MenuDrawer from './components/MenuDrawer';
import MyOrders from './pages/MyOrders';
import AccountSettings from './pages/AccountSettings';

import Payment from './pages/Payment';
import { CartProvider } from './context/CartContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import CartDrawer from './components/CartDrawer';
import LoginPopup from './components/LoginPopup';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const { showLoginPopup, setShowLoginPopup } = useUserAuth();
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1).split('?')[0] || 'home';
      setCurrentPage(hash);
      window.scrollTo(0, 0); // Scroll to top on navigation
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string, params?: string) => {
    // Correctly handle query params for page level switching
    const basePage = page.split('?')[0];
    setCurrentPage(basePage);
    window.location.hash = params ? `${page}${params}` : page;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'about':
        return <About />;
      case 'products':
        return <Products onNavigate={navigate} />;
      case 'gallery':
        return <Gallery />;
      case 'contact':
        return <Contact />;
      case 'productDetails':
        return <ProductDetails />;
      case 'blog':
        return <Blog />;
      case 'combos':
        return <Combos />;
      case 'garage-sale':
        return <GarageSale onNavigate={navigate} />;
      case 'brands':
        return <Brands onNavigate={navigate} />;
      case 'category':
        return <Category onNavigate={navigate} />;
      case 'categories':
        return <Categories onNavigate={navigate} />;
      case 'checkout':
        return <Payment />;
      case 'orders':
        return <MyOrders />;
      case 'settings':
        return <AccountSettings />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation
        currentPage={currentPage}
        onNavigate={navigate}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenMenu={() => setIsMenuDrawerOpen(true)}
      />
      <main>{renderPage()}</main>
      <Footer />
      <ChatBot />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onNavigate={navigate}
      />

      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />

      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        onNavigate={navigate}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#18181b', // zinc-900
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem',
            padding: '12px 24px',
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          },
        }} 
      />
    </div>
  );
}

function App() {
  return (
    <UserAuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </UserAuthProvider>
  );
}

export default App;
