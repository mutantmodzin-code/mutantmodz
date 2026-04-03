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
import MenuDrawer from './components/MenuDrawer';

import Payment from './pages/Payment';
import { CartProvider } from './context/CartContext';
import { UserAuthProvider, useUserAuth } from './context/UserAuthContext';
import CartDrawer from './components/CartDrawer';
import LoginPopup from './components/LoginPopup';

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
    setCurrentPage(page);
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
      case 'category':
        return <Category onNavigate={navigate} />;
      case 'categories':
        return <Categories onNavigate={navigate} />;
      case 'payment':
        return <Payment />;
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
