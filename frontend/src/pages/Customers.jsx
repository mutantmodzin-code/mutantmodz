import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Phone, Mail, MapPin, Eye, Search, Plus } from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [history, setHistory] = useState([]);

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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Customer Relations</h1>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} size={20} />
                    <input className="input" style={{ paddingLeft: '3rem' }} placeholder="Search customers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {customers.map(c => (
                    <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e2e8f0', transition: 'transform 0.2s', cursor: 'default' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                                {c.name.charAt(0)}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{c.name}</h3>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Customer ID #CU-{c.id}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {c.phone}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {c.email || 'No email provided'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={14} /> {c.address || 'No address provided'}</div>
                        </div>
                        <button className="btn" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }} onClick={() => viewHistory(c)}>
                            <Eye size={18} /> View Profile & History
                        </button>
                    </div>
                ))}
            </div>

            {selectedCustomer && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h2>{selectedCustomer.name}'s History</h2>
                            <button className="btn" style={{ padding: '0.25rem' }} onClick={() => setSelectedCustomer(null)}><Plus size={24} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>

                        {history.length === 0 ? <p>No purchase history found.</p> : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {history.map(h => (
                                    <div key={h.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 600 }}>Invoice #{h.id}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(h.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 700, color: '#2563eb' }}>${h.total_amount}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#22c55e' }}>{h.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setSelectedCustomer(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
