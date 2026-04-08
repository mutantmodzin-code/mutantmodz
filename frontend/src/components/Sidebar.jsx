import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Receipt,
    History,
    Users,
    BarChart3,
    Settings,
    Bike,
    TrendingUp,
    ShoppingCart
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, children }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '0.75rem',
            color: isActive ? 'white' : '#64748b',
            backgroundColor: isActive ? '#2563eb' : 'transparent',
            fontWeight: isActive ? 600 : 500,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            marginBottom: '0.5rem',
            boxShadow: isActive ? '0 10px 15px -3px rgba(37, 99, 235, 0.4)' : 'none'
        })}
    >
        <Icon size={20} />
        <span style={{ fontSize: '0.875rem' }}>{children}</span>
    </NavLink>
);

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    return (
        <aside style={{ 
            width: '250px', 
            height: '100vh', 
            backgroundColor: 'white', 
            borderRight: '1px solid #e2e8f0', 
            padding: '1.5rem', 
            position: 'fixed', 
            left: isMobile ? (isOpen ? 0 : '-250px') : 0, 
            top: 0, 
            zIndex: 110, 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'left 0.3s ease-in-out',
            boxShadow: isMobile && isOpen ? '20px 0 50px rgba(0,0,0,0.2)' : 'none'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.5rem 2rem 0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ backgroundColor: '#2563eb', padding: '0.5rem', borderRadius: '0.75rem', color: 'white' }}>
                        <Bike size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#0f172a' }}>MUTANT MODZ</h1>
                        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Pitshop Inventory</p>
                    </div>
                </div>
                {isMobile && (
                    <button onClick={onClose} style={{ padding: '0.5rem', color: '#64748b', border: 'none', background: 'none', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                )}
            </div>

            <nav style={{ flex: 1 }}>
                <SidebarLink to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
                <div style={{ margin: '1.5rem 0 0.5rem 0', padding: '0 0.5rem', fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Management</div>
                <SidebarLink to="/products" icon={Package}>Inventory</SidebarLink>
                <SidebarLink to="/vendors" icon={Users}>Vendors</SidebarLink>
                <SidebarLink to="/customers" icon={Users}>Customers</SidebarLink>

                <div style={{ margin: '1.5rem 0 0.5rem 0', padding: '0 0.5rem', fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sales & Billing</div>
                <SidebarLink to="/billing" icon={Receipt}>New Invoice</SidebarLink>
                <SidebarLink to="/invoices" icon={History}>Invoice Registry</SidebarLink>
                <SidebarLink to="/online-orders" icon={ShoppingCart}>Online Orders</SidebarLink>

                <div style={{ margin: '1.5rem 0 0.5rem 0', padding: '0 0.5rem', fontSize: '0.625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Analytics</div>
                <SidebarLink to="/reports" icon={BarChart3}>Revenue Reports</SidebarLink>
                <SidebarLink to="/profit" icon={TrendingUp}>Profit Dashboard</SidebarLink>
                <SidebarLink to="/gst-reports" icon={Receipt}>GST Reports</SidebarLink>
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ backgroundColor: '#e2e8f0', padding: '0.5rem', borderRadius: '0.5rem', color: '#475569' }}>
                        <Settings size={18} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Administration</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
