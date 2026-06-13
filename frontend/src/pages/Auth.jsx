import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bike, Lock, User, LogIn } from 'lucide-react';
import { loadRecaptchaV3, executeRecaptchaV3 } from '../utils/recaptcha';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (RECAPTCHA_SITE_KEY) {
            loadRecaptchaV3(RECAPTCHA_SITE_KEY);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const token = await executeRecaptchaV3(RECAPTCHA_SITE_KEY, 'login');
        if (!token) {
            setError('Please verify that you are not a robot (CAPTCHA failed).');
            return;
        }
        try {
            await login(username, password, token);
            navigate('/');
        } catch (err) {
            if (err.response && (err.response.status === 400 || err.response.status === 401)) {
                setError(err.response.data?.error || 'Invalid credentials. Please try again.');
            } else {
                setError('Server connection error. Please verify your backend server status and API configuration.');
            }
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
            <div className="card" style={{ width: '400px', padding: '3rem', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '0.75rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                    <img src="/favicon-192x192.jpg" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Pitshop Inventory & Billing</h2>
                    <p style={{ color: '#64748b' }}>Admin Portal Access</p>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <User style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} size={20} />
                        <input className="input" style={{ paddingLeft: '3rem' }} placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} size={20} />
                        <input className="input" style={{ paddingLeft: '3rem' }} type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    {RECAPTCHA_SITE_KEY && (
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', margin: '1rem 0' }}>
                            Protected by Google reCAPTCHA
                        </p>
                    )}
                    {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
                    <button className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem' }} type="submit">
                        <LogIn size={20} /> Login Securely
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <p>&copy; 2026 Antigravity Labs. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
