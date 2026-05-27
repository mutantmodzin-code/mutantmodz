import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash, Search, Package, AlertCircle } from 'lucide-react';

import { getMediaUrl } from '../utils/url';

const COMBO_TYPES = ['General Combos', 'Riding Combo Kit', 'Monsoon Combo', 'Service Combo', 'Touring Combo'];

const Combos = () => {
    const [combos, setCombos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCombo, setEditingCombo] = useState(null);

    const [formData, setFormData] = useState({
        name: '', brand: '', price: '', stock: 0, sku: '', image_url: '',
        images: ['', '', '', ''],
        description: '', combo_type: '',
        linked_items: [],
        delivery_tn: 0, delivery_south: 0, delivery_north: 0
    });
    const [allInventory, setAllInventory] = useState([]);
    const [skuSearch, setSkuSearch] = useState('');

    useEffect(() => {
        fetchCombos();
        fetchInventory();
    }, [searchTerm]);

    const fetchCombos = async () => {
        const res = await api.get(`/combos?search=${searchTerm}`);
        setCombos(res.data);
    };

    const fetchInventory = async () => {
        const res = await api.get('/products');
        setAllInventory(res.data);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = { 
                ...formData, 
                images: formData.images.filter(url => url !== ''),
                linked_items: formData.linked_items
            };
            
            if (editingCombo) {
                await api.put(`/combos/${editingCombo.id}`, dataToSave);
            } else {
                await api.post('/combos', dataToSave);
            }
            
            setIsModalOpen(false);
            fetchCombos();
            resetForm();
        } catch (error) {
            console.error(error);
            alert('Error saving combo: ' + (error.response?.data?.error || error.message));
        }
    };

    const resetForm = () => {
        setEditingCombo(null);
        setFormData({
            name: '', brand: '', price: '', stock: 0, sku: '', image_url: '',
            images: ['', '', '', ''],
            description: '', combo_type: '',
            linked_items: [],
            delivery_tn: 0, delivery_south: 0, delivery_north: 0
        });
    };

    const addLinkedItem = (prod) => {
        if (formData.linked_items.some(item => item.sku === prod.sku)) return;
        setFormData({
            ...formData,
            linked_items: [...formData.linked_items, { sku: prod.sku, quantity: 1, name: prod.name }]
        });
        setSkuSearch('');
    };

    const removeLinkedItem = (sku) => {
        setFormData({
            ...formData,
            linked_items: formData.linked_items.filter(item => item.sku !== sku)
        });
    };

    const updateItemQuantity = (sku, q) => {
        setFormData({
            ...formData,
            linked_items: formData.linked_items.map(item => item.sku === sku ? { ...item, quantity: parseInt(q) || 1 } : item)
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this combo?')) return;
        await api.delete(`/combos/${id}`);
        fetchCombos();
    };

    const uploadImage = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 800;
                    let { width, height } = img;
                    if (width > height) { if (width > MAX_SIZE) { height = (height * MAX_SIZE) / width; width = MAX_SIZE; } }
                    else { if (height > MAX_SIZE) { width = (width * MAX_SIZE) / height; height = MAX_SIZE; } }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const currentUrls = [...formData.images];
        let fileIdx = 0;
        
        for (let i = 0; i < 4 && fileIdx < files.length; i++) {
            if (!currentUrls[i]) {
                currentUrls[i] = await uploadImage(files[fileIdx]);
                fileIdx++;
            }
        }
        
        setFormData({ ...formData, images: currentUrls });
        e.target.value = ''; 
    };

    const openEdit = (c) => {
        setEditingCombo(c);
        setFormData({
            name: c.name,
            brand: c.brand || '',
            price: c.price,
            stock: c.stock,
            sku: c.sku || '',
            image_url: c.image_url || '',
            images: Array.isArray(c.images) ? [...c.images, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
            description: c.description || '',
            combo_type: c.combo_type || '',
            linked_items: Array.isArray(c.linked_items) ? c.linked_items : [],
            delivery_tn: c.delivery_tn || 0,
            delivery_south: c.delivery_south || 0,
            delivery_north: c.delivery_north || 0
        });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Combo Bundles</h1>
                <button className="btn btn-primary" onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} /> Add New Combo
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} size={20} />
                    <input className="input" style={{ paddingLeft: '3rem' }} placeholder="Search combos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Combo Name</th>
                            <th>Type</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {combos.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <img src={getMediaUrl(c.images?.[0] || c.image_url) || 'https://via.placeholder.com/50'} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem' }} />
                                </td>
                                <td style={{ fontWeight: 600 }}>{c.name}</td>
                                <td><span className="badge">{c.combo_type}</span></td>
                                <td>{c.brand}</td>
                                <td style={{ fontWeight: 600 }}>₹{c.price}</td>
                                <td>
                                    <span style={{
                                        fontWeight: 600,
                                        color: c.stock < 10 ? '#ef4444' : '#0f172a',
                                        backgroundColor: c.stock < 10 ? '#fee2e2' : 'transparent',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    }}>
                                        {c.stock} {c.stock < 10 && <AlertCircle size={14} style={{ display: 'inline', marginTop: -2 }} />}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => openEdit(c)}><Edit size={16} color="#2563eb" /></button>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => handleDelete(c.id)}><Trash size={16} color="#ef4444" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} onClick={() => setIsModalOpen(false)}></div>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '750px', backgroundColor: 'white', borderRadius: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingCombo ? 'Update Combo' : 'New Combo'}</h2>
                            <button onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        
                        <form onSubmit={handleSave} style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', overflowY: 'auto' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Combo Name</label>
                                <input className="input" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="label">Brand</label>
                                <input className="input" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                            </div>

                            <div>
                                <label className="label">Combo SKU</label>
                                <input className="input" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="UNIQUE-COMBO-ID" />
                            </div>

                            <div>
                                <label className="label">Combo Type</label>
                                <select className="input" value={formData.combo_type} onChange={(e) => setFormData({ ...formData, combo_type: e.target.value })}>
                                    <option value="">Select Type</option>
                                    {COMBO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="label">Price</label>
                                <input className="input" type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                            </div>

                            <div>
                                <label className="label">Stock</label>
                                <input className="input" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: 'span 2', backgroundColor: '#fcf8ff', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #d8b4fe' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>🚚 Delivery Charges (Region Wise)</span>
                                    <div style={{ height: '1px', flex: 1, backgroundColor: '#d8b4fe' }}></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', marginBottom: '0.35rem', display: 'block' }}>TAMIL NADU</label>
                                        <input className="input" style={{ borderRadius: '0.6rem', borderColor: '#e9d5ff' }} type="number" value={formData.delivery_tn} onChange={(e) => setFormData({ ...formData, delivery_tn: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', marginBottom: '0.35rem', display: 'block' }}>SOUTH INDIA</label>
                                        <input className="input" style={{ borderRadius: '0.6rem', borderColor: '#e9d5ff' }} type="number" value={formData.delivery_south} onChange={(e) => setFormData({ ...formData, delivery_south: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', marginBottom: '0.35rem', display: 'block' }}>NORTH INDIA</label>
                                        <input className="input" style={{ borderRadius: '0.6rem', borderColor: '#e9d5ff' }} type="number" value={formData.delivery_north} onChange={(e) => setFormData({ ...formData, delivery_north: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2', backgroundColor: '#f0f9ff', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #bae6fd' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1' }}>🔗 Linked Inventory Items</h3>
                                    {formData.linked_items.length > 0 && (
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#0ea5e9', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '2rem' }}>
                                            Available: {Math.min(...formData.linked_items.map(li => {
                                                const inv = allInventory.find(p => p.sku === li.sku);
                                                return inv ? Math.floor(inv.stock / (li.quantity || 1)) : 0;
                                            }))} Units
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            className="input" 
                                            placeholder="Search product by SKU to add to combo..." 
                                            value={skuSearch}
                                            onChange={(e) => setSkuSearch(e.target.value.toUpperCase())}
                                        />
                                        {skuSearch && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto' }}>
                                                {allInventory.filter(p => (p.sku && p.sku.includes(skuSearch)) || p.name.toLowerCase().includes(skuSearch.toLowerCase())).map(p => (
                                                    <div 
                                                        key={p.id} 
                                                        onClick={() => addLinkedItem(p)}
                                                        style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                    >
                                                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{p.sku} - {p.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock: {p.stock} | Price: ₹{p.price}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {formData.linked_items.map(item => (
                                        <div key={item.sku} style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#0369a1' }}>{item.sku}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#0ea5e9' }}>Component Stock: {allInventory.find(p => p.sku === item.sku)?.stock || 0}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>QTY:</span>
                                                <input 
                                                    type="number" 
                                                    className="input" 
                                                    style={{ width: '60px', padding: '0.25rem 0.5rem' }} 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateItemQuantity(item.sku, e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeLinkedItem(item.sku)}
                                                style={{ padding: '0.25rem', color: '#ef4444' }}
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.linked_items.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                            No inventory items linked to this combo yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Description</label>
                                <textarea className="input" style={{ minHeight: '100px' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Images</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div 
                                        style={{ width: '100px', height: '100px', border: '2px dashed #e2e8f0', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        onClick={() => document.getElementById('combo-img-input').click()}
                                    >
                                        <Plus />
                                        <input id="combo-img-input" type="file" multiple hidden onChange={handleFileChange} />
                                    </div>
                                    {formData.images.map((url, idx) => url && (
                                        <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                                            <img src={getMediaUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} />
                                            <button 
                                                type="button"
                                                onClick={() => { const n = [...formData.images]; n[idx] = ''; setFormData({ ...formData, images: n }); }}
                                                style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', color: 'white', borderRadius: '50%', width: 20, height: 20 }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1 }}>Save Combo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Combos;
