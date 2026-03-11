import React, { useState, useEffect } from 'react';
import api from '../api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, IndianRupee, PieChart as PieIcon, Activity } from 'lucide-react';

const ProfitDashboard = () => {
    const [profitData, setProfitData] = useState({ daily: [], weekly: [], monthly: [], byProduct: [] });
    const [view, setView] = useState('daily');

    useEffect(() => {
        fetchProfit();
    }, []);

    const fetchProfit = async () => {
        try {
            const res = await api.get('/reports/profit');
            setProfitData(res.data);
        } catch (error) { console.error('Error fetching profit data', error); }
    };

    const currentData = profitData[view] || [];
    const dataKey = view === 'daily' ? 'date' : (view === 'weekly' ? 'week' : 'month');

    const totalProfit = currentData.reduce((sum, item) => sum + parseFloat(item.profit), 0);
    const totalRevenue = currentData.reduce((sum, item) => sum + parseFloat(item.total_selling), 0);
    const margin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <h1 style={{ gridColumn: 'span 4', fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Profit Analytics Dashboard</h1>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: '#dcfce7', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <IndianRupee color="#16a34a" size={24} />
                </div>
                <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Net Profit</p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: '#e0e7ff', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <TrendingUp color="#2563eb" size={24} />
                </div>
                <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Avg. Profit Margin</p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{margin}%</h3>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: '#fef3c7', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <Activity color="#d97706" size={24} />
                </div>
                <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Revenue</p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ backgroundColor: '#f3e8ff', padding: '0.75rem', borderRadius: '0.75rem' }}>
                    <PieIcon color="#7c3aed" size={24} />
                </div>
                <div>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Top Product Growth</p>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>+12.4%</h3>
                </div>
            </div>

            <div className="card" style={{ gridColumn: 'span 3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Profit Trend</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn ${view === 'daily' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setView('daily')}>Daily</button>
                        <button className={`btn ${view === 'weekly' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setView('weekly')}>Weekly</button>
                        <button className={`btn ${view === 'monthly' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setView('monthly')}>Monthly</button>
                    </div>
                </div>
                <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentData.slice().reverse()}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey={dataKey} />
                            <YAxis />
                            <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Area type="monotone" dataKey="profit" stroke="#22c55e" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card" style={{ gridColumn: 'span 1' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>Top Profitable Products</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {(profitData.byProduct || []).map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</p>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.units_sold} units sold</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 700, color: '#16a34a' }}>+₹{parseFloat(p.total_profit).toFixed(0)}</p>
                                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Profit</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{ gridColumn: 'span 4', padding: 0 }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Period ({view})</th>
                            <th style={{ textAlign: 'right' }}>Total Sales</th>
                            <th style={{ textAlign: 'right' }}>Total Purchase Cost</th>
                            <th style={{ textAlign: 'right' }}>Net Profit</th>
                            <th style={{ textAlign: 'right' }}>Margin (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(currentData || []).map((item, idx) => (
                            <tr key={idx}>
                                <td>{item[dataKey]}</td>
                                <td style={{ textAlign: 'right' }}>₹{parseFloat(item.total_selling).toFixed(2)}</td>
                                <td style={{ textAlign: 'right' }}>₹{parseFloat(item.total_purchase).toFixed(2)}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>₹{parseFloat(item.profit).toFixed(2)}</td>
                                <td style={{ textAlign: 'right' }}>{((item.profit / item.total_selling) * 100).toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProfitDashboard;
