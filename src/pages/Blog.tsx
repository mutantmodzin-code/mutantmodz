import { useEffect } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';

const posts = [
  {
    title: 'Top 5 Must-Have Accessories for Royal Enfield Himalayan',
    desc: 'The Himalayan 450 is a beast. Here is how to make it even better with these essential mods.',
    date: 'March 15, 2026',
    img: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    title: 'How to Choose the Right Riding Jacket',
    desc: 'Mesh vs. Textile vs. Leather. We break down the pros and cons for Indian riding conditions.',
    date: 'March 10, 2026',
    img: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    title: 'Best Helmets Under ₹5000 in India',
    desc: 'Safety does not have to break the bank. Our top picks for budget-conscious riders.',
    date: 'March 5, 2026',
    img: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=600'
  },
  {
    title: 'Bike Touring Checklist: Everything You Need',
    desc: 'Preparing for your first long ride? Do not forget these essential items in your toolkit.',
    date: 'February 28, 2026',
    img: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=600'
  }
];

export default function Blog() {
  useEffect(() => {
    updatePageSEO(PAGE_SEO.blog);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      <section className="py-32 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-6">
            <div className="text-red-600 font-black uppercase tracking-[0.5em] text-[10px]">Transmission Hub</div>
            <h1 className="text-6xl sm:text-[10rem] font-black text-white tracking-tighter uppercase leading-none">
              BUYING <span className="text-red-600">GUIDE</span>
            </h1>
            <p className="text-zinc-500 font-black uppercase tracking-widest text-xs">Expert tactical advice for the modern rider.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {posts.map((p, i) => (
              <div key={i} className="group bg-zinc-900/40 rounded-[3rem] border border-white/5 overflow-hidden hover:border-red-600/30 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                <div className="h-64 overflow-hidden relative">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent"></div>
                  <div className="absolute top-8 left-8 bg-red-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-lg">New Thread</div>
                </div>
                <div className="p-10 space-y-6">
                  <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                    <Calendar size={14} className="text-red-500" />
                    {p.date}
                  </div>
                  <h3 className="text-2xl font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight leading-tight line-clamp-2">{p.title}</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed uppercase tracking-wide line-clamp-3">{p.desc}</p>
                  <button className="flex items-center gap-4 text-white font-black uppercase tracking-widest text-xs border-b border-red-600/50 pb-2 hover:text-red-500 transition-colors group/btn">
                    Access Intel <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
