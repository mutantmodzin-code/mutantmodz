import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'RAJESH KUMAR',
    location: 'Coimbatore, TN',
    review: 'Elite-tier accessories. The crash guards for my Himalayan 450 fit perfectly and have already saved my bike once!',
    rating: 5,
    role: 'Touring Enthusiast'
  },
  {
    name: 'ARUN PRASAD',
    location: 'Chennai, TN',
    review: 'Precision mods that transformed my KTM. The performance exhaust sound is exactly what I was looking for. Highly recommended!',
    rating: 5,
    role: 'Track Rider'
  },
  {
    name: 'VIKRAM SINGH',
    location: 'Bangalore, KA',
    review: 'The helmet collection is massive. Got a carbon fiber LS2 at a great price. Service at the Coimbatore HQ was top-notch.',
    rating: 4,
    role: 'Daily Commuter'
  },
  {
    name: 'PRIYA RAVI',
    location: 'Madurai, TN',
    review: 'Best riding gear for women I’ve found in south India. The Rynox jacket is super comfortable even on long summer rides.',
    rating: 5,
    role: 'Long Distance Rider'
  },
  {
    name: 'KARTHIK J',
    location: 'Coimbatore, TN',
    review: 'Mutant Modz is the go-to place for performance modules. Zero latency in support and rapid logistics for all my orders.',
    rating: 5,
    role: 'Superbike Tech'
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
    <section className="py-32 px-6 sm:px-12 bg-zinc-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-6">
          <div className="text-red-600 font-black uppercase tracking-[0.5em] text-[10px]">The Feedback Loop</div>
          <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase">TRUSTED BY <span className="text-red-600">RIDERS</span></h2>
          <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Direct reviews from our global community.</p>
        </div>

        <div className="relative group min-h-[400px]">
          {/* Navigation */}
          <button onClick={prev} className="absolute -left-4 xl:-left-20 top-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex shadow-2xl">
            <ChevronLeft size={32} />
          </button>
          <button onClick={next} className="absolute -right-4 xl:-right-20 top-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all opacity-0 group-hover:opacity-100 hidden sm:flex shadow-2xl">
            <ChevronRight size={32} />
          </button>

          {/* Cards Carousel */}
          <div className="relative h-full overflow-hidden px-4">
            <div 
              className="flex transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 flex justify-center">
                  <div className="max-w-4xl w-full p-12 sm:p-20 bg-zinc-900/40 rounded-[3rem] border border-white/5 relative group/card hover:border-red-600/30 transition-all duration-700">
                    <Quote className="absolute top-10 right-10 text-red-600 opacity-20 w-24 h-24" />
                    
                    <div className="space-y-12">
                      <div className="flex gap-2">
                        {[...Array(t.rating)].map((_, s) => (
                          <Star key={s} size={20} className="fill-red-600 text-red-600 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                        ))}
                      </div>

                      <p className="text-2xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tighter line-clamp-4">
                        "{t.review}"
                      </p>

                      <div className="flex items-center gap-8 pt-10 border-t border-white/5">
                        <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl transform rotate-3 scale-110">
                          {t.name[0]}
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-black text-white uppercase tracking-widest">{t.name}</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em]">{t.role}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,1)]"></span>
                            <span className="text-red-500 font-black text-[10px] uppercase tracking-[0.2em]">{t.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-3 mt-16 mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`transition-all duration-500 rounded-full h-1.5 ${current === i ? 'bg-red-600 w-12 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/10 w-4 hover:bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
