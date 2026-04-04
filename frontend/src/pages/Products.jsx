import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash, Search, PackageMinus, PackagePlus, AlertCircle } from 'lucide-react';

const PARTNER_BRANDS = [
    'FXR', 'Barkbusters', 'SENA', 'SHAD', 'FuelX', 'Maddog', 'PowerTronic', 'Devil Evolution', 
    'Reise', 'Moto Torque', 'K&N', 'Vesrah', 'Red Rooster', 'Motul', 'SMK', 'Tarmac', 
    'EBC Brakes', 'RAM Mounts', 'RCB', 'Raida', 'BSDDP', 'Orazo', 'Studds', 'Zana', 
    'Vega', 'Guardian Gears', 'Bobo', 'Carbonado', '100%', 'Acerbis', 'Akro', 'Dochaki', 
    'Forma', 'Glosil', 'Grip Puppies', 'HJG', 'NightEye', 'Putoline', 'Rahgear', 'Maxima', 
    'Liqui Moly', 'JB Racing'
];

const BIKE_DATA = [
    { name: 'KTM', models: ['390 Adventure', 'Duke 390', 'Duke 250', 'RC 390', 'Duke 200', 'Adv 340', 'Gen 3 Duke 390', 'RC 200'] },
    { name: 'Royal Enfield', models: ['Himalayan 450', 'Bear 650', 'Guerrilla 450', 'Himalayan', 'Interceptor 650', 'Continental Gt 650', 'Hunter 350', 'Classic 350', 'Meteor 350', 'Bullet 350'] },
    { name: 'Yamaha', models: ['R15 V4', 'MT-15', 'R15 M', 'Aerox 155', 'R3', 'FZ-S'] },
    { name: 'Honda', models: ['CB350 H\'ness', 'CB350RS', 'CB200X', 'NX500', 'Africa Twin'] },
    { name: 'Kawasaki', models: ['Ninja 300', 'Ninja 400', 'Ninja 650', 'Z900', 'Versys 650'] },
    { name: 'BMW', models: ['G310GS', 'G310R', 'G310RR', 'R1250GS'] },
    { name: 'Suzuki', models: ['V-Strom 250SX', 'Gixxer 250', 'Hayabusa'] },
    { name: 'Triumph', models: ['Speed 400', 'Scrambler 400X'] },
    { name: 'Hero', models: ['Xpulse 200 4V', 'Xpulse 210'] },
    { name: 'Bajaj', models: ['Pulsar NS200', 'Dominar 400', 'Dominar 250'] },
    { name: 'TVS', models: ['Apache RR 310', 'RTR 200 4V', 'Ronin'] },
    { name: 'Others', models: ['Universal', 'Custom Bike'] }
];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const getSelectedCategoryName = () => {
        return categories.find(c => c.id.toString() === formData.category_id.toString())?.name;
    };

    const [formData, setFormData] = useState({
        name: '', brand: '', category_id: '',
        price: '', stock: 0, vendor_id: '', sku: '', purchase_price: '',
        image_urls: ['', '', '', ''],
        bike_brand: '', bike_model: '',
        description: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchVendors();
    }, [searchTerm, selectedCategory]);

    const fetchProducts = async () => {
        const res = await api.get(`/products?search=${searchTerm}&category=${selectedCategory}`);
        setProducts(res.data);
    };

    const fetchCategories = async () => {
        const res = await api.get('/products/categories');
        setCategories(res.data);
    };

    const fetchVendors = async () => {
        const res = await api.get('/vendors');
        setVendors(res.data);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Save as JSON string in the database column
            const dataToSave = { ...formData, image_url: JSON.stringify(formData.image_urls) };
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, dataToSave);
            } else {
                await api.post('/products', dataToSave);
            }
            setIsModalOpen(false);
            fetchProducts();
            setEditingProduct(null);
            setFormData({
                name: '', brand: '', category_id: '',
                price: '', stock: 0, vendor_id: '', sku: '', purchase_price: '',
                image_urls: ['', '', '', ''],
                bike_brand: '', bike_model: '',
                description: ''
            });
        } catch (error) {
            console.error(error);
            alert('Error saving product: ' + (error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        await api.delete(`/products/${id}`);
        fetchProducts();
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
        const files = Array.from(e.target.files).slice(0, 4);
        if (files.length === 0) return;
        const newUrls = ['', '', '', ''];
        for (let i = 0; i < files.length; i++) {
            newUrls[i] = await uploadImage(files[i]);
        }
        setFormData({ ...formData, image_urls: newUrls });
    };

    const openEdit = (p) => {
        let urls = ['', '', '', ''];
        try {
            if (p.image_url) {
                const parsed = JSON.parse(p.image_url);
                if (Array.isArray(parsed)) urls = [...parsed, '', '', '', ''].slice(0, 4);
                else urls = [p.image_url, '', '', ''];
            }
        } catch (e) {
            urls = [p.image_url || '', '', '', ''];
        }

        setEditingProduct(p);
        setFormData({
            name: p.name,
            brand: p.brand || '',
            category_id: p.category_id,
            price: p.price,
            stock: p.stock,
            vendor_id: p.vendor_id,
            sku: p.sku || '',
            purchase_price: p.purchase_price || '',
            image_urls: urls,
            bike_brand: p.bike_brand || '',
            bike_model: p.bike_model || '',
            description: p.description || ''
        });
        setIsModalOpen(true);
    };

    const categoryName = getSelectedCategoryName();
    const isCompatibilityNeeded = categoryName === 'Accessories' || categoryName === 'Bike Parts';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Inventory Management</h1>
                <button className="btn btn-primary" onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                        name: '', brand: '', category_id: '',
                        price: '', stock: 0, vendor_id: '', sku: '', purchase_price: '',
                        image_urls: ['', '', '', ''],
                        bike_brand: '', bike_model: ''
                    });
                    setIsModalOpen(true);
                }}>
                    <Plus size={20} /> Add New Product
                </button>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} size={20} />
                    <input className="input" style={{ paddingLeft: '3rem' }} placeholder="Search products by name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <select className="input" style={{ maxWidth: '200px' }} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Vendor</th>
                            <th>Purchase Price</th>
                            <th>Selling Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td style={{ fontWeight: 600, color: '#2563eb' }}>{p.sku || 'N/A'}</td>
                                <td>
                                    <div>{p.name}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                                        {p.brand} {p.bike_brand && `| ${p.bike_brand} ${p.bike_model}`}
                                    </div>
                                </td>
                                <td>{p.category_name}</td>
                                <td>{p.vendor_name || 'N/A'}</td>
                                <td>₹{p.purchase_price}</td>
                                <td style={{ fontWeight: 600 }}>₹{p.price}</td>
                                <td>
                                    <span style={{
                                        fontWeight: 600,
                                        color: p.stock < 10 ? '#ef4444' : '#0f172a',
                                        backgroundColor: p.stock < 10 ? '#fee2e2' : 'transparent',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem'
                                    }}>
                                        {p.stock} {p.stock < 10 && <AlertCircle size={14} style={{ display: 'inline', marginTop: -2 }} />}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => openEdit(p)}><Edit size={16} color="#2563eb" /></button>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => handleDelete(p.id)}><Trash size={16} color="#ef4444" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '2rem' }}>
                    <div className="card" style={{ width: '600px', maxWidth: '100%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Product Name</label>
                                <input className="input" placeholder="e.g. Full Face helmet" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>SKU (Unique Number)</label>
                                <input className="input" placeholder="e.g. PROD-001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Category</label>
                                <select className="input" required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Vendor</label>
                                <select className="input" value={formData.vendor_id} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}>
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Manufacturer Brand</label>
                                <select className="input" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}>
                                    <option value="">Select Brand</option>
                                    {PARTNER_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {isCompatibilityNeeded && (
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem', gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#f8fafc' }}>
                                    <div style={{ gridColumn: 'span 2', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.1em' }}>Bike Compatibility</div>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Bike Brand</label>
                                        <select className="input" value={formData.bike_brand} onChange={(e) => setFormData({ ...formData, bike_brand: e.target.value, bike_model: '' })}>
                                            <option value="">Select bike brand</option>
                                            {BIKE_DATA.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Bike Model</label>
                                        <select className="input" disabled={!formData.bike_brand} value={formData.bike_model} onChange={(e) => setFormData({ ...formData, bike_model: e.target.value })}>
                                            <option value="">Select bike model</option>
                                            {BIKE_DATA.find(b => b.name === formData.bike_brand)?.models.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Purchase Price (₹)</label>
                                <input className="input" type="number" step="0.01" placeholder="0.00" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Selling Price (₹)</label>
                                <input className="input" type="number" step="0.01" placeholder="0.00" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.75rem', display: 'block' }}>Product Images (Up to 4)</label>
                                <div
                                    style={{ border: '2px dashed #e2e8f0', borderRadius: '0.5rem', padding: '1rem', backgroundColor: '#f8fafc', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s', userSelect: 'none' }}
                                    onClick={() => document.getElementById('multi-image-input').click()}
                                >
                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>🖼️ Click to select up to 4 images</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>Hold Ctrl / ⌘ to pick multiple files</div>
                                    <input
                                        id="multi-image-input"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                {formData.image_urls.some(u => u) && (
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                                        {formData.image_urls.map((url, idx) => url ? (
                                            <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '0.5rem', overflow: 'hidden', border: '2px solid #e2e8f0', flexShrink: 0 }}>
                                                <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Image ${idx + 1}`} />
                                                <button
                                                    type="button"
                                                    style={{ position: 'absolute', top: '2px', right: '2px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                                                    onClick={(e) => { e.stopPropagation(); const newUrls = [...formData.image_urls]; newUrls[idx] = ''; setFormData({ ...formData, image_urls: newUrls }); }}
                                                >✕</button>
                                                <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '1px 3px', borderRadius: '3px' }}>{idx + 1}</span>
                                            </div>
                                        ) : null)}
                                    </div>
                                )}
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Initial Stock</label>
                                <input className="input" type="number" placeholder="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Product Description</label>
                                <textarea 
                                    className="input" 
                                    placeholder="Enter product description..." 
                                    style={{ width: '100%', minHeight: '100px', resize: 'vertical', padding: '0.5rem' }} 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', gridColumn: 'span 2' }}>
                                <button className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
                                <button type="button" className="btn" style={{ backgroundColor: '#e2e8f0', flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
