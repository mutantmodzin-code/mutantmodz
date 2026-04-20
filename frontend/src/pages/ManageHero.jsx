import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, 
  Image as ImageIcon, Eye, EyeOff, Layout
} from 'lucide-react';
import api from '../api';

import { getMediaUrl } from '../utils/url';

const ManageHero = () => {
    const [slides, setSlides] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingSlide, setEditingSlide] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [formData, setFormData] = useState({
        title_white: '',
        title_red: '',
        subtitle: '',
        display_order: 1,
        is_active: true
    });

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const res = await api.get('/hero');
            setSlides(res.data);
        } catch (err) {
            console.error('Failed to fetch slides');
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
        data.append('title_white', formData.title_white || '');
        data.append('title_red', formData.title_red || '');
        data.append('subtitle', formData.subtitle || '');
        data.append('display_order', String(formData.display_order || 1));
        data.append('is_active', String(formData.is_active));
        
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            if (editingSlide) {
                if (!imageFile) data.append('existing_image_url', editingSlide.image_url);
                await api.put(`/hero/${editingSlide.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/hero', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            resetForm();
            fetchSlides();
        } catch (err) {
            const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Failed to save slide';
            alert(`Error: ${errorMsg}`);
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({ title_white: '', title_red: '', subtitle: '', display_order: slides.length + 1, is_active: true });
        setImageFile(null);
        setPreviewUrl('');
        setIsAdding(false);
        setEditingSlide(null);
    };

    const handleEdit = (slide) => {
        setEditingSlide(slide);
        setFormData({
            title_white: slide.title_white || '',
            title_red: slide.title_red || '',
            subtitle: slide.subtitle || '',
            display_order: slide.display_order || 1,
            is_active: !!slide.is_active
        });
        setPreviewUrl(slide.image_url);
        setIsAdding(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this slide?')) return;
        try {
            await api.delete(`/hero/${id}`);
            fetchSlides();
        } catch (err) {
            alert('Failed to delete slide');
        }
    };

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Layout className="text-red-600" size={28} />
                            HOMEPAGE BANNERS
                        </h1>
                        <p style={{ color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>Manage your storefront's main promotional slideshow</p>
                    </div>
                    <button
                        onClick={() => {
                            setIsAdding(true);
                            setFormData({ title_white: '', title_red: '', subtitle: '', display_order: slides.length + 1, is_active: true });
                        }}
                        style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.3)' }}
                    >
                        <Plus size={20} /> ADD NEW SLIDE
                    </button>
                </header>

                {isAdding && (
                    <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', border: '2px solid #dc2626', padding: '2rem', marginBottom: '3rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{editingSlide ? 'Edit Slide' : 'Create New Slide'}</h2>
                            <button onClick={resetForm} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
                                <div style={{ gridColumn: 'span 4' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Slide Image</label>
                                    <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#f1f5f9', border: '2px dashed #cbd5e1', borderRadius: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {previewUrl ? (
                                            <img src={getMediaUrl(previewUrl)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                                <ImageIcon size={32} />
                                                <p style={{ fontSize: '0.7rem', fontWeight: 700, margin: '0.5rem 0' }}>Click to Upload</p>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            required={!editingSlide}
                                            onChange={handleImageChange}
                                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                                        />
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Title (White Part) - Optional</label>
                                        <input
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                            value={formData.title_white}
                                            onChange={e => setFormData({...formData, title_white: e.target.value})}
                                            placeholder="e.g. Coimbatore's Best"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Title (Red Part) - Optional</label>
                                        <input
                                            style={{ width: '100%', padding: '0.875rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                            value={formData.title_red}
                                            onChange={e => setFormData({...formData, title_red: e.target.value})}
                                            placeholder="e.g. Bike Accessories"
                                        />
                                    </div>
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
                            
                            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{ flex: 1, backgroundColor: '#0f172a', color: 'white', padding: '1rem', borderRadius: '0.75rem', border: 'none', fontWeight: 800, cursor: uploading ? 'not-allowed' : 'pointer' }}
                                >
                                    {uploading ? 'SAVING...' : (editingSlide ? 'UPDATE SLIDE' : 'DEPLOY SLIDE')}
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {slides.map((slide) => (
                        <div key={slide.id} style={{ backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#f1f5f9' }}>
                                <img src={getMediaUrl(slide.image_url)} alt={slide.title_red} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}>
                                    <span style={{ backgroundColor: slide.is_active ? '#ecfdf5' : '#fef2f2', color: slide.is_active ? '#059669' : '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                        {slide.is_active ? 'Active' : 'Hidden'}
                                    </span>
                                </div>
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(slide)} style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: 'none', color: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(slide.id)} style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: 'none', color: '#dc2626', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.65rem', fontWeight: 800 }}>
                                    ORDER: {slide.display_order}
                                </div>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>
                                    {slide.title_white} <span style={{ color: '#dc2626' }}>{slide.title_red}</span>
                                </h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', lineHeight: 1.5 }}>{slide.subtitle || 'No description provided.'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ManageHero;
