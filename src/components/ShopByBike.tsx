interface ShopByBikeProps {
  onNavigate: (page: string, params?: string) => void;
}

export const bikes = [
  { name: 'Royal Enfield', image: '/bike brands/royal Enfield.png' },
  { name: 'KTM', image: '/bike brands/ktm.png' },
  { name: 'Honda', image: '/bike brands/honda.png' },
  { name: 'Kawasaki', image: '/bike brands/Kawasaki.png' },
  { name: 'Yamaha', image: '/bike brands/Yamaha.png' },
  { name: 'Ducati', image: '/bike brands/ducati.png' },
  { name: 'BMW', image: '/bike brands/Bmw.png' },
  { name: 'Triumph', image: '/bike brands/NicePng_red-solo-cup-png_5412282.png' },
  { name: 'Bajaj', image: '/bike brands/Bajaj.png' },
  { name: 'Jawa', image: '/bike brands/jawa.webp' },
  { name: 'Yezdi', image: '/bike brands/yezdi.webp' },
  { name: 'Suzuki', image: '/bike brands/suzuki.png' }
];

export default function ShopByBike({ onNavigate }: ShopByBikeProps) {
  return (
    <section className="py-8 sm:py-16 bg-zinc-950">
      <div className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
            SHOP BY <span className="text-red-600">BIKE</span>
          </h2>
          <p className="text-zinc-500 text-[10px] sm:text-xs font-black uppercase tracking-widest mt-1">
            Pick your ride, find the perfect gear
          </p>
        </div>

        {/* Circular Thumbnails Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6 lg:gap-8">
          {bikes.map((bike, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('products', `?bike=${encodeURIComponent(bike.name)}`)}
              className="flex flex-col items-center gap-2 group touch-manipulation active:scale-95 transition-all duration-300"
            >
              {/* Circular Content Container */}
              <div className="relative w-full aspect-square rounded-full overflow-hidden border border-white/10 bg-[#f8f8f8] group-hover:bg-white group-hover:border-red-600/50 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] p-2 sm:p-3">
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 pointer-events-none" />
              </div>
              
              {/* Name Label */}
              <span className="text-zinc-500 group-hover:text-white text-[9px] sm:text-xs font-black uppercase tracking-tighter sm:tracking-wider text-center transition-colors leading-none truncate w-full px-1">
                {bike.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
