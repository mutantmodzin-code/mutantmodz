import { useEffect, useState } from 'react';
import { getPromoBanners } from '../utils/storage';
import { getMediaUrl } from '../utils/url';

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
    <div className="bg-zinc-950 py-6 sm:py-12 px-4 sm:px-12">
      <div className="max-w-[1300px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10 lg:gap-16">
          {banners.map((banner) => (
            <div 
              key={banner.id}
              className="relative group cursor-pointer overflow-hidden rounded-[1.25rem] aspect-[16/10] bg-zinc-900 border border-white/5 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(220,38,38,0.2)]"
            >
              {/* Entire Card is the Image - No Stretching */}
              <img 
                src={getMediaUrl(banner.image_url || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400')} 
                alt={banner.title}
                className="w-full h-full object-cover"
              />

              {/* Minimalist Overlay to keep the clean "image only" focus */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
