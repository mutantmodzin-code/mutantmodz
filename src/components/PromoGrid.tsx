import React, { useEffect, useState } from 'react';
import { ArrowRight, Flame, Tag } from 'lucide-react';
import { getPromoBanners } from '../utils/storage';

interface PromoBanner {
  id: number;
  title: string;
  discount_text: string;
  price_text: string;
  image_url: string;
  link_url: string;
  bg_color: string;
}

export default function PromoGrid() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const data = await getPromoBanners();
      setBanners(data);
    };
    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="bg-zinc-950 py-12">
      <div className="max-w-[1700px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {banners.map((banner) => (
            <div 
              key={banner.id}
              className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] aspect-[4/3] sm:aspect-auto sm:h-[320px] transition-all duration-700 hover:shadow-[0_20px_50px_rgba(251,191,36,0.15)]"
              style={{ backgroundColor: banner.bg_color || '#fbbf24' }}
            >
              {/* Background Ray Pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
                <div className="w-full h-full bg-[repeating-conic-gradient(from_0deg,_transparent_0deg_15deg,_rgba(255,255,255,0.2)_15deg_30deg)] animate-[spin_60s_linear_infinite]"></div>
              </div>

              {/* Badges */}
              <div className="absolute top-6 left-6 z-20 space-y-2">
                <div className="bg-[#a3e635] text-black px-4 py-3 rounded-2xl shadow-xl transform group-hover:scale-110 transition-transform flex flex-col items-center justify-center min-w-[80px]">
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-none">UPTO</span>
                  <span className="text-2xl font-black leading-none my-0.5">{banner.discount_text?.split(' ')[0] || '40%'}</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter leading-none">OFF</span>
                </div>
              </div>

              {banner.price_text && (
                <div className="absolute top-6 right-6 z-20">
                  <div className="bg-red-600 text-white px-5 py-2.5 rounded-xl shadow-xl transform -rotate-2 group-hover:rotate-0 transition-all flex flex-col items-center">
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none mb-1">STARTS FROM</span>
                    <span className="text-lg font-black leading-none">{banner.price_text}</span>
                  </div>
                </div>
              )}

              {/* Product Image */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 flex justify-center items-center z-10 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-[60%]">
                <img 
                  src={banner.image_url || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                  alt={banner.title}
                  className="w-4/5 h-auto object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                />
              </div>

              {/* Title Banner */}
              <div className="absolute bottom-0 inset-x-0 bg-transparent py-8 px-6 flex flex-col items-center z-20">
                <div className="relative">
                  <div className="absolute -inset-x-20 inset-y-0 bg-red-600 -skew-x-12 transform scale-y-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <h3 className="relative text-2xl sm:text-3xl font-black text-black group-hover:text-white uppercase tracking-tighter transition-colors duration-500">
                    {banner.title}
                  </h3>
                </div>
                
                <div className="mt-4 flex items-center gap-2 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-black group-hover:text-white">Shop Collection</span>
                  <ArrowRight size={14} className="text-black group-hover:text-white" />
                </div>
              </div>

              {/* Click Overlay */}
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500 z-30"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
