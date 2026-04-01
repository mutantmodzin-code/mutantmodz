import { useState, useEffect, useRef } from 'react';
import {
  Menu, Search, Mic, User, ShoppingCart, ChevronDown,
  Bike, Zap, Wrench, Shirt, Briefcase, Shield, Package, Calendar,
  ArrowRight, Flame, Star, ChevronRight, LogOut, Home, LayoutGrid
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

export default function Navigation({ currentPage: _currentPage, onNavigate, onOpenCart, onOpenMenu }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchCategory, setSearchCategory] = useState('All');
  const [isSearchCatOpen, setIsSearchCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>('Royal Enfield');
  const { totalCount } = useCart();
  const { isLoggedIn, user, setShowLoginPopup, logout } = useUserAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

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

  // Complex Mega Menu Structure Data
  const categoriesData = [
    {
      id: 'bike',
      label: 'Shop by Bike',
      icon: Bike,
      isMega: true,
      brands: [
        { 
          name: 'Royal Enfield', 
          models: ['Classic 350', 'Meteor 350', 'Himalayan 450', 'Hunter 350', 'Interceptor 650', 'Continental GT 650', 'Super Meteor 650'] 
        },
        { 
          name: 'KTM', 
          models: ['Duke 125', 'Duke 200', 'Duke 390', 'Adventure 390', 'RC 390'] 
        },
        { 
          name: 'Yamaha', 
          models: ['R15 V3', 'R15 V4', 'MT-15', 'FZ-S', 'Aerox 155'] 
        },
        { 
          name: 'Honda', 
          models: ['CB300R', 'CB350', 'CB500X', 'Hornet 160R', 'CBR 650R'] 
        },
        { 
          name: 'Bajaj', 
          models: ['Pulsar 150', 'Pulsar 220', 'Pulsar NS200', 'Dominar 400'] 
        },
        { 
          name: 'TVS', 
          models: ['Apache RTR 160', 'Apache RTR 200', 'Apache RTX 300', 'Ronin'] 
        },
        { 
          name: 'Suzuki', 
          models: ['Gixxer', 'Gixxer SF', 'V-Strom 250'] 
        },
        { 
          name: 'Hero', 
          models: ['Xpulse 200', 'Xpulse 210'] 
        }
      ],
      featured: [
        { title: 'Himalayan 450 Mods', image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'New' }
      ]
    },
    {
      id: 'super',
      label: 'Super Bikes',
      icon: Zap,
      columns: [
        {
          title: 'Premium Brands',
          links: ['Ducati', 'Kawasaki', 'BMW Motorrad', 'Triumph', 'Aprilia', 'Honda BigWing']
        },
        {
          title: 'Performance Parts',
          links: ['Performance Exhausts', 'Frame Sliders', 'Racing Mirrors', 'Carbon Fiber Parts', 'Racing Levers']
        }
      ],
      featured: [
        { title: 'Track Day Essentials', image: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Hot' }
      ]
    },
    {
      id: 'accessories',
      label: 'Motorcycle Accessories',
      icon: Wrench,
      columns: [
        {
          title: 'Essentials',
          links: ['Mobile Holders', 'LED Lights', 'Mirrors', 'Crash Guards', 'Bike Covers']
        },
        {
          title: 'Add-ons',
          links: ['Engine Guards', 'Windshields', 'USB Chargers', 'Handlebar Accs', 'Number Plates']
        }
      ],
      featured: [
        { title: 'Premium Mounts', image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Top Rated' }
      ]
    },
    {
      id: 'gear',
      label: 'Riding Gear',
      icon: Shirt,
      columns: [
        {
          title: 'Apparel',
          links: ['Riding Jackets', 'Riding Pants', 'Rain Gear', 'Riding Balaclavas']
        },
        {
          title: 'Protection & Wear',
          links: ['Riding Gloves', 'Riding Boots', 'Riding Backpacks', 'Knee Guards', 'Elbow Guards']
        }
      ],
      featured: [
        { title: 'All-Weather Jackets', image: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Bestseller' }
      ]
    },
    {
      id: 'luggage',
      label: 'Luggage & Touring',
      icon: Briefcase,
      columns: [
        {
          title: 'Hard & Soft Luggage',
          links: ['Saddle Bags', 'Tank Bags', 'Tail Bags', 'Top Boxes', 'Side Panniers']
        },
        {
          title: 'Touring Accessories',
          links: ['Waterproof Bags', 'Bungee Cords', 'Cargo Nets', 'Touring Accessories']
        }
      ],
      featured: [
        { title: 'Expedition Saddle Bags', image: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'New' }
      ]
    },
    {
      id: 'helmets',
      label: 'Helmets & Protection',
      icon: Shield,
      columns: [
        {
          title: 'Helmets',
          links: ['Full Face Helmets', 'Modular Helmets', 'Open Face Helmets', 'Off-Road Helmets']
        },
        {
          title: 'Accessories & Armor',
          links: ['Helmet Visors', 'Helmet Locks', 'Helmet Accessories', 'Body Armor', 'Chest Guards']
        }
      ],
      featured: [
        { title: 'Carbon Fiber Series', image: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Premium' }
      ]
    },
    {
      id: 'combos',
      label: 'Combos',
      icon: Package,
      columns: [
        {
          title: 'Bundles',
          links: ['Rider Starter Kits', 'Touring Combo Packs', 'Helmet + Gloves Combos']
        },
        {
          title: 'Special Offers',
          links: ['Riding Gear Bundles', 'Accessory Combo Deals', 'Seasonal Discount Packs']
        }
      ],
      featured: [
        { title: 'Starter Kit: Save 20%', image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Sale' }
      ]
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      columns: [
        {
          title: 'Community',
          links: ['Upcoming Rides', 'Track Days', 'Bike Meetups', 'Riding Workshops']
        },
        {
          title: 'Media',
          links: ['Community Events', 'Brand Launch Events', 'Photo Gallery', 'Event Highlights']
        }
      ],
      featured: [
        { title: 'Track Day 2026', image: 'https://images.pexels.com/photos/2416812/pexels-photo-2416812.jpeg?auto=compress&cs=tinysrgb&w=300', badge: 'Register' }
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
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 cubic-bezier(0.25, 1, 0.5, 1) border-b border-zinc-800/80 ${isScrolled
          ? 'bg-zinc-950/85 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]'
          : 'bg-gradient-to-b from-zinc-950/95 to-zinc-950/80 backdrop-blur-md'
          }`}
      >
        {/* TOP ROW: Logo & Search & Icons */}
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border-b border-zinc-800/40 ${isScrolled ? 'py-1' : 'py-5'}`}>
          <div className="max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12">
            <div className="flex justify-between items-center gap-6">

              {/* Logo */}
              <div
                className="flex items-center cursor-pointer group shrink-0"
                onClick={() => handleNavClick('home')}
              >
                <div className={`font-extrabold tracking-tighter transition-all duration-500 ${isScrolled ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'}`}>
                  <span className="text-white group-hover:text-red-500 transition-colors duration-300 drop-shadow-md">MUTANT</span>
                  <span className="text-red-600 group-hover:text-white transition-colors duration-300 ml-1 drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]">MODZ</span>
                </div>
              </div>

              {/* Large Smart Search Bar (Desktop) */}
              <div className="hidden lg:flex flex-1 max-w-4xl mx-auto relative group z-10">
                <div className={`flex w-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-700/60 rounded-full transition-all duration-400 shadow-inner group-focus-within:bg-zinc-900/80 group-focus-within:border-red-500/50 group-focus-within:shadow-[0_0_20px_rgba(220,38,38,0.15)] ${isScrolled ? 'h-10' : 'h-12'}`}>

                  {/* Category Selector inside search */}
                  <div className="relative flex items-center h-full border-r border-zinc-700/60 transition-colors group-focus-within:border-zinc-600">
                    <button
                      className="flex items-center gap-2 px-5 md:px-6 text-[13px] font-bold text-zinc-300 hover:text-white transition-all duration-300 uppercase tracking-tight"
                      onClick={() => setIsSearchCatOpen(!isSearchCatOpen)}
                    >
                      {searchCategory} <ChevronDown size={14} className={`transition-transform duration-300 ${isSearchCatOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Search Category Dropdown */}
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

                  {/* Input Field */}
                  <form onSubmit={handleSearch} className="relative flex-1 flex items-center h-full">
                    <input
                      type="text"
                      placeholder="Search helmets, riding gear, performance mods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-full bg-transparent text-white text-[15px] pl-5 pr-14 focus:outline-none placeholder-zinc-500 font-medium transition-all duration-300"
                    />
                    {/* Micro-interaction icons inside input */}
                    <div className="absolute right-3 flex items-center gap-2 text-zinc-400">
                      <button type="button" className="p-1.5 hover:text-red-500 hover:bg-zinc-800 rounded-full transition-colors duration-300 cursor-pointer group/mic">
                        <Mic size={18} className="group-hover/mic:scale-110 group-hover/mic:animate-pulse transition-transform" />
                      </button>
                      <button type="submit" className="p-1.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-full transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.2)] hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:scale-105 active:scale-95">
                        <Search size={18} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Icons: User & Cart */}
              <div className="hidden lg:flex items-center space-x-5 shrink-0">
                <button 
                  onClick={() => isLoggedIn ? setShowUserMenu(!showUserMenu) : setShowLoginPopup(true)}
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
                  
                  {/* User Dropdown Menu */}
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

              {/* Desktop & Mobile: Cart + Menu Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenCart}
                  className="relative text-white p-3 bg-zinc-800 rounded-xl border border-zinc-700 active:scale-95 touch-manipulation min-h-[48px] min-w-[48px] flex items-center justify-center"
                  aria-label="Open Cart"
                >
                  <ShoppingCart size={22} />
                  {totalCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                      {totalCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onOpenMenu?.()}
                  aria-label="Open Menu"
                  className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl bg-red-600 border border-red-500 text-white shadow-[0_0_16px_rgba(220,38,38,0.5)] active:scale-95 touch-manipulation transition-all duration-200"
                >
                  <Menu size={24} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Mobile Smart Search (Shows below logo on mobile) */}
            <div className={`lg:hidden w-full mt-3 transition-all duration-500 ${isScrolled ? 'hidden' : 'block'}`}>
              <form onSubmit={handleSearch} className="relative flex w-full bg-zinc-900/60 border border-zinc-800 rounded-full h-11 shadow-inner focus-within:border-red-500/50 transition-colors duration-300">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full bg-transparent text-white text-sm pl-4 pr-10 focus:outline-none placeholder-zinc-500"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors">
                  <Search size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Category Navigation with Mega Menus */}
        <div className="hidden lg:block relative bg-zinc-950/40 backdrop-blur-md mega-menu-container">
          <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-[52px] opacity-100'}`}>

              <div className="flex items-center space-x-2 flex-1 justify-center xl:justify-start">
                {categoriesData.map((cat) => (
                  <div
                    key={cat.id}
                    className="group"
                    onMouseEnter={() => handleMouseEnter(cat.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === cat.id ? null : cat.id)}
                      className={`flex items-center gap-2 px-5 py-5 text-[13px] xl:text-[14px] font-black tracking-widest uppercase transition-all duration-500 relative group/navlink hover:-translate-y-0.5 ${activeDropdown === cat.id ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                      <cat.icon size={18} className={`transition-all duration-500 group-hover/navlink:scale-125 group-hover/navlink:text-red-500 group-hover/navlink:drop-shadow-[0_0_8px_rgba(220,38,38,0.5)] ${activeDropdown === cat.id ? 'text-red-500' : 'text-zinc-500'}`} />
                      {cat.label}
                      {/* Glow Highlight Background */}
                      <span className="absolute inset-x-0 inset-y-2 bg-red-600/0 group-hover/navlink:bg-red-600/5 rounded-xl transition-all duration-500 -z-10"></span>
                      {/* Smooth Underline Animation */}
                      <span className={`absolute left-1/2 -translate-x-1/2 bottom-[4px] h-[3px] bg-red-600 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(220,38,38,1)] rounded-full ${activeDropdown === cat.id ? 'w-[70%]' : 'w-0 group-hover:w-[70%]'}`}></span>
                    </button>

                    {/* Dynamic Mega Menu Dropdown */}
                    <div className={`absolute left-0 top-full w-full bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-y border-zinc-800/80 shadow-[0_40px_80px_rgba(0,0,0,0.95)] transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform origin-top overflow-hidden ${activeDropdown === cat.id ? 'opacity-100 scale-y-100 translate-y-0 visible h-auto pb-4 max-h-[500px]' : 'opacity-0 scale-y-95 -translate-y-4 invisible h-0 pointer-events-none'
                      }`}>
                      <div className="max-w-[1500px] mx-auto px-8 py-10 flex gap-12">
                        {/* Columns Container or Brand/Model Split */}
                        <div className="flex flex-1 gap-12 border-r border-zinc-800/50 pr-12">
                          {cat.id === 'bike' && cat.brands ? (
                            <div className="flex w-full gap-8">
                              {/* Brands List (Left) */}
                              <div className="w-1/3 border-r border-zinc-800/50 pr-8">
                                <h3 className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">Select Brand</h3>
                                <div className="space-y-1">
                                  {cat.brands.map((brand) => (
                                    <button
                                      key={brand.name}
                                      onMouseEnter={() => setActiveBrand(brand.name)}
                                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-black uppercase text-[12px] tracking-widest ${activeBrand === brand.name ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                      {brand.name} <ChevronRight size={14} className={activeBrand === brand.name ? 'translate-x-1 opacity-100' : 'opacity-0'} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {/* Models List (Right) */}
                              <div className="flex-1">
                                <h3 className="text-zinc-500 font-bold text-[10px] uppercase tracking-[0.3em] mb-6">Compatible Models</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                  {cat.brands.find(b => b.name === activeBrand)?.models.map((model) => (
                                    <button
                                      key={model}
                                      onClick={() => handleNavClick('products', `?bike=${encodeURIComponent(model)}`)}
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
                                        onClick={() => handleNavClick('products')}
                                        className="text-zinc-400 hover:text-white text-[15px] font-bold transition-all duration-300 hover:translate-x-3 flex items-center gap-3 group/link"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover/link:opacity-100 transition-all duration-300 shadow-[0_0_8px_rgba(220,38,38,1)]"></div>
                                        {link}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                                {/* 'View All' Link at bottom of first column */}
                                {idx === 0 && (
                                  <button onClick={() => handleNavClick('products')} className="mt-6 text-sm font-bold text-white hover:text-red-500 flex items-center gap-1 group/all transition-colors">
                                    View all <ArrowRight size={14} className="group-hover/all:translate-x-1 transition-transform" />
                                  </button>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {/* Featured Image Cards (Right Sidebar of Mega Menu) */}
                        <div className="w-[30%] grid gap-5">
                          <h3 className="text-zinc-500 font-bold text-xs uppercase tracking-widest pl-2">Featured</h3>
                          {cat.featured.map((card, fIdx) => (
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

              {/* Animated CTA Garage Sale */}
              <button
                onClick={() => handleNavClick('products')}
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

      {/* ── STICKY BOTTOM NAV (Mobile Only) ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/98 border-t border-zinc-800 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-5 h-[60px]">
          <button
            onClick={() => { handleNavClick('home'); }}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-red-500 transition-colors touch-manipulation"
          >
            <Home size={22} strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-wide">Home</span>
          </button>
          <button
            onClick={() => { handleNavClick('products'); }}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-red-500 transition-colors touch-manipulation"
          >
            <Flame size={22} strokeWidth={2} />
            <span className="text-[9px] font-bold uppercase tracking-wide">Shop</span>
          </button>
          {/* Centre Menu Button – oversized for emphasis */}
          <button
            onClick={() => onOpenMenu?.()}
            className="flex flex-col items-center justify-center gap-1 touch-manipulation"
          >
            <div className="flex flex-col items-center justify-center w-13 h-13 w-[52px] h-[52px] rounded-full -mt-4 shadow-[0_-4px_20px_rgba(220,38,38,0.5)] bg-red-600 transition-all duration-300">
              <LayoutGrid size={22} className="text-white" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-400 mt-0.5">Menu</span>
          </button>
          <button
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-red-500 transition-colors touch-manipulation relative"
          >
            <div className="relative">
              <ShoppingCart size={22} strokeWidth={2} />
              {totalCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {totalCount}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wide">Cart</span>
          </button>
          <button
            onClick={() => isLoggedIn ? setShowUserMenu(!showUserMenu) : setShowLoginPopup(true)}
            className="flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-white active:text-red-500 transition-colors touch-manipulation"
          >
            {isLoggedIn ? (
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black text-white">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            ) : (
              <User size={22} strokeWidth={2} />
            )}
            <span className="text-[9px] font-bold uppercase tracking-wide">
              {isLoggedIn ? (user?.displayName?.split(' ')[0] || 'Me') : 'Login'}
            </span>
          </button>
        </div>
      </nav>

      {/* Spacer to prevent content from going under the fixed nav */}
      <div className={`transition-all duration-400 ${isScrolled ? 'h-[70px] sm:h-[68px]' : 'h-[130px] sm:h-[156px]'}`}></div>
    </>
  );
}
