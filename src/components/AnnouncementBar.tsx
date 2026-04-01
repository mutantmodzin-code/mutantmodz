// AnnouncementBar removed — replaced with a static, non-scrolling banner only on desktop
export default function AnnouncementBar() {
  return (
    <div className="hidden sm:flex h-9 items-center justify-center bg-zinc-950 border-b border-red-900/30 px-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-white/80 text-center">
        🔥 Free Shipping Above <span className="text-red-500">₹999</span> &nbsp;|&nbsp; COD Available &nbsp;|&nbsp; Trusted by 10,000+ Riders
      </p>
    </div>
  );
}
