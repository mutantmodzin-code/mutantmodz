import React, { useState, useEffect } from 'react';
import api from '../api';
import { Package, AlertTriangle, BadgeIndianRupee, ShoppingCart, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DashboardCard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
        <div style={{ backgroundColor: `${color}20`, padding: '1rem', borderRadius: '1rem', color }}>
            <Icon size={32} />
        </div>
        <div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockCount: 0,
        dailyRevenue: 0,
        dailyInvoiceCount: 0,
        totalStock: 0,
        recentOnline: [],
        recentOffline: [],
        revenueTrend: []
    });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/reports/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats', error);
        }
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.875rem', fontWeight: 700 }}>Dashboard Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <DashboardCard title="Total Products" value={stats.totalProducts} icon={Package} color="#2563eb" />
                <DashboardCard title="Low Stock Alerts" value={stats.lowStockCount} icon={AlertTriangle} color="#ef4444" />
                <DashboardCard title="Daily Sales" value={`₹${(stats.dailyRevenue || 0).toFixed(2)}`} icon={BadgeIndianRupee} color="#22c55e" />
                <DashboardCard title="Remaining Inventory" value={stats.totalStock} icon={Package} color="#8b5cf6" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                        <h3 style={{ fontWeight: 700 }}>Revenue Trend (Last 7 Days)</h3>
                        <TrendingUp color="#2563eb" />
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.revenueTrend}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Recent Online Orders</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {stats.recentOnline.length > 0 ? stats.recentOnline.map(order => (
                                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                    <span>#{order.id} - {order.customer_name || 'Guest'}</span>
                                    <span style={{ fontWeight: 600 }}>₹{parseFloat(order.total_amount).toFixed(2)}</span>
                                </div>
                            )) : <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No recent online orders</p>}
                        </div>
                    </div>
                    <div className="card">
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Recent Offline Bills</h3>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {stats.recentOffline.length > 0 ? stats.recentOffline.map(bill => (
                                <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                    <span>#{bill.id} - {bill.customer_name || 'Walking Customer'}</span>
                                    <span style={{ fontWeight: 600 }}>₹{parseFloat(bill.total_amount).toFixed(2)}</span>
                                </div>
                            )) : <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No recent offline bills</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
