import { brands } from '../data/brands';

export default function BrandCarousel({ onNavigate }: { onNavigate: (page: string, params?: string) => void }) {
  // Prepare brands for the ticker (doubled for infinite scroll)
  const tickerBrands = [...brands, ...brands];

  return (
    <section id="brands-section" className="py-4 sm:py-8 bg-zinc-950 border-b border-white/5 relative overflow-hidden">
      {/* CSS for the ticker animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .ticker-animate {
          animation: ticker 40s linear infinite;
        }
        .ticker-animate:hover {
          animation-play-state: paused;
        }
      `}} />

      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-red-600/5 blur-[120px] pointer-events-none"></div>
      
      <div className="relative">
        <div className="flex overflow-hidden">
          <div className="flex ticker-animate whitespace-nowrap gap-4 py-2 px-4">
            {tickerBrands.map((brand, i) => (
              <button
                key={`ticker-${i}`}
                onClick={() => onNavigate('products', `?brand=${brand.name.toLowerCase()}`)}
                className="flex-shrink-0 w-24 sm:w-32 aspect-[4/2] bg-white rounded-lg border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-red-600/40 hover:-translate-y-1 active:scale-95 group"
              >
                <div className="relative z-10 w-full h-full p-2 flex items-center justify-center">
                  <img 
                    src={brand.logo} 
                    alt={brand.name}
                    className="w-full h-full object-contain pointer-events-none group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent && !parent.querySelector('.brand-fallback')) {
                        const text = document.createElement('span');
                        text.className = 'brand-fallback text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center';
                        text.innerText = brand.name;
                        parent.appendChild(text);
                      }
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
          {/* Gradient Fades for the edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
