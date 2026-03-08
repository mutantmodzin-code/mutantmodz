import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
    id: number;
    text: string;
    sender: 'bot' | 'user';
    timestamp: Date;
}

// ─── Knowledge base ───────────────────────────────────────────────────────────
const KB: { patterns: RegExp[]; response: string }[] = [
    {
        patterns: [/hello|hi|hey|good\s*(morning|afternoon|evening)|namaste|howdy/i],
        response:
            "👋 Hey there, rider! Welcome to **Mutant Modz**! I'm your virtual assistant. Ask me anything about our products, store location, timings, or how to reach us. 🏍️",
    },
    {
        patterns: [/product|sell|stock|availabl|what.*have|what.*offer|catalog/i],
        response:
            "🛒 We carry a wide range of products:\n\n• **Helmets** – Full-face, half-face, modular (₹2,499 – ₹7,999)\n• **Riding Gear** – Jackets, gloves, knee & elbow guards\n• **Bike Accessories** – LED lights, exhaust systems, mobile mounts\n• **Modification Parts** – Air filters, LED strips, carbon fibre pads\n\nVisit the **Products** page for the full catalogue!",
    },
    {
        patterns: [/helmet/i],
        response:
            "🪖 Our helmet collection includes:\n\n• **MT Revenge 2 Full-Face** – ₹4,999\n• **SMK Twister Captain** – ₹3,499 (DOT certified, anti-fog visor)\n• **Axor Apex Hunter** – ₹5,499 (dual visor, lightweight)\n\nAll helmets are DOT/ISI certified for your safety! 💪",
    },
    {
        patterns: [/gear|glove|jacket|guard|suit|riding wear/i],
        response:
            "🧤 Our riding gear lineup:\n\n• **Riding Gloves Pro** – ₹899 (knuckle guard + touchscreen)\n• **Riding Jacket** – ₹4,499 (waterproof, CE-approved armor)\n• **Knee & Elbow Guards** – ₹1,299 (adjustable straps)\n\nStay safe and stylish on every ride! 🏍️",
    },
    {
        patterns: [/modif|custom|mod|exhaust|led|light|strip|carbon|air filter|performance/i],
        response:
            "🔧 Custom modification parts we offer:\n\n• **LED Headlight Kit** – ₹1,999 (6000K ultra-bright)\n• **Custom Exhaust System** – ₹3,999 (enhanced sound & performance)\n• **Performance Air Filter** – ₹1,799\n• **LED Strip Lights (RGB)** – ₹899\n• **Carbon Fibre Tank Pad** – ₹699\n\nTransform your ride with Mutant Modz! ⚡",
    },
    {
        patterns: [/accessory|accessories|mobile holder|mount|charger/i],
        response:
            "📱 Popular bike accessories:\n\n• **Mobile Holder Mount** – ₹499 (360° rotation, secure grip)\n• **LED Headlight Kit** – ₹1,999\n• **Custom Exhaust** – ₹3,999\n\nTons more in-store — come visit us! 🏪",
    },
    {
        patterns: [/price|cost|rate|how much|₹|rs\.|rupee/i],
        response:
            "💰 Our price range:\n\n• Helmets – ₹2,499 to ₹7,999\n• Riding Gear – ₹499 to ₹4,999\n• Accessories – ₹499 to ₹3,999\n• Modification Parts – ₹699 to ₹3,999\n\nWe offer **competitive prices** with no compromise on quality. Visit us or call for a specific quote!",
    },
    {
        patterns: [/location|address|where|find|directions?|map|reach|place|shop|store/i],
        response:
            "📍 You can find us at:\n\n**Mutant Modz**\nOpposite Vibgyor School, Uppilipalayam\nCoimbatore, Tamil Nadu, India\n\nCheck the **Contact** page for a Google Maps embed. We're easy to find! 🗺️",
    },
    {
        patterns: [/time|hour|open|close|timing|when.*open|schedule|day/i],
        response:
            "🕐 Our store timings:\n\n• **Monday – Saturday**: 10:00 AM – 8:00 PM\n• **Sunday**: 10:00 AM – 6:00 PM\n\nWe're open all days — come ride over! 🏍️",
    },
    {
        patterns: [/phone|call|number|contact|reach|talk|speak/i],
        response:
            "📞 Reach us anytime:\n\n• **Phone / WhatsApp**: +91 93426 37975\n• **Email**: info@mutantmodz.com\n• **Store**: Opp. Vibgyor School, Uppilipalayam, Coimbatore\n\nGive us a call or walk into the store — we're always happy to help! 😊",
    },
    {
        patterns: [/email|mail/i],
        response:
            '📧 You can email us at:\n\n**info@mutantmodz.com**\n\nWe usually reply within a few hours during store hours.',
    },
    {
        patterns: [/whatsapp|wa|chat/i],
        response:
            '💬 Send us a WhatsApp message at **+91 93426 37975** and we\'ll get back to you right away!',
    },
    {
        patterns: [/about|who|story|brand|company|mutant modz|history/i],
        response:
            "🏍️ **About Mutant Modz**\n\nWe're Coimbatore's favourite one-stop shop for premium bike accessories, helmets, and custom riding gear. Born from a passion for motorcycles, we've been serving the biking community with top-quality products and expert guidance.\n\nFrom first-time riders to seasoned enthusiasts — **Mutant Modz** has got you covered! 🔥",
    },
    {
        patterns: [/instagram|insta|facebook|social|follow/i],
        response:
            '📸 Follow us on social media for the latest arrivals, custom builds & community updates!\n\n• **Instagram**: @mutantmodz\n• **Facebook**: Mutant Modz\n\nStay connected with the riding community! 🤝',
    },
    {
        patterns: [/offer|discount|deal|sale|coupon|promo/i],
        response:
            '🎉 Visit us in-store or follow us on Instagram **@mutantmodz** to catch our latest offers and seasonal discounts. We love rewarding our loyal riders! 🏍️',
    },
    {
        patterns: [/deliver|ship|online order|buy online/i],
        response:
            '🏪 Currently we operate as a **physical store** in Coimbatore. Visit us at Opp. Vibgyor School, Uppilipalayam, or call **+91 93426 37975** to enquire about a specific product!',
    },
    {
        patterns: [/thank|thanks|thankyou|great|perfect|awesome|nice/i],
        response:
            "😊 You're welcome! Happy riding! If you have more questions, I'm right here. 🏍️🔥",
    },
    {
        patterns: [/bye|goodbye|see you|later|cya/i],
        response:
            '👋 Goodbye! Stay safe on the roads and keep riding! See you at **Mutant Modz**! 🏍️',
    },
];

