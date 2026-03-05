import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const phoneNumber = '919876543210';
  const message = 'Hi! I am interested in your bike accessories.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={32} className="group-hover:animate-pulse" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with us!
      </span>
    </a>
  );
}
