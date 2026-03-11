import React, { useState, useEffect } from 'react';
import api from '../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileDown, Calendar, TrendingUp, Package } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [weeklyRevenue, setWeeklyRevenue] = useState([]);
    const [yearlyRevenue, setYearlyRevenue] = useState([]);
    const [revenueView, setRevenueView] = useState('monthly');
    const [topSelling, setTopSelling] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [dateRange, setDateRange] = useState({ start: format(new Date(), 'yyyy-MM-01'), end: format(new Date(), 'yyyy-MM-dd') });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const [mon, week, year, top, low] = await Promise.all([
                api.get('/reports/monthly-revenue'),
                api.get('/reports/weekly-revenue'),
                api.get('/reports/yearly-revenue'),
                api.get('/reports/top-selling'),
                api.get('/reports/low-stock')
            ]);
            setMonthlyRevenue(mon.data.reverse());
            setWeeklyRevenue(week.data.reverse());
            setYearlyRevenue(year.data.reverse());
            setTopSelling(top.data);
            setLowStock(low.data);
        } catch (error) { console.error('Error fetching reports', error); }
    };

    const handleExportPDF = async () => {
        try {
            const res = await api.get(`/reports/pdf-data?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            const data = res.data;

            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text('Pitshop Inventory - Revenue Report', 14, 22);
            doc.setFontSize(10);
            doc.text(`Report Period: ${data.dateRange.start} to ${data.dateRange.end}`, 14, 30);

            doc.autoTable({
                startY: 40,
                head: [['Metric', 'Value']],
                body: [
                    ['Total Invoices', data.summary.invoice_count],
                    ['Total Revenue', `₹${parseFloat(data.summary.total_revenue || 0).toFixed(2)}`],
                    ['Total Products Sold', data.summary.total_products_sold]
                ],
                theme: 'striped'
            });

            doc.text('Sales Summary by Product', 14, doc.lastAutoTable.finalY + 10);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                head: [['Product Name', 'Quantity Sold', 'Revenue Generated']],
                body: data.details.map(item => [item.name, item.quantity, `₹${parseFloat(item.revenue).toFixed(2)}`]),
            });

            doc.save(`Revenue_Report_${data.dateRange.start}_${data.dateRange.end}.pdf`);
        } catch (err) {
            alert('Failed to generate PDF. Make sure jsPDF is installed.');
            console.error(err);
        }
    };

    const currentRevenueData = revenueView === 'monthly' ? monthlyRevenue : (revenueView === 'weekly' ? weeklyRevenue : yearlyRevenue);
    const dataKey = revenueView === 'monthly' ? 'month' : (revenueView === 'weekly' ? 'week' : 'year');

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={24} color="#2563eb" /> Revenue Performance</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                            <button className={`btn ${revenueView === 'weekly' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setRevenueView('weekly')}>Weekly</button>
                            <button className={`btn ${revenueView === 'monthly' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setRevenueView('monthly')}>Monthly</button>
                            <button className={`btn ${revenueView === 'yearly' ? 'btn-primary' : ''}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setRevenueView('yearly')}>Yearly</button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', display: 'block' }}>From</label>
                            <input type="date" className="input" style={{ padding: '0.25rem', fontSize: '0.8rem' }} value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', display: 'block' }}>To</label>
                            <input type="date" className="input" style={{ padding: '0.25rem', fontSize: '0.8rem' }} value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                        </div>
                        <button className="btn btn-primary" onClick={handleExportPDF}><FileDown size={18} /> Export PDF</button>
                    </div>
                </div>
                <div style={{ height: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey={dataKey} />
                            <YAxis />
                            <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={24} color="#22c55e" /> Top Selling Products</h2>
                <div style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={topSelling} dataKey="total_sold" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {topSelling.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card">
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={24} color="#ef4444" /> Urgent Inventory Action</h2>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Products currently below reorder levels {lowStock.length > 0 ? `(${lowStock.length})` : '(0)'}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {lowStock.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#fff1f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                            <span style={{ fontWeight: 700, color: '#ef4444' }}>Only {p.stock} left</span>
                        </div>
                    ))}
                    {lowStock.length === 0 && <p style={{ color: '#22c55e', fontStyle: 'italic' }}>All products are in adequate stock.</p>}
                </div>
            </div>
        </div>
    );
};

export default Reports;
