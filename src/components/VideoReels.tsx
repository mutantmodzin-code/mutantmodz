import { Play } from 'lucide-react';

const videos = [
  { id: 1, title: 'Performance Exhaust', video: 'https://cdn.coverr.co/videos/coverr-a-motorcyclist-on-the-road-4530/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 2, title: 'Tactical Gear', video: 'https://cdn.coverr.co/videos/coverr-motorcyclist-riding-on-the-highway-5408/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, title: 'Mountain Touring', video: 'https://cdn.coverr.co/videos/coverr-motorcyclist-riding-on-a-curvy-road-5407/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 4, title: 'Night Ride', video: 'https://cdn.coverr.co/videos/coverr-a-motorcyclist-on-the-road-4530/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function VideoReels() {
  return (
    <section className="py-24 px-6 sm:px-12 bg-zinc-950 overflow-hidden">
      <div className="max-w-[1700px] mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-4">
            <div className="text-red-600 font-bold uppercase tracking-[0.3em] text-[10px]">Visual Protocols</div>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">RIDER <span className="text-red-600">FEED</span></h2>
          </div>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] hidden md:block">Real world testing protocols in 4k</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {videos.map((v) => (
            <div key={v.id} className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer shadow-2xl">
               <video 
                 src={v.video} 
                 className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                 muted 
                 loop 
                 playsInline
                 onMouseEnter={(e) => e.currentTarget.play()}
                 onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none group-hover:via-transparent transition-all duration-700"></div>
               
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Play size={24} className="text-white fill-white ml-1" />
                  </div>
               </div>

               <div className="absolute bottom-8 left-8 text-white z-10">
                 <div className="flex items-center gap-2 mb-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)]"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">In Play</span>
                 </div>
                 <h4 className="text-lg font-black uppercase tracking-tight leading-none max-w-[120px]">{v.title}</h4>
               </div>

               {/* Scanline Effect */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
