import { useState } from 'react';
import { ShoppingCart, ShoppingBag, ArrowUpRight, CheckCircle, Zap, Flame, Truck, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string) => void;
  className?: string;
}

const ProductImage = ({ images, alt, isHovered }: { images?: string[], alt: string, isHovered: boolean }) => {
  const imageList = images && images.length > 0
    ? images.filter(url => url && url.trim() !== '')
    : [];

  const finalList = imageList.length > 0
    ? imageList
    : ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Primary Image */}
      <img
        src={finalList[0]}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${isHovered && finalList.length > 1 ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
      />
      
      {/* Secondary Image for Hover (Dual Image Hover) */}
      {finalList.length > 1 && (
        <img
          src={finalList[1]}
          alt={`${alt} hover`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out hidden md:block ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        />
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent group-hover:from-red-950/40 transition-colors z-10"></div>
    </div>
  );
};

export default function ProductCard({ product, onNavigate, className = '' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isLoggedIn, setShowLoginPopup, setPendingAction } = useUserAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    if (!isLoggedIn) {
      setPendingAction(() => () => addToCart(product));
      setShowLoginPopup(true);
      return;
    }
    addToCart(product);
  };

  const isNew = product.date_added ? (new Date().getTime() - new Date(product.date_added).getTime()) < 30 * 24 * 60 * 60 * 1000 : false;
  // Fallback for demo if no date_added exists
  const showNewBadge = isNew || (product as any).isNew;
  const isBestSeller = (product as any).isBestSeller;
  const hasFreeShipping = product.price_num > 999 || (product as any).freeShipping;

  const stockStatus = () => {
    if (product.stock === 0) return { label: 'Out of Stock', color: 'bg-zinc-800 text-red-500 border-zinc-700', icon: null };
    if (product.stock >= 1 && product.stock <= 3) return { label: 'Very Low Stock', color: 'bg-red-600 text-white border-red-400', icon: AlertTriangle };
    if (product.stock >= 4 && product.stock <= 10) return { label: 'Low Stock', color: 'bg-orange-600 text-white border-orange-400', icon: AlertTriangle };
    return null;
  };

  const status = stockStatus();
  
  // Calculate original price if discount exists
  const discount = product.discount_percent || 0;
  const currentPrice = product.price_num;
  const originalPrice = discount > 0 ? Math.round(currentPrice / (1 - discount / 100)) : null;

  return (
    <div
      className={`group relative animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col h-full bg-zinc-900/40 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/5 hover:border-red-600/30 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Interface */}
      <div
        className="h-48 sm:h-56 overflow-hidden relative cursor-pointer"
        onClick={() => onNavigate(`productDetails?productId=${product.id}`)}
      >
        <ProductImage images={product.images} alt={product.name} isHovered={isHovered} />

        {/* Status Badges (Top Left) */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-20">
          {status && (
            <div className={`border ${status.color} px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg`}>
              {status.icon && <status.icon size={10} className="text-white" />}
              {status.label}
            </div>
          )}
          {hasFreeShipping && (
            <div className="bg-emerald-600 border border-emerald-400 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Truck size={10} />
              Free Shipping
            </div>
          )}
          {discount > 0 && (
            <div className="bg-red-600 border border-red-400 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              SAVE {Math.round(discount)}%
            </div>
          )}
        </div>

        {/* Marketing Badges (Top Right) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
          {isBestSeller && (
            <div className="bg-zinc-950/80 backdrop-blur-md border border-red-600/50 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Flame size={10} className="text-orange-500" />
              Best Seller
            </div>
          )}
          {showNewBadge && (
            <div className="bg-blue-600 border border-blue-400 text-white px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              New
            </div>
          )}
        </div>

        {/* Quick Add Action (Floating) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={product.stock <= 0}
          className={`absolute bottom-4 right-4 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl ${product.stock > 0 ? 'bg-red-600 border border-red-500 shadow-red-600/40 opacity-100 sm:opacity-0 sm:translate-y-4 sm:group-hover:opacity-100 sm:group-hover:translate-y-0' : 'bg-zinc-800 border border-zinc-700 cursor-not-allowed hidden'}`}
        >
          <ShoppingBag size={18} />
        </button>

        {/* Price Element */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start gap-1">
          {originalPrice && (
            <div className="bg-zinc-950/60 backdrop-blur-md text-zinc-400 px-2 py-0.5 rounded-lg text-[10px] font-bold line-through">
              ₹{originalPrice.toLocaleString()}
            </div>
          )}
          <div className="bg-white text-zinc-950 px-4 py-2 rounded-xl text-[14px] font-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:scale-110">
            {product.price}
          </div>
        </div>
      </div>

      {/* Data Panel */}
      <div className="p-4 sm:p-6 flex flex-1 flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-500 font-black text-[8px] uppercase tracking-widest border-b border-red-500/20 pb-0.5">{product.category}</span>
            {/* Added Bike Info if available */}
            {(product as any).bike_brand && (
              <span className="text-zinc-500 font-black text-[8px] uppercase tracking-widest">| {(product as any).bike_brand}</span>
            )}
          </div>
          <h3 className="text-[15px] font-black text-white group-hover:text-red-500 transition-colors tracking-tight leading-tight uppercase line-clamp-1">{product.name}</h3>
          <p className="text-zinc-500 text-[11px] font-medium leading-relaxed line-clamp-1">{product.description}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <div className="flex items-center gap-1 text-[8px] font-black text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <CheckCircle size={10} className="text-red-600" />
              Certified
            </div>
            <div className="flex items-center gap-1 text-[8px] font-black text-zinc-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
              <Zap size={10} className="text-red-600" />
              Express
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock <= 0}
            className={`w-full relative h-[44px] group/btn overflow-hidden rounded-xl transition-all duration-500 active:scale-95 ${product.stock > 0 ? 'bg-red-600' : 'bg-zinc-900/50 cursor-not-allowed opacity-50'}`}
          >
            <div className={`absolute inset-0 flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-[9px] transition-all duration-500 ${product.stock > 0 ? 'sm:group-hover/btn:-translate-y-full' : ''}`}>
              <ShoppingCart size={14} className="text-white" />
              {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
            </div>
            {product.stock > 0 && (
              <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-[9px] -translate-y-full sm:group-hover/btn:translate-y-0 transition-all duration-500">
                Add to Cart <ArrowUpRight size={14} />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
