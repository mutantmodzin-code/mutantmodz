import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, Search, Mic, User, ShoppingCart, ChevronDown,
  Bike, Shield, Package,
  ArrowRight, Flame, Star, ChevronRight, LogOut, X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import AnnouncementBar from './AnnouncementBar';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string, params?: string) => void;
  onOpenCart?: () => void;
  onOpenMenu?: () => void;
}

export default function Navigation({ currentPage, onNavigate, onOpenCart, onOpenMenu }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState('All');
  const [isSearchCatOpen, setIsSearchCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const timeoutRef = useRef<any>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>('Royal Enfield');
  const { totalCount } = useCart();
  const { isLoggedIn, user, setShowLoginPopup, logout } = useUserAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const cat = categoriesData.find(c => c.id === id);
    if (cat?.isLink) {
      setActiveDropdown(null);
      return;
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mega-menu-container')) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Comprehensive Mega Menu Structure Data
  const categoriesData = [
    {
      id: 'new',
      label: 'New Arrivals!!',
      icon: Flame,
      isLink: true,
      onClick: () => handleNavClick('products', '?cat=new')
    },
    {
      id: 'bike',
      label: 'Shop by Bike',
      icon: Bike,
      isMega: true,
      brands: [
        { name: 'KTM', models: ['390/250 Adventure X', 'Gen 3 Duke 390', 'Duke 125', 'RC 125', 'RC 200', 'Duke 200', 'Duke 250', 'ADV 250', 'RC 390', 'Adv 390', 'Duke 390', 'Duke 790'] },
        { name: 'Royal Enfield', models: ['Himalayan 450', 'Bear 650', 'Guerrilla 450', 'Himalayan', 'Himalayan Scram 411', 'Shotgun 650', 'Interceptor 650', 'Continental Gt 650', 'Hunter 350', 'Classic 350', 'Thunderbird 350', 'Meteor 650', 'Meteor 350', 'Classic 350 Reborn', 'Thunderbird-x', 'Classic 500', 'Bullet 350', 'Bullet 500', 'Thunderbird 500'] },
        { name: 'Yamaha', models: ['Aerox 155', 'R15 v2', 'R15 v3', 'R15 v4', 'R15 M', 'MT-15', 'FZ-25', 'Fazer-250', 'Yamaha YZF R3'] },
        { name: 'Honda', models: ['Honda NX-500', 'Honda X Blade', 'Honda CB200x', 'Honda CBR 250R', 'Honda CB300R', 'Honda CF300F', 'Honda H\'ness CB350', 'Honda CB350RS', 'Honda CB 500X', 'Honda CB650R', 'Honda CBR650F', 'Honda CB1000R', 'Honda CBR 1000RR Fireblade', 'Honda African Twin', 'Honda Gold Wing', 'Honda XL750 Transalp'] },
        { name: 'Hero', models: ['Xpulse 210', 'Xpulse 200', 'Xtreme 160', 'Xpulse 200 4V', 'Xpulse 200T', 'Xtreme 200S', 'Xpulse 2004v Rally Edition'] },
        { name: 'Suzuki', models: ['V Strom 250 XS', 'V Strom 650', 'V Strom 1000', 'Burgman Street 125', 'Gixxer SF 250', 'Hayabusa'] },
        { name: 'Triumph', models: ['Speed 400', 'Scrambler 400X', 'Street Triple'] },
        { name: 'Bajaj', models: ['NS 160', 'NS 200', 'RS 200', 'Avenger', 'Pulsar 150', 'Pulsar 180', 'Pulsar 220', 'Dominar 250', 'Dominar 400'] },
        { name: 'BMW', models: ['BMW G310 GS', 'BMW G310R', 'BMW G310RR'] },
        { name: 'TVS', models: ['Ntorq', 'Apache RTR 160', 'RTR 160 4V', 'RR 310', 'TVS Ronin'] },
        { name: 'Kawasaki', models: ['Versys 650', 'Z900', 'Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z800', 'Z1000', 'Versys 1000', 'Ninja ZX10R', 'Ninja 1000SX'] },
        { name: 'Harley', models: ['Davidson X440', 'HD Street 750', 'HD 48', 'HD IRON 883', 'HD Sportster S'] },
        { name: 'Benelli', models: ['TRK 250', 'TNT 250', 'TNT 300', 'Imperiale 400', 'TRK 502', 'Leoncio 502', '600i'] },
        { name: 'Aprilia', models: ['RS 457', 'SR 150', 'SR 160'] },
        { name: 'Yezdi', models: ['Adventure', 'Scrambler'] },
        { name: 'Jawa', models: ['Jawa 42', 'Jawa Peark', 'Jawa Standard'] },
        { name: 'Scooters', models: ['Ola Scooter', 'Ather Scooter'] }
      ],
      featured: [
        { title: 'New Arrival Bike Mods', image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'New' }
      ]
    },
    {
      id: 'combos',
      label: 'Combos',
      icon: Package,
      columns: [
        {
          title: 'Combo Collections',
          links: ['General Combos', 'Riding Combo Kit', 'Monsoon Combo', 'Service Combo', 'Touring Combo']
        }
      ],
      featured: [
        { title: 'Best Value Bundles', image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Popular' }
      ]
    },
    {
      id: 'brands',
      label: 'Shop by Brands',
      icon: Star,
      isLink: true,
      onClick: () => handleNavClick('brands')
    },
    {
      id: 'helmets',
      label: 'Helmet & Accessories',
      icon: Shield,
      columns: [
        {
          title: 'Helmets & Tech',
          links: ['Helmet', 'Helmet Accessories', 'Bluetooth Intercoms']
        }
      ],
      featured: [
        { title: 'Premium Bluetooth Intercoms', image: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Premium' }
      ]
    },
    {
      id: 'additional',
      label: 'Other Categories',
      icon: ChevronDown,
      columns: [
        {
          title: 'MOTORCYCLE ACCESSORIES',
          links: [
            'Bike Protection',
            'Handlebar',
            'Electronic',
            'Essentials',
            'Rain Cover',
            'Cameras'
          ]
        },
        {
          title: 'Lighting',
          links: [
            'Auxiliary Light',
            'Headlight',
            'Hazards',
            'Light Accessories'
          ]
        },
        {
          title: 'Riding Gear ',
          links: [
            'Jackets',
            'Jerseys',
            'Pants',
            'Gloves',
            'Boots'
          ]
        },
        {
          title: 'Luggage',
          links: [
            'Racks',
            'Bag and panniers',
            'Jerry can',
            'GPS mount',
            'Air seat'
          ]
        },
        {
          title: 'Performance Parts',
          links: [
            'Air Filter',
            'Brake Pads',
            'Bendpipe',
            'Chain Sprocket',
            'Exhaust',
            'ECU',
            'Spark Plug',
            'Oil Filter'
          ]
        }
      ],
      featured: [
        { title: 'High Performance Lubes', image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Trending' }
      ]
    },
  ];

  const searchCategories = ['All', 'Helmets', 'Gear', 'Accessories', 'Exhausts', 'Luggage'];

  const handleNavClick = (pageId: string, params: string = '') => {
    onNavigate(pageId, params);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products', `?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowMobileSearch(false);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      onNavigate('products', `?search=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) border-b border-zinc-800/80 ${isScrolled
          ? 'bg-zinc-950/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-zinc-950/95 to-zinc-950/80 backdrop-blur-md'
          }`}
      >
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-[56px] px-4">
            <button
               onClick={() => onOpenMenu?.()}
               aria-label="Open Navigation Menu"
               className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-white active:scale-95 touch-manipulation transition-all"
             >
              <Menu size={24} strokeWidth={2} />
            </button>

            <div
              className="flex items-center cursor-pointer group"
              onClick={() => handleNavClick('home')}
            >
              <div className="font-extrabold tracking-tighter text-xl">
                <span className="text-white">MUTANT</span>
                <span className="text-red-600 ml-0.5 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">MODZ</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pr-1">
               <button
                 onClick={() => setShowMobileSearch(true)}
                 aria-label="Open Search"
                 className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors touch-manipulation"
               >
                <Search size={20} />
              </button>
              <button
                onClick={() => isLoggedIn ? setShowUserMenu(!showUserMenu) : setShowLoginPopup(true)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors touch-manipulation"
                aria-label="Account"
              >
                {isLoggedIn ? (
                  <div className="w-8 h-8 sm:w-6 sm:h-6 bg-red-600 rounded-full flex items-center justify-center text-[12px] font-black text-white">
                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                ) : (
                  <User size={20} />
                )}
              </button>
              <button
                onClick={onOpenCart}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors touch-manipulation relative"
                aria-label="Open Cart"
              >
                <ShoppingCart size={20} />
                {totalCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[11px] font-bold w-[20px] h-[20px] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.6)]">
                    {totalCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`hidden lg:block transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-b border-zinc-800/40 ${isScrolled ? 'py-1' : 'py-5'}`}>
          <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12">
            <div className="flex justify-between items-center gap-6">

              <div
                className="flex items-center cursor-pointer group shrink-0"
                onClick={() => handleNavClick('home')}
              >
                <div className={`font-extrabold tracking-tighter transition-all duration-500 ${isScrolled ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>
                  <span className="text-white group-hover:text-red-500 transition-colors duration-300 drop-shadow-md">MUTANT</span>
                  <span className="text-red-600 group-hover:text-white transition-colors duration-300 ml-1 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">MODZ</span>
                </div>
              </div>

              <div className="hidden lg:flex flex-1 max-w-4xl mx-auto relative group z-10">
                <div className={`flex w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/60 rounded-full transition-all duration-400 shadow-inner group-focus-within:bg-zinc-900/80 group-focus-within:border-red-500/50 group-focus-within:shadow-[0_0_20px_rgba(220,38,38,0.15)] ${isScrolled ? 'h-10' : 'h-12'}`}>

                  <div className="relative flex items-center h-full border-r border-zinc-700/60 transition-colors group-focus-within:border-zinc-600">
                    <button
                      className="flex items-center gap-2 px-5 md:px-6 text-[13px] font-bold text-zinc-300 hover:text-white transition-all duration-300 uppercase tracking-tight"
                      onClick={() => setIsSearchCatOpen(!isSearchCatOpen)}
                      aria-label="Select Search Category"
                    >
                      {searchCategory} <ChevronDown size={14} className={`transition-transform duration-300 ${isSearchCatOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isSearchCatOpen && (
                      <div className="absolute top-[120%] left-0 w-40 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        {searchCategories.map(cat => (
                          <button
                            key={cat}
                            className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-red-600/20 hover:pl-5 transition-all duration-300"
                            onClick={() => { setSearchCategory(cat); setIsSearchCatOpen(false); }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSearch} className="relative flex-1 flex items-center h-full">
                    <input
                      type="text"
                      placeholder="Search helmets, riding gear, performance mods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-full bg-transparent text-white text-[15px] pl-5 pr-14 focus:outline-none placeholder-zinc-500 font-medium transition-all duration-300"
                    />
                    <div className="absolute right-3 flex items-center gap-2 text-zinc-400">
                      <button 
                        type="button" 
                        onClick={handleVoiceSearch}
                        aria-label="Voice Search"
                        className={`p-1.5 hover:text-red-500 hover:bg-zinc-800 rounded-full transition-all duration-300 cursor-pointer group/mic ${isListening ? 'text-red-500 bg-red-600/10 animate-pulse' : ''}`}
                      >
                        <Mic size={18} className={`group-hover/mic:scale-110 transition-transform ${isListening ? 'animate-bounce' : ''}`} />
                      </button>
                      <button type="submit" aria-label="Submit Search" className="p-1.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-full transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.2)] hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95">
                        <Search size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="hidden lg:flex items-center space-x-5 shrink-0">
                <button 
                  onClick={() => isLoggedIn ? setShowUserMenu(!showUserMenu) : setShowLoginPopup(true)}
                  aria-label="Account Menu"
                  className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors duration-300 group cursor-pointer relative"
                >
                  <div className="relative p-2 bg-zinc-900/50 rounded-full group-hover:bg-zinc-800 border border-transparent group-hover:border-zinc-700 transition-all duration-300 group-hover:-translate-y-1">
                    {isLoggedIn ? (
                      <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-black text-white">
                        {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    ) : (
                      <User size={20} className="group-hover:text-red-400 transition-colors" />
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">
                    {isLoggedIn ? user?.displayName?.split(' ')[0] || 'Account' : 'Login'}
                  </span>
                  
                  {isLoggedIn && showUserMenu && (
                    <div className="absolute top-full mt-3 right-0 w-48 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-zinc-800">
                        <p className="text-white text-xs font-bold truncate">{user?.displayName}</p>
                        <p className="text-zinc-500 text-[10px] truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); logout(); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-red-500 hover:bg-red-600/10 transition-all text-xs font-bold"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </button>
                <div className="w-px h-8 bg-zinc-800"></div>
                <button
                  onClick={onOpenCart}
                  aria-label="Open Cart"
                  className="flex flex-col items-center gap-1 text-zinc-400 hover:text-white transition-colors duration-300 group cursor-pointer relative"
                >
                  <div className="relative p-2 bg-zinc-900/50 rounded-full group-hover:bg-zinc-800 border border-transparent group-hover:border-zinc-700 transition-all duration-300 group-hover:-translate-y-1 group-hover:animate-[wiggle_1s_ease-in-out_infinite]">
                    <ShoppingCart size={20} className="group-hover:text-red-400 transition-colors" />
                    {totalCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.8)] animate-bounce">
                        {totalCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">Cart</span>
                </button>
              </div>

              <button
                onClick={() => onOpenMenu?.()}
                aria-label="Open Navigation Menu"
                className="hidden lg:flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl bg-red-600 border border-red-500 text-white shadow-[0_0_16px_rgba(220,38,38,0.5)] active:scale-95 touch-manipulation transition-all duration-200"
              >
                <Menu size={24} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative bg-zinc-950/40 backdrop-blur-md mega-menu-container">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-[52px] opacity-100'}`}>

              <div className="flex items-center space-x-2 flex-1 justify-center xl:justify-start overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap px-4">
                {categoriesData.map((cat) => (
                  <div
                    key={cat.id}
                    className="group"
                    onMouseEnter={() => handleMouseEnter(cat.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => cat.isLink ? cat.onClick?.() : setActiveDropdown(activeDropdown === cat.id ? null : cat.id)}
                      className={`flex items-center gap-2 px-5 py-5 text-[13px] xl:text-[14px] font-black tracking-widest uppercase transition-all duration-500 relative group/navlink hover:-translate-y-0.5 ${activeDropdown === cat.id ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                      <cat.icon size={18} className={`transition-all duration-500 group-hover/navlink:scale-125 group-hover/navlink:text-red-500 group-hover/navlink:drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] ${activeDropdown === cat.id ? 'text-red-500' : 'text-zinc-500'}`} />
                      {cat.label}
                      <span className="absolute inset-x-0 inset-y-2 bg-red-600/0 group-hover/navlink:bg-red-600/5 rounded-xl transition-all duration-500 -z-10"></span>
                      <span className={`absolute left-1/2 -translate-x-1/2 bottom-[4px] h-[3px] bg-red-600 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(220,38,38,1)] rounded-full ${activeDropdown === cat.id ? 'w-[70%]' : 'w-0 group-hover:w-[70%]'}`}></span>
                    </button>

                    <div className={`absolute left-0 top-full w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-y border-zinc-800/80 shadow-[0_40px_80px_rgba(0,0,0,0.95)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform origin-top overflow-hidden ${activeDropdown === cat.id ? 'opacity-100 scale-y-100 translate-y-0 visible h-auto pb-4 max-h-[500px]' : 'opacity-0 scale-y-95 -translate-y-4 invisible h-0 pointer-events-none'
                      }`}>
                      <div className="max-w-[1500px] mx-auto px-8 py-10 flex gap-12">
                        <div className="flex flex-1 gap-12 border-r border-zinc-800/50 pr-12">
                          {cat.id === 'bike' && cat.brands ? (
                            <div className="flex w-full gap-8">
                              <div className="w-1/3 border-r border-zinc-800/50 pr-8">
                                <h3 className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">Select Brand</h3>
                                <div className="space-y-1">
                                  {cat.brands.map((brand) => (
                                    <button
                                      key={brand.name}
                                      onMouseEnter={() => setActiveBrand(brand.name)}
                                      onClick={() => handleNavClick('products', `?brand=${encodeURIComponent(brand.name)}`)}
                                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-black uppercase text-[12px] tracking-widest ${activeBrand === brand.name ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                      {brand.name} <ChevronRight size={14} className={activeBrand === brand.name ? 'translate-x-1 opacity-100' : 'opacity-0'} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="flex-1 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
                                <h3 className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6 sticky top-0 bg-transparent backdrop-blur-sm pt-0">Compatible Models</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                  {cat.brands.find(b => b.name === activeBrand)?.models?.map((model) => (
                                    <button
                                      key={model}
                                      onClick={() => handleNavClick('products', `?cat=${encodeURIComponent(model)}`)}
                                      className="text-left text-zinc-300 hover:text-red-500 text-[13px] font-bold transition-colors flex items-center gap-2 group/model"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover/model:opacity-100 transition-all shadow-[0_0_8px_rgba(220,38,38,1)]"></div>
                                      {model}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            cat.columns?.map((col, idx) => (
                              <div key={idx} className="flex-1">
                                <h3 className="text-white font-bold text-[15px] mb-5 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/80 pb-3 group-hover/title:text-red-500">
                                  {idx === 0 ? <cat.icon size={18} className="text-red-500 animate-[pulse_2s_infinite]" /> : <Star size={16} className="text-zinc-500" />}
                                  {col.title}
                                </h3>
                                <ul className="space-y-4">
                                  {col.links.map((link, lIdx) => (
                                    <li key={link} className={`transition-all duration-500 transform ${activeDropdown === cat.id ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`} style={{ transitionDelay: `${(idx * 50) + (lIdx * 30)}ms` }}>
                                      <button
                                        onClick={() => handleNavClick('products', cat.id === 'combos' ? `?cat=combos&comboType=${encodeURIComponent(link)}` : `?cat=${encodeURIComponent(link)}`)}
                                        className="text-zinc-400 hover:text-white text-[15px] font-bold transition-all duration-300 hover:translate-x-3 flex items-center gap-3 group/link"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover/link:opacity-100 transition-all duration-300 shadow-[0_0_8px_rgba(220,38,38,1)]"></div>
                                        {link}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                                {idx === 0 && (
                                  <button onClick={() => handleNavClick('products', cat.id === 'combos' ? '?cat=combos' : '')} className="mt-6 text-sm font-bold text-white hover:text-red-500 flex items-center gap-1 group/all transition-colors">
                                    View all <ArrowRight size={14} className="group-hover/all:translate-x-1 transition-transform" />
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        <div className="w-[30%] grid gap-5">
                          <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-widest pl-2">Featured</h3>
                          {cat.featured?.map((card, fIdx) => (
                            <div key={fIdx}
                              className={`group/card relative cursor-pointer rounded-2xl overflow-hidden hover:shadow-[0_15px_40px_rgba(220,38,38,0.2)] transition-all duration-700 h-48 border border-zinc-800/50 hover:border-red-600/50 transform ${activeDropdown === cat.id ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                              style={{ transitionDelay: `${400 + (fIdx * 100)}ms` }}
                              onClick={() => handleNavClick('products')}
                            >
                              <div className="absolute inset-0 bg-black/50 group-hover/card:bg-black/20 transition-colors duration-500 z-10"></div>
                              <img src={card.image} alt={card.title} className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-700 ease-in-out" />
                              <div className="absolute top-4 right-4 z-20 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-lg">{card.badge}</div>
                              <div className="absolute bottom-0 left-0 w-full p-5 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent transform group-hover/card:translate-y-0 transition-transform duration-500">
                                <span className="text-white font-bold text-lg block group-hover/card:text-red-400 transition-colors">{card.title}</span>
                                <span className="text-red-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-1 opacity-0 translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-500 delay-100">
                                  Shop Now <ArrowRight size={12} />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleNavClick('products', '?cat=garage-sale')}
                className="group relative inline-flex items-center justify-center shrink-0 ml-4 font-bold hidden xl:flex"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-md opacity-70 group-hover:opacity-100 blur transition-opacity duration-500"></div>
                <div className="relative px-5 py-2.5 bg-zinc-950 border border-red-500/50 rounded-md overflow-hidden flex items-center gap-2 group-hover:border-transparent transition-colors duration-500 shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-500/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                  <Flame size={16} className="text-orange-500 group-hover:text-white group-hover:animate-pulse transition-colors duration-300 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                  <span className="text-xs uppercase tracking-widest text-white z-10">Garage Sale</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        <AnnouncementBar />
      </nav>

      {showMobileSearch && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-white/5">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-12 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white text-sm pl-12 pr-4 focus:outline-none focus:border-red-500/50 placeholder-zinc-500"
              />
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            </form>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors touch-manipulation"
            >
              <X size={24} />
            </button>
          </div>
          {/* Quick search suggestions */}
          <div className="p-4 space-y-3">
            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">Popular Searches</p>
            {['Helmets', 'Riding Jackets', 'Crash Guards', 'LED Lights', 'Saddle Bags'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  onNavigate('products', `?search=${encodeURIComponent(term)}`);
                  setShowMobileSearch(false);
                }}
                className="block w-full text-left text-zinc-300 text-sm font-bold py-3 px-4 rounded-xl hover:bg-white/5 transition-colors touch-manipulation active:bg-red-600/10"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Spacer to prevent content from going under the fixed nav */}
      <div className="h-[56px] lg:hidden"></div>
      <div className={`hidden lg:block transition-all duration-400 ${isScrolled ? 'h-[60px]' : 'h-[110px]'}`}></div>
    </>
  );
}
