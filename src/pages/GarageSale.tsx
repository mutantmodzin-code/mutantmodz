import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';

export default function GarageSale({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    updatePageSEO(PAGE_SEO['garage-sale']);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const all = await getProducts();
      // Simulate garage sale products - items with low stock or specific markers
      const sale = all.filter(p => p.stock < 5 || (p as any).garage_sale).map(p => ({
        ...p,
        garage_sale: true,
        originalPrice: `₹${(p.price_num * 1.3).toLocaleString('en-IN')}`, // Mock original price
        discount: '30%'
      }));
      setProducts(sale as any);
      setIsLoaded(true);
    };
    fetch();
  }, []);

  return (
    <div className={`min-h-screen bg-zinc-950 pt-44 pb-20 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <section className="relative py-40 px-6 sm:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-red-600/10 blur-[150px] transform -translate-x-1/2 rounded-full"></div>
        <div className="max-w-7xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 bg-orange-600/10 border border-orange-600/20 px-8 py-3 rounded-full mb-4">
            <Flame size={20} className="text-orange-500 animate-pulse" />
            <span className="text-orange-500 text-[12px] font-black uppercase tracking-[0.5em]">Inventory Liquidation</span>
          </div>
          <h1 className="text-7xl sm:text-[12rem] font-black text-white tracking-tighter uppercase leading-none">
            GARAGE <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-orange-800">SALE</span>
          </h1>
          <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-sm max-w-3xl mx-auto leading-relaxed">
            Final hardware clearing protocol. Maximum discounts on elite gear. Limited stock only.
          </p>
        </div>
      </section>

      <section className="py-24 px-6 sm:px-12 bg-black/40 border-y border-white/5">
        <div className="max-w-[1700px] mx-auto">
          {products.length === 0 ? (
            <div className="text-center py-48">
              <span className="text-zinc-600 font-black uppercase tracking-widest text-sm">No clearance units in current sector.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {products.map((p) => (
                <div key={p.id} className="relative group">
                  <div className="absolute -top-4 -left-4 z-30 bg-orange-600 text-white font-black px-6 py-2 rounded-xl text-[12px] rotate-[-5deg] shadow-[0_10px_30px_rgba(234,88,12,0.4)] border border-orange-400">
                    CLEARANCE {(p as any).discount} OFF
                  </div>
                  <ProductCard product={p} onNavigate={onNavigate} />
                  <div className="absolute bottom-40 right-10 text-zinc-500 line-through text-sm font-black z-20">
                    {(p as any).originalPrice}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
