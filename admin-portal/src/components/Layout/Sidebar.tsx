import React from 'react';
import { LayoutDashboard, Package, Settings, LogOut, ChevronRight } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-black border-r border-zinc-800 h-screen sticky top-0 flex flex-col pt-8">
            <div className="px-6 mb-12">
                <div className="text-2xl font-bold tracking-tighter">
                    <span className="text-white">MUTANT</span>
                    <span className="text-red-600 block text-xs tracking-[0.2em] font-black -mt-1 ml-0.5">ADMIN</span>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${activeTab === item.id
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} />
                            <span className="font-semibold">{item.label}</span>
                        </div>
                        {activeTab === item.id && <ChevronRight size={16} />}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white transition-colors">
                    <LogOut size={20} />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </aside>
    );
};
