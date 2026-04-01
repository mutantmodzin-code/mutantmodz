import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import ProductCard from './ProductCard';

export default function NewArrivals({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const all = await getProducts();
      // Sort by date or id descending to simulate "new"
      const sorted = [...all].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 8);
      // Mark as new for the badge if not already
      setProducts(sorted.map(p => ({ ...p, isNew: true })));
    };
    fetch();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const amount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: dir === 'left' ? scrollLeft - amount : scrollLeft + amount,
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-28 bg-zinc-950 overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-6 sm:px-12">
        <div className="flex justify-between items-end mb-16 px-4">
          <div className="space-y-4">
            <div className="text-red-500 font-black tracking-[0.4em] text-[10px] uppercase">Just Arrived</div>
            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-none">
              NEW <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900">ARRIVALS</span>
            </h2>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs max-w-sm">
              Fresh products added to our store.
            </p>
          </div>
          <div className="flex gap-4 mb-4">
             <button onClick={() => scroll('left')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-2xl">
              <ChevronLeft size={28} />
            </button>
            <button onClick={() => scroll('right')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-2xl">
              <ChevronRight size={28} />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-10 pb-20 px-4"
        >
          {products.map((p) => (
            <div key={p.id} className="min-w-[320px] sm:min-w-[400px] snap-center">
              <ProductCard product={p} onNavigate={onNavigate} />
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => onNavigate('products?filter=new')}
            className="group flex items-center gap-4 px-10 py-5 sm:px-16 sm:py-8 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-2 active:scale-95 min-h-[56px]"
          >
            See All New Products <ArrowUpRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
