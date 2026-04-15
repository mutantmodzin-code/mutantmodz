import { useEffect } from 'react';
import { brands } from '../data/brands';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';

export default function Brands({ onNavigate }: { onNavigate: (page: string, params?: string) => void }) {
  useEffect(() => {
    updatePageSEO(PAGE_SEO.brands);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 pt-8 pb-20">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-600/20 bg-red-600/5 backdrop-blur-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Official Partners</span>
          </div>
          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-[0.8] mb-6">
            SHOP BY <span className="text-red-600">BRANDS</span>
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[10px] max-w-xl">
             Explore our full ecosystem of premium racing and performance partners
          </p>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-12">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-3 gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {brands.map((brand, i) => (
            <button
              key={i}
              onClick={() => onNavigate('products', `?brand=${brand.name.toLowerCase()}`)}
              className="group relative aspect-[4/2.8] bg-white rounded-xl border border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 hover:border-red-600/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-600/20 active:scale-95"
            >
              <div className="absolute inset-0 bg-white group-hover:bg-zinc-50 transition-colors duration-500"></div>
              <div className="relative z-10 w-full h-full p-2 sm:p-3 flex items-center justify-center">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="w-full h-full object-contain transition-all duration-700 group-hover:scale-105 pointer-events-none"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector('.brand-fallback')) {
                      const text = document.createElement('span');
                      text.className = 'brand-fallback text-[10px] sm:text-xs font-black text-zinc-400 group-hover:text-red-600 uppercase tracking-[0.2em] transition-all duration-500 text-center px-2';
                      text.innerText = brand.name;
                      parent.appendChild(text);
                    }
                  }}
                />
              </div>
              <div className="absolute top-0 right-0 p-1 lg:p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
