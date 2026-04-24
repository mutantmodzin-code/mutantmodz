import { useState, useEffect } from 'react';
import {
    Heart,
    Phone,
    ShoppingCart,
    Minus,
    Plus,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Truck,
    RotateCcw,
    ChevronRight,
    Star,
    AlertTriangle,
    Zap
} from 'lucide-react';
import { getProducts, getCombos, getGarageSale } from '../utils/storage';
import { Product } from '../types';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { updatePageSEO, getProductDetailSEO } from '../utils/seo';
import { getMediaUrl } from '../utils/url';

export default function ProductDetails() {
    const [product, setProduct] = useState<Product | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedSize, setSelectedSize] = useState('L');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [mainImage, setMainImage] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const { isLoggedIn, setShowLoginPopup, setPendingAction } = useUserAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            const productId = params.get('productId');
            const productType = params.get('type');

            // Fetch from all potential data sources
            const [standardProducts, comboProducts, garageProducts] = await Promise.all([
                getProducts(),
                getCombos(),
                getGarageSale()
            ]);

            const allFetched = [...standardProducts, ...comboProducts, ...garageProducts];
            setAllProducts(allFetched);

            // Find the product in the combined list with type disambiguation
            let selectedProduct: Product | undefined;
            
            if (productType === 'combo') {
                selectedProduct = comboProducts.find(p => p.id === productId);
            } else if (productType === 'garage') {
                selectedProduct = garageProducts.find(p => p.id === productId);
            } else {
                // Default search: standard first, then others
                selectedProduct = standardProducts.find(p => p.id === productId) ||
                                  allFetched.find(p => p.id === productId);
            }

            // Fallback for numeric ID comparison if string comparison fails
            if (!selectedProduct && productId) {
                selectedProduct = allFetched.find(p => p.id === Number(productId).toString());
            }

            if (selectedProduct) {
                setProduct(selectedProduct);
                setMainImage(getMediaUrl(selectedProduct.image));
                setIsLoaded(true);
                // Dynamic SEO for this specific product
                updatePageSEO(getProductDetailSEO(
                  selectedProduct.name,
                  selectedProduct.category,
                  selectedProduct.price
                ));
            }
        };
        fetchProduct();

        const handleHashChange = () => fetchProduct();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        if (!product || !product.images || product.images.length <= 1) return;
        const filteredImages = product.images.filter(img => img && img.trim() !== '');
        if (filteredImages.length <= 1) return;

        const interval = setInterval(() => {
            setMainImage((current) => {
                const idx = filteredImages.indexOf(current);
                return filteredImages[(idx + 1) % filteredImages.length];
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [product]);

    if (!product) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Accessing Core Data...</p>
                </div>
            </div>
        );
    }

    const galleryImages = product.images && product.images.length > 0
        ? product.images.filter(img => img && img.trim() !== '')
        : [product.image];

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            setPendingAction(() => () => {
                localStorage.setItem('checkout_size', selectedSize);
                localStorage.setItem('checkout_quantity', quantity.toString());
                window.location.hash = `checkout?productId=${product.id}${product.is_combo ? '&type=combo' : product.is_garage_sale ? '&type=garage' : ''}`;
            });
            setShowLoginPopup(true);
            return;
        }
        localStorage.setItem('checkout_size', selectedSize);
        localStorage.setItem('checkout_quantity', quantity.toString());
        window.location.hash = `checkout?productId=${product.id}${product.is_combo ? '&type=combo' : product.is_garage_sale ? '&type=garage' : ''}`;
    };

    const handleAddToCart = () => {
        if (product.stock <= 0) return;
        if (!isLoggedIn) {
            setPendingAction(() => () => {
                addToCart(product, quantity);
                toast.success('Added to cart!', {
                    icon: '🔥',
                    style: { border: '1px solid #dc2626' }
                });
            });
            setShowLoginPopup(true);
            return;
        }
        addToCart(product, quantity);
        toast.success('Added to cart!', {
            icon: '🔥',
            style: { border: '1px solid #dc2626' }
        });
    };

    const handleWhatsAppOrder = () => {
        const message = `Hi Mutant Modz! I'm interested in ordering:
Product: ${product.name}
Quantity: ${quantity}
Size: ${selectedSize || 'N/A'}
Price: ${product.price}
Link: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/919597596755?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className={`min-h-screen bg-zinc-950 pt-32 pb-16 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-[1500px] mx-auto px-4 sm:px-8">

                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-8 sm:mb-12 animate-on-scroll">
                    <button
                        onClick={() => window.history.back()}
                        className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full border border-zinc-900 flex items-center justify-center group-hover:border-red-600 transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back</span>
                    </button>

                    <div className="flex gap-4">
                        <button className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-red-600 transition-all">
                            <Share2 size={18} />
                        </button>
                        <button className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:border-red-600 transition-all">
                            <Heart size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Product Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">

                    {/* Left: Interactive Media Hub */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-8 animate-on-scroll">
                        <div className="relative group bg-zinc-900 rounded-[3rem] p-12 lg:p-24 border border-zinc-800 overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-600/5 via-transparent to-transparent"></div>
                            <img
                                src={getMediaUrl(mainImage)}
                                alt={product.name}
                                className="w-full max-h-[600px] object-contain relative z-10 transition-transform duration-700 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            />

                            {/* Visual Accents */}
                            <div className="absolute top-12 left-12">
                                <span className="text-xs font-black uppercase tracking-[0.5em] block mb-2">Product Overview</span>
                                <div className="h-px w-20 bg-gradient-to-r from-red-600 to-transparent"></div>
                            </div>
                        </div>

                        {/* Thumbnails Matrix */}
                        <div className="grid grid-cols-4 gap-6">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img)}
                                    className={`relative aspect-square rounded-[2rem] overflow-hidden border-2 transition-all p-4 flex items-center justify-center
                                        ${mainImage === img ? 'border-red-600 bg-zinc-900 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'border-zinc-900 bg-zinc-950 hover:border-zinc-700'}`}
                                >
                                    <img src={getMediaUrl(img)} alt={`view ${idx}`} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Spec Controls */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-12 animate-on-scroll">
                        <div className="space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest">
                                    <ShieldCheck size={14} /> Premium Authentic
                                </div>
                                {parseFloat(product.discount_percent?.toString() || '0') > 0 && (
                                    <div className="w-full">
                                        <div className="inline-flex items-center gap-2 bg-white text-red-600 border border-red-600 px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                                            <Zap size={14} fill="currentColor" /> {parseFloat(product.discount_percent?.toString() || '0').toFixed(0)}% OFF DISCOUNT
                                        </div>
                                    </div>
                                )}
                                {product.stock > 0 && product.stock < 10 && (
                                    <div className="inline-flex items-center gap-2 bg-red-600 border border-red-400 px-4 py-2 rounded-xl shadow-lg shadow-red-600/50">
                                        <AlertTriangle size={14} className="text-white" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest">Only {product.stock} items left in stock</span>
                                    </div>
                                )}
                                {product.stock <= 0 && (
                                    <div className="inline-flex items-center gap-2 bg-red-600 border border-red-400 px-4 py-2 rounded-xl shadow-lg shadow-red-600/50">
                                        <AlertTriangle size={14} className="text-white" />
                                        <span className="text-white text-xs font-black uppercase tracking-widest">OUT OF STOCK</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight uppercase">{product.name}</h1>

                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    {parseFloat(product.discount_percent?.toString() || '0') > 0 && (
                                        <div className="text-sm font-bold text-zinc-600 line-through mb-1">
                                            ₹{(product.price_num / (1 - parseFloat(product.discount_percent?.toString() || '0') / 100)).toFixed(2)}
                                        </div>
                                    )}
                                    <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">{product.price}</div>
                                </div>
                                {parseFloat(product.discount_percent?.toString() || '0') > 0 && (
                                    <div className="bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        You Save ₹{( (product.price_num / (1 - parseFloat(product.discount_percent?.toString() || '0') / 100)) - product.price_num ).toFixed(0)}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className="text-red-600 fill-red-600" />)}
                                    <span className="text-zinc-600 text-[10px] font-black uppercase tracking-widest ml-1">VERIFIED REVIEWS</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-10 rounded-[3rem] border border-white/5 space-y-10">
                            {/* Customization Options - Conditional logic */}
                            {(() => {
                                const lowerCat = product.category?.toLowerCase() || '';
                                const lowerName = product.name?.toLowerCase() || '';
                                const lowerType = (product as any).sub_category_type?.toLowerCase() || '';

                                const hasSizes = lowerCat.includes('helmet') || 
                                               lowerCat.includes('helmets') ||
                                               lowerName.includes('helmet') ||
                                               lowerCat.includes('jacket') ||
                                               lowerName.includes('jacket') ||
                                               lowerCat.includes('jersey') ||
                                               lowerName.includes('jersey') ||
                                               lowerType.includes('riding gear');
                                
                                if (hasSizes) {
                                    return (
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Select Size</p>
                                                    <span className="text-red-500 text-xs font-black">FITMENT GUARANTEED</span>
                                                </div>
                                                <div className="flex gap-4">
                                                    {['M', 'L', 'XL'].map(size => (
                                                        <button
                                                            key={size}
                                                            onClick={() => setSelectedSize(size)}
                                                            className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black transition-all border
                                                                ${selectedSize === size ? 'bg-red-600 border-red-600 text-white shadow-xl scale-110' : 'bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-500'}`}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // Accessories don't want scale and color
                                return null;
                            })()}

                            {/* Execution Controls */}
                            <div className="flex flex-col gap-6 pt-10 border-t border-zinc-800/50">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center bg-black/60 rounded-2xl border border-zinc-800 p-2">
                                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white">
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-12 text-center text-white font-black">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white">
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleBuyNow}
                                        disabled={product.stock <= 0}
                                        className={`flex-1 ${product.stock > 0 ? 'bg-red-600 hover:bg-white hover:text-red-600 text-white text-xs' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed text-xs'} py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3`}
                                    >
                                        {product.stock > 0 ? 'Buy Now' : 'Sold Out'} <ArrowRight size={16} />
                                    </button>
                                </div>
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={product.stock <= 0} 
                                    className={`w-full ${product.stock > 0 ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white' : 'bg-zinc-900 border-zinc-900 text-zinc-700 cursor-not-allowed'} py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 border`}
                                >
                                    <ShoppingCart size={16} /> Add to Cart
                                </button>
                                <button 
                                    onClick={handleWhatsAppOrder}
                                    disabled={product.stock <= 0} 
                                    className={`w-full ${product.stock > 0 ? 'bg-[#1ebe5d]/10 text-[#1ebe5d] hover:bg-[#1ebe5d] hover:text-white border-[#1ebe5d]/20' : 'bg-zinc-900 text-zinc-700 border-zinc-900 cursor-not-allowed'} py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all flex items-center justify-center gap-3 border`}
                                >
                                    <Phone size={16} /> WhatsApp Direct Purchase
                                </button>
                            </div>
                        </div>

                        {/* Value Markers */}
                        <div className="grid grid-cols-2 gap-8 border-t border-zinc-900 pt-12">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-red-600 shrink-0">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Fast Shipping</p>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">India Wide Delivery</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-red-600 shrink-0">
                                    <RotateCcw size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase tracking-widest">Support Portal</p>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">30-Day Protocol</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-Section Navigation */}
                <div className="border-b border-zinc-900 mb-20 animate-on-scroll">
                    <div className="flex gap-16">
                        {['description'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-8 font-black uppercase tracking-[0.4em] text-xs transition-all relative
                                    ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dynamic Content Panel */}
                <div className="mb-40 min-h-[400px]">
                    {activeTab === 'description' && (
                        <div className="max-w-4xl space-y-12 animate-on-scroll">
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">{product.name} Engineering Overview</h3>
                                <div className="text-zinc-400 text-base leading-loose font-medium whitespace-pre-wrap">
                                    {product.description || "Technical specifications and engineering details pending for this hardware unit."}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Related Evolution Section */}
                {relatedProducts.length > 0 && (
                    <div className="animate-on-scroll">
                        <div className="flex items-center justify-between mb-16 px-4">
                            <div className="space-y-4">
                                <span className="text-red-600 text-xs font-black uppercase tracking-[0.3em]">Compatible Tech</span>
                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">RELATED <span className="text-zinc-800">HARDWARE</span></h2>
                            </div>
                            <button className="text-white border-b border-red-600 pb-2 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors">
                                EXPLORE MATRIX
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                            {relatedProducts.map((p) => (
                                <a
                                    key={p.id}
                                    href={`#productDetails?productId=${p.id}${p.is_combo ? '&type=combo' : p.is_garage_sale ? '&type=garage' : ''}`}
                                    className="group space-y-4"
                                >
                                    <div className="relative aspect-square bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex items-center justify-center p-6 transition-all duration-500 group-hover:border-red-600/30 group-hover:translate-y-[-5px]">
                                        <img src={getMediaUrl(p.image)} alt={p.name} className="w-full h-full object-contain transition-transform duration-700" />
                                        <button className="absolute top-8 right-8 w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
                                            <Heart size={16} />
                                        </button>
                                        <div className="absolute bottom-8 left-8">
                                            <div className="bg-red-600 px-3 py-1.5 rounded text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                VIEW TECH
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 px-1">
                                        <h3 className="text-xs font-black text-zinc-500 group-hover:text-white transition-colors uppercase tracking-widest truncate">{p.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-white">{p.price}</span>
                                            <ChevronRight className="text-red-600 group-hover:translate-x-1 transition-transform" size={14} />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
