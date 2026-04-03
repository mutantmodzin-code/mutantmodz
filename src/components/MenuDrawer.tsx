import { useState, useEffect } from 'react';
import { X, ChevronDown, User, ShoppingCart, Home, Package, Shield, Wrench, Shirt, Briefcase, Zap, Bike, Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, params?: string) => void;
  onOpenCart: () => void;
}

interface AccordionItemProps {
  label: string;
  icon: any;
  items: { label: string; params: string }[];
  onNavigate: (page: string, params: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem = ({ label, icon: Icon, items, onNavigate, isOpen, onToggle }: AccordionItemProps) => (
  <div className="border-b border-white/5">
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between py-4 px-2 text-sm font-black uppercase tracking-widest transition-colors ${isOpen ? 'text-red-500' : 'text-zinc-300 hover:text-white'}`}
    >
      <div className="flex items-center gap-4">
        <Icon size={20} className={isOpen ? 'text-red-500' : 'text-zinc-500'} />
        {label}
      </div>
      <ChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[500px] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
      <div className="grid grid-cols-1 gap-1 pl-12 pr-4">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate('products', item.params)}
            className="w-full text-left py-2.5 text-[13px] font-bold text-zinc-500 hover:text-white transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default function MenuDrawer({ isOpen, onClose, onNavigate, onOpenCart }: MenuDrawerProps) {
  const { isLoggedIn, logout, setShowLoginPopup } = useUserAuth();
  const { totalCount } = useCart();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const categories = [
    { 
      id: 'bike', label: 'Shop By Bike', icon: Bike,
      subs: [
        { label: 'KTM', params: '?bike=KTM' },
        { label: 'Royal Enfield', params: '?bike=Royal%20Enfield' },
        { label: 'Yamaha', params: '?bike=Yamaha' },
        { label: 'Honda', params: '?bike=Honda' },
        { label: 'Bajaj', params: '?bike=Bajaj' },
        { label: 'TVS', params: '?bike=TVS' },
        { label: 'Suzuki', params: '?bike=Suzuki' },
        { label: 'Hero', params: '?bike=Hero' },
      ]
    },
    { 
      id: 'helmets', label: 'Helmets & Protection', icon: Shield,
      subs: [
        { label: 'Full Face', params: '?search=full+face' },
        { label: 'Modular', params: '?search=modular' },
        { label: 'Open Face', params: '?search=open+face' },
        { label: 'Off-Road', params: '?search=off-road' },
        { label: 'Visors', params: '?search=visor' },
      ]
    },
    { 
      id: 'gear', label: 'Riding Gear', icon: Shirt,
      subs: [
        { label: 'Jackets', params: '?search=jacket' },
        { label: 'Gloves', params: '?search=gloves' },
        { label: 'Pants', params: '?search=pants' },
        { label: 'Boots', params: '?search=boots' },
        { label: 'Rain Gear', params: '?search=rain' },
      ]
    },
    { 
      id: 'accessories', label: 'Motorcycle Accessories', icon: Wrench,
      subs: [
        { label: 'LED Lights', params: '?search=led' },
        { label: 'Crash Guards', params: '?search=guard' },
        { label: 'Mirrors', params: '?search=mirror' },
        { label: 'Mobile Holders', params: '?search=mobile' },
      ]
    },
    { 
      id: 'perf', label: 'Performance Parts', icon: Zap,
      subs: [
        { label: 'Exhausts', params: '?search=exhaust' },
        { label: 'Frame Sliders', params: '?search=slider' },
        { label: 'Racing Levers', params: '?search=lever' },
      ]
    },
    { 
      id: 'luggage', label: 'Luggage & Touring', icon: Briefcase,
      subs: [
        { label: 'Saddle Bags', params: '?search=saddle+bag' },
        { label: 'Tank Bags', params: '?search=tank+bag' },
        { label: 'Tail Bags', params: '?search=tail+bag' },
        { label: 'Top Boxes', params: '?search=top+box' },
      ]
    },
  ];

  const handleNav = (page: string, params?: string) => {
    onNavigate(page, params);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[85%] sm:w-[400px] bg-zinc-950 border-r border-white/5 z-[80] transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950">
          <div className="flex items-center gap-3">
             <div className="font-extrabold tracking-tighter text-lg">
                <span className="text-white">MUTANT</span>
                <span className="text-red-600 ml-1">MODZ</span>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6">
          <div className="px-4 space-y-2">
            
            {/* Main Links */}
            <button onClick={() => handleNav('home')} className="w-full flex items-center gap-4 py-4 px-2 text-sm font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors border-b border-white/5">
              <Home size={20} className="text-zinc-500" /> Home
            </button>

            <button onClick={() => handleNav('combos')} className="w-full flex items-center gap-4 py-4 px-2 text-sm font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors border-b border-white/5">
              <Package size={20} className="text-zinc-500" /> Combos
            </button>

            {/* Accordion Categories */}
            {categories.map((cat) => (
              <AccordionItem
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                items={cat.subs}
                isOpen={openAccordion === cat.id}
                onToggle={() => setOpenAccordion(openAccordion === cat.id ? null : cat.id)}
                onNavigate={handleNav}
              />
            ))}

            {/* User Account / Login */}
            <button 
              onClick={() => { if (!isLoggedIn) setShowLoginPopup(true); else handleNav('payment'); }}
              className="w-full flex items-center gap-4 py-4 px-2 text-sm font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors border-b border-white/5"
            >
              <User size={20} className="text-zinc-500" /> {isLoggedIn ? 'Account Settings' : 'Login / Register'}
            </button>

            <button 
              onClick={() => { onClose(); onOpenCart(); }}
              className="w-full flex items-center justify-between py-4 px-2 text-sm font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-4">
                <ShoppingCart size={20} className="text-zinc-500" /> My Cart
              </div>
              {totalCount > 0 && <span className="bg-red-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{totalCount}</span>}
            </button>
          </div>
        </div>

        {/* Fixed Footer info */}
        <div className="p-6 bg-zinc-900/50 border-t border-white/5 space-y-6">
          <div className="space-y-4">
            <h4 className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-zinc-500 mt-0.5" />
                <p className="text-zinc-400 text-[11px] font-bold leading-relaxed">Uppilipalayam, Coimbatore, TN</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-zinc-500" />
                <p className="text-zinc-400 text-[11px] font-bold">+91 98765 43210</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-zinc-500" />
                <p className="text-zinc-400 text-[11px] font-bold">info@mutantmodz.com</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Facebook size={20} />
            </a>
          </div>

          {isLoggedIn && (
            <button 
              onClick={() => { logout(); onClose(); }}
              className="w-full py-3 text-zinc-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest border border-white/5 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
}
