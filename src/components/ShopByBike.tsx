interface ShopByBikeProps {
  onNavigate: (page: string, params?: string) => void;
}

const bikes = [
  { name: 'Royal Enfield', image: 'https://i.postimg.cc/PfYfZnpM/Screenshot-13-3-2026-113212-www-bing-com.jpg' },
  { name: 'KTM', image: 'https://i.postimg.cc/ZRJHcSYJ/Screenshot-13-3-2026-114152-www-bing-com.jpg' },
  { name: 'Yamaha', image: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=400&q=80' },
  { name: 'Honda', image: 'https://i.postimg.cc/RZPQfVgF/Screenshot-2026-03-13-135421.png' },
  { name: 'Kawasaki', image: 'https://images.unsplash.com/photo-1620038891632-6bf590b10e53?auto=format&fit=crop&w=400&q=80' },
  { name: 'Ducati', image: 'https://images.unsplash.com/photo-1568772585428-1cdbc1276d33?auto=format&fit=crop&w=400&q=80' },
  { name: 'BMW', image: 'https://images.unsplash.com/photo-1599819811279-d5ad9ceced8d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Triumph', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bajaj', image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=400' },
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
              onClick={() => onNavigate('products', `?bike=${encodeURIComponent(bike.name)}`)}
              className="flex flex-col items-center gap-2 sm:gap-3 group touch-manipulation active:scale-95 transition-transform"
            >
              {/* Circular Image */}
              <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] lg:w-[120px] lg:h-[120px] rounded-full overflow-hidden border-2 border-white/10 group-hover:border-red-600/50 transition-all duration-500 shadow-lg group-hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                <img
                  src={bike.image}
                  alt={bike.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
