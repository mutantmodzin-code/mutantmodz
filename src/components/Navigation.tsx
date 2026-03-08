import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'products', label: 'Products' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="bg-black text-white sticky top-0 z-50 shadow-lg border-b-2 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => handleNavClick('home')}
          >
            <div className="text-2xl sm:text-3xl font-bold">
              <span className="text-white group-hover:text-red-600 transition-colors">MUTANT</span>
              <span className="text-red-600 group-hover:text-white transition-colors ml-2">MODZ</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:text-red-600 ${currentPage === item.id ? 'text-red-600 border-b-2 border-red-600' : 'text-white'
                  }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href="tel:+919342637975"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
            >
              <Phone size={18} />
              <span className="text-sm font-semibold">Call Now</span>
            </a>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-red-600 transition-colors"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-4 py-3 rounded-md text-sm font-semibold uppercase transition-colors ${currentPage === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-zinc-800 hover:text-red-600'
                  }`}
              >
                {item.label}
              </button>
            ))}
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 px-4 py-3 rounded-md transition-colors"
            >
              <Phone size={18} />
              <span className="text-sm font-semibold">Call Now</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
