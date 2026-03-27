import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative group bg-zinc-950 border-b border-red-900/40 overflow-hidden z-[60]">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10 pointer-events-none"></div>
      
      <div className="flex h-10 items-center">
        <div className="flex-1 whitespace-nowrap overflow-hidden">
          <div className="inline-block animate-marquee-slower">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-white/90 px-4">
              🔥 Free Shipping on Orders Above <span className="text-red-500 underline decoration-2 underline-offset-4">₹999</span> | Premium Bike Accessories | COD Available | Trusted by 10,000+ Riders
            </span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-white/90 px-4">
              🔥 Free Shipping on Orders Above <span className="text-red-500 underline decoration-2 underline-offset-4">₹999</span> | Premium Bike Accessories | COD Available | Trusted by 10,000+ Riders
            </span>
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-white/90 px-4">
              🔥 Free Shipping on Orders Above <span className="text-red-500 underline decoration-2 underline-offset-4">₹999</span> | Premium Bike Accessories | COD Available | Trusted by 10,000+ Riders
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-0 top-0 h-full w-10 bg-zinc-950 border-l border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-600/20 transition-all z-20 group-hover:w-12"
          aria-label="Dismiss Announcement"
        >
          <X size={14} className="hover:rotate-90 transition-transform" />
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-slower {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee-slower {
          animation: marquee-slower 30s linear infinite;
        }
        .animate-marquee-slower:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}
