import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Package, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

interface ComboProductsProps {
  onNavigate: (page: string, params?: string) => void;
}

function ComboProductCard({ product, onNavigate }: { product: Product; onNavigate: (page: string, params?: string) => void }) {
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
      className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 hover:border-sky-500/30 hover:shadow-[0_20px_40px_rgba(14,165,233,0.1)]"
      onClick={() => onNavigate(`productDetails?productId=${product.id}`)}
    >
      <div className="relative h-[200px] sm:h-[240px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-10"></div>
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 z-20 bg-sky-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
          <Package size={12} /> Special Combo
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-20 -mt-10">
        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 shadow-2xl">
          {product.brand && (
            <span className="text-sky-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
              {product.brand}
            </span>
          )}

          <h4 className="text-white text-[15px] font-black tracking-tight leading-tight line-clamp-2 mb-3 min-h-[40px]">
            {product.name}
          </h4>

          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-white text-xl font-black">{product.price}</span>
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Bundle Price</span>
            </div>
            {product.stock > 0 && (
              <div className="bg-green-500/10 text-green-500 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">
                In Stock
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              product.stock > 0
                ? 'bg-white text-black hover:bg-sky-500 hover:text-white shadow-xl hover:shadow-sky-500/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={16} />
            {product.stock > 0 ? 'Claim Offer' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComboProducts({ onNavigate }: ComboProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const all = await getProducts();
      const combos = all.filter(p => p.is_combo);
      setProducts(combos);
    };
    fetchProducts();
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
    <section className="py-12 sm:py-24 bg-zinc-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-600/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
      
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Package size={14} className="text-sky-500" />
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">Curated Bundles</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-[0.8]">
              MONSTER <span className="text-sky-500">COMBOS!!</span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xl">
              Professional upgrade kits designed for peak performance and style. Save big when you mutation in bulk.
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <button 
              onClick={() => onNavigate('products', '?cat=combos')}
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-[0.3em]"
            >
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-sky-600 hover:border-sky-600 transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-sky-600 hover:border-sky-600 transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-8"
        >
          {products.map((p) => (
            <ComboProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
          
          {/* Last View All card */}
          <div 
            onClick={() => onNavigate('products', '?cat=combos')}
            className="flex-shrink-0 w-[200px] snap-end bg-sky-600/5 border border-sky-500/20 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer group hover:bg-sky-600/10 transition-all active:scale-95"
          >
            <div className="w-16 h-16 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/40 group-hover:scale-110 transition-transform">
              <ArrowRight size={30} />
            </div>
            <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Explore More Combos</span>
          </div>
        </div>
      </div>
    </section>
  );
}
