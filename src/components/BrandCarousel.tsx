import { brands } from '../data/brands';

export default function BrandCarousel({ onNavigate }: { onNavigate: (page: string, params?: string) => void }) {
  // Prepare brands for the ticker (doubled for infinite scroll)
  const tickerBrands = [...brands, ...brands];

  return (
    <section id="brands-section" className="py-12 sm:py-24 bg-zinc-950 border-b border-white/5 relative overflow-hidden">
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

      <div className="max-w-7xl mx-auto px-6 mb-16 sm:mb-20">
        <div className="flex flex-col items-center text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/20 bg-red-600/5 backdrop-blur-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Elite Partnerships</span>
          </div>
          <h2 className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-4">
            LEVEL UP YOUR <span className="text-red-600">RIDE</span>
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px] max-w-xl">
             Authorized partner of premium motorcycle brands in Coimbatore for Royal Enfield, KTM, Yamaha & more.
          </p>
        </div>
      </div>
      
      <div className="relative">
        <div className="flex overflow-hidden">
          <div className="flex ticker-animate whitespace-nowrap gap-4 py-4 px-4">
            {tickerBrands.map((brand, i) => (
              <button
                key={`ticker-${i}`}
                onClick={() => onNavigate('products', `?brand=${brand.name.toLowerCase()}`)}
                className="flex-shrink-0 w-32 sm:w-48 aspect-[4/2.5] bg-white rounded-xl border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-red-600/40 hover:-translate-y-1 active:scale-95 group"
              >
                <div className="relative z-10 w-full h-full p-2 sm:p-4 flex items-center justify-center">
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
                        text.className = 'brand-fallback text-[8px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center';
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

        {/* Explore All Brands CTA */}
        <div className="mt-16 text-center">
           <button 
             onClick={() => onNavigate('brands')}
             className="text-xs font-black text-zinc-500 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-3 mx-auto group"
           >
             Explore All {brands.length}+ Brands
             <div className="w-8 h-px bg-zinc-800 group-hover:bg-red-600 group-hover:w-16 transition-all"></div>
             <span className="transform transition-all duration-300 group-hover:translate-x-1">
               →
             </span>
           </button>
        </div>
      </div>
    </section>
  );
}
