import { ArrowRight } from 'lucide-react';

interface CategoryBannersProps {
  onNavigate: (page: string, params?: string) => void;
}

const banners = [
  {
    title: 'Motorcycle Accessories',
    subtitle: 'Custom mounts, guards & LED upgrades',
    image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'products',
    params: '?cat=Accessories',
  },
  {
    title: 'Riding Gear',
    subtitle: 'Jackets, gloves & protective wear',
    image: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'products',
    params: '?cat=Gear',
  },
  {
    title: 'Performance Parts',
    subtitle: 'Exhausts, sliders & racing components',
    image: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'products',
    params: '?cat=Mods',
  },
  {
    title: 'Luggage & Touring',
    subtitle: 'Saddle bags, top boxes & touring kits',
    image: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=800',
    link: 'products',
    params: '?cat=Luggage',
  },
];

export default function CategoryBanners({ onNavigate }: CategoryBannersProps) {
  return (
    <section className="bg-zinc-950">
      <div className="flex flex-col">
        {banners.map((banner, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(banner.link, banner.params)}
            className="relative w-full h-[180px] sm:h-[220px] lg:h-[280px] overflow-hidden group active:scale-[0.98] transition-transform duration-200 touch-manipulation"
          >
            {/* Background Image */}
            <img
              src={banner.image}
              alt={banner.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/60 to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 lg:px-16">
              <h3 className="text-white font-black uppercase tracking-tight text-xl sm:text-2xl lg:text-3xl leading-tight">
                {banner.title}
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 max-w-[250px]">
                {banner.subtitle}
              </p>
              <div className="flex items-center gap-2 mt-3 text-red-500 text-[11px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all duration-300">
                Shop Now <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bottom border separator */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/5" />
          </button>
        ))}
      </div>
    </section>
  );
}
