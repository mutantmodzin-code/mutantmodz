import { useState, useEffect } from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface CategoryProps {
  onNavigate: (page: string, params?: string) => void;
}

export default function Category({ onNavigate }: CategoryProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      setIsLoaded(true);
    };
    fetchProducts();

    const parseCategoryFromHash = () => {
      const hash = window.location.hash;
      const catMatch = hash.match(/[?&]cat=([^&]+)/);
      if (catMatch) {
        setCategoryName(decodeURIComponent(catMatch[1]));
      }
    };
    parseCategoryFromHash();
    window.addEventListener('hashchange', parseCategoryFromHash);

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => window.removeEventListener('hashchange', parseCategoryFromHash);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCat = categoryName
      ? p.category?.toLowerCase() === categoryName.toLowerCase() ||
        p.name?.toLowerCase().includes(categoryName.toLowerCase()) ||
        (p as any).brand?.toLowerCase() === categoryName.toLowerCase()
      : true;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Get unique categories from products
  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className={`min-h-screen bg-zinc-950 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* Header */}
      <section className="relative py-32 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img
            src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg"
            className="w-full h-full object-cover opacity-15 transform scale-105"
            alt="Background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/80 to-zinc-950"></div>

        <div className="max-w-[1700px] mx-auto px-6 relative z-10">
          {/* Tactical Navigation Row */}
          <div className="pt-32 pb-12 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full border border-zinc-900 flex items-center justify-center group-hover:border-red-600 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-zinc-950">
                <span className="text-[20px] group-hover:-translate-x-1 transition-transform">←</span>
              </div>
              <div className="flex flex-col items-start translate-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1">Back To</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-red-500 transition-colors">Previous Section</span>
              </div>
            </button>
            <div className="hidden sm:flex gap-4">
              <div className="px-5 py-2.5 rounded-xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Inventory State</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span className="text-white text-[11px] font-black uppercase tracking-widest">Active Hunt</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pb-24 space-y-6">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Category Sector</span>
            </div>
            <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tighter leading-none uppercase">
              {categoryName || 'ALL'}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800">PRODUCTS</span>
            </h1>
            <p className="text-zinc-400 text-sm font-bold uppercase tracking-[0.3em]">
              {filteredProducts.length} items found
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter Chips + Search */}
      <section className="sticky top-[73px] z-40 border-y border-white/5 bg-zinc-950/70 backdrop-blur-3xl">
        <div className="max-w-[1700px] mx-auto px-6 py-6 flex flex-col lg:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full lg:w-auto pb-2 lg:pb-0">
            <div className="flex items-center gap-3 text-zinc-500 mr-4 shrink-0 border-r border-white/5 pr-4 py-2">
              <Filter size={16} className="text-red-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-300">Filter</span>
            </div>
            <button
              onClick={() => { setCategoryName(''); onNavigate('category', ''); }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                !categoryName ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'text-zinc-500 hover:text-white bg-white/5'
              }`}
            >
              All
            </button>
            {uniqueCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategoryName(cat); }}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${
                  categoryName.toLowerCase() === cat.toLowerCase()
                    ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                    : 'text-zinc-500 hover:text-white bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-[400px] group">
            <div className="absolute inset-0 bg-red-600/5 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input
              type="text"
              placeholder="SEARCH IN CATEGORY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-14 pr-8 text-[11px] font-black text-white tracking-[0.3em] uppercase focus:outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-700 relative z-10"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors z-20" size={18} />
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-24 px-6 sm:px-12">
        <div className="max-w-[1700px] mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-48 glass-card rounded-[3rem] border border-white/5">
              <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-red-600/10 rounded-full animate-ping"></div>
                <Search size={40} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 font-black text-sm uppercase tracking-[0.3em] mb-8">No products found in this category</p>
              <button
                onClick={() => { setCategoryName(''); setSearchQuery(''); }}
                className="px-10 py-4 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
              {filteredProducts.map((product, index) => (
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
    </div>
  );
}
