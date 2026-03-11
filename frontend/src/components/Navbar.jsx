import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ position: 'relative', width: '400px' }}>
                <Search style={{ position: 'absolute', top: '10px', left: '12px', color: '#94a3b8' }} size={18} />
                <input className="input" style={{ backgroundColor: '#f8fafc', border: 'none', paddingLeft: '3rem' }} placeholder="Search commands or data..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ cursor: 'pointer', position: 'relative', padding: '0.5rem', borderRadius: '50%', backgroundColor: '#f1f5f9' }}>
                    <Bell size={20} color="#64748b" />
                    <span style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid #e2e8f0' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.username || 'Admin'}</p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>System Administrator</p>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} />
                    </div>
                    <button onClick={logout} className="btn" style={{ padding: '0.5rem', color: '#ef4444' }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
