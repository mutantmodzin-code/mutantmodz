const brands = [
  'Rynox', 'Alpinestars', 'LS2', 'K&N', 'Sena', 
  'Axor', 'SMK', 'Studds', 'Acerbis', 'Viaterra', 'Scoyco', 'Raida', 'HJG'
];

export default function BrandCarousel({ onNavigate }: { onNavigate: (page: string, params?: string) => void }) {
  return (
    <section className="py-8 sm:py-24 bg-zinc-950 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none text-center">
          SHOP BY <span className="text-red-600">BRANDS</span>
        </h2>
        <p className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] text-center mt-2">Elite Partnership Matrix</p>
      </div>
      
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
          {brands.map((brand, i) => (
            <button
              key={i}
              onClick={() => onNavigate('products', `?brand=${brand.toLowerCase()}`)}
              className="aspect-[3/2] bg-zinc-900/40 rounded-xl border border-white/5 flex items-center justify-center hover:border-red-600/30 transition-all duration-500 active:scale-95 group touch-manipulation"
            >
              <span className="text-sm sm:text-lg font-black text-zinc-500 group-hover:text-white uppercase tracking-tighter transition-colors select-none">
                {brand}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
