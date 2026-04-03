interface ShopByBikeProps {
  onNavigate: (page: string, params?: string) => void;
}

export const bikes = [
  { name: 'Royal Enfield', image: '/bike brands/royal Enfield.png' },
  { name: 'KTM', image: '/bike brands/ktm.png' },
  { name: 'Yamaha', image: '/bike brands/Yamaha.png' },
  { name: 'Honda', image: '/bike brands/honda.png' },
  { name: 'Kawasaki', image: '/bike brands/Kawasaki.png' },
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
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {bikes.map((bike, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('products', `?bike=${encodeURIComponent(bike.name.trim())}`)}
              className="flex flex-col items-center gap-2 sm:gap-3 group touch-manipulation active:scale-95 transition-transform"
            >
              {/* Circular Image with White Background */}
              <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] rounded-full overflow-hidden bg-white border-2 border-white/10 group-hover:border-red-600 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] flex items-center justify-center p-1 sm:p-2">
                <img
                  src={bike.image.trim()}
                  alt={bike.name}
                  className="w-[100%] h-[100%] object-contain group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Name Label */}
              <span className="text-zinc-300 group-hover:text-white text-[11px] sm:text-xs font-black uppercase tracking-wider text-center transition-colors leading-tight">
                {bike.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
