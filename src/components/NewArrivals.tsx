import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, ShoppingCart } from 'lucide-react';
import { getProducts, getCombos, getGarageSale } from '../utils/storage';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

function CompactMobileCard({ product, onNavigate }: { product: Product; onNavigate: (page: string) => void }) {
  const { addToCart } = useCart();
  const { isLoggedIn, setShowLoginPopup, setPendingAction } = useUserAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    if (!isLoggedIn) {
      setPendingAction(() => () => addToCart(product));
      setShowLoginPopup(true);
      return;
    }
    addToCart(product);
  };

  const imageUrl = product.images && product.images.length > 0 && product.images[0].trim()
    ? product.images[0]
    : 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div
      className="flex-shrink-0 w-44 sm:w-[200px] snap-start bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden flex flex-col touch-manipulation"
      onClick={() => {
        const typeParam = product.is_combo ? '&type=combo' : product.is_garage_sale ? '&type=garage' : '';
        onNavigate(`productDetails?productId=${product.id}${typeParam}`);
      }}
    >
      <div className="relative h-[160px] sm:h-[180px] bg-zinc-800/50 overflow-hidden">
        <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[11px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-wide">
          New
        </div>
      </div>
      <div className="p-3 flex flex-col flex-1">
        {product.brand && <span className="text-red-500 text-[11px] font-black uppercase tracking-widest mb-1">{product.brand}</span>}
        <h4 className="text-white text-[13px] font-bold leading-tight line-clamp-2 mb-2 min-h-[36px]">{product.name}</h4>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-white text-base font-black">{product.price}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all active:scale-95 touch-manipulation mt-auto min-h-[44px] ${product.stock > 0
              ? 'bg-zinc-800 text-white hover:bg-red-600 shadow-lg'
              : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
            }`}
        >
          <ShoppingCart size={14} />
          {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
}

export default function NewArrivals({ onNavigate }: { onNavigate: (page: string, params?: string) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [all, combos, garage] = await Promise.all([
          getProducts(),
          getCombos(),
          getGarageSale()
        ]);

        const combined = [...all, ...combos, ...garage];

        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const sorted = combined
          .filter(p => p.isNew || (p.created_at && new Date(p.created_at) >= tenDaysAgo))
          .sort((a, b) => b.id.localeCompare(a.id))
          .slice(0, 10);

        setProducts(sorted.map(p => ({ ...p, isNew: true })));
      } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
      }
    };
    fetch();
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: dir === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 bg-zinc-950 overflow-hidden">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-end mb-4 sm:mb-8">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase leading-none">
              NEW <span className="text-red-600">ARRIVALS!!</span>
            </h2>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-[8px] sm:text-[10px]">
              Latest gear.
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl active:scale-90"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl active:scale-90"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth-x snap-x snap-mandatory pb-6 -mx-1 px-1"
        >
          {products.map((p) => (
            <CompactMobileCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            onClick={() => onNavigate('products', '?cat=new')}
            className="group flex items-center gap-3 px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-xl"
          >
            See All New <ArrowUpRight size={14} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
