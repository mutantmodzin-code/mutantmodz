import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Zap, Phone } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getProducts, getCombos, getGarageSale, getNewArrivals } from '../utils/storage';
import { Product } from '../types';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';
import ProductCard from '../components/ProductCard';
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProductsProps {
  onNavigate: (page: string) => void;
}

export default function Products({ onNavigate }: ProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [expandedSections, setExpandedSections] = useState<string[]>(['availability', 'price', 'brand', 'product-type']);
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 25000 });

  const availableFilters = useMemo(() => {
    const stats = {
      brands: {} as Record<string, number>,
      types: {} as Record<string, number>,
      maxPrice: 0
    };

    products.forEach(p => {
      const matchesCategory = selectedCategory === 'all' || 
        p.category_name?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase();
        
      if (!matchesCategory) return;

      if (p.brand) {
        const brandLabel = p.brand.trim();
        if (brandLabel) {
          stats.brands[brandLabel] = (stats.brands[brandLabel] || 0) + 1;
        }
      }

      // Priority for Product Type: sub_category_type > category_name > category
      const typeLabel = (p.sub_category_type || p.category_name || p.category || 'Other').trim();
      if (typeLabel) {
        // Normalize for display (Capitalize first letter)
        const displayType = typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1).toLowerCase();
        stats.types[displayType] = (stats.types[displayType] || 0) + 1;
      }
      
      if (p.price_num > stats.maxPrice) stats.maxPrice = p.price_num;
    });

    return stats;
  }, [products, selectedCategory]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [regularData, comboData, garageData] = await Promise.all([
          getProducts(),
          getCombos(),
          getGarageSale()
        ]);
        setProducts([...regularData, ...comboData, ...garageData]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchAllData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updatePageSEO(PAGE_SEO.products);
  }, []);

  useEffect(() => {
    const isNewCat = selectedCategory === 'new' || selectedCategory === 'new arrivals';
    if (!isNewCat) return;
    getNewArrivals().then(data => {
      if (data.length > 0) setProducts(data);
    });
  }, [selectedCategory]);

  useEffect(() => {
    const catKey = selectedCategory.toLowerCase().replace(/[\s-]+/g, '');
    const seoMap: Record<string, string> = {
      'helmets': 'helmets',
      'accessories': 'accessories',
      'gear': 'gear',
      'ridinggear': 'gear',
      'luggage': 'luggage',
      'super': 'super',
      'combos': 'combos',
      'combo': 'combos',
      'garagesale': 'garage-sale',
      'offer': 'garage-sale',
    };
    const seoKey = seoMap[catKey];
    if (seoKey && PAGE_SEO[seoKey]) {
      updatePageSEO(PAGE_SEO[seoKey]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const syncStateWithUrl = () => {
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      
      const search = searchParams.get('search');
      const cat = searchParams.get('cat');
      const brand = searchParams.get('brand');
      const bike = searchParams.get('bike');
      const model = searchParams.get('model');
      const comboType = searchParams.get('comboType');

      if (search) setSearchQuery(decodeURIComponent(search));
      else if (bike) setSearchQuery(decodeURIComponent(bike));
      else if (model) setSearchQuery(decodeURIComponent(model));
      else if (cat && !['helmets', 'accessories', 'gear', 'mods', 'luggage', 'riding gear', 'bike parts', 'lighting', 'performance parts', 'new', 'new arrivals'].includes(decodeURIComponent(cat).toLowerCase())) {
        setSearchQuery(decodeURIComponent(cat));
      } else {
        if (!brand) setSearchQuery('');
      }

      if (brand) {
        setSelectedBrands([decodeURIComponent(brand).toLowerCase()]);
      } else {
        setSelectedBrands([]);
      }

      if (cat) {
        const decodedCat = decodeURIComponent(cat).toLowerCase();
        if (['helmets', 'accessories', 'gear', 'mods', 'luggage', 'riding gear', 'bike parts', 'lighting', 'performance parts', 'new', 'new arrivals', 'garage-sale', 'offer', 'garage sale', 'combos', 'combo'].includes(decodedCat)) {
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
      const matchesCategory = selectedCategory === 'all' || 
        p.category_name?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        p.sub_category_type?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory.toLowerCase() === 'accessories' && (p.sub_category_type?.toLowerCase() === 'motorcycle accessories' || p.category?.toLowerCase() === 'motorcycle accessories')) ||
        (selectedCategory.toLowerCase() === 'riding gear' && (p.sub_category_type?.toLowerCase() === 'riding gear' || p.category_name?.toLowerCase() === 'gear' || p.category?.toLowerCase() === 'riding gear'));

      const matchesSearch = !searchQuery || (() => {
        const terms = searchQuery.toLowerCase().split(/\s+/).filter(t => t.length > 0);
        const searchPool = `${p.name} ${p.description} ${p.brand} ${p.bike_brand} ${p.bike_model} ${p.sub_category} ${p.sub_category_type} ${p.category_name} ${p.category}`.toLowerCase();
        return terms.every(term => searchPool.includes(term));
      })();

      const matchesMultiBrand = selectedBrands.length === 0 || 
        (p.brand && selectedBrands.includes(p.brand.toLowerCase()));

      const matchesType = selectedTypes.length === 0 || 
        (p.sub_category_type && selectedTypes.includes(p.sub_category_type.toLowerCase())) ||
        (p.category_name && selectedTypes.includes(p.category_name.toLowerCase())) ||
        (p.category && selectedTypes.includes(p.category.toLowerCase()));

      const matchesPrice = p.price_num >= priceRange.min && p.price_num <= priceRange.max;

      const matchesAvailability = availabilityFilter === 'all' || 
        (availabilityFilter === 'in-stock' && p.stock > 0) ||
        (availabilityFilter === 'out-of-stock' && p.stock === 0);
        
      return matchesCategory && matchesSearch && matchesMultiBrand && matchesType && matchesPrice && matchesAvailability;
    });
  }, [products, selectedCategory, searchQuery, selectedBrands, selectedTypes, priceRange, availabilityFilter]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price_num || 0) - (b.price_num || 0);
    if (sortBy === 'price-high') return (b.price_num || 0) - (a.price_num || 0);
    if (sortBy === 'newest') return (b.date_added ? new Date(b.date_added).getTime() : 0) - (a.date_added ? new Date(a.date_added).getTime() : 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-zinc-950 pt-16 lg:pt-24 pb-20">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-red-600/20 to-transparent pointer-events-none opacity-40"></div>

      {!isLoaded ? (
        <div className="max-w-[1700px] mx-auto px-6 relative z-10">
          <div className="pt-2 pb-4 flex items-center justify-between animate-pulse">
            <div className="w-32 h-10 bg-zinc-900/50 rounded-full border border-white/5"></div>
            <div className="w-48 h-10 bg-zinc-900/50 rounded-xl hidden sm:block"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-20">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[3/5] bg-zinc-900/40 rounded-[2.5rem] border border-white/5 animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-[1700px] mx-auto px-6 relative z-10 animate-in fade-in duration-1000">
          <div className="pt-2 pb-4 flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className="group flex items-center gap-3 text-white hover:text-red-500 transition-all duration-300 bg-zinc-900/50 pr-4 pl-1.5 py-1.5 rounded-full border border-white/5 hover:border-red-600/50"
            >
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center group-hover:bg-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                <span className="text-[14px] text-white group-hover:text-red-600 transition-colors font-black">←</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Back</span>
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

          <div className="text-center pb-2 space-y-8">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-6 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Official Mutant Collection</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none uppercase mb-3">
              {(selectedCategory === 'all' || selectedCategory === 'new') ? (selectedCategory === 'new' ? 'LATEST' : 'PREMIUM') : selectedCategory} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800">
                {(selectedCategory === 'all' || selectedCategory === 'new') ? (selectedCategory === 'new' ? 'ARRIVALS' : 'MODZ') : 'COLLECTION'}
              </span>
            </h1>
          </div>
        </div>

        <div className="max-w-[1700px] mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 mt-12 pb-20">
          
          {/* DESKTOP STATIONARY SIDEBAR */}
          <aside className="hidden lg:block w-[300px] shrink-0 sticky top-[100px] h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-4">
            <div className="space-y-10">
              <div className="pb-4 border-b border-white/5">
                <h2 className="text-white font-black text-2xl uppercase tracking-tighter">Filters</h2>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Refine Hardware List</p>
              </div>

              {/* Availability Section */}
              <div className="space-y-4">
                <button onClick={() => toggleSection('availability')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                  Availability <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('availability') ? "rotate-180" : "")}>↓</span>
                </button>
                {expandedSections.includes('availability') && (
                  <div className="space-y-3 pt-2">
                    {['all', 'in-stock', 'out-of-stock'].map(val => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer group">
                        <input type="radio" checked={availabilityFilter === val} onChange={() => setAvailabilityFilter(val as any)} className="hidden" />
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", availabilityFilter === val ? "border-red-600" : "border-white/10 group-hover:border-white/30")}>
                          {availabilityFilter === val && <div className="w-2 h-2 bg-red-600 rounded-full" />}
                        </div>
                        <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", availabilityFilter === val ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>{val.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-6">
                <button onClick={() => toggleSection('price')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                  Price <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('price') ? "rotate-180" : "")}>↓</span>
                </button>
                {expandedSections.includes('price') && (
                  <div className="space-y-6 pt-2">
                    <input 
                      type="range" min="0" max="50000" step="1000" value={priceRange.max} 
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full accent-red-600 bg-white/5 h-1 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2">
                        <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Min (₹)</p>
                        <input type="number" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: parseInt(e.target.value) || 0 }))} className="bg-transparent text-white text-xs font-black focus:outline-none w-full" />
                      </div>
                      <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2">
                        <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Max (₹)</p>
                        <input type="number" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: parseInt(e.target.value) || 0 }))} className="bg-transparent text-white text-xs font-black focus:outline-none w-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Brand Section */}
              <div className="space-y-4">
                <button onClick={() => toggleSection('brand')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                  Brand <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('brand') ? "rotate-180" : "")}>↓</span>
                </button>
                {expandedSections.includes('brand') && (
                  <div className="space-y-3 pt-2">
                    {Object.entries(availableFilters.brands).map(([name, count]) => (
                      <label key={name} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedBrands.includes(name.toLowerCase())} onChange={() => setSelectedBrands(prev => prev.includes(name.toLowerCase()) ? prev.filter(b => b !== name.toLowerCase()) : [...prev, name.toLowerCase()])} className="hidden" />
                          <div className={cn("w-4 h-4 border-2 rounded transition-all flex items-center justify-center", selectedBrands.includes(name.toLowerCase()) ? "bg-red-600 border-red-600" : "border-white/10 group-hover:border-white/30")}>
                            {selectedBrands.includes(name.toLowerCase()) && <span className="text-[8px] text-white">✓</span>}
                          </div>
                          <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", selectedBrands.includes(name.toLowerCase()) ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>{name}</span>
                        </div>
                        <span className="text-zinc-700 text-[10px] font-black">({count})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Type Section */}
              <div className="space-y-4">
                <button onClick={() => toggleSection('product-type')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                  Product Type <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('product-type') ? "rotate-180" : "")}>↓</span>
                </button>
                {expandedSections.includes('product-type') && (
                  <div className="space-y-3 pt-2">
                    {Object.entries(availableFilters.types).map(([type, count]) => (
                      <label key={type} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedTypes.includes(type.toLowerCase())} onChange={() => setSelectedTypes(prev => prev.includes(type.toLowerCase()) ? prev.filter(t => t !== type.toLowerCase()) : [...prev, type.toLowerCase()])} className="hidden" />
                          <div className={cn("w-4 h-4 border-2 rounded transition-all flex items-center justify-center", selectedTypes.includes(type.toLowerCase()) ? "bg-red-600 border-red-600" : "border-white/10 group-hover:border-white/30")}>
                            {selectedTypes.includes(type.toLowerCase()) && <span className="text-[8px] text-white">✓</span>}
                          </div>
                          <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", selectedTypes.includes(type.toLowerCase()) ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>{type}</span>
                        </div>
                        <span className="text-zinc-700 text-[10px] font-black">({count})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => { setSelectedBrands([]); setSelectedTypes([]); setPriceRange({ min: 0, max: 25000 }); setAvailabilityFilter('all'); }}
                className="w-full py-4 border border-red-600/20 text-red-600 hover:bg-red-600 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all mt-10"
              >
                Clear Protocols
              </button>
            </div>
          </aside>

          {/* MAIN RESULTS GRID - DRIVER STICKY HEADER FOR MOBILE */}
          <div className="flex-1">
            <section className="sticky top-[56px] lg:top-[73px] z-40 lg:z-10 border-b lg:border-none border-white/5 bg-zinc-950/70 backdrop-blur-3xl lg:bg-transparent lg:backdrop-blur-none mb-8">
              <div className="py-4 lg:py-0 flex flex-row items-center gap-2 sm:gap-4 justify-between lg:justify-end">
                
                {/* Mobile Tablet Filter Accordion Toggle */}
                <div className="lg:hidden relative flex-shrink-0">
                  <button 
                    onClick={() => setShowSortMenu(true)}
                    className="group flex items-center gap-2 h-12 px-4 rounded-xl bg-zinc-900 border border-white/10 text-xs font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                  >
                    <Filter size={14} className="text-red-600" />
                    <span className="text-white">Filter</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                   <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-red-600 transition-colors z-20" size={14} />
                      <input 
                        type="text" 
                        placeholder="SEARCH..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="h-12 w-32 sm:w-48 bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 text-[10px] font-black text-white tracking-widest focus:outline-none focus:border-red-600 transition-all" 
                      />
                   </div>
                   <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-12 bg-zinc-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 rounded-xl focus:outline-none focus:border-red-600"
                  >
                    {sortOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Drawer for Mobile (Detached from sticky header to prevent backdrop-blur z-index trapping) */}
            <div className={cn("fixed inset-0 z-[100] transition-opacity duration-300 pointer-events-none lg:hidden", showSortMenu ? "opacity-100 pointer-events-auto" : "opacity-0")}>
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSortMenu(false)} />
              <div className={cn("absolute top-0 left-0 h-full w-[85%] bg-zinc-950 border-r border-white/5 flex flex-col transition-transform duration-500", showSortMenu ? "translate-x-0" : "-translate-x-full")}>
                <div className="px-8 py-8 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-white font-black text-2xl uppercase tracking-tighter">FILTERS</h2>
                  <button onClick={() => setShowSortMenu(false)} className="p-2 text-zinc-400 hover:text-white"><span className="text-xl">✕</span></button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-0 space-y-10">
                  {/* Availability Section */}
                  <div className="space-y-4">
                    <button onClick={() => toggleSection('availability')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                      Availability <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('availability') ? "rotate-180" : "")}>↓</span>
                    </button>
                    {expandedSections.includes('availability') && (
                      <div className="space-y-3 pt-2">
                        {['all', 'in-stock', 'out-of-stock'].map(val => (
                          <label key={val} className="flex items-center gap-3 cursor-pointer group">
                            <input type="radio" checked={availabilityFilter === val} onChange={() => setAvailabilityFilter(val as any)} className="hidden" />
                            <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", availabilityFilter === val ? "border-red-600" : "border-white/10")}>
                              {availabilityFilter === val && <div className="w-2 h-2 bg-red-600 rounded-full" />}
                            </div>
                            <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", availabilityFilter === val ? "text-white" : "text-zinc-500")}>{val.replace('-', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="space-y-6">
                    <button onClick={() => toggleSection('price')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                      Price <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('price') ? "rotate-180" : "")}>↓</span>
                    </button>
                    {expandedSections.includes('price') && (
                      <div className="space-y-6 pt-2">
                        <div className="px-1">
                          <input 
                            type="range" min="0" max="50000" step="1000" value={priceRange.max} 
                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                            className="w-full accent-red-600 bg-white/5 h-1 rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2">
                            <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Min</p>
                            <input type="number" value={priceRange.min} onChange={e => setPriceRange(p => ({ ...p, min: parseInt(e.target.value) || 0 }))} className="bg-transparent text-white text-[11px] font-black focus:outline-none w-full" />
                          </div>
                          <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-2">
                            <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Max</p>
                            <input type="number" value={priceRange.max} onChange={e => setPriceRange(p => ({ ...p, max: parseInt(e.target.value) || 0 }))} className="bg-transparent text-white text-[11px] font-black focus:outline-none w-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Brand Section */}
                  <div className="space-y-4">
                    <button onClick={() => toggleSection('brand')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                      Brand <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('brand') ? "rotate-180" : "")}>↓</span>
                    </button>
                    {expandedSections.includes('brand') && (
                      <div className="space-y-3 pt-2">
                        {Object.entries(availableFilters.brands).map(([name, count]) => (
                          <label key={name} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={selectedBrands.includes(name.toLowerCase())} onChange={() => setSelectedBrands(prev => prev.includes(name.toLowerCase()) ? prev.filter(b => b !== name.toLowerCase()) : [...prev, name.toLowerCase()])} className="hidden" />
                              <div className={cn("w-4 h-4 border-2 rounded transition-all flex items-center justify-center", selectedBrands.includes(name.toLowerCase()) ? "bg-red-600 border-red-600" : "border-white/10")}>
                                {selectedBrands.includes(name.toLowerCase()) && <span className="text-[8px] text-white">✓</span>}
                              </div>
                              <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", selectedBrands.includes(name.toLowerCase()) ? "text-white" : "text-zinc-500")}>{name}</span>
                            </div>
                            <span className="text-zinc-700 text-[10px] font-black">({count})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Type Section */}
                  <div className="space-y-4">
                    <button onClick={() => toggleSection('product-type')} className="w-full flex items-center justify-between text-white font-bold uppercase tracking-widest text-[11px]">
                      Product Type <span className={cn("text-zinc-600 transition-transform duration-300", expandedSections.includes('product-type') ? "rotate-180" : "")}>↓</span>
                    </button>
                    {expandedSections.includes('product-type') && (
                      <div className="space-y-3 pt-2">
                        {Object.entries(availableFilters.types).map(([type, count]) => (
                          <label key={type} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                              <input type="checkbox" checked={selectedTypes.includes(type.toLowerCase())} onChange={() => setSelectedTypes(prev => prev.includes(type.toLowerCase()) ? prev.filter(t => t !== type.toLowerCase()) : [...prev, type.toLowerCase()])} className="hidden" />
                              <div className={cn("w-4 h-4 border-2 rounded transition-all flex items-center justify-center", selectedTypes.includes(type.toLowerCase()) ? "bg-red-600 border-red-600" : "border-white/10")}>
                                {selectedTypes.includes(type.toLowerCase()) && <span className="text-[8px] text-white">✓</span>}
                              </div>
                              <span className={cn("text-[11px] font-bold uppercase tracking-widest transition-colors", selectedTypes.includes(type.toLowerCase()) ? "text-white" : "text-zinc-500")}>{type}</span>
                            </div>
                            <span className="text-zinc-700 text-[10px] font-black">({count})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => { setSelectedBrands([]); setSelectedTypes([]); setPriceRange({ min: 0, max: 25000 }); setAvailabilityFilter('all'); setShowSortMenu(false); }}
                    className="w-full py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="text-center py-48 bg-zinc-900/10 rounded-[3rem] border border-white/5 border-dashed">
                <Search size={40} className="text-zinc-800 mx-auto mb-6" />
                <p className="text-zinc-600 font-black text-sm uppercase tracking-[0.3em]">Zero matches in this sector</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {sortedProducts.map((product, index) => (
                  <ProductCard key={product.id || index} product={product} onNavigate={onNavigate} />
                ))}
              </div>
            )}
          </div>
        </div>

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
        </>
      )}
    </div>
  );
}
