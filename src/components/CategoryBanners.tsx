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
    <section className="bg-zinc-950 py-2 sm:py-8" ref={sectionRef}>
      <div className="px-3 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {banners.map((banner, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(banner.link, banner.params)}
              className="category-box scroll-fade-up relative w-full aspect-square overflow-hidden rounded-xl sm:rounded-2xl group active:scale-[0.97] transition-transform duration-200 touch-manipulation"
            >
              {/* Background Image */}
              <img
                src={banner.image}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/85 group-hover:via-black/50 transition-all duration-500" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-2.5 sm:p-5 lg:p-6">
                <h3 className="text-white font-black uppercase tracking-tight text-xs sm:text-lg lg:text-xl leading-tight">
                  {banner.title}
                </h3>
                <p className="text-zinc-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-0.5 sm:mt-1 line-clamp-1">
                  {banner.subtitle}
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-red-500 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] group-hover:gap-3 transition-all duration-300">
                  Shop Now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform sm:w-[14px] sm:h-[14px]" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
