import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

interface BestDealsProps {
  onNavigate: (page: string) => void;
}

function MobileProductCard({ product, onNavigate }: { product: Product; onNavigate: (page: string) => void }) {
  const { addToCart } = useCart();
  const { isLoggedIn, setShowLoginPopup, setPendingAction } = useUserAuth();

  // Mock discount calculation (15-30%)
  const discountPercent = 15 + ((product.id.charCodeAt(0) * 7) % 16);
  const originalPrice = Math.round(product.price_num / (1 - discountPercent / 100));

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
      className="flex-shrink-0 w-[180px] sm:w-[200px] snap-start bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden flex flex-col touch-manipulation"
      onClick={() => onNavigate(`productDetails?productId=${product.id}`)}
    >
      {/* Image area with discount badge */}
      <div className="relative h-[160px] sm:h-[180px] bg-zinc-800/50 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Discount Badge */}
        <div className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-wide">
          Save {discountPercent}%
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        {product.brand && (
          <span className="text-red-500 text-[9px] font-black uppercase tracking-widest mb-1">
            {product.brand}
          </span>
        )}

        {/* Title */}
        <h4 className="text-white text-[13px] font-bold leading-tight line-clamp-2 mb-2 min-h-[36px]">
          {product.name}
        </h4>

        {/* Price Block */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-white text-base font-black">{product.price}</span>
          <span className="text-zinc-500 text-xs font-bold line-through">
            ₹{originalPrice.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 touch-manipulation mt-auto min-h-[44px] ${
            product.stock > 0
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_15px_rgba(220,38,38,0.3)]'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={14} />
          {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
}

export default function BestDeals({ onNavigate }: BestDealsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const all = await getProducts();
      // Pick products with highest stock as "best deals"
      const deals = [...all]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 10)
        .map(p => ({ ...p, isBestSeller: true }));
      setProducts(deals);
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
    <section className="py-8 sm:py-16 bg-zinc-950">
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-6 sm:mb-10">
          <div className="flex items-center gap-3">
            <Flame size={22} className="text-red-600 animate-pulse" />
            <div>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                BEST <span className="text-red-600">DEALS!!</span>
              </h2>
              <p className="text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1">
                Limited time offers on top products
              </p>
            </div>
          </div>
          <div className="hidden sm:flex gap-3">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all shadow-xl active:scale-90"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth-x snap-x snap-mandatory pb-4 -mx-1 px-1"
        >
          {products.map((p) => (
            <MobileProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
}
