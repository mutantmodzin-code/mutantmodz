import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Zap, Target } from 'lucide-react';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';

export default function Contact() {
  useEffect(() => {
    updatePageSEO(PAGE_SEO.contact);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      label: 'Address',
      value: 'Singanallur, Opposite Vibgyor School, Uppilipalayam, Coimbatore - 641015',
      link: 'https://maps.app.goo.gl/LqMYmPvYTdRkvGBn7',
      sub: 'Our Location (Singanallur)'
    },
    {
      icon: Phone,
      label: 'Call Us',
      value: '+91 95975 96755',
      link: 'tel:+919597596755',
      sub: 'Phone Number'
    },
    {
      icon: Mail,
      label: 'Email Us',
      value: 'info@mutantmodz.com',
      link: 'mailto:info@mutantmodz.com',
      sub: 'Email Address'
    },
    {
      icon: MessageSquare,
      label: 'WhatsApp Us',
      value: '+91 95975 96755',
      link: 'https://wa.me/919597596755',
      sub: 'Message Us'
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
            <span className="text-red-500 text-xs font-black uppercase tracking-[0.4em]">Ready to Contact</span>
          </div>
          <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter leading-none uppercase mb-6">
            GET IN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">TOUCH</span>
          </h1>
          <p className="text-lg text-zinc-500 font-bold max-w-2xl mx-auto uppercase tracking-[0.3em] text-[12px] opacity-80">
            Get in touch with the Mutant Modz support team.
          </p>
        </div>
      </section>

      {/* Interface Section */}
      <section className="py-12 sm:py-24 px-4 sm:px-12 bg-zinc-950">
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-20">

          {/* Methods Array (Left Side) */}
          <div className="lg:col-span-5 space-y-8 sm:space-y-10">
            <div className="space-y-4 mb-8 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">CONTACT <span className="text-red-600">OPTIONS</span></h2>
              <div className="w-16 h-1 bg-red-600"></div>
              <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-xs">Choose how you want to contact us</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6">
              {contactMethods.map((method, idx) => (
                <a
                  key={idx}
                  href={method.link}
                  className="group flex items-center gap-4 sm:gap-6 p-5 sm:p-8 bg-zinc-900/40 rounded-2xl sm:rounded-[2.5rem] border border-white/5 hover:border-red-600/40 transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(220,38,38,0.2)] min-h-[72px]"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-red-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-6 shadow-inner flex-shrink-0">
                    <method.icon size={24} />
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <div className="text-xs font-black text-red-500 uppercase tracking-widest">{method.sub}</div>
                    <div className="text-white font-black text-base sm:text-lg uppercase tracking-tight group-hover:text-red-600 transition-colors line-clamp-1">{method.label}</div>
                    <div className="text-zinc-500 text-[12px] sm:text-[13px] font-medium uppercase break-words leading-snug">{method.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="pt-6 sm:pt-12 p-6 sm:p-10 bg-red-600 rounded-2xl sm:rounded-[3rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 transform scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                <Clock size={120} />
              </div>
              <div className="relative z-10 space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <Clock size={24} className="animate-pulse" />
                  <h4 className="font-black uppercase tracking-widest text-base">WORKING HOURS</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="font-black uppercase text-xs">MON - SAT</span>
                    <span className="font-bold text-xs uppercase">10:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="font-black uppercase text-xs">SUNDAY</span>
                    <span className="font-bold text-xs uppercase">10:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (Right Side) */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/40 backdrop-blur-3xl p-6 sm:p-20 rounded-2xl sm:rounded-[4rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent"></div>

              <div className="relative z-10 space-y-8 sm:space-y-12">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-3xl sm:text-5xl font-black text-white leading-none uppercase tracking-tighter">CONTACT <br /><span className="text-red-600">US</span></h3>
                  <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs">Fill the form below and we will contact you</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-zinc-400 font-black uppercase text-xs tracking-widest ml-2 sm:ml-4">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                        className="w-full bg-black/40 border border-white/5 rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-8 text-[14px] sm:text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all tracking-wide sm:uppercase sm:tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-600 min-h-[52px]"
                      />
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <label className="text-zinc-400 font-black uppercase text-xs tracking-widest ml-2 sm:ml-4">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                        className="w-full bg-black/40 border border-white/5 rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-8 text-[14px] sm:text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all tracking-wide sm:uppercase sm:tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-600 min-h-[52px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-zinc-400 font-black uppercase text-xs tracking-widest ml-2 sm:ml-4">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Enter your phone number"
                      className="w-full bg-black/40 border border-white/5 rounded-xl sm:rounded-2xl py-4 sm:py-5 px-5 sm:px-8 text-[14px] sm:text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all tracking-wide sm:uppercase sm:tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-600 min-h-[52px]"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <label className="text-zinc-400 font-black uppercase text-xs tracking-widest ml-2 sm:ml-4">Your Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Type your message"
                      className="w-full bg-black/40 border border-white/5 rounded-xl sm:rounded-3xl py-4 sm:py-6 px-5 sm:px-8 text-[14px] sm:text-[13px] font-bold text-white focus:outline-none focus:border-red-600/50 transition-all tracking-wide sm:uppercase sm:tracking-widest resize-none placeholder:normal-case placeholder:tracking-normal placeholder:text-zinc-600"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-bold text-center uppercase tracking-wider">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || submitted}
                    className={`relative w-full h-16 sm:h-20 rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-xs transition-all flex items-center justify-center gap-4 active:scale-95 group overflow-hidden disabled:opacity-80 ${
                      submitted ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    <div className={`flex items-center gap-4 transition-all duration-500 ${submitted || isLoading ? '-translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}>
                      <Send size={20} className="group-hover:rotate-12 transition-transform" />
                      Send Message
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center gap-4 transition-all duration-500 ${submitted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                      <Zap size={20} />
                      Message Sent!
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center gap-4 transition-all duration-500 ${isLoading && !submitted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-12 sm:py-24 px-4 sm:px-12 bg-black border-t border-white/5">
        <div className="max-w-[1700px] mx-auto text-center space-y-8 sm:space-y-12">
          <div className="space-y-4">
            <Target size={40} className="text-red-600 mx-auto" />
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">OUR <span className="text-red-600">LOCATION</span></h2>
            <p className="text-zinc-500 font-medium uppercase tracking-[0.2em] text-xs">Opposite Vibgyor School, Uppilipalayam, Coimbatore - 641015</p>
          </div>

          <div className="w-full h-[350px] sm:h-[600px] bg-zinc-900 rounded-2xl sm:rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl relative group">
            <iframe
              src="https://maps.app.goo.gl/LqMYmPvYTdRkvGBn7"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mutant Modz Location – Opposite Vibgyor School, Uppilipalayam, Coimbatore"
              className="grayscale contrast-125 brightness-75 group-hover:grayscale-0 group-hover:brightness-100 group-hover:contrast-100 transition-all duration-1000"
            ></iframe>

            {/* Overlay badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <div className="flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md border border-red-600/30 px-4 py-2 rounded-full shadow-xl">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse flex-shrink-0"></span>
                <span className="text-white text-xs font-black uppercase tracking-widest whitespace-nowrap">Mutant Modz — Coimbatore</span>
              </div>
            </div>
          </div>

          {/* Get Directions Button */}
          <a
            href="https://maps.app.goo.gl/LqMYmPvYTdRkvGBn7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.3em] text-base rounded-2xl transition-all active:scale-95 shadow-xl shadow-red-600/30"
          >
            <Target size={18} />
            Get Directions
          </a>
        </div>
      </section>

    </div>
  );
}
