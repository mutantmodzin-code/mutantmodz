import { useEffect } from 'react';
import HeroSlideshow from '../components/HeroSlideshow';
import NewArrivals from '../components/NewArrivals';
import BrandCarousel from '../components/BrandCarousel';
import VideoReels from '../components/VideoReels';
import TestimonialSlider from '../components/TestimonialSlider';
import CategoryBanners from '../components/CategoryBanners';
import BestDeals from '../components/BestDeals';
import ComboProducts from '../components/ComboProducts';
import ShopByBike from '../components/ShopByBike';
import CollectionSquares from '../components/CollectionSquares';
import { ArrowRight, Zap } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, params?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      {/* 1. Hero Slideshow - Touch Swipeable */}
      <HeroSlideshow onNavigate={onNavigate} />

      {/* 2. Category Banners - NEW Stacked */}
      <CategoryBanners onNavigate={onNavigate} />

      {/* 3. Best Deals - NEW Horizontal Scroll */}
      <BestDeals onNavigate={onNavigate} />

      {/* 4. Monster Combos - NEW Specialized Section */}
      <ComboProducts onNavigate={onNavigate} />

      {/* 5. New Arrivals - Updated Horizontal Scroll */}
      <NewArrivals onNavigate={onNavigate} />

      {/* 5. Shop By Brands - Updated Grid Layout */}
      <BrandCarousel onNavigate={onNavigate} />

      {/* 6. Shop By Bike - NEW Circular Thumbnails */}
      <ShopByBike onNavigate={onNavigate} />

      {/* 7. Watch Our Reels - Updated Horizontal Scroll */}
      <VideoReels />

      {/* 8. Touring Collections - NEW Square Grid */}
      <CollectionSquares onNavigate={onNavigate} />

      {/* 9. Trusted By Riders - Updated Vertical List */}
      <TestimonialSlider />

      {/* Final Premium CTA Section */}
      <section className="py-16 sm:py-32 relative overflow-hidden bg-zinc-900/40">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-red-600/20 bg-red-600/5 backdrop-blur-sm mb-4">
            <Zap size={14} className="text-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Premium Mods Only</span>
          </div>
          <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
            READY TO <span className="text-red-600">MUTATE?</span>
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs max-w-2xl mx-auto leading-relaxed">
            Coimbatore's biggest hub for genuine parts, performance accessories, and high-tier riding gear.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => onNavigate('products')}
              className="group bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-2xl shadow-red-600/20"
            >
              Shop All Products <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-10 py-5 rounded-2xl border border-white/10 hover:bg-white hover:text-black text-white text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 bg-zinc-900/60 backdrop-blur-md"
            >
              Visit Our Store
            </button>
          </div>
          
          <div className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
             <div className="space-y-2">
               <div className="text-2xl font-black text-white">10K+</div>
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Happy Riders</div>
             </div>
             <div className="space-y-2">
               <div className="text-2xl font-black text-white">50+</div>
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Elite Brands</div>
             </div>
             <div className="space-y-2">
               <div className="text-2xl font-black text-white">100%</div>
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Genuine parts</div>
             </div>
             <div className="space-y-2">
               <div className="text-2xl font-black text-white">4.9/5</div>
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Store Rating</div>
             </div>
          </div>
        </div>
      </section>
      
      {/* Scroll to top buffer */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
}
