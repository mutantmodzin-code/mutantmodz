import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Search, X } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { bikes } from '../components/ShopByBike';

interface BikeModelsProps {
  onNavigate: (page: string, params?: string) => void;
}

export default function BikeModels({ onNavigate }: BikeModelsProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bikeBrand, setBikeBrand] = useState('');
  const [bikeImage, setBikeImage] = useState('');

  const [productSearch, setProductSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const syncWithUrl = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
      const bike = params.get('bike');
      const model = params.get('model');

      if (bike) {
        setBikeBrand(decodeURIComponent(bike));
        const bikeData = bikes.find(b => b.name.toLowerCase() === decodeURIComponent(bike).toLowerCase());
        if (bikeData) setBikeImage(bikeData.image);
      }
      setSelectedModel(model ? decodeURIComponent(model) : null);
    };

    fetchProducts();
    syncWithUrl();
    window.addEventListener('hashchange', syncWithUrl);
    return () => window.removeEventListener('hashchange', syncWithUrl);
  }, []);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.bike_brand?.toLowerCase() === bikeBrand.toLowerCase()) {
        if (p.category) cats.add(p.category);
      }
    });
    return Array.from(cats).sort();
  }, [products, bikeBrand]);

  const bikeModelsMapping: Record<string, string[]> = {
    // ... same as before
    'KTM': ['390/250 Adventure X', 'Gen 3 Duke 390', 'Duke 125', 'RC 125', 'RC 200', 'Duke 200', 'Duke 250', 'ADV 250', 'RC 390', 'Adv 390', 'Duke 390', 'Duke 790'],
    'Royal Enfield': ['Himalayan 450', 'Bear 650', 'Guerrilla 450', 'Himalayan', 'Himalayan Scram 411', 'Shotgun 650', 'Interceptor 650', 'Continental Gt 650', 'Hunter 350', 'Classic 350', 'Thunderbird 350', 'Meteor 650', 'Meteor 350', 'Classic 350 Reborn', 'Thunderbird-x', 'Classic 500', 'Bullet 350', 'Bullet 500', 'Thunderbird 500'],
    'Yamaha': ['Aerox 155', 'R15 v2', 'R15 v3', 'R15 v4', 'R15 M', 'MT-15', 'FZ-25', 'Fazer-250', 'Yamaha YZF R3'],
    'Honda': ['Honda NX-500', 'Honda X Blade', 'Honda CB200x', 'Honda CBR 250R', 'Honda CB300R', 'Honda CF300F', 'Honda H\'ness CB350', 'Honda CB350RS', 'Honda CB 500X', 'Honda CB650R', 'Honda CBR650F', 'Honda CB1000R', 'Honda CBR 1000RR Fireblade', 'Honda African Twin', 'Honda Gold Wing', 'Honda XL750 Transalp'],
    'Hero': ['Xpulse 210', 'Xpulse 200', 'Xtreme 160', 'Xpulse 200 4V', 'Xpulse 200T', 'Xtreme 200S', 'Xpulse 2004v Rally Edition'],
    'Suzuki': ['V Strom 250 XS', 'V Strom 650', 'V Strom 1000', 'Burgman Street 125', 'Gixxer SF 250', 'Hayabusa'],
    'Triumph': ['Speed 400', 'Scrambler 400X', 'Street Triple'],
    'Bajaj': ['NS 160', 'NS 200', 'RS 200', 'Avenger', 'Pulsar 150', 'Pulsar 180', 'Pulsar 220', 'Dominar 250', 'Dominar 400'],
    'BMW': ['BMW G310 GS', 'BMW G310R', 'BMW G310RR'],
    'TVS': ['Ntorq', 'Apache RTR 160', 'RTR 160 4V', 'RR 310', 'TVS Ronin'],
    'Kawasaki': ['Versys 650', 'Z900', 'Ninja 300', 'Ninja 400', 'Ninja 650', 'Z650', 'Z800', 'Z1000', 'Versys 1000', 'Ninja ZX10R', 'Ninja 1000SX'],
    'Harley': ['Davidson X440', 'HD Street 750', 'HD 48', 'HD IRON 883', 'HD Sportster S'],
    'Benelli': ['TRK 250', 'TNT 250', 'TNT 300', 'Imperiale 400', 'TRK 502', 'Leoncio 502', '600i'],
    'Aprilia': ['RS 457', 'SR 150', 'SR 160'],
    'Yezdi': ['Adventure', 'Scrambler'],
    'Jawa': ['Jawa 42', 'Jawa Peark', 'Jawa Standard'],
    'Scooters': ['Ola Scooter', 'Ather Scooter'],
    'Ducati': ['Monster', 'Scrambler 800', 'Panigale V2', 'Panigale V4', 'Multistrada V4', 'Streetfighter V4']
  };

  const models = useMemo(() => {
    const bikeModels = new Set<string>();
    products.forEach(p => {
      if (p.bike_brand?.toLowerCase() === bikeBrand.toLowerCase() && p.bike_model) {
        bikeModels.add(p.bike_model);
      }
    });
    const mappingKey = Object.keys(bikeModelsMapping).find(k => k.toLowerCase() === bikeBrand.toLowerCase());
    const mappedModels = mappingKey ? bikeModelsMapping[mappingKey] : [];
    mappedModels.forEach(m => bikeModels.add(m));
    return Array.from(bikeModels).sort();
  }, [products, bikeBrand]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesBrand = p.bike_brand?.toLowerCase() === bikeBrand.toLowerCase();
      const matchesModel = !selectedModel || p.bike_model?.toLowerCase() === selectedModel.toLowerCase();
      const matchesCategory = activeCategory === 'all' || p.category?.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = !productSearch || 
        p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
        p.description.toLowerCase().includes(productSearch.toLowerCase());
      return matchesBrand && matchesModel && matchesCategory && matchesSearch;
    });
  }, [products, bikeBrand, selectedModel, activeCategory, productSearch]);

  const handleModelSelect = (model: string | null) => {
    setSelectedModel(model);
    const params = new URLSearchParams();
    params.set('bike', bikeBrand);
    if (model) params.set('model', model);
    window.location.hash = `bike-models?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-16 sm:pt-20 pb-20">
      {/* Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-red-600/10 via-red-600/5 to-transparent pointer-events-none opacity-40"></div>

      <div className="max-w-[1700px] mx-auto px-6 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="group flex items-center gap-3 text-white hover:text-red-500 transition-all duration-300 bg-zinc-900/50 pr-4 pl-1.5 py-1.5 rounded-full border border-white/5 hover:border-red-600/50 mb-8 sm:mb-12"
        >
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center group-hover:bg-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <ChevronLeft size={18} className="text-white group-hover:text-red-600 transition-colors" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white">Back to Home</span>
        </button>

        {/* Central Bike Image and Info */}
        <div className="flex flex-col items-center mb-10 sm:mb-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600/20 blur-[120px] group-hover:bg-red-600/30 transition-all duration-500"></div>
            <img 
              src={bikeImage ? encodeURI(bikeImage) : 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800'} 
              alt={bikeBrand} 
              className="relative w-56 h-56 sm:w-80 sm:h-80 object-contain filter drop-shadow-[0_20px_60px_rgba(220,38,38,0.4)] group-hover:scale-105 transition-transform duration-700 mt-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800';
              }}
            />
          </div>
          <div className="text-center mt-4 sm:mt-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none text-glow shadow-red-600/20">
              {bikeBrand}
            </h1>
            <p className="text-red-600 text-[10px] sm:text-xs font-black uppercase tracking-[0.5em] mt-2 sm:mt-3 opacity-80">
              Elite Hardware Collection
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="max-w-4xl mx-auto mb-16 space-y-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600/5 blur-xl group-focus-within:bg-red-600/10 transition-all"></div>
            <div className="relative flex items-center bg-zinc-900/80 border border-white/10 rounded-2xl p-2 focus-within:border-red-600/50 transition-all">
              <div className="pl-4 pr-2 text-zinc-500">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder={`Search ${selectedModel || bikeBrand} mods, accessories, or parts...`}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="flex-1 bg-transparent py-3 text-white placeholder-zinc-500 focus:outline-none text-sm font-medium"
              />
              {productSearch && (
                <button 
                  onClick={() => setProductSearch('')}
                  className="p-2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/5'}`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory.toLowerCase() === cat.toLowerCase() ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Model Selection Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 animate-in fade-in duration-1000 delay-300">
          <button
            onClick={() => handleModelSelect(null)}
            className={`px-6 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
              selectedModel === null 
                ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                : 'bg-zinc-900/50 border-white/10 text-zinc-500 hover:border-white/30 hover:text-white'
            }`}
          >
            All Models
          </button>
          {models.map(model => (
            <button
              key={model}
              onClick={() => handleModelSelect(model)}
              className={`px-6 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                selectedModel === model 
                  ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                  : 'bg-zinc-900/50 border-white/10 text-zinc-500 hover:border-white/30 hover:text-white'
              }`}
            >
              {model}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-8">
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                {selectedModel || 'All'} <span className="text-red-600">MODZ</span>
              </h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">
                Showing {filteredProducts.length} items
              </p>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-32 bg-zinc-900/10 rounded-[3rem] border border-white/5 border-dashed">
              <p className="text-zinc-600 font-black text-sm uppercase tracking-[0.3em]">No products found for this selection</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id || index} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Explore Other Brands Section */}
      <section className="py-20 border-t border-white/5 relative bg-zinc-950/50">
        <div className="max-w-[1700px] mx-auto px-6">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">
              EXPLORE OTHER <span className="text-red-600">BRANDS</span>
            </h2>
            <div className="w-20 h-1 bg-red-600 mt-4 rounded-full"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {bikes.map((bike, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate('bike-models', `?bike=${encodeURIComponent(bike.name)}`)}
                className={`flex flex-col items-center gap-3 transition-all duration-500 group ${bike.name.toLowerCase() === bikeBrand.toLowerCase() ? 'opacity-40 pointer-events-none grayscale' : 'hover:-translate-y-2'}`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center p-3 group-hover:border-red-600/50 transition-colors shadow-xl group-hover:shadow-red-600/10">
                   <img 
                    src={bike.image} 
                    alt={bike.name} 
                    className="w-full h-full object-contain filter group-hover:brightness-125 transition-all" 
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                  {bike.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-40 px-6 sm:px-12 relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-red-600">
          <img
            src="https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg"
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            alt="Workshop"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-transparent to-red-600 opacity-50"></div>

        <div className="max-w-[1200px] mx-auto text-center relative z-10 space-y-12">
          <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-none uppercase">
            CUSTOME <span className="text-black">UPGRADES</span>
          </h2>
          <p className="text-lg text-white font-bold tracking-[0.3em] uppercase max-w-2xl mx-auto">
            Get expert advice on your {bikeBrand} modifications.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <a
              href="tel:+919597596755"
              className="bg-white text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-4"
            >
               CALL CONSULTANT
            </a>
            <a
              href="https://wa.me/919597596755"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-4"
            >
              WHATSAPP PROTOCOL
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
