import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'RAJESH KUMAR',
    location: 'Coimbatore, TN',
    review: 'Elite-tier accessories. The crash guards for my Himalayan 450 fit perfectly and have already saved my bike once!',
    rating: 5,
    role: 'Touring Enthusiast',
    productImg: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    name: 'ARUN PRASAD',
    location: 'Chennai, TN',
    review: 'Precision mods that transformed my KTM. The performance exhaust sound is exactly what I was looking for. Highly recommended!',
    rating: 5,
    role: 'Track Rider',
    productImg: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    name: 'VIKRAM SINGH',
    location: 'Bangalore, KA',
    review: 'The helmet collection is massive. Got a carbon fiber LS2 at a great price. Service at the Coimbatore HQ was top-notch.',
    rating: 5,
    role: 'Daily Commuter',
    productImg: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=100'
  },
  {
    name: 'PRIYA RAVI',
    location: 'Madurai, TN',
    review: 'Best riding gear for women I’ve found. The Rynox jacket is super comfortable even on long summer rides.',
    rating: 5,
    role: 'Long Distance Rider',
    productImg: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=100'
  }
];

export default function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="py-8 sm:py-24 bg-zinc-950 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter uppercase leading-none">
            TRUSTED BY <span className="text-red-600">RIDERS</span>
          </h2>
          <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] sm:text-xs mt-2">The Feedback Loop</p>
        </div>

        {/* MOBILE: Vertical List */}
        <div className="sm:hidden space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-zinc-900/40 p-4 rounded-2xl border border-white/5 flex gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800 border border-white/10">
                <img src={t.productImg} alt="Product" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} size={10} className="fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-white text-xs font-medium leading-tight">"{t.review}"</p>
                <div className="flex items-center gap-2 pt-1 mt-1 border-t border-white/5">
                  <span className="text-[9px] font-black uppercase text-red-500 tracking-wider font-bold">{t.name}</span>
                  <span className="text-zinc-600 text-[9px] uppercase font-bold">{t.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP: Existing Slider */}
        <div className="hidden sm:block relative group">
          <button onClick={prev} className="absolute -left-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex shadow-xl">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute -right-12 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 hidden lg:flex shadow-xl">
            <ChevronRight size={24} />
          </button>

          <div className="overflow-hidden rounded-[2.5rem]">
            <div 
              className="flex transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 flex justify-center">
                  <div className="max-w-4xl w-full p-12 lg:p-16 bg-zinc-900/40 rounded-[2.5rem] border border-white/5 relative group/card hover:border-red-600/30 transition-all">
                    <Quote className="absolute top-10 right-10 text-red-600 opacity-20 w-20 h-20" />
                    <div className="space-y-8">
                      <div className="flex gap-1">
                        {[...Array(t.rating)].map((_, s) => (
                          <Star key={s} size={20} className="fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                      <p className="text-2xl lg:text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                        "{t.review}"
                      </p>
                      <div className="flex items-center gap-6 pt-8 border-t border-white/5">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl">
                          {t.name[0]}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-black text-white uppercase tracking-widest">{t.name}</h4>
                          <p className="text-red-500 font-bold text-[10px] uppercase tracking-widest">{t.role} | {t.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-500 rounded-full h-1 ${current === i ? 'bg-red-600 w-8' : 'bg-white/10 w-2 hover:bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
