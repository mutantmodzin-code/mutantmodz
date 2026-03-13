import { useState, useEffect } from 'react';
import { Star, Shield, Wrench, Heart, Zap, Box, ArrowUpRight, AlertTriangle, ShoppingCart } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import { HeroSlideshow } from '../components/HeroSlideshow';
import { useCart } from '../context/CartContext';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const ProductImage = ({ images, alt }: { images?: string[], alt: string }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const imageList = images && images.length > 0
    ? images.filter(url => url && url.trim() !== '')
    : [];

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
    <div className="relative w-full h-full overflow-hidden">
      {finalList.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${alt} ${idx + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out"
          style={{
            transform: `translateX(${(idx - currentIdx) * 100}%)`,
            transition: 'transform 700ms cubic-bezier(0.4,0,0.2,1), filter 700ms ease, opacity 700ms ease',
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
                ? 'bg-white w-4 h-1.5 shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                : 'bg-white/40 w-1.5 h-1.5'
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
const bikeBrands = [
  { name: 'Royal Enfield', image: 'https://i.postimg.cc/PfYfZnpM/Screenshot-13-3-2026-113212-www-bing-com.jpg' },
  { name: 'KTM Performance', image: 'https://i.postimg.cc/ZRJHcSYJ/Screenshot-13-3-2026-114152-www-bing-com.jpg' },
  { name: 'Yamaha Racing', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80' },
  { name: 'Honda HighWing', image: 'https://i.postimg.cc/RZPQfVgF/Screenshot-2026-03-13-135421.png' },
  { name: 'Kawasaki Ninja', image: 'https://images.unsplash.com/photo-1620038891632-6bf590b10e53?auto=format&fit=crop&w=800&q=80' },
  { name: 'Ducati Corse', image: 'https://images.unsplash.com/photo-1568772585428-1cdbc1276d33?auto=format&fit=crop&w=800&q=80' },
  { name: 'BMW Motorrad', image: 'https://images.unsplash.com/photo-1599819811279-d5ad9ceced8d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Triumph Engineering', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80' }
];

const BrandCard = ({ brand }: { brand: typeof bikeBrands[0] }) => {
  const [transformStyle, setTransformStyle] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) {
      setIsHovered(true);
    }
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    if (window.innerWidth >= 1024) {
      setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    } else {
      setTransformStyle('');
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6 cursor-pointer group">
      <div
        className="w-full aspect-[4/3] bg-zinc-900/30 rounded-[2.5rem] border border-white/5 relative overflow-hidden transition-all duration-300 ease-out active:scale-95 sm:group-hover:shadow-[0_20px_40px_rgba(220,38,38,0.15)] sm:group-hover:border-red-600/30"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: transformStyle,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'none' : 'transform 500ms ease-out',
        }}
      >
        <div 
          className="absolute inset-0 z-0 transition-all duration-700 ease-out group-hover:scale-110"
        >
          <img 
            src={brand.image} 
            alt={brand.name} 
            className="w-full h-full object-cover opacity-60 transition-all duration-500 group-hover:opacity-100" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
        </div>
      </div>

      <div className="text-zinc-300 font-black uppercase text-lg sm:text-lg tracking-[0.2em] group-hover:text-white transition-colors duration-300 text-center">
        {brand.name}
      </div>
    </div>
  );
};

export default function Home({ onNavigate }: HomeProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    setIsLoaded(true);
    const fetchProducts = async () => {
      const products = await getProducts();
      setFeaturedProducts(products.slice(0, 4));
    };
    fetchProducts();
  }, []);

  const features = [
    { icon: Shield, title: 'Ballistic Protection', sub: 'Certified gear only', desc: 'Every helmet and jacket meets global safety standards for maximum survival.' },
    { icon: Zap, title: 'Performance Mods', sub: 'Elite engineering', desc: 'Custom modifications designed to push your machines threshold of performance.' },
    { icon: Wrench, title: 'Tactical Service', sub: 'Zero latency support', desc: 'Instant mechanical advice and professional installation for all hardware.' },
    { icon: Box, title: 'Rapid Logistics', sub: 'Global reach', desc: 'Fast, secure shipping protocols for your essential riding modules.' },
  ];

  return (
    <div className={`min-h-screen bg-zinc-950 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <HeroSlideshow onNavigate={onNavigate} />

      {/* FEATURED DROPS: THE COLLECTIVE */}
      <section className="py-20 px-6 sm:px-12 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-[1700px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div className="space-y-6">
              <div className="text-red-600 font-black uppercase tracking-[0.5em] text-[12px]">Latest Hardware Releases</div>
              <h2 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none">
                FEATURED <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-400">ARRAY</span>
              </h2>
            </div>
            <div className="flex flex-col items-end gap-6">
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm max-w-sm text-right">
                Directly imported performance modules from elite global manufacturers.
              </p>
              <button onClick={() => onNavigate('products')} className="group flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs border-b border-red-600/50 pb-2 hover:text-red-500 transition-colors">
                View Entire Catalog <ArrowUpRight size={16} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p, i) => (
              <div key={i} className="group relative h-[320px] rounded-[2rem] overflow-hidden border border-white/5 cursor-pointer" onClick={() => onNavigate(`productDetails?productId=${p.id}`)}>
                <ProductImage images={p.images} alt={p.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent z-10"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 space-y-2 transform group-hover:translate-y-[-6px] transition-transform duration-500 z-20">
                  {p.stock > 0 && p.stock < 10 && (
                    <div className="flex items-center gap-1.5 bg-red-600 border border-red-400 px-2.5 py-1 rounded-lg w-fit shadow-lg shadow-red-600/50">
                      <AlertTriangle size={10} className="text-white" />
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">Only {p.stock} left</span>
                    </div>
                  )}
                  {p.stock <= 0 && (
                    <div className="flex items-center gap-1.5 bg-red-600 border border-red-400 px-2.5 py-1 rounded-lg w-fit shadow-lg shadow-red-600/50">
                      <AlertTriangle size={10} className="text-white" />
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">Out of Stock</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <div className="text-red-500 font-black uppercase tracking-widest text-[9px]">{p.category}</div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{p.name}</h4>
                    </div>
                    <div className="text-base font-black text-white border-l border-white/20 pl-3">
                      {p.price}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                      onClick={(e) => { e.stopPropagation(); if (p.stock > 0) addToCart(p); }}
                      disabled={p.stock <= 0}
                      className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all ${p.stock > 0 ? 'bg-white text-black hover:bg-red-600 hover:text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                    >
                      <ShoppingCart size={12} />
                      {p.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                    </button>
                    <button className="w-9 h-9 bg-white/10 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Heart size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            About <span className="text-red-600">Mutant Modz</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Your one-stop shop for premium bike accessories, helmets, and riding gear in Coimbatore.
            We bring passion and expertise to any rider who walks through our doors.
          </p>
        </div>
      </section>

      {/* THE SHOP BY BIKE: TECHNICAL SPECTRUM */}
      < section className="py-40 px-6 sm:px-12 bg-black border-y border-white/5" >
        <div className="max-w-[1700px] mx-auto text-center space-y-24">
          <div className="space-y-6">
            <h2 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none">
              ENGINEERED BY <br /> <span className="text-red-600">MODEL</span>
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.5em] text-xs">Precise compatibility mapping for every machine.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {bikeBrands.map((brand, idx) => (
              <BrandCard key={idx} brand={brand} />
            ))}
          </div>
        </div>
      </section >

      {/* THE ARRAY: CORE VALUES */}
      <section className="py-40 px-6 sm:px-12 bg-black relative">
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((f, i) => (
            <div key={i} className="group p-12 bg-zinc-900/40 rounded-[3rem] border border-white/5 hover:border-red-600/30 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
              <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-red-600 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-inner">
                <f.icon size={32} className="text-zinc-500 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-4">
                <div className="text-red-500 font-black text-[10px] uppercase tracking-widest">{f.sub}</div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{f.title}</h3>
                <p className="text-zinc-500 font-medium text-sm leading-relaxed uppercase tracking-wide group-hover:text-zinc-400 transition-colors">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section >

      {/* TESTIMONIALS: THE FEEDBACK LOOP */}
      < section className="py-40 px-6 sm:px-12 bg-zinc-950" >
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase">THE <span className="text-red-600">FEEDBACK</span> LOOP</h2>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Direct reviews from our riding community.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              { name: 'RAJESH KUMAR', review: 'Tactical equipment of the highest order. The Coimbatore customer support is unparalleled.', role: 'Enfield Pilot' },
              { name: 'ARUN PRASAD', review: 'Precision mods that transformed my mechanical output. Fast logistics, zero latency.', role: 'KTM Rider' },
              { name: 'VIKRAM S', review: 'Elite standards in every hardware module. Highly recommend the modification protocol.', role: 'Superbike Tech' }
            ].map((r, i) => (
              <div key={i} className="p-12 bg-zinc-900/40 rounded-[3rem] border border-white/5 space-y-12 flex flex-col justify-between hover:border-red-600/30 transition-all duration-500">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className="fill-red-600 text-red-600" />)}
                </div>
                <p className="text-2xl font-black text-white italic tracking-tight leading-relaxed uppercase">"{r.review}"</p>
                <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                  <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl">{r.name[0]}</div>
                  <div className="space-y-1">
                    <div className="text-white font-black text-sm uppercase tracking-widest">{r.name}</div>
                    <div className="text-zinc-600 font-black text-[10px] uppercase tracking-widest">{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section >

      {/* FINAL CALL: BUY NOW */}
      < section className="py-40 px-6 sm:px-12 bg-red-600 relative overflow-hidden group" >
        <div className="absolute inset-0 bg-black opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="max-w-[1200px] mx-auto text-center relative z-10 space-y-12">
          <h2 className="text-6xl sm:text-[10rem] font-black text-white leading-none tracking-tighter uppercase">
            READY FOR <br /> <span className="text-black">UPGRADE?</span>
          </h2>
          <p className="text-xl sm:text-2xl text-white font-black uppercase tracking-[0.5em] max-w-2xl mx-auto leading-relaxed">
            Enter the catalog or visit our Coimbatore HQ for elite modification protocols.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
            <button
              onClick={() => onNavigate('products')}
              className="px-16 py-8 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-white hover:text-red-700 transition-all transform hover:-translate-y-2 active:scale-95"
            >
              View Catalog
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-16 py-8 bg-white text-red-700 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-black hover:text-white transition-all transform hover:-translate-y-2 active:scale-95"
            >
              Secure Direct Channel
            </button>
          </div>
        </div>
      </section >
    </div >
  );
}
