import { useEffect } from 'react';
import HeroSlideshow from '../components/HeroSlideshow';
import NewArrivals from '../components/NewArrivals';
import BrandCarousel from '../components/BrandCarousel';
import VideoReels from '../components/VideoReels';
import TestimonialSlider from '../components/TestimonialSlider';
import CategoryBanners from '../components/CategoryBanners';
import BestDeals from '../components/BestDeals';
import GarageSaleSection from '../components/GarageSaleSection';
import ComboProducts from '../components/ComboProducts';
import FeaturedGrid from '../components/FeaturedGrid';
import ShopByBike from '../components/ShopByBike';
import CollectionSquares from '../components/CollectionSquares';
import PromoGrid from '../components/PromoGrid';
import { ArrowRight, Zap } from 'lucide-react';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';

interface HomeProps {
  onNavigate: (page: string, params?: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
    updatePageSEO(PAGE_SEO.home);
  }, []);

  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-hidden">
      {/* 1. Hero Slideshow - Touch Swipeable */}
      <HeroSlideshow onNavigate={onNavigate} />

      {/* 2. Category Banners - NEW Stacked */}
      <CategoryBanners onNavigate={onNavigate} />

      {/* 3. TODAY SALES (Garage Sale) - High Priority Clearance */}
      <GarageSaleSection onNavigate={onNavigate} />

      {/* 4. Best Deals - NEW Horizontal Scroll */}
      <BestDeals onNavigate={onNavigate} />

      {/* 5. Monster Combos - NEW Specialized Section */}
      <ComboProducts onNavigate={onNavigate} />

      {/* 6. Featured Grid - NEW Direct Access */}
      <FeaturedGrid onNavigate={onNavigate} />

      {/* 5. New Arrivals - Updated Horizontal Scroll */}
      <NewArrivals onNavigate={onNavigate} />

      {/* 5. Shop By Brands - Updated Grid Layout */}
      <BrandCarousel onNavigate={onNavigate} />

      {/* 6. Shop By Bike - NEW Circular Thumbnails */}
      <ShopByBike onNavigate={onNavigate} />

      {/* 7. Watch Our Reels - Updated Horizontal Scroll */}
      <VideoReels />

      {/* Promo Ad Grid */}
      <PromoGrid />

      {/* 8. Touring Collections - NEW Square Grid */}
      <CollectionSquares onNavigate={onNavigate} />

      {/* 9. Trusted By Riders - Updated Vertical List */}
      <TestimonialSlider />

      {/* Final Premium CTA Section */}
      {/* Final Premium CTA Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden bg-zinc-900/40">
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/20 bg-red-600/5 backdrop-blur-sm mb-1">
            <Zap size={10} className="text-red-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Premium Mods Only</span>
          </div>
          <h2 className="text-2xl sm:text-5xl font-black tracking-tighter uppercase leading-tight">
            READY TO <span className="text-red-600">MUTATE?</span>
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[9px] max-w-2xl mx-auto leading-relaxed">
            Coimbatore's biggest hub for genuine hardware.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={() => onNavigate('products')}
              className="group bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-red-600/20"
            >
              Shop All Products <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-4 rounded-2xl border border-white/10 hover:bg-white hover:text-black text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all transform active:scale-95 bg-zinc-900/60 backdrop-blur-md"
            >
              Visit Our Store
            </button>
          </div>
          
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-60">
             <div className="space-y-0.5">
               <div className="text-lg font-black text-white">10K+</div>
               <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Happy Riders</div>
             </div>
             <div className="space-y-0.5">
               <div className="text-lg font-black text-white">50+</div>
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Elite Brands</div>
             </div>
             <div className="space-y-1">
               <div className="text-xl font-black text-white">100%</div>
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Genuine parts</div>
             </div>
             <div className="space-y-1">
               <div className="text-xl font-black text-white">4.9/5</div>
               <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Store Rating</div>
             </div>
          </div>
        </div>
      </section>

      {/* 10. SEO Knowledge Base / Local Content Hub */}
      <section className="py-12 sm:py-20 bg-zinc-950 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="prose prose-invert prose-zinc max-w-none">
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white mb-6">
              Mutant Modz: The Ultimate <span className="text-red-600">Pitshop Coimbatore</span> for Enthusiasts
            </h1>
            
            <p className="text-zinc-500 text-sm leading-relaxed mb-10 font-medium">
              Welcome to <strong>Mutant Modz</strong>, the premier destination for automotive enthusiasts in South India. 
              Located in the heart of Singanallur, we are recognized as the leading <strong>pitshop Coimbatore</strong> has to offer 
              for those who demand performance, style, and safety. Whether you are looking to enhance your daily commute or 
              prep your machine for a cross-country adventure, our expert team at our <strong>pit shop in Coimbatore</strong> 
              is dedicated to transforming your vision into reality.
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-red-600 pl-4">
                  Bike Accessories in Coimbatore
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Your motorcycle is an extension of your personality. At Mutant Modz (often searched as mutantmodz or mutant modz), we offer an extensive collection of <strong>bike accessories in Coimbatore</strong> designed to improve both the aesthetics and functionality of your ride. From high-performance exhaust systems to ergonomic seats and crash guards, we stock products from the world's most trusted brands.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-red-600 pl-4">
                  Riding Gear & Helmets
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Safety should never be a compromise. That is why Mutant Modz is the go-to hub for high-quality <strong>riding gear in Coimbatore</strong>. We house a curated selection of helmets, armored jackets, gloves, and boots that provide maximum protection without sacrificing comfort. Our experts help you find the perfect fit for your style.
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-red-600 pl-4">
                  Bike & Car Modifications
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Uniqueness is at the core of what we do. Our <strong>bike and car modification</strong> services are tailored to those who want to stand out from the crowd. Our workshop in Singanallur is equipped with state-of-the-art tools to handle everything from subtle aesthetic upgrades to complete performance overhauls. 
                </p>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest text-white border-l-4 border-red-600 pl-4">
                  Why Choose Mutant Modz?
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Choosing the right partner for your vehicle is crucial. Mutant Modz stands out because of our deep-rooted passion for the automotive culture. We offer expert craftsmanship, genuine parts, and a customer-centric approach that ensures your ride is always in safe hands.
                </p>
              </div>
            </div>

            <div className="mt-16 p-8 rounded-3xl bg-zinc-900/50 border border-white/5 text-center">
              <p className="text-zinc-300 text-lg mb-6">
                Ready to elevate your riding experience? Visit our store in Singanallur today or call us for expert advice.
              </p>
              <button 
                onClick={() => onNavigate('contact')}
                className="text-red-500 font-black uppercase tracking-[0.2em] text-sm hover:text-red-400 transition-colors"
              >
                Get in Touch with our Pit Shop &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Scroll to top buffer */}
      <div className="h-32 lg:hidden"></div>
    </div>
  );
}
