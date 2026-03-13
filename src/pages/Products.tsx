import { useState, useEffect } from 'react';
import { Shield, Wrench, Shirt, Cog, ShoppingCart, Filter, ArrowUpRight, Search, Zap, CheckCircle, Phone, ShoppingBag } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductsProps {
  onNavigate: (page: string) => void;
}

const ProductImage = ({ images, alt, className }: { images?: string[], alt: string, className?: string }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const imageList = images && images.length > 0
    ? images.filter(img => img && img.trim() !== '')
    : [];

  // Always have at least the placeholder
  const finalList = imageList.length > 0
    ? imageList
    : ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'];

  useEffect(() => {
    if (finalList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % finalList.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [finalList.length]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className ?? ''}`}>
      {finalList.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${alt} ${idx + 1}`}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-in-out"
          style={{
            transform: `translateX(${(idx - currentIdx) * 100}%)`,
            transition: 'transform 700ms cubic-bezier(0.4,0,0.2,1), scale 700ms ease',
            zIndex: idx === currentIdx ? 1 : 0,
          }}
        />
      ))}

      {/* Dot indicators */}
      {finalList.length > 1 && (
        <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5 z-20 pointer-events-none">
          {finalList.map((_, idx) => (
            <div
              key={idx}
              className={`transition-all duration-500 rounded-full ${idx === currentIdx
                  ? 'bg-white w-5 h-1.5 shadow-[0_0_6px_rgba(255,255,255,0.9)]'
                  : 'bg-white/40 w-1.5 h-1.5'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};


export default function Products({ onNavigate }: ProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      setIsLoaded(true);
    };
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const brandMatch = hash.match(/[?&]brand=([^&]+)/);
      if (brandMatch) {
        setSelectedBrand(brandMatch[1].toLowerCase());
      } else {
        setSelectedBrand(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Initial check for URL search params
    const checkUrlParams = () => {
      const searchParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      const search = searchParams.get('search');
      if (search) setSearchQuery(decodeURIComponent(search));
    };
    checkUrlParams();

    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const categories = [
    { id: 'all', name: 'All Manifest', icon: Cog },
    { id: 'helmets', name: 'Ballistic Helmets', icon: Shield },
    { id: 'accessories', name: 'Tech Accessories', icon: Wrench },
    { id: 'gear', name: 'Tactical Gear', icon: Shirt },
    { id: 'mods', name: 'Performance Mods', icon: Zap },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !selectedBrand ||
      p.name.toLowerCase().includes(selectedBrand) ||
      p.description.toLowerCase().includes(selectedBrand) ||
      (p as any).brand?.toLowerCase() === selectedBrand;
    return matchesCategory && matchesSearch && matchesBrand;
  });



  return (
    <div className={`min-h-screen bg-zinc-950 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* Editorial Header Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img
            src="https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg"
            className="w-full h-full object-cover opacity-20 transform scale-105 animate-slow-zoom"
            alt="Background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950"></div>

        <div className="max-w-[1600px] mx-auto relative z-10 px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Operational Manifest 2026</span>
          </div>
          <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter leading-none uppercase mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            ELITE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800">HARDWARE</span>
          </h1>
          <p className="text-lg text-zinc-400 font-bold max-w-2xl mx-auto uppercase tracking-[0.3em] text-[13px] opacity-80 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            High-performance modules engineered for the extreme.
          </p>
          {selectedBrand && (
            <div className="mt-8 inline-flex items-center gap-4 bg-red-600/10 border border-red-600/20 px-6 py-3 rounded-2xl animate-in fade-in zoom-in duration-500">
              <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em]">Sector: {selectedBrand}</span>
              <button
                onClick={() => window.location.hash = 'products'}
                className="text-zinc-500 hover:text-white transition-colors text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-40 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-widest text-white">View Item</span>
          <div className="w-px h-12 bg-gradient-to-b from-red-600 to-transparent"></div>
        </div>
      </section>

      {/* Control Center: Filter Bar */}
      <section className="sticky top-[73px] z-40  border-y border-white/5 bg-zinc-950/70 backdrop-blur-3xl">
        <div className="max-w-[1700px] mx-auto px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-10">

          <div className="flex items-center gap-5 overflow-x-auto no-scrollbar w-full lg:w-auto pb-4 lg:pb-0">
            <div className="flex items-center gap-3 text-zinc-500 mr-6 shrink-0 border-r border-white/5 pr-6 py-2">
              <Filter size={16} className="text-red-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">Classification</span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group overflow-hidden ${selectedCategory === cat.id
                  ? 'text-white'
                  : 'text-zinc-500 hover:text-white bg-white/5'
                  }`}
              >
                {selectedCategory === cat.id && (
                  <div className="absolute inset-0 bg-red-600 transition-all duration-500 animate-in fade-in zoom-in shadow-[0_0_20px_rgba(220,38,38,0.4)]"></div>
                )}
                <cat.icon size={16} className="relative z-10" />
                <span className="relative z-10">{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-[450px] group">
            <div className="absolute inset-0 bg-red-600/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input
              type="text"
              placeholder="SEARCH THE ARSENAL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-5 pl-14 pr-8 text-[11px] font-black text-white tracking-[0.3em] uppercase focus:outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-700 relative z-10"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors z-20" size={18} />
          </div>
        </div>
      </section>

      {/* Grid Assembly */}
      <section className="py-24 px-6 sm:px-12">
        <div className="max-w-[1700px] mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-48 glass-card rounded-[3rem] border border-white/5">
              <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping"></div>
                <Search size={40} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 font-black text-sm uppercase tracking-[0.3em] mb-8">Zero hardware matches found in current sector</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="px-10 py-4 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
              >
                Re-initialize Hunt
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  className="group relative animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="bg-zinc-900/40 backdrop-blur-md rounded-[3rem] overflow-hidden border border-white/5 group-hover:border-red-600/30 transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] flex flex-col h-full">

                    {/* Visual Interface */}
                    <div
                      className="h-80 overflow-hidden relative cursor-pointer group-hover:h-72 transition-all duration-500"
                      onClick={() => onNavigate(`productDetails?productId=${product.id}`)}
                    >
                      <ProductImage images={product.images} alt={product.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent group-hover:from-red-950/40 transition-colors"></div>

                      {/* Price Element */}
                      <div className="absolute bottom-8 left-8 z-20">
                        <div className="bg-white text-zinc-950 px-6 py-3 rounded-2xl text-[20px] font-black shadow-[0_10px_30px_rgba(255,255,255,0.2)] group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:scale-110">
                          {product.price}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="absolute top-8 left-8 flex flex-col gap-2 z-20">
                        {product.stock > 0 ? (
                          <div className="bg-red-600 border border-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-600/50">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                            {product.stock < 10 ? `Only ${product.stock} Left` : 'In Stock'}
                          </div>
                        ) : (
                          <div className="bg-zinc-800 border border-zinc-600 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-zinc-900/50">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Sold Out
                          </div>
                        )}
                      </div>

                      {/* Action Icon: Add to Cart Quick Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.stock > 0) addToCart(product);
                        }}
                        className="absolute top-8 right-8 z-20 w-12 h-12 bg-red-600 border border-red-500 rounded-2xl flex items-center justify-center text-white opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 hover:scale-110 active:scale-95 shadow-lg shadow-red-600/40"
                      >
                        <ShoppingBag size={20} />
                      </button>
                    </div>

                    {/* Data Panel */}
                    <div className="p-10 flex flex-1 flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-500 font-black text-[10px] uppercase tracking-widest border-b border-red-500/20 pb-1">{product.category}</span>
                        </div>
                        <h3 className="text-[22px] font-black text-white group-hover:text-red-500 transition-colors tracking-tight leading-tight uppercase">{product.name}</h3>
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
                            if (product.stock > 0) addToCart(product);
                          }}
                          disabled={product.stock <= 0}
                          className={`w-full relative h-[60px] group/btn overflow-hidden rounded-2xl transition-all duration-500 active:scale-95 ${product.stock > 0 ? 'bg-zinc-800' : 'bg-zinc-900 cursor-not-allowed opacity-50'}`}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Workshop Call-to-Action */}
      <section className="py-40 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600">
          <img
            src="https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay scale-110 group-hover:scale-125 transition-transform duration-1000"
            alt="Workshop"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-transparent to-red-600 opacity-50"></div>

        <div className="max-w-[1200px] mx-auto text-center relative z-10 space-y-12">
          <div className="inline-block px-6 py-2 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-4">Direct Channel</div>
          <h2 className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-none uppercase">
            UPGRADE YOUR <br />
            <span className="text-black inline-block transform -rotate-1 skew-x-1 underline decoration-white decoration-4 underline-offset-8">HARDWARE</span>
          </h2>
          <p className="text-xl text-white font-bold tracking-[0.3em] uppercase max-w-2xl mx-auto leading-relaxed">
            Professional consultation available at Coimbatore customer support.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
            <a
              href="tel:+919342637975"
              className="bg-white text-black px-12 py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-black hover:text-white transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4"
            >
              <Phone size={20} /> +91 93426 37975
            </a>
            <a
              href="https://wa.me/919342637975"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-12 py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-white hover:text-black transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4"
            >
              <Zap size={20} className="text-red-600" /> Secure Protocol
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
