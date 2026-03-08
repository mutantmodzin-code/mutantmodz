import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

import Payment from './pages/Payment';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1).split('?')[0] || 'home';
      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.location.hash = page;
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

      case 'payment':
        return <Payment />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation currentPage={currentPage} onNavigate={navigate} />
      <main className="pt-20">{renderPage()}</main>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default App;
