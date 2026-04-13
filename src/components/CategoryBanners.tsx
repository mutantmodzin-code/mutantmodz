import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface CategoryBannersProps {
  onNavigate: (page: string, params?: string) => void;
}

const banners = [
  {
    title: 'Motorcycle Accessories',
    subtitle: 'Mounts, guards & LED upgrades',
    image: '/banner/pexels-gautham-reghu-1029880-34035152.jpg',
    link: 'products',
    params: '?cat=Accessories',
  },
  {
    title: 'Riding Gear',
    subtitle: 'Jackets, gloves & protection',
    image: '/banner/IMG_20260411_194553.jpg',
    link: 'products',
    params: '?cat=Riding Gear',
  },
  {
    title: 'Performance Parts',
    subtitle: 'Exhausts, sliders & racing parts',
    image: '/banner/a-machine-tool-and-other-machines-sitting-on-a-black-background-free-photo.jpg',
    link: 'products',
    params: '?cat=Performance Parts',
  },
  {
    title: 'Luggage & Touring',
    subtitle: 'Saddle bags, top boxes & kits',
    image: '/banner/IMG_20260411_194215.jpg',
    link: 'products',
    params: '?cat=Luggage',
  },
];

export default function CategoryBanners({ onNavigate }: CategoryBannersProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.querySelectorAll('.category-box');
            items.forEach((item, index) => {
              setTimeout(() => {
                (item as HTMLElement).classList.add('animate-in');
              }, index * 150);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-zinc-950 py-6 sm:py-12" ref={sectionRef}>
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {banners.map((banner, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(banner.link, banner.params)}
              className="category-box scroll-fade-up relative w-full aspect-[3/4] sm:aspect-square overflow-hidden rounded-xl sm:rounded-2xl group active:scale-[0.98] transition-all duration-300 touch-manipulation shadow-2xl shadow-black/50"
            >
              {/* Background Image */}
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                loading="lazy"
              />

              {/* Enhanced Dark Overlay for Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent group-hover:from-black/95 group-hover:via-black/50 transition-all duration-500" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-3 sm:p-6 lg:p-8">
                <h3 className="text-white font-black uppercase tracking-tighter text-sm sm:text-lg lg:text-xl leading-none mb-1 shadow-black drop-shadow-lg">
                  {banner.title}
                </h3>
                <p className="text-zinc-300 text-[8px] sm:text-xs font-bold uppercase tracking-widest mt-1 opacity-80 line-clamp-2">
                  {banner.subtitle}
                </p>
                
                {/* Enhanced Touch Target for Shop Now */}
                <div className="flex items-center gap-1.5 mt-3 text-red-500 text-[8px] sm:text-[12px] font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all duration-300 bg-red-600/10 w-fit px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg border border-red-600/20 backdrop-blur-sm group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600">
                  Shop <span className="hidden sm:inline">Now</span> <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
