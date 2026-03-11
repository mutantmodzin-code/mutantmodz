import React, { useState, useEffect } from 'react';
import api from '../api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    FileDown, Calendar, Search, Filter, ArrowUpRight,
    TrendingUp, Package, Receipt, Info
} from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const GstReports = () => {
    const [summary, setSummary] = useState({
        total_invoices: 0,
        total_taxable_sales: 0,
        total_gst_collected: 0,
        total_cgst: 0,
        total_sgst: 0,
        total_igst: 0
    });
    const [invoices, setInvoices] = useState([]);
    const [analytics, setAnalytics] = useState({
        monthly: [],
        byCategory: [],
        trend: []
    });
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [activeFilter, setActiveFilter] = useState('monthly');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReportData();
        fetchAnalytics();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            const res = await api.get(`/gst/report?startDate=${dateRange.start}&endDate=${dateRange.end}`);
            setSummary(res.data.summary || {
                total_invoices: 0,
                total_taxable_sales: 0,
                total_gst_collected: 0,
                total_cgst: 0,
                total_sgst: 0,
                total_igst: 0
            });
            setInvoices(res.data.invoices || []);
        } catch (error) {
            console.error('Error fetching GST report', error);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/gst/analytics');
            setAnalytics(res.data);
        } catch (error) {
            console.error('Error fetching analytics', error);
        }
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        const today = new Date();
        let start = today;
        let end = today;

        if (filter === 'daily') {
            start = today;
        } else if (filter === 'weekly') {
            start = startOfWeek(today);
        } else if (filter === 'monthly') {
            start = startOfMonth(today);
        }

        setDateRange({
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd')
        });
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('GST TAX REPORT', 14, 25);
        doc.setFontSize(10);
        doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 32);
        doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 160, 32);

        // Summary Table
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text('Summary Overview', 14, 50);

        doc.autoTable({
            startY: 55,
            head: [['Description', 'Value']],
            body: [
                ['Total Invoices', summary.total_invoices],
                ['Total Taxable Amount', `₹${parseFloat(summary.total_taxable_sales || 0).toLocaleString('en-IN')}`],
                ['Total CGST', `₹${parseFloat(summary.total_cgst || 0).toLocaleString('en-IN')}`],
                ['Total SGST', `₹${parseFloat(summary.total_sgst || 0).toLocaleString('en-IN')}`],
                ['Total IGST', `₹${parseFloat(summary.total_igst || 0).toLocaleString('en-IN')}`],
                ['Total GST Collected', `₹${parseFloat(summary.total_gst_collected || 0).toLocaleString('en-IN')}`],
                ['Grand Total', `₹${(parseFloat(summary.total_taxable_sales || 0) + parseFloat(summary.total_gst_collected || 0)).toLocaleString('en-IN')}`]
            ],
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
        });

        // Detail Table
        doc.text('Invoice Details', 14, doc.lastAutoTable.finalY + 15);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 20,
            head: [['Inv #', 'Date', 'Customer', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total GST', 'Total']],
            body: invoices.map(i => [
                i.invoice_number,
                format(new Date(i.invoice_date), 'dd/MM/yy'),
                i.customer_name || 'N/A',
                parseFloat(i.taxable_value).toFixed(2),
                parseFloat(i.cgst_amount).toFixed(2),
                parseFloat(i.sgst_amount).toFixed(2),
                parseFloat(i.igst_amount).toFixed(2),
                parseFloat(i.total_gst).toFixed(2),
                parseFloat(i.total_amount).toFixed(2)
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [71, 85, 105] }
        });

        doc.save(`GST_Report_${dateRange.start}_${dateRange.end}.pdf`);
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoice_number.toString().includes(searchTerm)
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>GST Reporting & Monitoring</h1>
                    <p style={{ color: '#64748b' }}>Monitor your tax collections and compliance in real-time.</p>
                </div>
                <button className="btn btn-primary" onClick={handleExportPDF}>
                    <FileDown size={18} /> Export GST Data (PDF)
                </button>
            </div>

            {/* Filters Section */}
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['daily', 'weekly', 'monthly', 'custom'].map(f => (
                        <button
                            key={f}
                            className={`btn ${activeFilter === f ? 'btn-primary' : ''}`}
                            style={{ textTransform: 'capitalize', padding: '0.5rem 1rem' }}
                            onClick={() => handleFilterChange(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <Calendar size={16} />
                        </span>
                        <input
                            type="date"
                            className="input"
                            style={{ paddingLeft: '35px', width: '160px' }}
                            value={dateRange.start}
                            onChange={(e) => {
                                setDateRange(prev => ({ ...prev, start: e.target.value }));
                                setActiveFilter('custom');
                            }}
                        />
                    </div>
                    <span style={{ color: '#94a3b8' }}>to</span>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                            <Calendar size={16} />
                        </span>
                        <input
                            type="date"
                            className="input"
                            style={{ paddingLeft: '35px', width: '160px' }}
                            value={dateRange.end}
                            onChange={(e) => {
                                setDateRange(prev => ({ ...prev, end: e.target.value }));
                                setActiveFilter('custom');
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Taxable Sales</p>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{parseFloat(summary.total_taxable_sales || 0).toLocaleString('en-IN')}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#22c55e', fontSize: '0.75rem' }}>
                        <ArrowUpRight size={14} /> <span>Calculated Subtotal</span>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total GST</p>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{parseFloat(summary.total_gst_collected || 0).toLocaleString('en-IN')}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontSize: '0.75rem' }}>
                        <Info size={14} /> <span>Combined Tax</span>
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #22c55e' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>CGST (Center)</p>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{parseFloat(summary.total_cgst || 0).toLocaleString('en-IN')}</h2>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>State Split: 50%</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>SGST (State)</p>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{parseFloat(summary.total_sgst || 0).toLocaleString('en-IN')}</h2>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>State Split: 50%</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>IGST (Integrated)</p>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{parseFloat(summary.total_igst || 0).toLocaleString('en-IN')}</h2>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Inter-state</p>
                </div>
            </div>

            {/* Analytics Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '2rem' }}>
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} color="#2563eb" /> GST Collection Trend
                        </h3>
                    </div>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analytics.trend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" fontSize={10} tickFormatter={(tick) => format(new Date(tick), 'dd MMM')} />
                                <YAxis fontSize={10} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`₹${value}`, 'GST Collection']}
                                />
                                <Line type="monotone" dataKey="total_gst" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Package size={20} color="#22c55e" /> GST by Category
                    </h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.byCategory}
                                    dataKey="total_gst"
                                    nameKey="category_name"
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                >
                                    {analytics.byCategory.map((entry, index) => (
                                        <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹\${value}`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Receipt size={20} color="#64748b" /> Invoice Breakdown
                    </h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            className="input"
                            placeholder="Search by customer or invoice..."
                            style={{ paddingLeft: '40px', width: '300px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Inv #</th>
                                <th>Date</th>
                                <th>Customer Name</th>
                                <th style={{ textAlign: 'right' }}>Taxable Value</th>
                                <th style={{ textAlign: 'right' }}>CGST</th>
                                <th style={{ textAlign: 'right' }}>SGST</th>
                                <th style={{ textAlign: 'right' }}>IGST</th>
                                <th style={{ textAlign: 'right' }}>Total GST</th>
                                <th style={{ textAlign: 'right' }}>Net Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map((inv) => (
                                <tr key={inv.invoice_number}>
                                    <td style={{ fontWeight: 600 }}>#{inv.invoice_number}</td>
                                    <td style={{ fontSize: '0.875rem' }}>{format(new Date(inv.invoice_date), 'dd MMM yyyy')}</td>
                                    <td>{inv.customer_name || 'Walk-in Customer'}</td>
                                    <td style={{ textAlign: 'right' }}>₹{parseFloat(inv.taxable_value).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>₹{parseFloat(inv.cgst_amount).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>₹{parseFloat(inv.sgst_amount).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>₹{parseFloat(inv.igst_amount).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>₹{parseFloat(inv.total_gst).toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>₹{parseFloat(inv.total_amount).toFixed(2)}</td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        No invoices found for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default GstReports;
