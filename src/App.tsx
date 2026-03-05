import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const hash = window.location.hash.slice(1) || 'home';
    setCurrentPage(hash);
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
        return <Products />;
      case 'gallery':
        return <Gallery />;
      case 'contact':
        return <Contact />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation currentPage={currentPage} onNavigate={navigate} />
      <main>{renderPage()}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
