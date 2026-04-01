import { useEffect } from 'react';
import { X, ChevronRight, User, ShoppingCart, LogOut, Home, Package, Shield, Wrench, Shirt, Briefcase, Zap, Bike, ArrowRight, Star } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: string) => void;
  onOpenCart: () => void;
}

export default function MenuDrawer({ isOpen, onClose, onNavigate, onOpenCart }: MenuDrawerProps) {
  const { isLoggedIn, user, logout, setShowLoginPopup } = useUserAuth();
  const { totalCount } = useCart();

  // Keyboard accessibility
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const categories = [
    { 
      id: 'bike', label: 'Shop by Bike', icon: Bike, color: 'text-blue-500', bg: 'bg-blue-500/10',
      subs: ['RE Himalayan', 'KTM Duke', 'Yamaha R15']
    },
    { 
      id: 'helmets', label: 'Helmets', icon: Shield, color: 'text-red-500', bg: 'bg-red-500/10',
      subs: ['Full Face', 'Modular', 'Visors']
    },
    { 
      id: 'gear', label: 'Riding Gear', icon: Shirt, color: 'text-orange-500', bg: 'bg-orange-500/10',
      subs: ['Jackets', 'Gloves', 'Pants']
    },
    { 
      id: 'accessories', label: 'Accessories', icon: Wrench, color: 'text-green-500', bg: 'bg-green-500/10',
      subs: ['LED Lights', 'Crash Guards', 'Mirrors']
    },
    { 
      id: 'luggage', label: 'Luggage', icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-500/10',
      subs: ['Saddle Bags', 'Tail Bags']
    },
    { 
      id: 'super', label: 'Super Bikes', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10',
      subs: ['Ducati', 'Kawasaki', 'BMW']
    },
  ];

  const handleNav = (page: string, params?: string) => {
    onNavigate(page, params);
    onClose();
  };

  return (
    <>
      {/* Backdrop with Deep Blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[70] transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Optimized Drawer Container */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] lg:w-[480px] bg-zinc-950/80 backdrop-blur-3xl border-l border-white/10 z-[80] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.8)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Deep Optimization: Background Gradient Glow */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[40%] bg-red-600/30 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[40%] bg-zinc-800/50 blur-[120px] rounded-full"></div>
        </div>

        {/* Header: High Contrast & Identity */}
        <div className="relative sticky top-0 flex items-center justify-between px-8 py-8 lg:py-10 border-b border-white/5 bg-zinc-950/40 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => handleNav('home')}>
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Package size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-[0.2em] text-sm leading-none">Mutant<span className="text-red-500">Modz</span></h2>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">Premium Gear</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-all p-2.5 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/10 group">
            <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>

        {/* Content: Deeply Optimized for Hierarchy */}
        <div className="relative flex-1 overflow-y-auto custom-scrollbar z-10">
          <div className="px-6 py-6 space-y-8">
            
            {/* User Access Card */}
            <button 
              onClick={() => { if (!isLoggedIn) setShowLoginPopup(true); else handleNav('account'); }}
              className="w-full flex items-center gap-5 p-5 bg-gradient-to-br from-zinc-900/50 to-zinc-900/10 rounded-[2rem] border border-white/5 hover:border-red-500/30 transition-all group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-14 h-14 bg-zinc-800/80 rounded-full flex items-center justify-center border border-white/10 group-hover:border-red-500/50 transition-all transform group-hover:scale-105 z-10">
                {isLoggedIn && user?.displayName ? (
                  <span className="text-red-500 font-black text-xl">{user.displayName.charAt(0).toUpperCase()}</span>
                ) : (
                  <User size={28} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                )}
              </div>
              <div className="text-left z-10 flex-1">
                <p className="text-white font-black uppercase tracking-widest text-[13px] group-hover:text-red-500 transition-colors">
                  {isLoggedIn ? user?.displayName : 'Access Account'}
                </p>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.1em] mt-0.5">
                  {isLoggedIn ? 'Settings & History' : 'Login / Register Your Bike'}
                </p>
              </div>
              <ArrowRight size={18} className="text-zinc-700 group-hover:text-red-500 group-hover:translate-x-1 transition-all z-10" />
            </button>

            {/* Optimized Category Grid with Quick-Links */}
            <div className="space-y-6">
              <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
                Collections <span className="flex-1 h-px bg-white/5"></span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="group/item">
                    <button
                      onClick={() => handleNav('category', `?type=${cat.id}`)}
                      className="w-full flex items-center gap-5 p-4 bg-transparent hover:bg-zinc-900/40 rounded-2xl border border-transparent hover:border-white/5 transition-all active:scale-[0.98]"
                      style={{ transitionDelay: `${idx * 40}ms` }}
                    >
                      <div className={`p-3 rounded-xl ${cat.bg} border border-white/5 group-hover/item:scale-110 transition-all duration-500 ${cat.color} group-hover/item:shadow-[0_0_15px_rgba(220,38,38,0.15)]`}>
                        <cat.icon size={22} strokeWidth={1.5} />
                      </div>
                      <div className="text-left flex-1">
                        <span className="text-zinc-200 group-hover/item:text-white font-black uppercase tracking-widest text-xs transition-colors">{cat.label}</span>
                        
                        {/* High Optimization: Quick Sub-links on Desktop */}
                        <div className="hidden lg:flex items-center gap-3 mt-1.5 overflow-hidden">
                          {cat.subs.map((s, i) => (
                            <span key={i} className="text-zinc-600 text-[9px] font-bold uppercase tracking-tight group-hover/item:text-red-600/60 transition-colors flex items-center gap-1">
                              {i > 0 && <span className="w-0.5 h-0.5 rounded-full bg-zinc-800"></span>}
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-zinc-700 group-hover/item:text-red-500 group-hover/item:translate-x-1 transition-all" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Spotlight: Featured Banner */}
            <div 
              className="relative p-6 rounded-[2.5rem] bg-gradient-to-tr from-zinc-900 to-red-950/40 border border-red-500/10 overflow-hidden cursor-pointer group"
              onClick={() => handleNav('category', '?type=super')}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 group-hover:rotate-12 transition-all duration-1000">
                <Star size={80} className="text-red-500" fill="currentColor" />
              </div>
              <div className="relative z-10 flex flex-col gap-3">
                <span className="text-red-500 font-extrabold uppercase tracking-tight text-[10px]">Superbike Performance</span>
                <h4 className="text-white text-xl font-black uppercase tracking-tighter leading-tight">THE RACING <br />PROTOCOLS</h4>
                <div className="flex items-center gap-2 text-white font-black uppercase tracking-[0.2em] text-[9px] mt-2 group-hover:gap-3 transition-all">
                  Shop Curated <ArrowRight size={14} className="text-red-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer: Deep Blur & Separation */}
        <div className="relative p-8 border-t border-white/5 bg-zinc-950/60 backdrop-blur-2xl z-20 space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button 
              onClick={() => handleNav('home')}
              className="flex items-center justify-center gap-2 py-3.5 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Home size={14} /> Home
            </button>
            <button 
              onClick={() => { onClose(); onOpenCart(); }}
              className="flex items-center justify-center gap-2 py-3.5 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest transition-all relative"
            >
              <ShoppingCart size={14} /> Cart
              {totalCount > 0 && <span className="absolute top-[-5px] right-[-5px] bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{totalCount}</span>}
            </button>
          </div>
          
          {isLoggedIn ? (
            <button 
              onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center justify-center gap-3 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-500 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-white/5"
            >
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <button 
              onClick={() => { onClose(); setShowLoginPopup(true); }}
              className="w-full py-5 bg-red-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-red-700 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:translate-y-[-2px] active:translate-y-0"
            >
              Login / Profile
            </button>
          )}
        </div>
      </div>
    </>
  );
}
