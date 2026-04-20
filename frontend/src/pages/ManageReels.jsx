import React, { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Trash2, Edit2, Save, X, Video, UploadCloud, Film } from 'lucide-react';

import { getMediaUrl } from '../utils/url';

const ManageReels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', display_order: 0, is_active: true });
    const [videoFile, setVideoFile] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchReels = async () => {
        try {
            const res = await api.get('/reels/admin');
            setReels(res.data);
        } catch (err) {
            console.error('Error fetching reels:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReels();
    }, []);

    const handleEdit = (reel) => {
        setIsEditing(reel.id);
        setEditForm({ 
            title: reel.title, 
            display_order: reel.display_order, 
            is_active: reel.is_active,
            instagram_url: reel.instagram_url || '',
            existing_video_url: reel.video_url 
        });
        setVideoFile(null);
    };

    const handleSave = async (id) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('display_order', editForm.display_order);
        formData.append('is_active', editForm.is_active);
        if (editForm.instagram_url) formData.append('instagram_url', editForm.instagram_url);
        if (videoFile) formData.append('video', videoFile);
        else if (editForm.existing_video_url) formData.append('existing_video_url', editForm.existing_video_url);

        try {
            await api.put(`/reels/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsEditing(null);
            setVideoFile(null);
            fetchReels();
        } catch (err) {
            const msg = err.response?.data?.details || err.response?.data?.error || err.message;
            alert(`Save Failed: ${msg}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this reel?')) return;
        try {
            await api.delete(`/reels/${id}`);
            fetchReels();
        } catch (err) {
            const msg = err.response?.data?.details || err.response?.data?.error || err.message;
            alert(`Delete Failed: ${msg}`);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('display_order', editForm.display_order);
        formData.append('is_active', true);
        if (editForm.instagram_url) formData.append('instagram_url', editForm.instagram_url);
        if (videoFile) formData.append('video', videoFile);

        try {
            await api.post('/reels', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsAdding(false);
            setVideoFile(null);
            setEditForm({ title: '', display_order: reels.length + 1, is_active: true, instagram_url: '' });
            fetchReels();
        } catch (err) {
            const msg = err.response?.data?.details || err.response?.data?.error || err.message;
            alert(`Upload Failed: ${msg}`);
            console.error('Upload Error:', err.response?.data || err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Video Engine...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Header section with inline styles for reliability */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>HOMEPAGE VIDEO REELS</h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>Upload directly to your site. No external links required.</p>
                </div>
                <button
                    onClick={() => {
                        setIsAdding(true);
                        setEditForm({ title: '', display_order: reels.length + 1, is_active: true });
                        setVideoFile(null);
                    }}
                    style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' }}
                >
                    <Plus size={20} /> ADD NEW VIDEO
                </button>
            </div>

            {isAdding && (
                <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', border: '2px solid #2563eb', padding: '2rem', marginBottom: '3rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Film color="#2563eb" size={24} /> UPLOAD NEW PROJECT
                        </h2>
                        <button onClick={() => setIsAdding(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Video Title</label>
                            <input
                                required
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                placeholder="e.g. Performance Modifications Showcase"
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>External Video / Instagram URL (Optional but Recommended for Large Files)</label>
                            <input
                                value={editForm.instagram_url || ''}
                                onChange={e => setEditForm({ ...editForm, instagram_url: e.target.value })}
                                style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                                placeholder="https://www.instagram.com/reels/..."
                            />
                            <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem' }}>If provided, this link will be used instead of the uploaded file on the frontend.</p>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>OR Select Video File (Max 4.5MB on Vercel)</label>
                            <div style={{ position: 'relative', border: '2px dashed #e2e8f0', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                                <UploadCloud size={32} color="#cbd5e1" style={{ marginBottom: '0.5rem' }} />
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={e => setVideoFile(e.target.files[0])}
                                    style={{ cursor: 'pointer' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>MP4 or MOV recommended</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <button
                                type="submit"
                                disabled={uploading}
                                style={{ backgroundColor: uploading ? '#94a3b8' : '#2563eb', color: 'white', padding: '1rem', borderRadius: '0.75rem', border: 'none', fontWeight: 800, cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '1rem' }}
                            >
                                {uploading ? 'UPLOADING...' : 'START DEPLOYMENT'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {reels.map((reel) => (
                    <div key={reel.id} style={{ backgroundColor: 'white', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ aspectRatio: '9/16', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                            {reel.video_url ? (
                                <video 
                                    src={getMediaUrl(reel.video_url)} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    muted
                                    onMouseEnter={e => e.target.play()}
                                    onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                                />
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                                    <Video size={48} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem' }}>NO MEDIA</span>
                                </div>
                            )}
                            
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleEdit(reel)}
                                    style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: 'none', color: '#2563eb', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(reel.id)}
                                    style={{ padding: '0.5rem', backgroundColor: 'white', borderRadius: '0.5rem', border: 'none', color: '#ef4444', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem' }}>
                            {isEditing === reel.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontWeight: 600 }}
                                        value={editForm.title}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}
                                            value={editForm.display_order}
                                            onChange={e => setEditForm({ ...editForm, display_order: parseInt(e.target.value) })}
                                        />
                                        <button onClick={() => setIsEditing(null)} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: 'transparent' }}><X size={18} /></button>
                                        <button onClick={() => handleSave(reel.id)} style={{ padding: '0.75rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.5rem' }}><Save size={18} /></button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: 'tight' }}>{reel.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.625rem', fontWeight: 900, backgroundColor: '#f1f5f9', color: '#64748b', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textTransform: 'uppercase' }}>ORDER: {reel.display_order}</span>
                                        <span style={{ fontSize: '0.625rem', fontWeight: 900, backgroundColor: reel.is_active ? '#ecfdf5' : '#fef2f2', color: reel.is_active ? '#059669' : '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', textTransform: 'uppercase' }}>{reel.is_active ? 'ACTIVE' : 'DISABLED'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageReels;
