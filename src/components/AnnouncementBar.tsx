import { Zap, ArrowRight } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <>
      {/* Desktop Version */}
      <div className="hidden lg:flex h-9 items-center justify-center bg-zinc-950 border-b border-red-900/30 px-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/80 text-center">
          🔥 Boost Your Bike’s Performance <span className="text-red-500 font-black"></span> &nbsp;|&nbsp;  &nbsp;|&nbsp; Trusted by 10,000+ Riders
        </p>
      </div>

      {/* Mobile Sticky Version - Prominent Flash Clearance */}
      <div className="lg:hidden">
        <div className="bg-zinc-900 border border-red-600/30 rounded-2xl p-4 shadow-[0_10px_30px_rgba(220,38,38,0.3)] backdrop-blur-xl flex items-center justify-between group overflow-hidden relative">
          {/* Animated Background Pulse */}
          <div className="absolute inset-y-0 left-0 w-1 bg-red-600 animate-pulse"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/40">
              <Zap size={18} className="text-white fill-current animate-pulse" />
            </div>
            <div>
              <h4 className="text-white text-[11px] font-black uppercase tracking-widest leading-none mb-1">Flash Clearance</h4>
              <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-tighter">Limited Stock Performance Mods</p>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.hash = 'products?cat=garage-sale'}
            className="flex items-center gap-2 bg-white text-black text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-95 relative z-10"
          >
            Claim <ArrowRight size={12} />
          </button>
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-red-600/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </>
  );
}
