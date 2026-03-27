import { ShieldCheck, BadgeCheck, RotateCcw, MessageSquareText } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { icon: ShieldCheck, title: '100% Secure Payment', desc: 'Secure encryption protocols' },
    { icon: BadgeCheck, title: '100% Quality Products', desc: 'Certified performance gear' },
    { icon: RotateCcw, title: 'Easy Returns Policy', desc: '7-day replacement window' },
    { icon: MessageSquareText, title: 'Chat Support Available', desc: '24/7 expert assistance' },
  ];

  return (
    <section className="py-12 px-6 sm:px-12 bg-zinc-900/30 border-y border-white/5">
      <div className="max-w-[1700px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        {badges.map((badge, i) => (
          <div key={i} className="flex items-center gap-6 p-6 group hover:bg-white/5 rounded-3xl transition-all duration-500">
            <div className="w-16 h-16 shrink-0 bg-red-600/10 border border-red-600/20 rounded-2xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500">
              <badge.icon size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-white font-black text-sm uppercase tracking-widest">{badge.title}</h4>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
