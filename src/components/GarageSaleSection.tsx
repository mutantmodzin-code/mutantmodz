import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Zap, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { getGarageSale } from '../utils/storage';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

interface GarageSaleSectionProps {
  onNavigate: (page: string, params?: string) => void;
}


function ProductCard({ product, onNavigate }: { product: Product; onNavigate: (page: string, params?: string) => void }) {
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
    if (!isLoggedIn) {
      setPendingAction(() => () => { addToCart(product); onNavigate('cart'); });
      setShowLoginPopup(true);
      return;
    }
    addToCart(product);
    onNavigate('cart');
  };

  const imageUrl = product.images && product.images.length > 0 && product.images[0].trim()
    ? product.images[0]
    : 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div
      className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[300px] snap-start bg-zinc-900/40 border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 hover:border-orange-500/30 hover:shadow-[0_20px_40px_rgba(249,115,22,0.1)]"
      onClick={() => onNavigate(`productDetails?productId=${product.id}`)}
    >
      <div className="relative h-[160px] sm:h-[250px] overflow-hidden bg-white/5 p-2 sm:p-4 flex items-center justify-center">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 left-4 z-20 bg-orange-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md border border-orange-400/30">
          <Zap size={12} className="fill-current" /> Today Sales
        </div>
        {product.discount_percent && (
            <div className="absolute top-4 right-4 z-20 bg-white text-black text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
                -{product.discount_percent}%
            </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 relative z-20 bg-zinc-900/80 backdrop-blur-sm border-t border-white/5">
        <div className="flex flex-col h-full">
          {product.brand && (
            <span className="text-orange-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2 block">
              {product.brand}
            </span>
          )}

          <h4 className="text-white text-[15px] font-black tracking-tight leading-tight line-clamp-2 mb-4 min-h-[40px] group-hover:text-orange-400 transition-colors uppercase">
            {product.name}
          </h4>

          <div className="flex items-center justify-between mt-auto mb-5">
            <div className="flex flex-col">
              <span className="text-white text-xl font-black">{product.price}</span>
              <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest">Clearance Rate</span>
            </div>
            <div className="text-right">
                <span className="text-zinc-600 line-through text-xs block font-bold">₹{(product.price_num * 1.4).toLocaleString()}</span>
                <span className="text-green-500 text-[9px] font-black uppercase tracking-widest">Save Big</span>
            </div>
          </div>

          {product.stock > 0 ? (
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 bg-zinc-800 border border-white/10 text-white hover:bg-orange-600 hover:border-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
              >
                <ShoppingCart size={14} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 bg-orange-600 text-white hover:bg-orange-500 shadow-lg shadow-orange-600/30"
              >
                <Zap size={14} className="fill-current" />
                Buy Now
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-500 cursor-not-allowed"
            >
              <ShoppingCart size={16} /> Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GarageSaleSection({ onNavigate }: GarageSaleSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const gSale = await getGarageSale();
      setProducts(gSale);
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
    <section className="py-8 sm:py-16 bg-zinc-950 overflow-hidden border-b border-white/5">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-600/5 rounded-full blur-[120px] -translate-y-1/2"></div>
      
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto relative z-10">
        <div className="flex flex-col items-center text-center gap-6 mb-12 sm:mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Zap size={14} className="text-orange-500 fill-current" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Flash Clearance</span>
            </div>
            <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-[0.8]">
              TODAY <span className="text-orange-600">SALES!!</span>
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
              Extreme clearout event. High-performance mods at factory outlet rates. 
              <span className="text-orange-500/60 ml-2">Hardware refresh in progress.</span>
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('products', '?cat=garage-sale')}
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors uppercase text-[10px] font-black tracking-[0.3em]"
            >
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-all active:scale-90"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center text-white hover:bg-orange-600 transition-all active:scale-90"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-8 justify-start md:justify-center lg:justify-center"
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
          
          {/* Final card */}
          <div 
            onClick={() => onNavigate('products', '?cat=garage-sale')}
            className="flex-shrink-0 w-[260px] sm:w-[300px] snap-end bg-orange-600/5 border border-orange-500/20 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 cursor-pointer group hover:bg-orange-600/10 transition-all active:scale-95"
          >
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/40 group-hover:scale-110 transition-transform">
              <ArrowRight size={36} />
            </div>
            <span className="text-white font-black uppercase tracking-[0.3em] text-[10px]">Explore All Deals</span>
          </div>
        </div>
      </div>
    </section>

  );
}
