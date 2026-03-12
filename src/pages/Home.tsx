import { useState, useEffect } from 'react';
import { Star, Shield, Wrench, Heart, Zap, Box, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import { HeroSlideshow } from '../components/HeroSlideshow';

interface HomeProps {
  onNavigate: (page: string) => void;
}

const ProductImage = ({ images, alt }: { images?: string[], alt: string }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const imageList = images && images.length > 0 ? images.filter(url => url && url.trim() !== '') : ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'];

  useEffect(() => {
    if (imageList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % imageList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [imageList.length]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {imageList.map((img, idx) => (
        <img
          key={idx}
          src={img}
          className={`absolute inset-0 w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out ${idx === currentIdx ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          style={{
            zIndex: idx === currentIdx ? 1 : 0,
            transition: 'opacity 1s ease-in-out, transform 1s ease-out'
          }}
          alt={`${alt} view ${idx + 1}`}
        />
      ))}
    </div>
  );
};

export default function Home({ onNavigate }: HomeProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

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
      <section className="py-40 px-6 sm:px-12 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-[1700px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {featuredProducts.map((p, i) => (
              <div key={i} className="group relative h-[500px] sm:h-[600px] rounded-[4rem] overflow-hidden border border-white/5 cursor-pointer" onClick={() => onNavigate(`productDetails?productId=${p.id}`)}>
                <ProductImage images={p.images} alt={p.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10"></div>

                <div className="absolute bottom-0 left-0 w-full p-12 space-y-6 transform group-hover:translate-y-[-10px] transition-transform duration-500">
                  {p.stock > 0 && p.stock < 10 && (
                    <div className="flex items-center gap-2 bg-red-600/20 border border-red-600/30 px-4 py-2 rounded-xl w-fit mb-4">
                      <AlertTriangle size={12} className="text-red-600" />
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">⚠️ Only {p.stock} items left in stock</span>
                    </div>
                  )}
                  {p.stock <= 0 && (
                    <div className="flex items-center gap-2 bg-zinc-800/80 border border-white/10 px-4 py-2 rounded-xl w-fit mb-4">
                      <span className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">Out of Stock</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end">
                    <div className="space-y-4">
                      <div className="text-red-600 font-black uppercase tracking-[0.4em] text-[11px]">{p.category}</div>
                      <h4 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">{p.name}</h4>
                    </div>
                    <div className="text-3xl font-black text-white border-l border-white/20 pl-6 mb-1">
                      {p.price}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-6 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 active:scale-95">
                    <button
                      disabled={p.stock <= 0}
                      className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${p.stock > 0 ? 'bg-white text-black hover:bg-red-600 hover:text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                    >
                      {p.stock > 0 ? 'Buy Now' : 'Sold Out'}
                    </button>
                    <button className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                      <Heart size={24} />
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
            {['Royal Enfield', 'KTM Performance', 'Yamaha Racing', 'Honda HighWing', 'Kawasaki Ninja', 'Ducati Corse', 'BMW Motorrad', 'Triumph Engineering'].map((bike, idx) => (
              <div key={idx} className="group p-16 bg-zinc-900/20 rounded-[3rem] border border-white/5 hover:bg-red-600 transition-all duration-700 cursor-pointer text-center relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="text-white font-black uppercase text-xl sm:text-2xl tracking-tighter group-hover:scale-110 transition-transform">{bike}</div>
                  <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest group-hover:text-white/80">Calibration Active</div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity">
                  <Zap size={100} className="text-white" />
                </div>
              </div>
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
