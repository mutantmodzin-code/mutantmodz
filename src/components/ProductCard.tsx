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

  return (
    <div
      className={`group relative animate-in fade-in slide-in-from-bottom-8 duration-700 flex flex-col h-full bg-zinc-900/40 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/5 hover:border-red-600/30 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Interface */}
      <div
        className="h-80 overflow-hidden relative cursor-pointer"
        onClick={() => onNavigate(`productDetails?productId=${product.id}`)}
      >
        <ProductImage images={product.images} alt={product.name} isHovered={isHovered} />

        {/* Status Badges (Top Left) */}
        <div className="absolute top-8 left-8 flex flex-col gap-2 z-20">
          {status && (
            <div className={`border ${status.color} px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg`}>
              {status.icon && <status.icon size={12} className="text-white" />}
              {status.label}
            </div>
          )}
          {hasFreeShipping && (
            <div className="bg-emerald-600 border border-emerald-400 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <Truck size={12} />
              Free Shipping
            </div>
          )}
        </div>

        {/* Marketing Badges (Top Right) */}
        <div className="absolute top-8 right-8 flex flex-col gap-2 z-20">
          {isBestSeller && (
            <div className="bg-zinc-950/80 backdrop-blur-md border border-red-600/50 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <Flame size={12} className="text-orange-500" />
              Best Seller
            </div>
          )}
          {showNewBadge && (
            <div className="bg-blue-600 border border-blue-400 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
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
          className={`absolute bottom-8 right-8 z-20 w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 ${product.stock > 0 ? 'bg-red-600 border border-red-500 shadow-red-600/40' : 'bg-zinc-800 border border-zinc-700 cursor-not-allowed hidden'}`}
        >
          <ShoppingBag size={24} />
        </button>

        {/* Price Element */}
        <div className="absolute bottom-8 left-8 z-20">
          <div className="bg-white text-zinc-950 px-6 py-3 rounded-2xl text-[20px] font-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:scale-110">
            {product.price}
          </div>
        </div>
      </div>

      {/* Data Panel */}
      <div className="p-10 flex flex-1 flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500 font-black text-[10px] uppercase tracking-widest border-b border-red-500/20 pb-1">{product.category}</span>
          </div>
          <h3 className="text-[22px] font-black text-white group-hover:text-red-500 transition-colors tracking-tight leading-tight uppercase line-clamp-1">{product.name}</h3>
          <p className="text-zinc-500 text-[13px] font-medium leading-relaxed line-clamp-2">{product.description}</p>

          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <CheckCircle size={12} className="text-red-600" />
              Certified
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <Zap size={12} className="text-red-600" />
              Express
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock <= 0}
            className={`w-full relative h-[60px] group/btn overflow-hidden rounded-2xl transition-all duration-500 active:scale-95 ${product.stock > 0 ? 'bg-zinc-800' : 'bg-zinc-900/50 cursor-not-allowed opacity-50'}`}
          >
            <div className={`absolute inset-0 flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-[11px] transition-all duration-500 ${product.stock > 0 ? 'group-hover/btn:-translate-y-full' : ''}`}>
              <ShoppingCart size={18} className="text-red-600" />
              {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
            </div>
            {product.stock > 0 && (
              <div className="absolute inset-0 bg-red-600 flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-[11px] translate-y-full group-hover/btn:translate-y-0 transition-all duration-500">
                Assemble Order <ArrowUpRight size={16} />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
