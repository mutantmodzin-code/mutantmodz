import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, User, LogOut, ShoppingBag, X, Menu } from 'lucide-react';

// ── Loud notification ding via Web Audio API ──────────────────────────────────
const playNotificationSound = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        // Main ding
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(1.0, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.8);
        // Second note for a two-tone chime
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.55);
        gain2.gain.setValueAtTime(0.8, ctx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
        osc2.start(ctx.currentTime + 0.15);
        osc2.stop(ctx.currentTime + 0.9);
    } catch (e) {}
};

// ── Native browser notification (works on mobile) ─────────────────────────────
const showBrowserNotification = (notif) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
        const n = new Notification('🛒 New Order #' + notif.orderId, {
            body: `${notif.customerName} • ₹${parseFloat(notif.totalAmount).toLocaleString('en-IN')} • ${notif.paymentMethod}`,
            icon: '/vite.svg',
            badge: '/vite.svg',
            tag: 'order-' + notif.orderId,
            renotify: true,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 400]
        });
        n.onclick = () => {
            window.focus();
            n.close();
        };
    } catch (e) {}
};
// ─────────────────────────────────────────────────────────────────────────────

const Navbar = ({ onToggleSidebar, isMobile }) => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [pushPermission, setPushPermission] = useState('default');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const dropdownRef = useRef(null);
    const profileRef = useRef(null);

    // Register service worker & request notification permission on mount
    useEffect(() => {
        // Register SW
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
        }
        // Ask for permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(p => setPushPermission(p));
        } else if ('Notification' in window) {
            setPushPermission(Notification.permission);
        }
    }, []);

    // Live Notifications: Load initial + Poll for new orders
    useEffect(() => {
        let eventSource;
        let pollInterval;
        // Use a ref so it persists across renders but resets each session
        const lastOrderIdRef = { current: null };

        let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        if (API_BASE) {
            API_BASE = API_BASE.trim().replace(/\/$/, '');
            if (!API_BASE.endsWith('/api')) {
                API_BASE = `${API_BASE}/api`;
            }
        }

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
                playNotificationSound();
                showBrowserNotification(notification);
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
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfileMenu(false);
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
        <nav style={{ height: '70px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 1rem' : '0 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isMobile && (
                    <button onClick={onToggleSidebar} style={{ padding: '0.5rem', color: '#64748b', border: 'none', background: '#f1f5f9', borderRadius: '0.5rem', cursor: 'pointer' }}>
                        <Menu size={20} />
                    </button>
                )}
                <div style={{ position: 'relative', width: isMobile ? '180px' : '400px' }}>
                    <Search style={{ position: 'absolute', top: '10px', left: '12px', color: '#94a3b8' }} size={18} />
                    <input className="input" style={{ backgroundColor: '#f8fafc', border: 'none', paddingLeft: '3rem' }} placeholder="Search..." />
                </div>
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

                            {/* Enable notifications banner */}
                            {pushPermission !== 'granted' && (
                                <div style={{
                                    padding: '0.75rem 1.25rem',
                                    backgroundColor: '#eff6ff',
                                    borderBottom: '1px solid #bfdbfe',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '0.72rem', color: '#1e40af', fontWeight: 600 }}>
                                        📱 Get alerts on your phone
                                    </span>
                                    <button
                                        onClick={() => Notification.requestPermission().then(p => setPushPermission(p))}
                                        style={{
                                            fontSize: '0.7rem', fontWeight: 700, color: 'white',
                                            backgroundColor: '#2563eb', border: 'none', borderRadius: '6px',
                                            padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap'
                                        }}
                                    >
                                        Enable
                                    </button>
                                </div>
                            )}

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

                <div ref={profileRef} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid #e2e8f0', position: 'relative' }}>
                    {!isMobile && (
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.username || 'Admin'}</p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>System Administrator</p>
                        </div>
                    )}
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', border: 'none', padding: 0 }}
                        title="Profile menu"
                    >
                        <User size={20} />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '60px',
                            right: 0,
                            width: '250px',
                            backgroundColor: 'white',
                            borderRadius: '0.75rem',
                            boxShadow: '0 20px 60px -15px rgba(0,0,0,0.2)',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            zIndex: 200,
                            animation: 'fadeInDown 0.2s ease-out'
                        }}>
                            {/* Header */}
                            <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfd' }}>
                                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                                    {user?.username || 'Admin'}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>System Administrator</p>
                            </div>

                            {/* Menu Items */}
                            <div style={{ padding: '0.5rem' }}>
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowProfileMenu(false);
                                    }}
                                    type="button"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
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
