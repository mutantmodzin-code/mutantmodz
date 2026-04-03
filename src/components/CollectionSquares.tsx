import { ArrowRight } from 'lucide-react';

interface CollectionSquaresProps {
  onNavigate: (page: string, params?: string) => void;
}

const collections = [
  {
    title: 'Saddle Bags',
    image: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: 'products',
    params: '?search=saddle+bags',
  },
  {
    title: 'Top Boxes',
    image: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: 'products',
    params: '?search=top+box',
  },
  {
    title: 'Crash Guards',
    image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: 'products',
    params: '?search=crash+guard',
  },
  {
    title: 'Riding Jackets',
    image: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: 'products',
    params: '?search=riding+jacket',
  },
  {
    title: 'LED Lights',
    image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: 'products',
    params: '?search=led+light',
  },
  {
    title: 'Windshields',
    image: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=400',
    link: 'products',
    params: '?search=windshield',
  },
];

export default function CollectionSquares({ onNavigate }: CollectionSquaresProps) {
  return (
    <section className="py-8 sm:py-16 bg-zinc-950">
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
            TOURING <span className="text-red-600">COLLECTIONS</span>
          </h2>
          <p className="text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1">
            Everything you need for the open road
          </p>
        </div>

        {/* 2-column grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {collections.map((col, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(col.link, col.params)}
              className="relative aspect-square rounded-2xl overflow-hidden group active:scale-[0.97] transition-transform duration-200 touch-manipulation"
            >
              {/* Background Image */}
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-zinc-950/20 group-hover:from-red-950/60 transition-colors duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6">
                <h3 className="text-white font-black uppercase tracking-tight text-sm sm:text-base lg:text-lg text-center leading-tight">
                  {col.title}
                </h3>
                <div className="flex items-center gap-1 mt-1.5 text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Explore <ArrowRight size={10} />
                </div>
              </div>

              {/* Border */}
              <div className="absolute inset-0 border border-white/5 rounded-2xl group-hover:border-red-600/30 transition-colors duration-500" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
