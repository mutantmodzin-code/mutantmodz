import { ArrowRight } from 'lucide-react';

interface CollectionSquaresProps {
  onNavigate: (page: string, params?: string) => void;
}

const collections = [
  {
    title: 'Saddle Bags',
    image: '/Screenshot 2026-04-10 220946.png',
    link: 'products',
    params: '?search=saddle+bags',
  },
  {
    title: 'Top Boxes',
    image: '/top.jpg  ',
    link: 'products',
    params: '?search=top+box',
  },
  {
    title: 'Crash Guards',
    image: '/2_244239f6-ede3-4c2e-82b3-8e42bc4c40be_1445x.webp  ',
    link: 'products',
    params: '?search=crash+guard',
  },
  {
    title: 'Riding Jackets',
    image: '/KORDA_SUMMIT_RIDING_JACKET_GREY_7_2.jpg',
    link: 'products',
    params: '?search=riding+jacket',
  },
  {
    title: 'LED Lights',
    image: '/led.webp ',
    link: 'products',
    params: '?search=led+light',
  },
  {
    title: 'Windshields',
    image: '/windsh.webp   ',
    link: 'products',
    params: '?search=windshield',
  },
];

export default function CollectionSquares({ onNavigate }: CollectionSquaresProps) {
  return (
    <section className="py-8 bg-zinc-950">
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">
            TOURING <span className="text-red-600">COLLECTIONS</span>
          </h2>
          <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mt-1">
            Everything you need for the open road
          </p>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {collections.map((col, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(col.link, col.params)}
              className="relative aspect-[3/2] rounded-xl overflow-hidden group active:scale-[0.97] transition-transform duration-200 touch-manipulation"
            >
              {/* Background Image */}
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-black/20 group-hover:from-red-950/40 transition-colors duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-3 sm:p-4">
                <h3 className="text-white font-black uppercase tracking-tight text-[10px] sm:text-xs lg:text-sm text-center leading-tight">
                  {col.title}
                </h3>
                <div className="flex items-center gap-1 mt-1 text-red-500 text-[8px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                  Explore <ArrowRight size={8} />
                </div>
              </div>

              {/* Border */}
              <div className="absolute inset-0 border border-white/5 rounded-xl group-hover:border-red-600/30 transition-colors duration-500" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
