import { Play } from 'lucide-react';

const videos = [
  { id: 1, title: 'Performance Exhaust', video: 'https://cdn.coverr.co/videos/coverr-a-motorcyclist-on-the-road-4530/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 2, title: 'Tactical Gear', video: 'https://cdn.coverr.co/videos/coverr-motorcyclist-riding-on-the-highway-5408/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, title: 'Mountain Touring', video: 'https://cdn.coverr.co/videos/coverr-motorcyclist-riding-on-a-curvy-road-5407/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 4, title: 'Night Ride', video: 'https://cdn.coverr.co/videos/coverr-a-motorcyclist-on-the-road-4530/1080p.mp4', thumbnail: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function VideoReels() {
  return (
    <section className="py-8 sm:py-24 bg-zinc-950 overflow-hidden border-b border-white/5">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-end mb-6 sm:mb-10">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
              WATCH OUR <span className="text-red-600">REELS</span>
            </h2>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">See our products in action</p>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth-x snap-x snap-mandatory -mx-4 px-4 pb-4">
          {videos.map((v) => (
            <div key={v.id} className="flex-shrink-0 w-[160px] sm:w-[280px] aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 cursor-pointer shadow-2xl relative snap-start group">
               <video 
                 src={v.video} 
                 className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                 muted 
                 loop 
                 playsInline
                 onMouseEnter={(e) => e.currentTarget.play()}
                 onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>
               
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <Play size={20} className="text-white fill-white ml-1" />
                  </div>
               </div>

               <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                 <h4 className="text-xs sm:text-lg font-black uppercase tracking-tight leading-none line-clamp-2">{v.title}</h4>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
