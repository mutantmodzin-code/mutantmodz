import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
    ShieldAlert, 
    ShieldCheck, 
    Globe, 
    UserX, 
    AlertTriangle, 
    Activity, 
    Smartphone, 
    Server, 
    Search,
    RefreshCw
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: '220px' }}>
        <div style={{ backgroundColor: `${color}15`, padding: '1rem', borderRadius: '1rem', color }}>
            <Icon size={28} />
        </div>
        <div>
            <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>{value}</h3>
            {subtext && <p style={{ color: '#94a3b8', fontSize: '0.675rem', fontWeight: 500 }}>{subtext}</p>}
        </div>
    </div>
);

const SecurityDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        setRefreshing(true);
        try {
            const response = await api.get('/auth/security-stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching security metrics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Poll stats every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
                <Activity className="animate-spin" size={32} />
                <span style={{ marginLeft: '1rem', fontWeight: 600 }}>Loading security intelligence telemetry...</span>
            </div>
        );
    }

    const {
        blockedBotsToday = 0,
        blockedIps = 0,
        blockedCountries = [],
        vpnAttempts = 0,
        datacenterAttempts = 0,
        otpAbuse = 0,
        failedLogins = 0,
        topAttackedAccounts = [],
        topAttackingIps = [],
        riskStats = { averageScore: 0, maxScore: 0 },
        trends = [],
        recentEvents = []
    } = stats || {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>Security Operation Center</h1>
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Real-time threat monitoring and access policy metrics.</p>
                </div>
                <button 
                    onClick={fetchStats} 
                    disabled={refreshing}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        padding: '0.5rem 1rem', 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '0.75rem', 
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
                    }}
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Metrics Cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                <StatCard title="Bots Blocked (24h)" value={blockedBotsToday} subtext="Automation & Crawlers" icon={ShieldAlert} color="#ef4444" />
                <StatCard title="Banned IP Addresses" value={blockedIps} subtext="Temporary or Permanent bans" icon={ShieldCheck} color="#22c55e" />
                <StatCard title="VPN & Proxy Blocks" value={vpnAttempts} subtext="Anonymized login attempts" icon={Globe} color="#3b82f6" />
                <StatCard title="Datacenter Access Attempts" value={datacenterAttempts} subtext="Hosting provider nodes blocked" icon={Server} color="#8b5cf6" />
                <StatCard title="OTP & API Rate Limits" value={otpAbuse} subtext="Velocity protection triggers" icon={AlertTriangle} color="#f59e0b" />
                <StatCard title="Mean Risk Score" value={`${riskStats.averageScore} / 100`} subtext={`Max recorded: ${riskStats.maxScore}`} icon={Activity} color="#06b6d4" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
                {/* Attack and Login Trends */}
                <div className="card">
                    <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.5rem', color: '#0f172a' }}>Threat Vector Trends (7 Days)</h3>
                    <div style={{ height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Area type="monotone" name="Blocked Attacks" dataKey="attacks" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAttacks)" />
                                <Area type="monotone" name="Successful Logins" dataKey="logins" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorLogins)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Country Blocking Stats */}
                <div className="card">
                    <h3 style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '1.5rem', color: '#0f172a' }}>Blocked Traffic Origins (Top 5 Countries)</h3>
                    {blockedCountries.length > 0 ? (
                        <div style={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={blockedCountries.slice(0, 5)} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis type="category" dataKey="country" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                    <Bar dataKey="count" name="Threat Events" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                            No non-Indian traffic blocked in the last 24 hours.
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Top Attacking IPs */}
                <div className="card">
                    <h4 style={{ fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Top Threat Source IPs</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                <th style={{ padding: '0.5rem 0' }}>IP Address</th>
                                <th>Origin</th>
                                <th style={{ textAlign: 'right' }}>Security Triggers</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topAttackingIps.map((el, i) => (
                                <tr key={i} style={{ borderBottom: i === topAttackingIps.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 600, color: '#0f172a' }}>{el.ip}</td>
                                    <td>
                                        <span style={{ padding: '0.25rem 0.5rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '0.375rem', fontSize: '0.675rem', fontWeight: 700 }}>
                                            {el.country || 'Unknown'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>{el.count}</td>
                                </tr>
                            ))}
                            {topAttackingIps.length === 0 && (
                                <tr>
                                    <td colSpan={3} style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8' }}>No attacking IPs registered.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Top Targeted Accounts */}
                <div className="card">
                    <h4 style={{ fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Top Targeted Accounts</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                <th style={{ padding: '0.5rem 0' }}>Account Identifier</th>
                                <th style={{ textAlign: 'right' }}>Failed Login Attempts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topAttackedAccounts.map((el, i) => (
                                <tr key={i} style={{ borderBottom: i === topAttackedAccounts.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '0.75rem 0', fontWeight: 600, color: '#0f172a' }}>{el.account}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>{el.attempts}</td>
                                </tr>
                            ))}
                            {topAttackedAccounts.length === 0 && (
                                <tr>
                                    <td colSpan={2} style={{ padding: '2rem 0', textAlign: 'center', color: '#94a3b8' }}>No targeted accounts logged.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Realtime Event Log */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a' }}>Real-time Security Audit Log</h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>Live Stream</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600 }}>
                                <th style={{ padding: '0.75rem' }}>Timestamp</th>
                                <th>Incident Category</th>
                                <th>Source IP</th>
                                <th>Location</th>
                                <th>Risk Score</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentEvents.map((event) => {
                                const scoreColor = event.risk_score >= 70 ? '#ef4444' : event.risk_score >= 30 ? '#f59e0b' : '#22c55e';
                                return (
                                    <tr key={event.event_id} style={{ borderBottom: '1px solid #f1f5f9', hover: { backgroundColor: '#f8fafc' } }}>
                                        <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.75rem' }}>{new Date(event.timestamp).toLocaleString()}</td>
                                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{event.event_type}</td>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{event.ip}</td>
                                        <td style={{ color: '#475569' }}>{event.city}, {event.country}</td>
                                        <td>
                                            <span style={{ fontWeight: 800, color: scoreColor }}>
                                                {event.risk_score} / 100
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ 
                                                padding: '0.25rem 0.5rem', 
                                                borderRadius: '0.375rem', 
                                                fontSize: '0.675rem', 
                                                fontWeight: 700,
                                                backgroundColor: event.status === 'BLOCKED' || event.status === 'FAILED' ? '#fef2f2' : event.status === 'CHALLENGED' ? '#fffbeb' : '#f0fdf4',
                                                color: event.status === 'BLOCKED' || event.status === 'FAILED' ? '#ef4444' : event.status === 'CHALLENGED' ? '#d97706' : '#16a34a'
                                            }}>
                                                {event.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {recentEvents.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No threat logging reports. System secure.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
