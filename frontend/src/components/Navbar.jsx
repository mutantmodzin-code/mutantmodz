import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, LogOut, ShoppingBag, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    // Live Notifications: Load initial + Poll for new orders
    useEffect(() => {
        let eventSource;
        let pollInterval;
        // Use a ref so it persists across renders but resets each session
        const lastOrderIdRef = { current: null };

        const API_BASE = import.meta.env.VITE_API_URL;

        // Format a raw DB row / SSE payload into a notification object
        const buildNotification = (data) => ({
            type: 'new_order',
            orderId: data.id || data.orderId,
            customerName: data.customer_name || data.customerName || 'Customer',
            totalAmount: data.total_amount || data.totalAmount,
            paymentMethod: data.payment_method || data.paymentMethod,
            timestamp: data.created_at || data.timestamp || new Date().toISOString()
        });

        // Handle a single new-order event
        const handleNewOrder = (data, silent = false) => {
            if (!data?.id) return;
            const id = parseInt(data.id);
            if (lastOrderIdRef.current !== null && id <= lastOrderIdRef.current) return;
            lastOrderIdRef.current = Math.max(lastOrderIdRef.current || 0, id);
            const notification = buildNotification(data);
            setNotifications(prev => [notification, ...prev].slice(0, 20));
            if (!silent) {
                setUnreadCount(prev => prev + 1);
                try {
                    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczIjdjr+PkyoJXKClluOv/zINRISlnvO//0YdOIyxpvvP/04pPIi5qv/X/1IpOIi9rv/b/1YtOIjBswPf/1oxNITFtw/n/2I1MITJuw/v/2Y1MITNvxPz/2o5MITNvxf3/249LITRwxv7/3JBLITV');
                    audio.volume = 0.3;
                    audio.play().catch(() => {});
                } catch (e) {}
            }
        };

        // 1. Load last 5 recent online orders on mount (so existing orders appear immediately)
        const loadRecentOrders = async () => {
            try {
                const response = await fetch(`${API_BASE}/notifications/recent`);
                if (!response.ok) return;
                const orders = await response.json();
                if (Array.isArray(orders) && orders.length > 0) {
                    // Set lastOrderId to the highest existing ID so we don't re-notify for these
                    const maxId = Math.max(...orders.map(o => parseInt(o.id)));
                    lastOrderIdRef.current = maxId;
                    // Show them as notifications (silently – no sound, no badge increment)
                    const mapped = orders.map(buildNotification);
                    setNotifications(mapped);
                }
            } catch (e) {
                console.error('Failed to load recent orders:', e);
            }
        };

        // 2. SSE Connection (works locally)
        const connectSSE = () => {
            eventSource = new EventSource(`${API_BASE}/notifications/stream`);
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'new_order') handleNewOrder(data);
                } catch (e) {}
            };
            eventSource.onerror = () => {
                eventSource.close();
                setTimeout(connectSSE, 10000);
            };
        };

        // 3. Polling (reliable on Vercel – checks for orders newer than what we've seen)
        const pollForNewOrders = async () => {
            try {
                const url = lastOrderIdRef.current
                    ? `${API_BASE}/notifications/latest?afterId=${lastOrderIdRef.current}`
                    : `${API_BASE}/notifications/latest`;
                const response = await fetch(url);
                if (!response.ok) return;
                const data = await response.json();
                if (data && data.id && parseInt(data.id) > (lastOrderIdRef.current || 0)) {
                    handleNewOrder(data);
                }
            } catch (e) {
                console.error('Polling failed:', e);
            }
        };

        loadRecentOrders();
        connectSSE();
        pollInterval = setInterval(pollForNewOrders, 10000); // Poll every 10s

        return () => {
            if (eventSource) eventSource.close();
            if (pollInterval) clearInterval(pollInterval);
        };
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications) {
            setUnreadCount(0);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        return date.toLocaleDateString('en-IN');
    };

    return (
        <nav style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ position: 'relative', width: '400px' }}>
                <Search style={{ position: 'absolute', top: '10px', left: '12px', color: '#94a3b8' }} size={18} />
                <input className="input" style={{ backgroundColor: '#f8fafc', border: 'none', paddingLeft: '3rem' }} placeholder="Search commands or data..." />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {/* Notification Bell */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                    <div
                        onClick={handleBellClick}
                        style={{
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            backgroundColor: showNotifications ? '#eff6ff' : '#f1f5f9',
                            border: showNotifications ? '1px solid #bfdbfe' : '1px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Bell size={20} color={showNotifications ? '#2563eb' : '#64748b'} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 2, right: 2,
                                minWidth: 18, height: 18,
                                backgroundColor: '#ef4444', borderRadius: '9999px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.65rem', fontWeight: 700, color: 'white',
                                padding: '0 4px',
                                boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                                animation: 'pulse 2s infinite'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </div>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            top: '120%',
                            right: 0,
                            width: '380px',
                            maxHeight: '450px',
                            backgroundColor: 'white',
                            borderRadius: '1rem',
                            boxShadow: '0 20px 60px -15px rgba(0,0,0,0.2)',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            zIndex: 200,
                            animation: 'fadeInDown 0.2s ease-out'
                        }}>
                            {/* Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9',
                                backgroundColor: '#fafbfd'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Bell size={16} color="#2563eb" />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>Order Notifications</span>
                                </div>
                                {notifications.length > 0 && (
                                    <button onClick={clearNotifications} style={{
                                        fontSize: '0.7rem', color: '#64748b', background: 'none', border: 'none',
                                        cursor: 'pointer', fontWeight: 600
                                    }}>
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
                                        <Bell size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                        <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>No new notifications</p>
                                        <p style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>You'll see order alerts here</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem',
                                            borderBottom: '1px solid #f8fafc',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                        >
                                            <div style={{
                                                width: 40, height: 40, borderRadius: '0.75rem',
                                                backgroundColor: '#eff6ff', color: '#2563eb',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <ShoppingBag size={18} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                                                    New Online Order #{notif.orderId}
                                                </p>
                                                <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.25rem' }}>
                                                    {notif.customerName} • ₹{parseFloat(notif.totalAmount).toLocaleString('en-IN')}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{
                                                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                                                        padding: '2px 6px', borderRadius: '4px',
                                                        backgroundColor: notif.paymentMethod === 'COD' ? '#fff7ed' : '#eff6ff',
                                                        color: notif.paymentMethod === 'COD' ? '#ea580c' : '#2563eb'
                                                    }}>
                                                        {notif.paymentMethod}
                                                    </span>
                                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                                        {formatTime(notif.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
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

            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
