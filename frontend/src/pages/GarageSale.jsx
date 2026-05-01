import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash, Search, Zap, AlertCircle } from 'lucide-react';



import { getMediaUrl } from '../utils/url';

const GarageSale = () => {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '', brand: '', price: '', stock: 0, sku: '', image_url: '',
        images: ['', '', '', ''],
        description: '',
        linked_items: [],
        delivery_tn: 0, delivery_south: 0, delivery_north: 0,
        discount_percent: 0
    });
    const [allInventory, setAllInventory] = useState([]);
    const [skuSearch, setSkuSearch] = useState('');

    useEffect(() => {
        fetchItems();
        fetchInventory();
    }, [searchTerm]);

    const fetchItems = async () => {
        const res = await api.get(`/garage-sale?search=${searchTerm}`);
        setItems(res.data);
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
            
            if (editingItem) {
                await api.put(`/garage-sale/${editingItem.id}`, dataToSave);
            } else {
                await api.post('/garage-sale', dataToSave);
            }
            
            setIsModalOpen(false);
            fetchItems();
            resetForm();
        } catch (error) {
            console.error(error);
            alert('Error saving item: ' + (error.response?.data?.error || error.message));
        }
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            name: '', brand: '', price: '', stock: 0, sku: '', image_url: '',
            images: ['', '', '', ''],
            description: '', sku: '',
            linked_items: [],
            delivery_tn: 0, delivery_south: 0, delivery_north: 0,
            discount_percent: 0
        });
    };

    const addLinkedItem = (prod) => {
        // Safe image parsing helper
        const parseImages = (input) => {
            if (Array.isArray(input)) return input;
            if (typeof input === 'string') {
                try {
                    const parsed = JSON.parse(input);
                    return Array.isArray(parsed) ? parsed : [input];
                } catch (e) {
                    return [input];
                }
            }
            return [];
        };

        const prodImages = parseImages(prod.images || prod.image_url);
        
        // When a product is selected, we auto-populate the main fields
        setFormData({
            ...formData,
            name: prod.name,
            brand: prod.brand || '',
            price: prod.price,
            stock: prod.stock,
            sku: prod.sku,
            image_url: prodImages[0] || '',
            images: [...prodImages, '', '', ''].slice(0, 4),
            delivery_tn: prod.delivery_tn || 0,
            delivery_south: prod.delivery_south || 0,
            delivery_north: prod.delivery_north || 0,
            discount_percent: prod.discount_percent || 0,
            linked_items: [{ sku: prod.sku, quantity: 1, name: prod.name }]
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
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        await api.delete(`/garage-sale/${id}`);
        fetchItems();
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

    const openEdit = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            brand: item.brand || '',
            price: item.price,
            stock: item.stock,
            sku: item.sku || '',
            image_url: item.image_url || '',
            images: Array.isArray(item.images) ? [...item.images, '', '', '', ''].slice(0, 4) : ['', '', '', ''],
            description: item.description || '',
            linked_items: Array.isArray(item.linked_items) ? item.linked_items : [],
            delivery_tn: item.delivery_tn || 0,
            delivery_south: item.delivery_south || 0,
            delivery_north: item.delivery_north || 0,
            discount_percent: item.discount_percent || 0
        });
        setIsModalOpen(true);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Garage Sale Items</h1>
                <button className="btn btn-primary" onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} /> Add New Sale Item
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} size={20} />
                    <input className="input" style={{ paddingLeft: '3rem' }} placeholder="Search sale items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Item Name</th>
                            <th>Brand</th>
                            <th>Sale Price</th>
                            <th>Discount</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <img 
                                        src={getMediaUrl(
                                            (() => {
                                                const raw = item.images || item.image_url;
                                                if (Array.isArray(raw)) return raw[0];
                                                if (typeof raw === 'string' && raw.startsWith('[')) {
                                                    try { return JSON.parse(raw)[0]; } catch (e) { return raw; }
                                                }
                                                return raw;
                                            })()
                                        ) || 'https://via.placeholder.com/50'} 
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.5rem' }} 
                                    />
                                </td>
                                <td style={{ fontWeight: 600 }}>{item.name}</td>
                                <td>{item.brand}</td>
                                <td style={{ fontWeight: 600 }}>₹{item.price}</td>
                                <td>
                                    {item.discount_percent > 0 ? (
                                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '0.75rem' }}>
                                            -{item.discount_percent}%
                                        </span>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No Discount</span>
                                    )}
                                </td>
                                <td>
                                    <span style={{
                                        fontWeight: 600,
                                        color: item.stock < 5 ? '#ef4444' : '#0f172a',
                                        backgroundColor: item.stock < 5 ? '#fee2e2' : 'transparent',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    }}>
                                        {item.stock} {item.stock < 5 && <AlertCircle size={14} style={{ display: 'inline', marginTop: -2 }} />}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => openEdit(item)}><Edit size={16} color="#2563eb" /></button>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => handleDelete(item.id)}><Trash size={16} color="#ef4444" /></button>
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
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingItem ? 'Update Sale Item' : 'New Sale Item'}</h2>
                            <button onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        
                        <form onSubmit={handleSave} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                            {/* NEW SKU SEARCH AT TOP */}
                            <div style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #ffedd5' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#9a3412' }}>🔍 Search Product by SKU</h3>
                                    {formData.sku && (
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '2rem' }}>
                                            Selected: {formData.sku}
                                        </div>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        className="input" 
                                        placeholder="Enter SKU or Product Name..." 
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

                                {formData.sku && (
                                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '1rem', border: '1px solid #fed7aa' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>{formData.name}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{formData.brand}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.125rem', color: '#059669' }}>₹{formData.price}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stock: {formData.stock}</div>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => resetForm()}
                                            style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                        >
                                            <Trash size={14} /> Clear Selection
                                        </button>
                                    </div>
                                )}
                            </div>


                            {formData.discount_percent > 0 && (
                                <div style={{ backgroundColor: '#fff7ed', padding: '1rem', borderRadius: '1rem', border: '1px solid #ffedd5', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#9a3412', fontWeight: 700 }}>
                                        <Zap size={16} /> Discount from Inventory: {formData.discount_percent}%
                                    </div>
                                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>This discount is synced from the main product inventory.</p>
                                </div>
                            )}

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Description</label>
                                <textarea className="input" style={{ minHeight: '100px' }} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label">Images</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div 
                                        style={{ width: '100px', height: '100px', border: '2px dashed #e2e8f0', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        onClick={() => document.getElementById('gs-img-input').click()}
                                    >
                                        <Plus />
                                        <input id="gs-img-input" type="file" multiple hidden onChange={handleFileChange} />
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
                                <button className="btn btn-primary" style={{ flex: 1, backgroundColor: '#f97316', borderColor: '#ea580c' }}>Save Sale Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GarageSale;
