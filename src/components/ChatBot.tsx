import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Zap } from 'lucide-react';

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
            "👋 Welcome to **Mutant Modz** Customer Support. I'm your support agent. State your objective: products, location, or technical support. 🏍️",
    },
    {
        patterns: [/product|sell|stock|availabl|what.*have|what.*offer|catalog/i],
        response:
            "🛒 **Hardware Manifest**:\n\n• **Elite Helmets** – MT, SMK, Axor (₹2,499 – ₹7,999)\n• **Riding Hardware** – Jackets, Gloves, Armor\n• **Direct Mods** – LED Hub, Performance Exhaust, Carbon Panels\n\nAccess the **Products** sector for full sequence.",
    },
    {
        patterns: [/helmet/i],
        response:
            "🪖 **Ballistic Protection**:\n\n• **MT Revenge 2** – ₹4,999 (Elite Tier)\n• **SMK Twister** – ₹3,499 (Industrial Standard)\n• **Axor Apex** – ₹5,499 (Dual Visor Array)\n\nAll items are DOT/ISI validated.",
    },
    {
        patterns: [/gear|glove|jacket|guard|suit|riding wear/i],
        response:
            "🧤 **Tactical Gear**:\n\n• **Pro Gloves** – ₹899 (Haptic Ready)\n• **Command Jacket** – ₹4,499 (Weatherproof)\n• **Impact Guards** – ₹1,299 (Adjustable)",
    },
    {
        patterns: [/modif|custom|mod|exhaust|led|light|strip|carbon|air filter|performance/i],
        response:
            "🔧 **Modification Protocols**:\n\n• **LED Matrix** – ₹1,999 (6000K)\n• **High-Flow Exhaust** – ₹3,999\n• **Performance Filtration** – ₹1,799\n• **Carbon Accents** – ₹699",
    },
    {
        patterns: [/location|address|where|find|directions?|map|reach|place|shop|store/i],
        response:
            "📍 **Base Coordinates**:\n\n**Mutant Modz HQ**\nOpposite Vibgyor School, Uppilipalayam\nCoimbatore, Tamil Nadu\n\nNavigation data available on **Contact** page.",
    },
    {
        patterns: [/time|hour|open|close|timing|when.*open|schedule|day/i],
        response:
            "🕐 **Operational Window**:\n\n• **Mon – Sat**: 1000 - 2000 HRS\n• **Sunday**: 1000 - 1800 HRS",
    },
    {
        patterns: [/phone|call|number|contact|reach|talk|speak/i],
        response:
            "📞 **Comms Channel**:\n\n• **Direct Line**: +91 93426 37975\n• **Encryption**: info@mutantmodz.com",
    },
    {
        patterns: [/thank|thanks|great|perfect|awesome|nice/i],
        response: "🦾 Objective complete. Happy riding, user. Protocol ending. 🔥"
    }
];

const FALLBACK =
    "🤖 Search parameters not recognized. Try querying:\n• \"Hardware list\"\n• \"Base coordinates\"\n• \"Operational hours\"\n• \"Comms channel\"";

const QUICK_PROMPTS = [
    'Hardware list?',
    'Base coordinates?',
    'Operational hours?',
    'Comms channel?',
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
    const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
        }
        if (part === '\n') return <br key={i} />;
        return <span key={i}>{part}</span>;
    });
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            text: "👋 AI Logistic Officer online. Ready to decode your inquiries about Mutant Modz hardware and operations.",
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
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen((v) => !v)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                className="fixed bottom-28 sm:bottom-6 right-6 z-50 w-16 h-16 rounded-[1.5rem] bg-red-600 hover:bg-white text-white hover:text-red-600 shadow-2xl flex items-center justify-center transition-all duration-500 hover:rotate-12 group border-4 border-zinc-950"
            >
                {isOpen ? <X size={24} /> : <Zap size={24} className="group-hover:animate-pulse" />}
                {!isOpen && (
                    <span className="absolute right-full mr-6 bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none">
                        Customer Support
                    </span>
                )}
            </button>

            {/* Chat Interface */}
            <div
                className={`fixed bottom-28 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] flex flex-col rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] border border-white/5 transition-all duration-700 origin-bottom-right glass-card ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none translate-y-20'
                    }`}
                style={{ height: '600px' }}
            >
                {/* Header Profile */}
                <div className="flex items-center gap-4 bg-zinc-900/50 p-6 border-b border-white/5 backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center border border-red-500/30">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-black text-xs uppercase tracking-widest">LOGISTICS AI</p>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Protocol Active</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Data Feed */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-none">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex items-start gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center border ${msg.sender === 'bot' ? 'bg-zinc-900 border-zinc-800' : 'bg-red-600 border-red-500'
                                }`}>
                                {msg.sender === 'bot' ? <Bot size={14} className="text-zinc-400" /> : <User size={14} className="text-white" />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl p-4 text-[11px] font-medium leading-relaxed
                                ${msg.sender === 'bot'
                                    ? 'bg-white/5 text-zinc-400 border border-white/5 rounded-tl-none'
                                    : 'bg-white text-black font-bold rounded-tr-none shadow-lg'
                                }`}
                            >
                                {formatText(msg.text)}
                                <p className="text-[8px] mt-2 opacity-30 uppercase font-black tracking-widest">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                <Bot size={14} className="text-zinc-400" />
                            </div>
                            <div className="flex gap-1.5 bg-white/5 px-4 py-3 rounded-2xl">
                                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-150" />
                                <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce delay-300" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Sub-commands */}
                <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-none border-t border-white/5 bg-black/20">
                    {QUICK_PROMPTS.map((prompt) => (
                        <button
                            key={prompt}
                            onClick={() => sendMessage(prompt)}
                            className="flex-shrink-0 text-[9px] font-black uppercase tracking-widest bg-zinc-900/50 hover:bg-white text-zinc-500 hover:text-black px-4 py-2.5 rounded-xl border border-white/5 transition-all whitespace-nowrap"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                {/* Input Terminal */}
                <div className="p-6 bg-zinc-950 border-t border-white/5 flex gap-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        placeholder="INPUT QUERY..."
                        className="flex-1 bg-zinc-900 text-white placeholder-zinc-700 text-[10px] font-black tracking-widest px-6 py-4 rounded-2xl border border-transparent focus:border-red-600 focus:outline-none transition-all uppercase"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim()}
                        className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-white text-white hover:text-red-600 disabled:opacity-20 flex items-center justify-center transition-all flex-shrink-0 active:scale-90"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </>
    );
}
