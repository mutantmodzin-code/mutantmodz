import { Bike, Shield, Shirt, Wrench, Briefcase, Zap, Package, Calendar, ChevronRight, ArrowRight } from 'lucide-react';

interface CategoriesProps {
  onNavigate: (page: string, params?: string) => void;
}

export default function Categories({ onNavigate }: CategoriesProps) {
  const categories = [
    { 
      id: 'bike', 
      label: 'Shop by Bike', 
      icon: Bike, 
      count: '45+ Models',
      desc: 'Precision parts for Royal Enfield, KTM, Yamaha & more.',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' 
    },
    { 
      id: 'helmets', 
      label: 'Helmets & Safety', 
      icon: Shield, 
      count: '120+ Products',
      desc: 'Full-face, Modular, and Carbon Fiber protection.',
      color: 'bg-red-500/10 text-red-500 border-red-500/20' 
    },
    { 
      id: 'gear', 
      label: 'Riding Gear', 
      icon: Shirt, 
      count: '80+ Jackets',
      desc: 'All-weather jackets, gloves, and protective wear.',
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' 
    },
    { 
      id: 'accessories', 
      label: 'Bike Accessories', 
      icon: Wrench, 
      count: '250+ Items',
      desc: 'LED lights, crash guards, and performance mods.',
      color: 'bg-green-500/10 text-green-500 border-green-500/20' 
    },
    { 
      id: 'luggage', 
      label: 'Luggage & Touring', 
      icon: Briefcase, 
      count: '60+ Bags',
      desc: 'Saddle bags, tank bags, and touring essentials.',
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
    },
    { 
      id: 'super', 
      label: 'Super Bike Parts', 
      icon: Zap, 
      count: '15+ Brands',
      desc: 'Premium upgrades for Ducati, Kawasaki, and BMW.',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
    },
    { 
      id: 'combos', 
      label: 'Combo Packs', 
      icon: Package, 
      count: '20+ Bundles',
      desc: 'Curated kits to save you time and money.',
      color: 'bg-pink-500/10 text-pink-500 border-pink-500/20' 
    },
    { 
      id: 'events', 
      label: 'Community Events', 
      icon: Calendar, 
      count: 'Upcoming',
      desc: 'Join our rides, track days, and workshops.',
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' 
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pt-8 pb-20 px-6 sm:px-12">
      <div className="max-w-[1700px] mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-16 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="w-12 h-px bg-red-600"></span>
            <span className="text-red-500 font-black uppercase tracking-[0.3em] text-[10px]">Product Hierarchy</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none">
            OUR <span className="text-red-600">COLLECTIONS</span>
          </h1>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed">
            Every category has been curated for performance and style. Browse through our massive inventory of authentic motorcycle gear.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div 
              key={cat.id}
              onClick={() => onNavigate(cat.id === 'combos' ? 'products' : 'category', cat.id === 'combos' ? '?cat=combos' : `?type=${cat.id}`)}
              className="group relative bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-10 cursor-pointer overflow-hidden transition-all duration-700 hover:bg-zinc-900 hover:border-red-500/20 hover:-translate-y-2 shadow-2xl"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full translate-x-32 -translate-y-32 group-hover:bg-red-600/10 transition-colors"></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-700 group-hover:rotate-12 group-hover:scale-110 ${cat.color}`}>
                  <cat.icon size={32} strokeWidth={1.5} />
                </div>

                <div className="mt-12 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">
                      {cat.label}
                    </h3>
                    <div className="p-2 bg-zinc-800 rounded-full text-zinc-600 group-hover:text-white group-hover:bg-red-600 transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                  
                  <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest bg-zinc-900/50 inline-block px-3 py-1 rounded-lg border border-white/5">
                    {cat.count}
                  </p>

                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-10 flex items-center gap-2 text-white font-black uppercase tracking-widest text-[10px] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  Explore Now <ArrowRight size={14} className="text-red-500" />
                </div>
              </div>

              {/* Decorative Number */}
              <span className="absolute bottom-6 right-10 text-8xl font-black text-white/5 select-none pointer-events-none group-hover:text-red-600/10 transition-colors">
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
