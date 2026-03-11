import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Zap, Target } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: MapPin,
      label: 'Operational Base',
      value: 'Opposite Vibgyor School, Uppilipalayam, Coimbatore',
      link: 'https://maps.google.com',
      sub: 'Base Coordinates'
    },
    {
      icon: Phone,
      label: 'Voice Channel',
      value: '+91 93426 37975',
      link: 'tel:+919342637975',
      sub: 'Direct Line'
    },
    {
      icon: Mail,
      label: 'Digital Encryption',
      value: 'info@mutantmodz.com',
      link: 'mailto:info@mutantmodz.com',
      sub: 'Secure Message'
    },
    {
      icon: MessageSquare,
      label: 'Instant Comms',
      value: '+91 93426 37975',
      link: 'https://wa.me/919342637975',
      sub: 'WhatsApp Protocol'
    }
  ];

  return (
    <div className={`min-h-screen bg-zinc-950 transition-opacity duration-1000`}>

      {/* Communication Hub Header */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <img
            src="https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg"
            className="w-full h-full object-cover opacity-20 transform scale-110"
            alt="Contact Background"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/60 to-zinc-950"></div>

        <div className="max-w-5xl mx-auto relative z-10 px-6 text-center pt-20">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em]">Ready for Transmission</span>
          </div>
          <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter leading-none uppercase mb-6">
            COMMS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">CENTER</span>
          </h1>
          <p className="text-lg text-zinc-500 font-bold max-w-2xl mx-auto uppercase tracking-[0.3em] text-[12px] opacity-80">
            Initiate contact with the Mutant Modz logistics team.
          </p>
        </div>
      </section>

      {/* Interface Section */}
      <section className="py-24 px-6 sm:px-12 bg-zinc-950">
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Methods Array (Left Side) */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-4 mb-16">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">DIRECT <span className="text-red-600">LINKS</span></h2>
              <div className="w-16 h-1 bg-red-600"></div>
              <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-[11px]">Choose your preferred communication protocol.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {contactMethods.map((method, idx) => (
                <a
                  key={idx}
                  href={method.link}
                  className="group flex items-center gap-6 p-8 bg-zinc-900/40 rounded-[2.5rem] border border-white/5 hover:border-red-600/40 transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.2)]"
                >
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-6 shadow-inner">
                    <method.icon size={28} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">{method.sub}</div>
                    <div className="text-white font-black text-lg uppercase tracking-tight group-hover:text-red-600 transition-colors line-clamp-1">{method.label}</div>
                    <div className="text-zinc-500 text-[13px] font-medium uppercase truncate max-w-xs">{method.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-12 p-10 bg-red-600 rounded-[3rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 transform scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                <Clock size={120} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <Clock size={24} className="animate-pulse" />
                  <h4 className="font-black uppercase tracking-widest text-sm">OPERATIONAL WINDOW</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="font-black uppercase text-xs">MON - SAT</span>
                    <span className="font-bold text-xs uppercase">10:00 - 20:00 HRS</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="font-black uppercase text-xs">SUNDAY</span>
                    <span className="font-bold text-xs uppercase">10:00 - 18:00 HRS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comms Form (Right Side) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/40 backdrop-blur-3xl p-10 sm:p-20 rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>

              <div className="relative z-10 space-y-12">
                <div className="space-y-4">
                  <h3 className="text-4xl sm:text-5xl font-black text-white leading-none uppercase tracking-tighter">ENCRYPTED <br /><span className="text-red-600">MESSAGE</span></h3>
                  <p className="text-zinc-500 font-medium uppercase tracking-[0.3em] text-[11px]">Submit your hardware requirements below.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-zinc-400 font-black uppercase text-[10px] tracking-widest ml-4">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="INPUT IDENTITY..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all uppercase tracking-widest"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-zinc-400 font-black uppercase text-[10px] tracking-widest ml-4">Email Channel</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="INPUT ENCRYPTION..."
                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all uppercase tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-zinc-400 font-black uppercase text-[10px] tracking-widest ml-4">Phone Protocol</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="INPUT DIRECT LINE..."
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all uppercase tracking-widest"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-zinc-400 font-black uppercase text-[10px] tracking-widest ml-4">Message Parameters</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="STATE YOUR OBJECTIVE..."
                      className="w-full bg-black/40 border border-white/5 rounded-3xl py-6 px-8 text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all uppercase tracking-widest resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full h-20 rounded-2xl font-black uppercase tracking-[0.4em] text-xs transition-all flex items-center justify-center gap-4 active:scale-95 group overflow-hidden ${submitted ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white'
                      }`}
                  >
                    <div className={`flex items-center gap-4 transition-all duration-500 ${submitted ? '-translate-y-20' : 'translate-y-0'}`}>
                      <Send size={20} className="group-hover:rotate-12 transition-transform" />
                      Transmit Command
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center gap-4 transition-all duration-500 ${submitted ? 'translate-y-0' : 'translate-y-20'}`}>
                      <Zap size={20} />
                      Transmission Success
                    </div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Mapping */}
      <section className="py-24 px-6 sm:px-12 bg-black border-t border-white/5">
        <div className="max-w-[1700px] mx-auto text-center space-y-12">
          <div className="space-y-4">
            <Target size={40} className="text-red-600 mx-auto" />
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">BASE <span className="text-red-600">RECON</span></h2>
            <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-[11px]">Locate the headquarters in Coimbatore.</p>
          </div>

          <div className="w-full h-[600px] bg-zinc-900 rounded-[4rem] overflow-hidden border border-white/5 grayscale contrast-125 brightness-75 hover:grayscale-0 transition-all duration-1000 shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3947444885!2d76.999000!3d11.016800!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTHCsDAxJzAwLjUiTiA3NsKwNTknNTYuNCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Mutant Modz Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
