import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { getMediaUrl } from '../utils/url';

interface Reel {
  id: number;
  title: string;
  instagram_url: string;
  video_url: string;
  display_order: number;
}

export default function VideoReels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
        const res = await fetch(`${apiUrl}/reels`);
        const data = await res.json();
        
        // Ensure data is an array before setting state
        const reelsArray = Array.isArray(data) ? data : [];
        setReels(reelsArray);
      } catch (err) {
        console.error('Error fetching reels:', err);
        setReels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);


  if (loading) {
    return (
      <div className="py-24 bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Syncing Performance Matrix...</p>
      </div>
    );
  }

  if (reels.length === 0) return null;

  return (
    <section className="py-8 sm:py-24 bg-zinc-950 overflow-hidden border-b border-white/5">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start gap-3 mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-red-500 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Live Performance View</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase italic">
            MUTANT <span className="text-red-600">PRODUCTS</span>
          </h2>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.4em] text-[8px] sm:text-xs pl-1">Exclusively engineered in Coimbatore.</p>
        </div>
        
        <div className="flex gap-3 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth-x snap-x snap-mandatory -mx-4 px-4 pb-8">
          {reels.map((v) => {
            const isInstagram = v.instagram_url && v.instagram_url.includes('instagram.com');
            const vUrl = v.video_url ? getMediaUrl(v.video_url) : null;
            
            let embedUrl = null;
            if (isInstagram) {
              const base = v.instagram_url.split('?')[0];
              embedUrl = `${base.endsWith('/') ? base : base + '/'}embed/`;
            }

            return (
              <div key={v.id} className="flex-shrink-0 w-[240px] sm:w-[320px] aspect-[9/16] rounded-2xl sm:rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer shadow-2xl relative snap-start group">
                 {vUrl ? (
                   <video
                     key={vUrl}
                     className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                     muted 
                     loop 
                     autoPlay
                     playsInline
                     preload="auto"
                     onError={(e) => {
                       console.error('Video load error:', vUrl);
                       (e.target as HTMLVideoElement).parentElement!.style.backgroundColor = '#18181b';
                     }}
                   >
                     <source src={vUrl} type="video/mp4" />
                   </video>
                 ) : isInstagram ? (
                    <iframe
                      src={embedUrl!}
                      className="absolute inset-0 w-full h-full border-none opacity-90 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                      scrolling="no"
                      allowTransparency={true}
                    />
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-700">
                     <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">File Missing</span>
                   </div>
                 )}
                 
                 {/* Visual Overlays */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none transition-all duration-700"></div>

                 {/* Information Badge - Balanced Title */}
                 <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8 z-10 pointer-events-none">
                   <div className="flex flex-col gap-1.5 sm:gap-3">
                     <div className="w-4 sm:w-8 h-1 bg-red-600"></div>
                     <h4 className="text-[10px] sm:text-2xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-lg">
                       {v.title}
                     </h4>
                     <span className="text-zinc-500 text-[6px] sm:text-[8px] font-black uppercase tracking-[0.3em] opacity-80">Mutant Built</span>
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
