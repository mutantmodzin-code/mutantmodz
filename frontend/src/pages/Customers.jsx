import React, { useState, useEffect } from 'react';
import api from '../api';
import { Phone, Mail, MapPin, Eye, Search, Plus, Globe, Store, ShoppingBag, TrendingUp, Users, Wifi, WifiOff } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all' | 'online' | 'offline'

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const res = await api.get('/customers');
        setCustomers(res.data);
    };

    const viewHistory = async (c) => {
        setSelectedCustomer(c);
        const res = await api.get(`/customers/${c.id}/history`);
        setHistory(res.data);
    };

    const filtered = customers.filter(c => {
        const matchSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone?.includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filter === 'all' || c.customer_type === filter;
        return matchSearch && matchFilter;
    });

    const onlineCount = customers.filter(c => c.customer_type === 'online').length;
    const offlineCount = customers.filter(c => c.customer_type === 'offline').length;

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Customer Relations</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} size={20} />
                    <input
                        className="input"
                        style={{ paddingLeft: '3rem' }}
                        placeholder="Search customers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={22} color="#64748b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{customers.length}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Customers</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', border: '1px solid #bbf7d0' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={22} color="#16a34a" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{onlineCount}</div>
                        <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Online Customers</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', border: '1px solid #fed7aa' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store size={22} color="#ea580c" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ea580c' }}>{offlineCount}</div>
                        <div style={{ fontSize: '0.75rem', color: '#ea580c' }}>Offline / Walk-in</div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                    { key: 'all', label: `All (${customers.length})`, icon: Users },
                    { key: 'online', label: `Online (${onlineCount})`, icon: Globe },
                    { key: 'offline', label: `Offline (${offlineCount})`, icon: Store },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className="btn"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600,
                            backgroundColor: filter === tab.key
                                ? tab.key === 'online' ? '#dcfce7'
                                    : tab.key === 'offline' ? '#ffedd5'
                                        : '#e0f2fe'
                                : '#f8fafc',
                            color: filter === tab.key
                                ? tab.key === 'online' ? '#16a34a'
                                    : tab.key === 'offline' ? '#ea580c'
                                        : '#0369a1'
                                : '#64748b',
                            border: `1px solid ${filter === tab.key
                                ? tab.key === 'online' ? '#bbf7d0'
                                    : tab.key === 'offline' ? '#fed7aa'
                                        : '#bae6fd'
                                : '#e2e8f0'}`,
                        }}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Customer Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filtered.map(c => {
                    const isOnline = c.customer_type === 'online';
                    return (
                        <div
                            key={c.id}
                            className="card"
                            style={{
                                display: 'flex', flexDirection: 'column', gap: '0.875rem',
                                border: `1px solid ${isOnline ? '#bbf7d0' : '#fed7aa'}`,
                                position: 'relative', overflow: 'hidden'
                            }}
                        >
                            {/* Online/Offline badge ribbon */}
                            <div style={{
                                position: 'absolute', top: 0, right: 0,
                                background: isOnline ? '#16a34a' : '#ea580c',
                                color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                                padding: '3px 10px', borderBottomLeftRadius: '0.5rem',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
                                {isOnline ? 'Online' : 'Walk-in'}
                            </div>

                            {/* Avatar + name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '70px' }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: isOnline ? '#dcfce7' : '#fff7ed',
                                    color: isOnline ? '#16a34a' : '#ea580c',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '1.25rem', border: `2px solid ${isOnline ? '#bbf7d0' : '#fed7aa'}`
                                }}>
                                    {c.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{c.name}</h3>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer ID #CU-{c.id}</p>
                                </div>
                            </div>

                            {/* Contact info */}
                            <div style={{ display: 'grid', gap: '0.4rem', color: '#64748b', fontSize: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {c.phone}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {c.email || 'No email provided'}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> {c.address || 'No address provided'}</div>
                            </div>

                            {/* Order stats */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{
                                    flex: 1, background: '#f8fafc', borderRadius: '0.5rem',
                                    padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                                }}>
                                    <ShoppingBag size={14} color="#64748b" />
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.total_orders}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>orders</span>
                                </div>
                                <div style={{
                                    flex: 1, background: '#f8fafc', borderRadius: '0.5rem',
                                    padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                                }}>
                                    <TrendingUp size={14} color="#2563eb" />
                                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#2563eb' }}>
                                        ₹{parseFloat(c.total_spent || 0).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            {/* Channel chip */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {isOnline
                                    ? <><Globe size={13} color="#16a34a" /><span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>Ordered via Website</span></>
                                    : <><Store size={13} color="#ea580c" /><span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 600 }}>Walk-in / Billed In-Store</span></>
                                }
                            </div>

                            <button
                                className="btn"
                                style={{
                                    marginTop: '0.25rem', width: '100%', justifyContent: 'center',
                                    backgroundColor: isOnline ? '#f0fdf4' : '#fff7ed',
                                    border: `1px solid ${isOnline ? '#bbf7d0' : '#fed7aa'}`,
                                    color: isOnline ? '#16a34a' : '#ea580c', fontWeight: 600
                                }}
                                onClick={() => viewHistory(c)}
                            >
                                <Eye size={16} /> View Profile & History
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Profile Modal */}
            {selectedCustomer && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '620px', maxHeight: '80vh', overflowY: 'auto' }}>
                        {/* Modal header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <h2 style={{ margin: 0 }}>{selectedCustomer.name}</h2>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                                    background: selectedCustomer.customer_type === 'online' ? '#dcfce7' : '#ffedd5',
                                    color: selectedCustomer.customer_type === 'online' ? '#16a34a' : '#ea580c',
                                    display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase'
                                }}>
                                    {selectedCustomer.customer_type === 'online' ? <Wifi size={11} /> : <WifiOff size={11} />}
                                    {selectedCustomer.customer_type === 'online' ? 'Online Customer' : 'Walk-in Customer'}
                                </span>
                            </div>
                            <button className="btn" style={{ padding: '0.25rem' }} onClick={() => setSelectedCustomer(null)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Total Orders</div>
                                <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{selectedCustomer.total_orders}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Total Spent</div>
                                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#2563eb' }}>₹{parseFloat(selectedCustomer.total_spent || 0).toLocaleString('en-IN')}</div>
                            </div>
                        </div>

                        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: '#374151' }}>Purchase History</h3>
                        {history.length === 0 ? <p style={{ color: '#94a3b8' }}>No purchase history found.</p> : (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                {history.map(h => (
                                    <div key={h.id} style={{ padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 600, marginBottom: '2px' }}>Invoice #{h.id}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            {h.order_type && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px',
                                                    borderRadius: '999px', marginTop: '4px', display: 'inline-block',
                                                    background: h.order_type === 'Online Order' ? '#dcfce7' : '#ffedd5',
                                                    color: h.order_type === 'Online Order' ? '#16a34a' : '#ea580c'
                                                }}>
                                                    {h.order_type}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 700, color: '#2563eb' }}>₹{parseFloat(h.total_amount).toLocaleString('en-IN')}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '2px' }}>{h.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setSelectedCustomer(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
