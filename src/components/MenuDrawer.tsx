import { useState, useEffect } from 'react';
import { X, ChevronDown, User, ShoppingCart, Home, Package, Shield, Bike, Phone, Mail, MapPin, Instagram, Facebook, Flame, Star } from 'lucide-react';
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

const AccordionItem = ({ label, icon: Icon, items, brands, onNavigate, isOpen, onToggle }: AccordionItemProps & { brands?: any[] }) => {
  const [openBrand, setOpenBrand] = useState<string | null>(null);

  return (
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
      
      <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[2000px] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
        <div className="grid grid-cols-1 gap-1 pl-12 pr-4">
          {items && items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('products', item.params)}
              className="w-full text-left py-2.5 text-[13px] font-bold text-zinc-500 hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}

          {brands && brands.map((brand) => (
            <div key={brand.name} className="py-1">
              <button
                onClick={() => setOpenBrand(openBrand === brand.name ? null : brand.name)}
                className={`w-full flex items-center justify-between py-2 text-[13px] font-black uppercase tracking-wider ${openBrand === brand.name ? 'text-white' : 'text-zinc-500'}`}
              >
                {brand.name}
                <ChevronDown size={14} className={`transition-transform ${openBrand === brand.name ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openBrand === brand.name ? 'max-h-[1000px] mt-2 mb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-1 gap-2 pl-4 border-l border-white/5">
                  {brand.models.map((model: string) => (
                    <button
                      key={model}
                      onClick={() => onNavigate('products', `?cat=${encodeURIComponent(model)}`)}
                      className="w-full text-left py-1.5 text-[12px] font-bold text-zinc-600 hover:text-white"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
      ]
    },
    {
      id: 'combos', label: 'Combos', icon: Package,
      subs: [
        { label: 'General Combos', params: '?cat=General' },
        { label: 'Riding Combo Kit', params: '?cat=Riding%20Combo%20Kit' },
        { label: 'Monsoon Combo', params: '?cat=Monsoon%20Combo' },
      ]
    },
    {
      id: 'helmets', label: 'Helmet & Accessories', icon: Shield,
      subs: [
        { label: 'Helmet', params: '?cat=Helmet' },
        { label: 'Helmet Accessories', params: '?cat=Helmet%20Accessories' },
        { label: 'Bluetooth Intercoms', params: '?cat=Bluetooth%20Intercoms' },
      ]
    },
    {
      id: 'additional', label: 'Other Categories', icon: ChevronDown,
      subs: [
        { label: 'MOTORCYCLE ACCESSORIES', params: '?cat=MOTORCYCLE%20ACCESSORIES' },
        { label: 'Lighting', params: '?cat=Lighting' },
        { label: 'Lubricants', params: '?cat=Lubricants' },
        { label: 'Performance Parts', params: '?cat=Performance%20Parts' },
        { label: 'Riding Gear', params: '?cat=Riding%20Gear' },
        { label: 'Luggage', params: '?cat=Luggage' },
        { label: 'Apparels', params: '?cat=Apparels' },
        { label: 'Wholesale', params: '?cat=Wholesale' },
      ]
    }
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

            <button onClick={() => handleNav('products', '?cat=new')} className="w-full flex items-center gap-4 py-4 px-2 text-sm font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors border-b border-white/5">
              <Flame size={20} /> New Arrivals!!
            </button>

            <button onClick={() => handleNav('products', '?brands=all')} className="w-full flex items-center gap-4 py-4 px-2 text-sm font-black uppercase tracking-widest text-zinc-300 hover:text-white transition-colors border-b border-white/5">
              <Star size={20} className="text-zinc-500" /> Shop By Brands
            </button>

            {/* Accordion Categories */}
            {categories.map((cat) => (
              <AccordionItem
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                items={(cat as any).subs}
                brands={(cat as any).brands}
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
