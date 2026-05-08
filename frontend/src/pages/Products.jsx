import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Edit, Trash, Search, PackageMinus, PackagePlus, AlertCircle, Package } from 'lucide-react';

const PARTNER_BRANDS = [
    '100%', '5M', '66BHP', 'Acerbis', 'AG Star', 'Akro', 'AXOR', 'Barkbusters', 
    'BIKING BROTHERHOOD', 'BISON', 'Blue armor', 'BMC', 'Bobo', 'BSDDP', 
    'Carbonado', 'Devil Evolution', 'Dochaki', 'EBC Brakes', 'Ejeas', 
    'ERODIAN', 'EL FLEET TRACK', 'Forma', 'FuelX', 'FXR', 'Glosil', 
    'Grip Puppies', 'Guardian Gears', 'HJG', 'JB Racing', 'K&N', 'KYT', 
    'LGP', 'Liqui Moly', 'LS2', 'Maddog', 'Maxima', 'MICHELIN', 'MOTO GENIUS', 
    'Moto Torque', 'Moto Wing', 'MOTOMAX', 'Motowolf', 'Motul', 'MOXI', 
    'MTECHNICS', 'MT Helmets', 'NGAGE', 'NGK', 'NightEye', 'Orazo', 
    'Power Rage', 'Powershift', 'PowerTronic', 'PROTAPER', 'Putoline', 
    'RACE DYNAMICS', 'Rahgear', 'Raida', 'RAM Mounts', 'RCB', 'Red Rooster', 
    'Reise', 'RIDEX', 'ROLON', 'Royal Enfield', 'SENA', 'SHAD', 'SMK', 
    'STEELBIRD', 'Studds', 'Tarmac', 'TRM Calidad', 'UVHJG', 'Vega', 
    'Vesrah', 'Zana'
];

const SUB_CATEGORIES = {
    'Accessories': {
        'Motorcycle Accessories': ['Bike Protection', 'Handlebar', 'Electronic', 'Essentials', 'Rain Cover', 'Cameras', 'Mirror Accessories', 'Stickers'],
        'Riding Gear': ['Jackets', 'Jerseys', 'Pants', 'Gloves', 'Boots', 'Armor & Protectors', 'Rain Wear', 'Balaclavas'],
        'Lighting': ['Auxiliary Light', 'Headlight', 'Hazards', 'Light Accessories', 'Turn Signals'],
        'Luggage': ['Racks', 'Bag and panniers', 'Jerry can', 'GPS mount', 'Air seat', 'Top Boxes', 'Tank Bags'],
        'Performance Parts': ['Air Filter', 'Brake Pads', 'Bendpipe', 'Chain Sprocket', 'Exhaust', 'ECU', 'Spark Plug', 'Oil Filter', 'Coolant', 'Engine Oil']
    },
    'Riding Gear': {
        'Jackets': ['Textile Jackets', 'Mesh Jackets', 'Leather Jackets', 'Rain Jackets', 'Summer Jackets'],
        'Jerseys': ['Off-road Jerseys', 'Street Jerseys', 'Custom Jerseys'],
        'Pants': ['Riding Pants', 'Rain Pants', 'Denim Riding Pants'],
        'Gloves': ['Short Cuff', 'Long Cuff', 'Winter Gloves', 'Leather Gloves', 'Textile Gloves'],
        'Boots': ['Adventure Boots', 'Street Boots', 'Short Boots', 'Racing Boots']
    },
    'Helmets': {
        'Full Face': ['Premium', 'Entry Level', 'Sport'],
        'Open Face': ['Classic', 'Urban'],
        'Modular': ['Flip-up', 'Dual Sport'],
        'Motocross': ['Off-road', 'Enduro'],
        'Kids': ['Safety Certified']
    },
    'Others': {
        'Miscellaneous': ['Merchandise', 'Gift Cards', 'Tools']
    }
};


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

