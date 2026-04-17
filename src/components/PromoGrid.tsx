import { useEffect, useState } from 'react';
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
              className="relative group cursor-pointer overflow-hidden rounded-[1rem] sm:rounded-[2rem] aspect-[16/9] sm:h-[400px] transition-all duration-700 bg-zinc-900 border border-white/5 hover:border-red-600/30 shadow-2xl"
            >
              {/* Entire Card is the Image */}
              <img 
                src={banner.image_url || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400'} 
                alt={banner.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Subtle Overlay on Hover */}
              <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/5 transition-colors duration-500 z-10"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
