import { useState, useEffect } from 'react';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface FeaturedGridProps {
  onNavigate: (page: string, params?: string) => void;
}

export default function FeaturedGrid({ onNavigate }: FeaturedGridProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const all = await getProducts();
      // Strictly limit to 4 featured products as requested
      const featured = all
        .filter(p => !p.is_combo && !p.is_garage_sale)
        .slice(0, 4);
      setProducts(featured);
    };
    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-16 bg-zinc-950 relative overflow-hidden">
        {/* Dynamic background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/[0.02] rounded-full blur-[150px] pointer-events-none"></div>

      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto relative z-10">
        
        {/* Optimized Header Area */}
        <div className="mb-8 sm:mb-20">
            <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-lg bg-red-600/10 border border-red-600/20">
                  <PackageSearch size={12} className="text-red-500" />
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">Curated Hardware</span>
                </div>
                <h2 className="text-xl sm:text-5xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-1">
                  OUR <span className="text-red-600">PRODUCTS</span>
                </h2>
                <div className="h-1 w-16 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.8)] mx-auto md:mx-0"></div>
            </div>
        </div>

        {/* Static Grid for exactly 4 products */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10">
          {products.map(p => (
            <ProductCard 
                key={p.id} 
                product={p} 
                onNavigate={onNavigate} 
                className="hover:scale-[1.02] transition-transform duration-500"
            />
          ))}
        </div>
        
        {/* Desktop View All Button */}
        <div className="mt-8 sm:mt-16 flex justify-center">
            <button 
                onClick={() => onNavigate('products')}
                className="group relative inline-flex items-center justify-center gap-4 sm:gap-6 px-8 sm:px-12 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl bg-white text-black font-black uppercase tracking-[0.4em] text-[9px] sm:text-[11px] transition-all duration-500 hover:bg-red-600 hover:text-white shadow-xl active:scale-95 overflow-hidden"
            >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <span className="relative z-10 transition-colors">Complete Collection</span>
                <div className="w-8 h-8 rounded-full bg-black/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </button>
        </div>
      </div>
    </section>
  );
}
