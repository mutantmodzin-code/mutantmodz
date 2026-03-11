import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="h-20 bg-black/50 backdrop-blur-xl border-b border-zinc-800 px-8 flex items-center justify-between sticky top-0 z-50">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search for products, categories, or orders..."
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-red-600/50 transition-all placeholder:text-zinc-600"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative text-zinc-400 hover:text-white transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-black"></span>
                </button>
                <div className="h-8 w-px bg-zinc-800"></div>
                <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                    <div className="text-right">
                        <p className="text-sm font-bold text-white leading-tight">Admin User</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Super Admin</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white ring-2 ring-zinc-800 group-hover:ring-red-600/50 transition-all">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};
