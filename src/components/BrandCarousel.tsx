// No imports needed for this component's current functionality

const brands = [
  'Rynox', 'Alpinestars', 'LS2', 'K&N', 'Sena', 
  'Axor', 'SMK', 'Studds', 'Acerbis', 'Viaterra', 'Scoyco', 'Raida', 'HJG'
];

export default function BrandCarousel({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <section className="py-24 bg-zinc-950/50 border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <h3 className="text-zinc-500 font-black uppercase tracking-[0.4em] text-[10px] text-center">Elite Partnership Matrix</h3>
      </div>
      
      <div className="group relative flex overflow-hidden">
        <div className="flex animate-marquee-brand gap-16 items-center">
          {/* Double list for infinite scroll */}
          {[...brands, ...brands].map((brand, i) => (
            <button
              key={i}
              onClick={() => onNavigate(`products?brand=${brand.toLowerCase()}`)}
              className="px-12 py-8 bg-zinc-900/40 rounded-3xl border border-white/5 grayscale group-hover/item:grayscale-0 hover:border-red-600/30 transition-all duration-500 hover:scale-110 active:scale-95 group/item flex items-center justify-center min-w-[200px]"
            >
              <span className="text-3xl font-black text-white/20 group-hover/item:text-white uppercase tracking-tighter transition-colors select-none">
                {brand}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-brand {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-brand {
          animation: marquee-brand 40s linear infinite;
        }
        .animate-marquee-brand:hover {
          animation-play-state: paused;
        }
      `}} />
    </section>
  );
}