import { getMediaUrl } from '../utils/url';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

    const getSelectedCategoryName = () => {
        if (!formData.category_id) return '';
        return categories.find(c => c.id.toString() === formData.category_id.toString())?.name || '';
    };

    const [formData, setFormData] = useState({
        name: '', brand: '', category_id: '', sub_category: '', sub_category_type: '',
        price: '', stock: 0, vendor_id: '', sku: '', purchase_price: '',
        image_urls: ['', '', '', ''],
        bike_brand: '', bike_model: '',
        description: '', discount_percent: 0, is_garage_sale: false, is_combo: false, combo_type: '',
        delivery_tn: 0, delivery_south: 0, delivery_north: 0,
        size_stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
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
            // Use the same detection as the UI's needsSizeStock 
            const catName = getSelectedCategoryName();
            const needsSizes = (catName && (catName.toLowerCase() === 'helmets' || 
                catName.toLowerCase() === 'riding gear' || 
                catName.toLowerCase() === 'gear')) || 
                (catName && catName.toLowerCase() === 'accessories' && (formData.sub_category_type === 'Riding Gear' || formData.sub_category_type === 'Jackets')) ||
                // Also save if size_stock already has valid data (preserve existing)
                Object.values(formData.size_stock || {}).some(v => parseInt(v) > 0);

            let dataToSave = { ...formData, image_url: JSON.stringify(formData.image_urls) };
            if (needsSizes) {
                const sizeStock = { S: 0, M: 0, L: 0, XL: 0, XXL: 0, ...(formData.size_stock || {}) };
                const totalStock = SIZES.reduce((sum, s) => sum + (parseInt(sizeStock[s]) || 0), 0);
                dataToSave.stock = totalStock;
                dataToSave.size_stock = sizeStock;
            } else {
                dataToSave.size_stock = null;
            }

            console.log('--- SAVE DEBUG ---');

            console.log('Category ID:', formData.category_id);
            console.log('Category Name found:', catName);
            console.log('needsSizes detected:', needsSizes);
            console.log('size_stock state:', formData.size_stock);
            console.log('dataToSave object:', dataToSave);
            console.log('------------------');

            if (editingProduct) {

                const response = await api.put(`/products/${editingProduct.id}`, dataToSave);
                console.log('Update response:', response.data);
            } else {
                const response = await api.post('/products', dataToSave);
                console.log('Create response:', response.data);
            }
            setIsModalOpen(false);
            fetchProducts();
            setEditingProduct(null);
            setFormData({
                name: '', brand: '', category_id: '', sub_category: '', sub_category_type: '',
                price: '', stock: 0, vendor_id: '', sku: '', purchase_price: '',
                image_urls: ['', '', '', ''],
                bike_brand: '', bike_model: '',
                description: '', discount_percent: 0, is_garage_sale: false, is_combo: false, combo_type: '',
                delivery_tn: 0, delivery_south: 0, delivery_north: 0,
                size_stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
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
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        const currentUrls = [...formData.image_urls];
        let fileIdx = 0;
        
        // Find empty slots and fill them
        for (let i = 0; i < 4 && fileIdx < files.length; i++) {
            if (!currentUrls[i]) {
                currentUrls[i] = await uploadImage(files[fileIdx]);
                fileIdx++;
            }
        }
        
        setFormData({ ...formData, image_urls: currentUrls });
        e.target.value = ''; // Reset input to allow re-uploading same file
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

        let sStock = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
        let wasRecovered = false;
        try {
            if (p.size_stock) {
                let parsed = p.size_stock;
                if (typeof p.size_stock === 'string') {
                    parsed = JSON.parse(p.size_stock);
                }
                if (parsed && typeof parsed === 'object') {
                    sStock = { ...sStock, ...parsed };
                }
            }
            
            // If size_stock was empty but product has stock, default it to size L
            const currentTotal = Object.values(sStock).reduce((a, b) => a + (parseInt(b) || 0), 0);
            if (currentTotal === 0 && p.stock > 0) {
                sStock.L = parseInt(p.stock) || 0;
                wasRecovered = true;
            }
        } catch (e) {
            console.error('Error parsing size_stock:', e);
        }

        setEditingProduct(p);
        setFormData({
            ...formData, // Spread existing defaults
            name: p.name,
            brand: p.brand || '',
            category_id: p.category_id || '',
            sub_category: p.sub_category || '',
            sub_category_type: p.sub_category_type || '', 
            price: p.price,
            stock: p.stock,
            vendor_id: p.vendor_id || '',
            sku: p.sku || '',
            purchase_price: p.purchase_price || '',
            image_urls: urls,
            bike_brand: p.bike_brand || '',
            bike_model: p.bike_model || '',
            description: p.description || '',
            is_combo: p.is_combo || false,
            combo_type: p.combo_type || '',
            delivery_tn: p.delivery_tn || 0,
            delivery_south: p.delivery_south || 0,
            delivery_north: p.delivery_north || 0,
            discount_percent: p.discount_percent || 0,
            size_stock: sStock,
            was_recovered: wasRecovered
        });




        setIsModalOpen(true);
    };

    const categoryName = getSelectedCategoryName();
    const categoryData = SUB_CATEGORIES[categoryName] || [];
    const isNested = !Array.isArray(categoryData);
    
    const subCategoryTypes = isNested ? Object.keys(categoryData) : [];
    const subCategories = isNested 
        ? (categoryData[formData.sub_category_type] || []) 
        : categoryData;

    const isCompatibilityNeeded = categoryName === 'Accessories' || categoryName === 'Bike Parts' || categoryName === 'Performance Parts';

    // Check if current category+type combo needs per-size stock
    // Also show if product already has size_stock data set (preserve on edit)
    const hasExistingSizeData = Object.values(formData.size_stock || {}).some(v => parseInt(v) > 0);
    const needsSizeStock = (categoryName && (categoryName.toLowerCase() === 'helmets' || 
        categoryName.toLowerCase() === 'riding gear' || 
        categoryName.toLowerCase() === 'gear')) || 
        hasExistingSizeData ||
        (categoryName && categoryName.toLowerCase() === 'accessories' && (formData.sub_category_type === 'Riding Gear' || formData.sub_category_type === 'Jackets'));
    
    const totalSizeStock = needsSizeStock 
        ? SIZES.reduce((sum, s) => sum + (parseInt(formData.size_stock?.[s]) || 0), 0)
        : formData.stock;


    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Inventory Management</h1>
                <button className="btn btn-primary" onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                        name: '', brand: '', category_id: '', sub_category: '', sub_category_type: '',
                        price: '', stock: 0, vendor_id: '', sku: '', purchase_price: '',
                        image_urls: ['', '', '', ''],
                        bike_brand: '', bike_model: '',
                        description: '', discount_percent: 0, is_garage_sale: false, is_combo: false, combo_type: '',
                        delivery_tn: 0, delivery_south: 0, delivery_north: 0,
                        size_stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }
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
                    <option value="">All Divisions</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                    className="input" 
                    style={{ maxWidth: '150px' }} 
                    placeholder="Filter Type..." 
                    value={formData.sub_category_type} // re-using but in a filter way
                    onChange={(e) => fetchProducts()} // Simplification for now
                />
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>SKU</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Vendor</th>
                            <th>Purchase Price</th>
                            <th>Selling Price</th>
                            <th>Dis%</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <img 
                                        src={getMediaUrl(
                                            Array.isArray(p.image_url) ? p.image_url[0] : 
                                            (typeof p.image_url === 'string' && p.image_url.startsWith('[') ? JSON.parse(p.image_url)[0] : p.image_url)
                                        ) || 'https://via.placeholder.com/50'} 
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '0.5rem' }} 
                                    />
                                </td>
                                <td style={{ fontWeight: 600, color: '#2563eb' }}>{p.sku || 'N/A'}</td>
                                <td>
                                    <div>{p.name}</div>
                                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                                        {p.brand} {p.bike_brand && `| ${p.bike_brand} ${p.bike_model}`}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{p.category_name}</div>
                                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                        {p.sub_category_type} {p.sub_category && `> ${p.sub_category}`}
                                    </div>
                                </td>
                                <td>{p.vendor_name || 'N/A'}</td>
                                <td>₹{p.purchase_price}</td>
                                <td style={{ fontWeight: 600 }}>₹{p.price}</td>
                                <td style={{ color: parseFloat(p.discount_percent) > 0 ? '#10b981' : '#64748b' }}>
                                    {parseFloat(p.discount_percent) > 0 ? `${parseFloat(p.discount_percent).toFixed(0)}%` : '-'}
                                </td>
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
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} onClick={() => setIsModalOpen(false)}></div>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
                        {/* Modal Header */}
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', tracking: '-0.025em' }}>{editingProduct ? 'Update Product' : 'Add New Product'}</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Fill in the details to manage your mutant store inventory</p>
                            </div>
                            <button style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        
                        <form onSubmit={handleSave} style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem', overflowY: 'auto', flex: 1 }}>
                            <div style={{ gridColumn: 'span 8' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Product Name</label>
                                <input className="input" style={{ borderRadius: '0.75rem', padding: '0.75rem' }} placeholder="e.g. Full Face helmet" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>SKU / Barcode</label>
                                <input className="input" style={{ borderRadius: '0.75rem', padding: '0.75rem' }} placeholder="PROD-001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
                            </div>

                            <div style={{ gridColumn: isNested ? 'span 3' : 'span 4' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                                <select className="input" style={{ borderRadius: '0.75rem', padding: '0.75rem' }} required value={formData.category_id || ''} onChange={(e) => setFormData({ ...formData, category_id: e.target.value, sub_category_type: '', sub_category: '' })}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>

                            {isNested && (
                                <div style={{ gridColumn: 'span 3' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Type</label>
                                    <select className="input" style={{ borderRadius: '0.75rem', padding: '0.75rem' }} value={formData.sub_category_type || ''} onChange={(e) => setFormData({ ...formData, sub_category_type: e.target.value, sub_category: '' })}>
                                        <option value="">Select Type</option>
                                        {subCategoryTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            )}

                            <div style={{ gridColumn: isNested ? 'span 3' : 'span 4' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>{isNested ? 'Item' : 'Sub Category'}</label>
                                <select className="input" style={{ borderRadius: '0.75rem', padding: '0.75rem' }} value={formData.sub_category || ''} onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })} disabled={!subCategories.length}>
                                    <option value="">{subCategories.length ? 'Select' : 'N/A'}</option>
                                    {subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                </select>
                            </div>

                            <div style={{ gridColumn: isNested ? 'span 3' : 'span 4' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Partner Brand</label>
                                <select className="input" style={{ borderRadius: '0.75rem', padding: '0.75rem' }} value={formData.brand || ''} onChange={(e) => setFormData({ ...formData, brand: e.target.value })}>
                                    <option value="">Select Brand</option>
                                    {PARTNER_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>

                            <div style={{ gridColumn: 'span 12' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Vendor / Supplier</label>
                                <select className="input" style={{ borderRadius: '0.75rem', padding: '0.75rem' }} value={formData.vendor_id || ''} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}>
                                    <option value="">Select Vendor</option>
                                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                </select>
                            </div>

                            <div style={{ gridColumn: 'span 12', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>🏍️ Bike Compatibility</span>
                                    <div style={{ height: '1px', flex: 1, backgroundColor: '#e2e8f0' }}></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem', display: 'block' }}>BRAND</label>
                                        <select className="input" style={{ borderRadius: '0.6rem' }} value={formData.bike_brand || ''} onChange={(e) => setFormData({ ...formData, bike_brand: e.target.value, bike_model: '' })}>
                                            <option value="">Universal / No Brand</option>
                                            {BIKE_DATA.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.35rem', display: 'block' }}>MODEL</label>
                                        <select className="input" style={{ borderRadius: '0.6rem' }} disabled={!formData.bike_brand} value={formData.bike_model || ''} onChange={(e) => setFormData({ ...formData, bike_model: e.target.value })}>
                                            <option value="">All Models</option>
                                            {BIKE_DATA.find(b => b.name === formData.bike_brand)?.models.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Purchase Price</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>₹</span>
                                    <input className="input" style={{ paddingLeft: '1.75rem', borderRadius: '0.75rem' }} type="number" step="0.01" value={formData.purchase_price} onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Selling Price</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>₹</span>
                                    <input className="input" style={{ paddingLeft: '1.75rem', borderRadius: '0.75rem' }} type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Discount %</label>
                                <input className="input" style={{ borderRadius: '0.75rem' }} type="number" value={formData.discount_percent} onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })} />
                            </div>

                            {needsSizeStock ? (
                                <div style={{ gridColumn: 'span 12', backgroundColor: '#f0fdf4', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #86efac' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>📦 Size-wise Stock Quantity</span>
                                        <div style={{ height: '1px', flex: 1, backgroundColor: '#86efac' }}></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
                                        {SIZES.map(size => (
                                            <div key={size}>
                                                <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#15803d', marginBottom: '0.35rem', display: 'block' }}>SIZE {size}</label>
                                                <input
                                                    className="input"
                                                    style={{ borderRadius: '0.6rem', borderColor: '#86efac', backgroundColor: '#f0fdf4' }}
                                                    type="number"
                                                    min="0"
                                                    value={formData.size_stock?.[size] === undefined ? '' : formData.size_stock[size]}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setFormData({ 
                                                            ...formData, 
                                                            size_stock: { 
                                                                ...formData.size_stock, 
                                                                [size]: val === '' ? '' : parseInt(val, 10) 
                                                            } 
                                                        });
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <div style={{ backgroundColor: '#dcfce7', borderRadius: '0.6rem', padding: '0.5rem 1rem', border: '1px solid #86efac', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>Total Stock</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#166534' }}>{totalSizeStock}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                        {formData.was_recovered && (
                                            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '0.5rem' }}>
                                                <p style={{ fontSize: '0.7rem', color: '#9a3412', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    ⚠️ Stock Auto-Recovered
                                                </p>
                                                <p style={{ fontSize: '0.65rem', color: '#c2410c' }}>
                                                    Found {formData.stock} items in legacy stock. Assigned to **Size L** by default. Click "Reset All Sizes" to re-distribute.
                                                </p>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ fontSize: '0.65rem', color: '#15803d', fontStyle: 'italic' }}>
                                                Note: Total stock is automatically calculated from sizes.
                                            </p>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({ ...formData, size_stock: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }, was_recovered: false })}
                                                style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', textDecoration: 'underline' }}
                                            >
                                                Reset All Sizes
                                            </button>
                                        </div>
                                    </div>
                                </div>


                            ) : (
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Stock</label>
                                    <input className="input" style={{ borderRadius: '0.75rem' }} type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            )}

                            <div style={{ gridColumn: 'span 12', backgroundColor: '#fcf8ff', padding: '1.25rem', borderRadius: '1rem', border: '1px solid #d8b4fe' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>🚚 Manual Delivery Charges (Region Wise)</span>
                                    <div style={{ height: '1px', flex: 1, backgroundColor: '#d8b4fe' }}></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', marginBottom: '0.35rem', display: 'block' }}>INSIDE TAMILNADU</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#9333ea', fontSize: '12px' }}>₹</span>
                                            <input className="input" style={{ paddingLeft: '1.25rem', borderRadius: '0.6rem', borderColor: '#e9d5ff' }} type="number" value={formData.delivery_tn} onChange={(e) => setFormData({ ...formData, delivery_tn: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', marginBottom: '0.35rem', display: 'block' }}>BELOW MAHARASHTRA</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#9333ea', fontSize: '12px' }}>₹</span>
                                            <input className="input" style={{ paddingLeft: '1.25rem', borderRadius: '0.6rem', borderColor: '#e9d5ff' }} type="number" value={formData.delivery_south} onChange={(e) => setFormData({ ...formData, delivery_south: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9333ea', marginBottom: '0.35rem', display: 'block' }}>ABOVE MAHARASHTRA</label>
                                        <div style={{ position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#9333ea', fontSize: '12px' }}>₹</span>
                                            <input className="input" style={{ paddingLeft: '1.25rem', borderRadius: '0.6rem', borderColor: '#e9d5ff' }} type="number" value={formData.delivery_north} onChange={(e) => setFormData({ ...formData, delivery_north: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 12', backgroundColor: formData.is_garage_sale ? '#fff7ed' : '#f8fafc', padding: '1rem', borderRadius: '1rem', border: `1px solid ${formData.is_garage_sale ? '#ff7e33' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', backgroundColor: formData.is_garage_sale ? '#ff7e33' : '#94a3b8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                        <Plus size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 800, color: formData.is_garage_sale ? '#c2410c' : '#475569', fontSize: '0.9rem' }}>Garage Sale / Today's Offer</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Showcase this product in the exclusive offers section</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.is_garage_sale} onChange={(e) => setFormData({ ...formData, is_garage_sale: e.target.checked })} />
                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </label>
                            </div>

                            <div style={{ gridColumn: 'span 12', backgroundColor: formData.is_combo ? '#f0f9ff' : '#f8fafc', padding: '1.25rem', borderRadius: '1.25rem', border: `1px solid ${formData.is_combo ? '#0ea5e9' : '#e2e8f0'}`, transition: 'all 0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: formData.is_combo ? '1rem' : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', backgroundColor: formData.is_combo ? '#0ea5e9' : '#94a3b8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: formData.is_combo ? '#0369a1' : '#475569', fontSize: '0.9rem' }}>Combo Product / Bundle</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tag this as a specialized combo product package</div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={formData.is_combo} onChange={(e) => setFormData({ ...formData, is_combo: e.target.checked })} />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                    </label>
                                </div>
                                
                                {formData.is_combo && (
                                    <div style={{ paddingLeft: '3.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Select Combo Category</label>
                                        <select 
                                            className="input" 
                                            style={{ borderRadius: '0.75rem', borderColor: '#bae6fd', backgroundColor: '#f0f9ff' }}
                                            value={formData.combo_type}
                                            onChange={(e) => setFormData({ ...formData, combo_type: e.target.value })}
                                        >
                                            <option value="">Choose Combo Type...</option>
                                            <option value="General Combos">General Combos</option>
                                            <option value="Riding Combo Kit">Riding Combo Kit</option>
                                            <option value="Monsoon Combo">Monsoon Combo</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div style={{ gridColumn: 'span 12' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>Product Images</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div
                                        style={{ width: '120px', height: '120px', border: '2px dashed #cbd5e1', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', cursor: 'pointer', transition: 'all 0.2s' }}
                                        onClick={() => document.getElementById('multi-image-input').click()}
                                        onMouseOver={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                    >
                                        <Plus size={24} color="#64748b" />
                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', marginTop: '0.5rem' }}>ADD IMAGES</span>
                                        <input id="multi-image-input" type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        {formData.image_urls.map((url, idx) => url ? (
                                            <div key={idx} style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                <img src={getMediaUrl(url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={`Image ${idx + 1}`} />
                                                <button
                                                    type="button"
                                                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                                                    onClick={(e) => { e.stopPropagation(); const newUrls = [...formData.image_urls]; newUrls[idx] = ''; setFormData({ ...formData, image_urls: newUrls }); }}
                                                >✕</button>
                                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(15, 23, 42, 0.6)', color: 'white', fontSize: '10px', padding: '2px', textAlign: 'center', fontWeight: 700 }}>SLOT {idx + 1}</div>
                                            </div>
                                        ) : null)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ gridColumn: 'span 12' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Description</label>
                                <textarea 
                                    className="input" 
                                    placeholder="Write a compelling product description..." 
                                    style={{ width: '100%', minHeight: '80px', borderRadius: '0.75rem', padding: '0.75rem', resize: 'vertical' }} 
                                    value={formData.description} 
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 12', display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <button type="button" className="btn" style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 700, borderRadius: '0.75rem' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 2, padding: '1rem', borderRadius: '0.75rem', fontWeight: 800, letterSpacing: '0.025em', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>{editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
