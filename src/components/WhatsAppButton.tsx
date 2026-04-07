import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = '9597596755'; // Client's actual number from context
  const message = 'Hi! I am interested in your bike accessories.';
  const whatsappUrl = `https://wa.me/91${9597596755}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-[80px] sm:bottom-[20px] right-[16px] sm:right-[20px] z-[60] group">
      {/* Pulse Animation Layers */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></span>
      <span className="absolute -inset-2 rounded-full bg-[#25D366] animate-pulse opacity-10 group-hover:opacity-20 transition-opacity delay-75"></span>
      
      {/* Main Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-16 h-16 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-all duration-300 transform hover:scale-110 active:scale-95 group/btn"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={32} className="group-hover/btn:rotate-12 transition-transform duration-300" />
        
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none shadow-2xl border border-white/5">
          Chat with us on WhatsApp
        </span>
      </a>
    </div>
  );
}


