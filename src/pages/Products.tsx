import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Zap, Phone } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { brands } from '../data/brands';
import { bikes } from '../components/ShopByBike';

interface ProductsProps {
  onNavigate: (page: string) => void;
}

export default function Products({ onNavigate }: ProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const activeFilterName = selectedBrand || searchQuery;
  const activeBrandInfo = brands.find(b => b.name.toLowerCase() === activeFilterName?.toLowerCase());
  const activeBikeInfo = !activeBrandInfo ? bikes.find(b => b.name.toLowerCase() === activeFilterName?.toLowerCase()) : null;

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
    const syncStateWithUrl = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      
      const search = searchParams.get('search');
      const cat = searchParams.get('cat');
      const brand = searchParams.get('brand');
      const bike = searchParams.get('bike');
      const model = searchParams.get('model');
      
      // Update Search Query
      if (search) setSearchQuery(decodeURIComponent(search));
      else if (bike) setSearchQuery(decodeURIComponent(bike));
      else if (model) setSearchQuery(decodeURIComponent(model));
      else if (cat && !['helmets', 'accessories', 'gear', 'mods', 'luggage', 'riding gear', 'bike parts', 'lighting', 'performance parts', 'new', 'new arrivals'].includes(decodeURIComponent(cat).toLowerCase())) {
        setSearchQuery(decodeURIComponent(cat));
      } else {
        if (!brand) setSearchQuery('');
      }

      // Update Brand
      if (brand) {
        setSelectedBrand(decodeURIComponent(brand).toLowerCase());
      } else {
        setSelectedBrand(null);
      }

      // Update Category
      if (cat) {
        const decodedCat = decodeURIComponent(cat).toLowerCase();
        if (['helmets', 'accessories', 'gear', 'mods', 'luggage', 'riding gear', 'bike parts', 'lighting', 'performance parts', 'new', 'new arrivals'].includes(decodedCat)) {
          setSelectedCategory(decodedCat);
        }
      } else {
        setSelectedCategory('all');
      }
    };

    syncStateWithUrl();
    window.addEventListener('hashchange', syncStateWithUrl);
    return () => window.removeEventListener('hashchange', syncStateWithUrl);
  }, []);

  const sortOptions = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'newest', name: 'Newest Arrivals' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const isNewArrivalRequest = selectedCategory.toLowerCase() === 'new' || selectedCategory.toLowerCase() === 'new arrivals';
      const matchesNew = !isNewArrivalRequest || p.isNew;

      const matchesCategory = isNewArrivalRequest || selectedCategory === 'all' || 
        p.category_name?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.sub_category_type?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory.toLowerCase() === 'accessories' && p.sub_category_type?.toLowerCase() === 'motorcycle accessories') ||
        (selectedCategory.toLowerCase() === 'riding gear' && (p.sub_category_type?.toLowerCase() === 'riding gear' || p.category_name?.toLowerCase() === 'gear'));

      const matchesSearch = !searchQuery || (() => {
        const terms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        const searchPool = `${p.name} ${p.description} ${p.brand} ${p.bike_brand} ${p.bike_model} ${p.sub_category} ${p.sub_category_type}`.toLowerCase();
        return terms.every(term => searchPool.includes(term));
      })();

      const matchesBrand = !selectedBrand ||
        p.name.toLowerCase().includes(selectedBrand) ||
        p.description.toLowerCase().includes(selectedBrand) ||
        p.brand?.toLowerCase() === selectedBrand ||
        p.bike_brand?.toLowerCase() === selectedBrand;
        
      return matchesCategory && matchesSearch && matchesBrand && matchesNew;
    });
  }, [products, selectedCategory, searchQuery, selectedBrand]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return (a.price_num || 0) - (b.price_num || 0);
    }
    if (sortBy === 'price-high') {
      return (b.price_num || 0) - (a.price_num || 0);
    }
    if (sortBy === 'newest') {
      const dateA = a.date_added ? new Date(a.date_added).getTime() : 0;
      const dateB = b.date_added ? new Date(b.date_added).getTime() : 0;
      if (dateA && dateB) return dateB - dateA;
      return parseInt(b.id || '0') - parseInt(a.id || '0');
    }
    return 0;
  });

  return (
    <div className={`min-h-screen bg-zinc-950 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none opacity-30"></div>

      <div className="max-w-[1700px] mx-auto px-6 relative z-10">

        <div className="pt-32 pb-12 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full border border-zinc-900 flex items-center justify-center group-hover:border-red-600 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-zinc-950">
              <span className="text-[18px] group-hover:-translate-x-1 transition-transform">←</span>
            </div>
            <div className="flex flex-col items-start translate-y-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none mb-1">Back To</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-500 transition-colors">Previous Section</span>
            </div>
          </button>
          
          <div className="hidden sm:flex gap-4">
              <div className="px-5 py-2.5 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Inventory State</p>
                 <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <span className="text-white text-[11px] font-black uppercase tracking-widest">Live Updates</span>
                 </div>
              </div>
          </div>
        </div>

        <div className="text-center pb-24 space-y-8">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Official Mutant Collection</span>
          </div>
          
          {activeFilterName && (activeBrandInfo || activeBikeInfo) ? (
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full p-3 sm:p-4 mb-4 shadow-2xl flex items-center justify-center border-2 border-red-600/20">
                  <img 
                    src={activeBrandInfo?.logo || activeBikeInfo?.image} 
                    alt={activeFilterName} 
                    className="w-full h-full object-contain"
                  />
               </div>
               <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tighter leading-none uppercase mb-2">
                 {activeFilterName}
               </h1>
                <p className="text-red-500 font-black uppercase tracking-[0.6em] text-[9px] sm:text-[10px] opacity-80">
                  {activeBrandInfo ? 'Certified Hardware Partner' : 'Precision Components'}
                </p>
            </div>
          ) : (
            <>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none uppercase mb-4">
                {(selectedCategory === 'all' || selectedCategory === 'new') ? (selectedCategory === 'new' ? 'LATEST' : 'PREMIUM') : selectedCategory} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800">
                  {(selectedCategory === 'all' || selectedCategory === 'new') ? (selectedCategory === 'new' ? 'ARRIVALS' : 'MODZ') : 'COLLECTION'}
                </span>
              </h1>
              <p className="text-zinc-500 font-bold max-w-2xl mx-auto uppercase tracking-[0.3em] text-[10px] sm:text-[12px] leading-relaxed">
                {selectedCategory === 'all' 
                  ? 'THE DEFINITIVE ARCHIVE OF HIGH-PERFORMANCE BIKE HARDWARE.'
                  : selectedCategory === 'new'
                  ? 'THE LATEST PERFORMANCE EVOLUTION HAS ARRIVED. ENGINEERED PRECISELY.'
                  : `CURATED ${selectedCategory.toUpperCase()} ENGINEERED FOR PERFORMANCE.`}
              </p>
            </>
          )}

          {(selectedBrand || searchQuery) && (
            <div className="mt-8 inline-flex items-center gap-4 bg-red-600/5 border border-red-600/10 px-5 py-2.5 rounded-xl group">
              <span className="text-red-500 font-black uppercase text-[9px] tracking-[0.3em] group-hover:text-white transition-colors">Sector: {selectedBrand || searchQuery}</span>
              <button
                onClick={() => {
                  window.location.hash = 'products';
                  setSearchQuery('');
                  setSelectedBrand(null);
                }}
                className="text-zinc-600 hover:text-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="sticky top-[73px] z-40 border-y border-white/5 bg-zinc-950/70 backdrop-blur-3xl shadow-2xl">
        <div className="max-w-[1700px] mx-auto px-6 py-6 flex flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="group flex items-center gap-3 px-4 sm:px-8 py-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 hover:border-red-600/50 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden active:scale-95"
            >
              <Filter size={16} className="text-red-600 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-zinc-300 group-hover:text-white hidden sm:inline">Sort By:</span>
              <span className="text-white">{sortOptions.find(o => o.id === sortBy)?.name}</span>
            </button>

            {showSortMenu && (
              <>
                <div 
                  className="fixed inset-0 z-[45]" 
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute top-full left-0 mt-3 w-[260px] bg-zinc-900/95 backdrop-blur-3xl border border-zinc-800 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] py-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="px-6 py-3 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Choose Order</p>
                  </div>
                  {sortOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => { setSortBy(option.id); setShowSortMenu(false); }}
                      className={`w-full text-left px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${
                        sortBy === option.id 
                          ? 'text-red-500 bg-red-600/5' 
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </>
            )}
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

      <section className="py-12 px-6 sm:px-12">
        <div className="max-w-[1700px] mx-auto">
          {sortedProducts.length === 0 ? (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
              {sortedProducts.map((product, index) => (
                <ProductCard 
                  key={product.id || index}
                  product={product}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-40 px-6 sm:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600">
          <img
            src="https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
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
              href="tel:+919597596755"
              className="bg-white text-black px-12 py-7 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-black hover:text-white transition-all transform hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-4"
            >
              <Phone size={20} /> +91 95975 96755
            </a>
            <a
              href="https://wa.me/919597596755"
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
