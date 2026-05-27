import { ShieldCheck, BadgeCheck, RotateCcw, MessageSquareText } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, title: '100% Secure Payment', desc: 'Encrypted checkout protocol for safe shopping' },
    { icon: BadgeCheck, title: 'Genuine Accessories', desc: 'Official parts from premium global brands' },
    { icon: RotateCcw, title: '30-Day Support', desc: 'Expert technical assistance for every purchase' },
    { icon: MessageSquareText, title: 'Direct Intelligence', desc: "Professional consultation for Coimbatore riders" },
  ];

  return (
    <section className="py-10 px-4 sm:px-12 bg-zinc-900/30 border-y border-white/5">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-4 p-4 sm:p-6 group hover:bg-white/5 rounded-2xl transition-all duration-500">
            <div className="w-14 h-14 shrink-0 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-500">
              <badge.icon size={26} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="text-white font-black text-sm uppercase tracking-wide leading-tight">{badge.title}</h4>
              <p className="text-zinc-400 text-xs font-semibold">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
