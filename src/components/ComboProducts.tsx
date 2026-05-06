import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Package, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getCombos } from '../utils/storage';
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    const checkoutParams = `?productId=${product.id}&type=combo`;

    localStorage.removeItem('checkout_size');
    localStorage.setItem('checkout_quantity', '1');

    if (!isLoggedIn) {
      setPendingAction(() => () => onNavigate('checkout', checkoutParams));
      setShowLoginPopup(true);
      return;
    }
    onNavigate('checkout', checkoutParams);
  };

  const imageUrl = product.images && product.images.length > 0 && product.images[0].trim()
    ? product.images[0]
    : 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div
      className="flex-shrink-0 w-44 sm:w-[300px] snap-start bg-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 hover:border-sky-500/30 hover:shadow-[0_20px_40px_rgba(14,165,233,0.1)]"
      onClick={() => onNavigate(`productDetails?productId=${product.id}&type=combo`)}
    >
      <div className="relative h-[150px] sm:h-[260px] overflow-hidden bg-white/5 p-2 sm:p-4 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 z-20 bg-sky-600 text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg shadow-lg uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md border border-sky-400/30">
          <Package size={10} /> Special Combo
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 relative z-20 bg-zinc-900/80 backdrop-blur-sm border-t border-white/5">
        <div className="flex flex-col h-full">
          {product.brand && (
            <span className="text-sky-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 block">
              {product.brand}
            </span>
          )}

          <h4 className="text-white text-[14px] font-black tracking-tight leading-tight line-clamp-2 mb-3 min-h-[36px] group-hover:text-sky-400 transition-colors">
            {product.name}
          </h4>

          <div className="flex items-center justify-between mt-auto mb-4">
            <div className="flex flex-col">
              <span className="text-white text-lg font-black">{product.price}</span>
              <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Bundle Price</span>
            </div>
            {product.stock > 0 && (
              <div className="bg-green-500/10 text-green-500 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border border-green-500/20">
                In Stock
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                product.stock > 0
                  ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/10'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={14} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                product.stock > 0
                  ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-600/20'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Buy Now' : 'Sold Out'}
            </button>
          </div>
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
      const combos = await getCombos();
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
    <section className="py-8 sm:py-16 bg-zinc-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-600/5 rounded-full blur-[120px] -translate-y-1/2"></div>
      
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto relative z-10">
        <div className="flex flex-col items-center text-center gap-6 mb-12 sm:mb-16">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Package size={12} className="text-sky-500" />
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">Curated Bundles</span>
            </div>
            <h2 className="text-xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-[0.8]">
              MONSTER <span className="text-sky-500">COMBOS!!</span>
            </h2>
            <p className="text-zinc-500 text-[9px] sm:text-xs font-bold uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
              Professional upgrade kits.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('products', '?cat=combos')}
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-[0.3em]"
            >
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-sky-600 transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-8 px-1"
        >
          {products.map((p) => (
            <ComboProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
          
          {/* Last View All card */}
          <div 
            onClick={() => onNavigate('products', '?cat=combos')}
            className="flex-shrink-0 w-44 sm:w-[300px] snap-end bg-sky-600/5 border border-sky-500/20 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/40">
              <ArrowRight size={24} />
            </div>
            <span className="text-white font-black uppercase tracking-[0.2em] text-[8px] text-center px-4">Explore More</span>
          </div>
        </div>
      </div>
    </section>

  );
}
