import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = '9342637975';
  const message = 'Hi! I am interested in your bike accessories.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 group border-4 border-zinc-950"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
      <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl translate-x-4 group-hover:translate-x-0">
        Direct Line
      </span>
    </a>
  );
}

