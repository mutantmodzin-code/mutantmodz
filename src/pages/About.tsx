import { useEffect } from 'react';
import { Target, Heart, Award, Zap, Shield, Globe, MessageSquare } from 'lucide-react';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';

export default function About() {
  useEffect(() => {
    updatePageSEO(PAGE_SEO.about);
  }, []);

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To provide every rider with premium quality bike accessories and tactical gear that define the threshold of safety and performance.',
    },
    {
      icon: Heart,
      title: 'Rider Passion',
      description: 'We live and breathe motorcycles. Our team consists of active riders who understand the haptic demands of the road.',
    },
    {
      icon: Award,
      title: 'Elite Standards',
      description: 'Every module is carefully vetted and tested to meet industrial standards of durability and ballistic protection.',
    },
    {
      icon: Zap,
      title: 'Mod Innovation',
      description: 'We stay ahead of the curve, integrating the latest modification trends and hardware upgrades into our catalog.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">

      {/* Cinematic Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/1127133/pexels-photo-1127133.jpeg?auto=compress&cs=tinysrgb&w=1920"
            className="w-full h-full object-cover opacity-30 transform scale-110 animate-slow-zoom"
            alt="About Hero"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/80 to-zinc-950 z-10"></div>

        <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-10 inline-block px-8 py-2 bg-red-600/10 border border-red-600/20 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.5em]">The DNA of Mutant Modz</span>
          </div>
          <h1 className="text-7xl sm:text-[10rem] font-black text-white leading-none tracking-tighter uppercase mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            WE ARE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-800">MUTANT</span>
          </h1>
          <p className="text-xl sm:text-2xl text-zinc-400 font-bold uppercase tracking-[0.4em] mb-12 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Decoding the standard of bike customization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-12 mt-20 animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-white mb-2">500+</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Global Mods</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-white mb-2">2021</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Est. Protocol</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-white mb-2">10/10</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Quality Array</span>
            </div>
          </div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="py-40 px-6 sm:px-12 bg-black border-y border-white/5 relative">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                OUR <span className="text-red-600">ORIGIN</span> <br /> STORY
              </h2>
              <div className="w-24 h-2 bg-red-600"></div>
            </div>

            <div className="space-y-8 text-zinc-400 text-[16px] font-medium leading-[2] uppercase tracking-wide">
              <p className="animate-on-scroll">
                Mutant Modz emerged from the asphalt—a synthesis of raw passion and mechanical precision. Founded in the automotive hub of Coimbatore, we identified a void in the market for hardware that didn't just fit, but truly modified the rider's journey.
              </p>
              <p className="animate-on-scroll">
                Located in Singanallur, opposite Vibgyor School in Uppilipalayam, our workshop serves as the core processor for bike customization. We don't just sell parts; we provide tactical upgrades that allow every rider to express their unique identity. As the premier <strong>pitshop in Coimbatore</strong>, we are committed to excellence.
              </p>
              <div className="pt-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                  <Globe size={24} className="text-red-600" />
                  <h4 className="text-white font-black uppercase text-sm">Regional Footprint</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Serving the entire Tamil Nadu biking community with premium logistics.</p>
                </div>
                <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 space-y-4">
                  <MessageSquare size={24} className="text-red-600" />
                  <h4 className="text-white font-black uppercase text-sm">Open Channels</h4>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">Expert consultation for every tier of motorcycle enthusiast.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-red-600/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="space-y-6">
                <img
                  src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Modification Process"
                  className="rounded-[2.5rem] w-full h-80 object-cover grayscale hover:grayscale-0 transition-all duration-700 border-2 border-white/5 hover:border-red-600/50"
                />
                <img
                  src="https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Precision Parts"
                  className="rounded-[2.5rem] w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700 border-2 border-white/5 hover:border-red-600/50"
                />
              </div>
              <div className="space-y-6 pt-12">
                <img
                  src="https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Safety Array"
                  className="rounded-[2.5rem] w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-700 border-2 border-white/5 hover:border-red-600/50"
                />
                <img
                  src="https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Final Build"
                  className="rounded-[2.5rem] w-full h-80 object-cover grayscale hover:grayscale-0 transition-all duration-700 border-2 border-white/5 hover:border-red-600/50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE VALUES: The Array */}
      <section className="py-40 px-6 sm:px-12 bg-zinc-950">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
            <div className="space-y-6">
              <div className="text-red-600 font-black uppercase tracking-[0.5em] text-[10px]">Operational Philosophy</div>
              <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                THE CORE <br /> <span className="text-red-600 underline decoration-zinc-800 underline-offset-8">MANIFEST</span>
              </h2>
            </div>
            <p className="text-zinc-500 font-medium uppercase tracking-widest text-sm max-w-sm mb-2">
              Our commitment to the global brotherhood of riders and mechanical excellence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {values.map((value, index) => (
              <div
                key={index}
                className="group p-12 bg-zinc-900/40 rounded-[3rem] border border-white/5 hover:border-red-600/30 transition-all duration-700 relative overflow-hidden h-[400px] flex flex-col justify-end"
              >
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 transform">
                  <value.icon size={120} className="text-white" />
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                    <value.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{value.title}</h3>
                  <p className="text-zinc-500 font-medium text-[16px] leading-[1.8] uppercase tracking-wide group-hover:text-zinc-300 transition-colors">{value.description}</p>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/0 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US: The Stats */}
      <section className="py-40 px-6 sm:px-12 bg-black relative">
        <div className="absolute inset-0 bg-red-600/5 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-5xl sm:text-8xl font-black text-white tracking-tighter uppercase mb-24 leading-none">
            WHY THE COMMUNITY <br /> CHOOSES <span className="text-red-600">MUTANT</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <div className="text-8xl font-black text-white tracking-tighter group hover:text-red-500 transition-colors">99%</div>
              <div className="w-12 h-1 bg-red-600 mx-auto"></div>
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[11px]">User Satisfaction Array</p>
            </div>
            <div className="space-y-4">
              <div className="text-8xl font-black text-white tracking-tighter group hover:text-red-500 transition-colors">4.8</div>
              <div className="w-12 h-1 bg-red-600 mx-auto"></div>
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[11px]">Operational Rating</p>
            </div>
            <div className="space-y-4">
              <div className="text-8xl font-black text-white tracking-tighter group hover:text-red-500 transition-colors">24/7</div>
              <div className="w-12 h-1 bg-red-600 mx-auto"></div>
              <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[11px]">Logistics Support</p>
            </div>
          </div>

          <div className="mt-40 p-16 rounded-[4rem] bg-zinc-950 border border-white/5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-4xl font-black text-white flex items-center justify-center gap-4 uppercase tracking-tighter mb-8">
                <Shield size={40} className="text-red-600" />
                SECURE YOUR RIDE
              </h3>
              <p className="text-zinc-500 font-bold uppercase tracking-widest max-w-2xl mx-auto mb-12">
                Join thousands of riders who have upgraded their hardware manifest with Mutant Modz professional equipment.
              </p>
              <button className="px-12 py-6 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all transform hover:-translate-y-2 active:scale-95 shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
                Explore Full Catalog
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
