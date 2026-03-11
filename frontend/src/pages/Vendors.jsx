import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash, Search, User, Phone, Mail, MapPin } from 'lucide-react';

const Vendors = () => {
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({
        name: '', contact_person: '', phone: '', email: '', address: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await api.get('/vendors');
            setVendors(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingVendor) {
                await api.put(`/vendors/${editingVendor.id}`, formData);
            } else {
                await api.post('/vendors', formData);
            }
            setIsModalOpen(false);
            fetchVendors();
            setEditingVendor(null);
            setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        await api.delete(`/vendors/${id}`);
        fetchVendors();
    };

    const openEdit = (v) => {
        setEditingVendor(v);
        setFormData({ ...v });
        setIsModalOpen(true);
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.contact_person && v.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Vendor Management</h1>
                <button className="btn btn-primary" onClick={() => { setEditingVendor(null); setIsModalOpen(true); }}>
                    <Plus size={20} /> Add New Vendor
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} size={20} />
                    <input className="input" style={{ paddingLeft: '3rem' }} placeholder="Search vendors by name or contact..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {filteredVendors.map(v => (
                    <div className="card" key={v.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#2563eb' }}>{v.name}</h3>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button className="btn" style={{ padding: '0.25rem' }} onClick={() => openEdit(v)}><Edit size={16} color="#64748b" /></button>
                                <button className="btn" style={{ padding: '0.25rem' }} onClick={() => handleDelete(v.id)}><Trash size={16} color="#ef4444" /></button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} /> {v.contact_person || 'N/A'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {v.phone || 'N/A'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {v.email || 'N/A'}</div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><MapPin size={14} style={{ marginTop: '3px' }} /> {v.address || 'N/A'}</div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '450px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Vendor Name</label>
                                <input className="input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Contact Person</label>
                                <input className="input" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Phone</label>
                                    <input className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Email</label>
                                    <input className="input" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Address</label>
                                <textarea className="input" style={{ minHeight: '80px' }} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }}>Save Vendor</button>
                                <button type="button" className="btn" style={{ backgroundColor: '#e2e8f0', flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vendors;
