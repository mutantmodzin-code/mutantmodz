import { ShoppingCart, Flame, Shield, ArrowUpRight, Zap, Target } from 'lucide-react';
import { useCart } from '../context/CartContext';

const combos = [
  {
    id: 'c1',
    name: 'Rider Starter Kit',
    items: 'Helmet + Gloves + Balaclava',
    oldPrice: '₹8,499',
    newPrice: '₹6,999',
    save: '₹1,500',
    img: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Essential',
    stock: 5
  },
  {
    id: 'c2',
    name: 'Touring Combo Pack',
    items: 'Saddle Bags + Tank Bag + Bungee Cords',
    oldPrice: '₹12,499',
    newPrice: '₹9,999',
    save: '₹2,500',
    img: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Touring',
    stock: 3
  },
  {
    id: 'c3',
    name: 'Performance Duo',
    items: 'Crash Guard + Phone Mount',
    oldPrice: '₹5,799',
    newPrice: '₹4,499',
    save: '₹1,300',
    img: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Hardware',
    stock: 8
  },
  {
    id: 'c4',
    name: 'Helmet Upgrade Pack',
    items: 'Premium Visor + Anti-Fog Inserts + Cleaning Kit',
    oldPrice: '₹3,299',
    newPrice: '₹2,499',
    save: '₹800',
    img: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Protection',
    stock: 12
  }
];

export default function Combos() {
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <section className="py-32 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
             <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)]"></span>
              <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Operation Synergy</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-none">
              COMBO <span className="text-red-600">DEALS</span>
            </h1>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Maximum hardware efficiency with optimized cost mapping.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {combos.map((c, i) => (
              <div key={i} className="group flex flex-col sm:flex-row bg-zinc-900/40 rounded-[3rem] border border-white/5 overflow-hidden hover:border-red-600/30 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                <div className="w-full sm:w-1/2 overflow-hidden relative min-h-[300px]">
                  <img src={c.img} alt={c.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 flex flex-col gap-2">
                    <div className="flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-lg text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/50">
                      <Target size={14} /> SAVE {c.save}
                    </div>
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex gap-2">
                      <span className="bg-red-600/10 border border-red-600/30 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-500">{c.category} BUNDLE</span>
                    </div>
                    <h3 className="text-3xl font-black text-green tracking-tight uppercase leading-tight text-white group-hover:text-red-500 transition-colors">{c.name}</h3>
                    <p className="text-zinc-500 text-sm font-black uppercase tracking-widest leading-relaxed">{c.items}</p>

                    <div className="flex items-baseline gap-4 pt-4">
                      <span className="text-zinc-600 line-through text-lg font-black">{c.oldPrice}</span>
                      <span className="text-white text-4xl font-black bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">{c.newPrice}</span>
                    </div>
                  </div>

                  <div className="mt-10">
                    <button
                      onClick={() => addToCart({ ...c, price: c.newPrice, price_num: parseInt(c.newPrice.replace(/[^0-9]/g, '')) } as any)}
                       className="w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.2em] text-[11px] group/btn hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95"
                    >
                      Initialize Deployment <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
