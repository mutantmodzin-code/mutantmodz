import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-2 border-red-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tighter">
              <span className="text-white">MUTANT</span>
              <span className="text-red-600 ml-2">MODZ</span>
            </h3>
            <p className="text-zinc-500 font-medium uppercase tracking-widest text-[10px] leading-loose">
              Coimbatore's premier destination for high-performance bike accessories, premium helmets, and professional riding gear. We specialize in modifications for Royal Enfield, KTM, Yamaha, and more.
            </p>
            <div className="flex gap-4">
              <a href="https://instagram.com/mutant_modz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center hover:bg-red-600 transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com/mutantmodz" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center hover:bg-red-600 transition-all">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Quick Links</h4>
              <ul className="space-y-4">
                <li><a href="#products" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">Shop Products</a></li>
                <li><a href="#categories" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">Collections</a></li>
                <li><a href="#garage-sale" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">Garage Sale</a></li>
                <li><a href="#about" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">About Us</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Categories</h4>
              <ul className="space-y-4">
                <li><a href="#category?type=helmets" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">Helmets</a></li>
                <li><a href="#category?type=gear" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">Riding Gear</a></li>
                <li><a href="#category?type=accessories" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">Protection</a></li>
                <li><a href="#category?type=super" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">Superbike</a></li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-8">Contact Us</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <MapPin size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-relaxed">
                  Opposite Vibgyor School,<br />Uppilipalayam, Coimbatore<br />Tamil Nadu - 641015
                </p>
              </div>
              <div className="flex items-center gap-4 group">
                <Phone size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                <a href="tel:+918807727227" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">
                  +91 88077 27227
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <Mail size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                <a href="mailto:info@mutantmodz.com" className="text-zinc-500 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">
                  info@mutantmodz.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-20 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Mutant Modz Coimbatore. Premium Bike Accessories.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-zinc-700 hover:text-zinc-400 text-[9px] font-black uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-zinc-700 hover:text-zinc-400 text-[9px] font-black uppercase tracking-widest transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