const FALLBACK =
    "🤖 I'm specifically trained to answer questions about **Mutant Modz** — our products, location, timings, and contact details.\n\nTry asking me:\n• \"What helmets do you sell?\"\n• \"Where is the store?\"\n• \"What are your timings?\"\n• \"How can I contact you?\"";

const QUICK_PROMPTS = [
    'What products do you sell?',
    'Where is the store?',
    'Store timings?',
    'How to contact you?',
    'Helmet prices?',
];

function getBotResponse(input: string): string {
    const trimmed = input.trim();
    for (const entry of KB) {
        if (entry.patterns.some((p) => p.test(trimmed))) {
            return entry.response;
        }
    }
    return FALLBACK;
}

function formatText(text: string) {
    // Render **bold** and newlines
    const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part === '\n') return <br key={i} />;
        return <span key={i}>{part}</span>;
    });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            text: "👋 Hey there, rider! I'm the **Mutant Modz** virtual assistant. Ask me anything about our products, location, store hours, or how to reach us!",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [messages, isOpen]);

    const sendMessage = (text: string = input) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMsg: Message = {
            id: Date.now(),
            text: trimmed,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botMsg: Message = {
                id: Date.now() + 1,
                text: getBotResponse(trimmed),
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 700 + Math.random() * 400);
    };

    const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <>
            {/* ── Floating toggle button ── */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            >
                {isOpen ? (
                    <X size={26} />
                ) : (
                    <>
                        <MessageCircle size={26} />
                        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-zinc-700">
                            Chat with us!
                        </span>
                    </>
                )}
            </button>

            {/* ── Chat window ── */}
            <div
                className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-zinc-700 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'
                    }`}
                style={{ height: '520px' }}
            >
                {/* Header */}
                <div className="flex items-center gap-3 bg-red-600 px-4 py-3 flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm leading-tight">Mutant Modz Assistant</p>
                        <p className="text-red-100 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
                            Online · Always here to help
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="ml-auto text-white/80 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-zinc-900 px-3 py-4 space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div
                                className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'bot' ? 'bg-red-600' : 'bg-zinc-600'
                                    }`}
                            >
                                {msg.sender === 'bot' ? (
                                    <Bot size={14} className="text-white" />
                                ) : (
                                    <User size={14} className="text-white" />
                                )}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'bot'
                                    ? 'bg-zinc-800 text-gray-100 rounded-bl-sm'
                                    : 'bg-red-600 text-white rounded-br-sm'
                                    }`}
                            >
                                {formatText(msg.text)}
                                <p className="text-[10px] mt-1 opacity-50">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex items-end gap-2">
                            <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                                <Bot size={14} className="text-white" />
                            </div>
                            <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-bl-sm">
                                <span className="flex gap-1">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick prompts */}
                <div className="bg-zinc-900 border-t border-zinc-800 px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 scrollbar-none">
                    {QUICK_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => sendMessage(prompt)}
                            className="flex-shrink-0 text-xs bg-zinc-800 hover:bg-red-600 hover:text-white text-gray-300 px-3 py-1.5 rounded-full transition-colors border border-zinc-700 whitespace-nowrap"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div className="bg-zinc-950 border-t border-zinc-800 px-3 py-3 flex gap-2 flex-shrink-0">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="Ask about products, location…"
                        className="flex-1 bg-zinc-800 text-white placeholder-gray-500 text-sm px-4 py-2.5 rounded-xl border border-zinc-700 focus:border-red-600 focus:outline-none transition-colors"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim()}
                        className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors flex-shrink-0"
                        aria-label="Send"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </>
    );
}
