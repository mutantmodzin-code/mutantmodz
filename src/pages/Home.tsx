import { useState, useEffect } from 'react';
import { ArrowUpRight, Flame, Calendar } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';
import { HeroSlideshow } from '../components/HeroSlideshow';
import ProductCard from '../components/ProductCard';
import TrustBadges from '../components/TrustBadges';
import NewArrivals from '../components/NewArrivals';
import VideoReels from '../components/VideoReels';
import BrandCarousel from '../components/BrandCarousel';
import TestimonialSlider from '../components/TestimonialSlider';

interface HomeProps {
  onNavigate: (page: string) => void;
}

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

  return (
    <div className="flex flex-col items-center gap-5 sm:gap-6 cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'); }}
    >
      <div
        className="w-full aspect-[4/3] bg-zinc-900/30 rounded-[2.5rem] border border-white/5 relative overflow-hidden transition-all duration-300 ease-out active:scale-95 sm:group-hover:shadow-[0_20px_40px_rgba(220,38,38,0.15)] sm:group-hover:border-red-600/30"
        style={{ transform: transformStyle, transformStyle: 'preserve-3d', transition: isHovered ? 'none' : 'transform 500ms ease-out' }}
      >
        <img src={brand.image} alt={brand.name} className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"></div>
      </div>
      <div className="text-zinc-300 font-black uppercase text-lg tracking-[0.2em] group-hover:text-white transition-colors duration-300 text-center">
        {brand.name}
      </div>
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
      // Tag some as bestsellers for demo
      const tagged = products.slice(0, 4).map((p, i) => ({ ...p, isBestSeller: i % 2 === 0 }));
      setFeaturedProducts(tagged);
    };
    fetchProducts();
  }, []);

  return (
    <div className={`min-h-screen bg-zinc-950 transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <HeroSlideshow onNavigate={onNavigate} />
      
      {/* 4. TRUST BADGES STRIP */}
      <TrustBadges />

      {/* 11. NEW ARRIVALS SECTION */}
      <NewArrivals onNavigate={onNavigate} />

      {/* VIDEO FEED SECTION */}
      <VideoReels />

      {/* FEATURED PRODUCTS */}
      <section className="py-16 sm:py-28 px-6 sm:px-12 bg-zinc-950 relative overflow-hidden">
        <div className="max-w-[1700px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-20 gap-10">
            <div className="space-y-6">
              <div className="text-red-600 font-black uppercase tracking-[0.5em] text-[12px]">Our Top Picks</div>
              <h2 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none">
                FEATURED <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-400">PRODUCTS</span>
              </h2>
            </div>
            <div className="flex flex-col items-end gap-6 text-right">
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm max-w-sm">
                Premium gear sourced from top brands worldwide.
              </p>
              <button onClick={() => onNavigate('products')} className="group flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs border-b border-red-600/50 pb-2 hover:text-red-500 transition-colors">
                See All Products <ArrowUpRight size={16} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </section>

      {/* COMBO DEALS PREVIEW */}
      <section className="py-16 sm:py-32 px-6 sm:px-12 bg-black border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-600/5 skew-x-12 transform translate-x-1/2"></div>
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-8 sm:space-y-12">
            <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-6 py-3 rounded-full">
              <Flame size={20} className="text-red-600 animate-pulse" />
              <span className="text-red-500 text-[12px] font-black uppercase tracking-[0.5em]">Bundle & Save</span>
            </div>
            <h2 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none">
              COMBO <br /> <span className="text-red-600">DEALS</span>
            </h2>
            <p className="text-zinc-400 text-xl font-bold uppercase tracking-widest leading-relaxed max-w-xl">
              Get everything you need at one great price.
            </p>
            <button onClick={() => onNavigate('combos')} className="px-12 py-6 sm:px-16 sm:py-8 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:bg-red-600 hover:text-white transition-all transform hover:-translate-y-2 active:scale-95 shadow-2xl">
              View All Combos
            </button>
          </div>
          <div className="relative group hidden lg:block">
            <div className="absolute -inset-4 bg-red-600 opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-zinc-900/40 rounded-[4rem] border border-white/5 p-12 overflow-hidden backdrop-blur-3xl">
              <div className="flex gap-8 mb-10">
                <div className="w-1/2 aspect-square rounded-[2rem] overflow-hidden border border-white/5">
                  <img src="https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=300" className="w-full h-full object-cover" />
                </div>
                <div className="w-1/2 aspect-square rounded-[2rem] overflow-hidden border border-white/5">
                  <img src="https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=300" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-red-500 font-black text-[12px] uppercase tracking-[0.4em]">Starter Pack Bundle</div>
                <h4 className="text-4xl font-black text-white uppercase tracking-tight">Rider Essentials Kit</h4>
                <div className="flex items-baseline gap-4">
                  <span className="text-zinc-600 line-through text-lg font-black">₹8,499</span>
                  <span className="text-white text-4xl font-black">₹6,999</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BRAND LOGO CAROUSEL */}
      <BrandCarousel onNavigate={onNavigate} />

      {/* SHOP BY BIKE */}
      <section className="py-16 sm:py-32 px-6 sm:px-12 bg-black">
        <div className="max-w-[1700px] mx-auto text-center space-y-16 sm:space-y-24">
          <div className="space-y-6">
            <h2 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase leading-none">
              SHOP BY <br /> <span className="text-red-600">YOUR BIKE</span>
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.5em] text-xs">Pick your bike and find the perfect accessories.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {bikeBrands.map((brand, idx) => (
              <BrandCard key={idx} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SLIDER */}
      <TestimonialSlider />

      {/* BLOG PREVIEW SECTION */}
      <section className="py-16 sm:py-32 px-6 sm:px-12 bg-black relative">
        <div className="max-w-[1700px] mx-auto">
          <div className="flex justify-between items-end mb-12 sm:mb-24">
            <div className="space-y-6">
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase">TIPS & <span className="text-red-600">GUIDES</span></h2>
              <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Helpful advice for every rider.</p>
            </div>
            <button onClick={() => onNavigate('blog')} className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:text-red-500 transition-colors">
              See All Articles &rarr;
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
               { title: 'Choosing the Right Helmet', date: 'March 15, 2026', img: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=400' },
               { title: 'Monsoon Riding Essentials', date: 'March 12, 2026', img: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=400' },
               { title: 'Top 5 RE Modifications', date: 'March 10, 2026', img: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400' }
            ].map((p, i) => (
              <div key={i} className="group cursor-pointer" onClick={() => onNavigate('blog')}>
                <div className="h-52 sm:h-80 rounded-[3rem] overflow-hidden border border-white/5 mb-8 relative">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
                <div className="space-y-3 px-4">
                  <div className="flex items-center gap-3 text-red-600 text-[10px] font-black uppercase tracking-[0.2em]">
                    <Calendar size={12} /> {p.date}
                  </div>
                  <h4 className="text-2xl font-black text-white group-hover:text-red-600 transition-colors uppercase tracking-tight">{p.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL */}
      <section className="py-16 sm:py-32 px-6 sm:px-12 bg-red-600 relative overflow-hidden group">
        <div className="absolute inset-0 bg-black opacity-30 mix-blend-overlay group-hover:scale-110 transition-transform duration-1000"></div>
        <div className="max-w-[1200px] mx-auto text-center relative z-10 space-y-8 sm:space-y-12">
          <h2 className="text-6xl sm:text-[10rem] font-black text-white leading-none tracking-tighter uppercase">
            GEAR UP <br /> <span className="text-black">TODAY</span>
          </h2>
          <p className="text-xl sm:text-2xl text-white font-black uppercase tracking-[0.5em] max-w-2xl mx-auto leading-relaxed">
            Shop online or visit us in Coimbatore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center pt-4 sm:pt-8">
            <button
              onClick={() => onNavigate('products')}
              className="px-12 py-5 sm:px-16 sm:py-8 bg-black text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-white hover:text-red-700 transition-all transform hover:-translate-y-2 active:scale-95 min-h-[56px]"
            >
              Shop Now
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-12 py-5 sm:px-16 sm:py-8 bg-white text-red-700 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-2xl hover:bg-black hover:text-white transition-all transform hover:-translate-y-2 active:scale-95 min-h-[56px]"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
