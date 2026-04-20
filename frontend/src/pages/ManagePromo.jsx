import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, 
  Image as ImageIcon, Eye, EyeOff, Layout, Tag
} from 'lucide-react';
import api from '../api';
import { getMediaUrl } from '../utils/url';

const ManagePromo = () => {
    const [banners, setBanners] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        display_order: 1,
        is_active: true
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await api.get('/promo/admin');
            setBanners(res.data);
        } catch (err) {
            console.error('Failed to fetch banners');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        const data = new FormData();
        data.append('title', formData.title || '');
        data.append('display_order', String(formData.display_order || 1));
        data.append('is_active', String(formData.is_active));
        
        // Sending dummy values for text fields as they are still in DB but unused in UI
        data.append('discount_text', '');
        data.append('price_text', '');
        data.append('bg_color', '#000000');
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingBanner) {
                if (!imageFile) data.append('existing_image_url', editingBanner.image_url);
                await api.put(`/promo/${editingBanner.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/promo', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            resetForm();
            fetchBanners();
        } catch (err) {
            const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to save banner';
            alert(`Error: ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({ 
            title: '', 
            display_order: banners.length + 1, 
            is_active: true 
        });
        setImageFile(null);
        setPreviewUrl('');
        setIsAdding(false);
        setEditingBanner(null);
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title || '',
            display_order: banner.display_order || 1,
            is_active: !!banner.is_active
        });
        setPreviewUrl(banner.image_url);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this promo banner?')) return;
        try {
            await api.delete(`/promo/${id}`);
            fetchBanners();
        } catch (err) {
            alert('Failed to delete banner');
        }
    };

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Tag className="text-amber-500" size={28} />
                            PROMO AD CARDS
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>Manage image-only promotional banners for the home page</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setFormData({ ...formData, display_order: banners.length + 1 });
                        }}
                        style={{ backgroundColor: '#fbbf24', color: 'black', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={20} /> ADD NEW AD
                    </button>
                </header>

                {isAdding && (
                    <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', border: '2px solid #fbbf24', padding: '2rem', marginBottom: '3rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{editingBanner ? 'Edit Ad' : 'Create New Ad'}</h2>
                            <button onClick={resetForm} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Ad Image (16:9 Recommended)</label>
                                    <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#0f172a', border: '2px dashed #cbd5e1', borderRadius: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {previewUrl ? (
                                            <img src={getMediaUrl(previewUrl)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#475569' }}>
                                                <ImageIcon size={32} />
                                                <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: '0.5rem 0' }}>Click to Upload Image</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            required={!editingBanner}
                                            onChange={handleImageChange}
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Internal Title (Reference Only)</label>
                                        <input
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            placeholder="e.g. Summer Sale Banner"
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Display Order</label>
                                            <input
                                                type="number"
                                                style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
                                                value={formData.display_order}
                                                onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                                                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} /> Visible on Site
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{ flex: 1, backgroundColor: '#0f172a', color: 'white', padding: '1rem', borderRadius: '0.75rem', border: 'none', fontWeight: 800, cursor: uploading ? 'not-allowed' : 'pointer' }}
                                >
                                    {uploading ? 'SAVING...' : (editingBanner ? 'UPDATE AD' : 'DEPLOY AD')}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{ padding: '1rem 2rem', border: '1px solid #e2e8f0', borderRadius: '0.75rem', backgroundColor: 'transparent', fontWeight: 700 }}
                                >
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                    {banners.map((banner) => (
                        <div key={banner.id} style={{ backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#0f172a' }}>
                                <img src={getMediaUrl(banner.image_url)} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(banner)} style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: 'none', color: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(banner.id)} style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: 'none', color: '#dc2626', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{banner.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Pos: {banner.display_order}</p>
                                </div>
                                <span style={{ color: banner.is_active ? '#059669' : '#dc2626', fontSize: '0.7rem', fontWeight: 900 }}>{banner.is_active ? 'ACTIVE' : 'HIDDEN'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManagePromo;
