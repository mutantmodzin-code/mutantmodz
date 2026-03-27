import React, { useState, useEffect } from 'react';
import api from '../api';
import { Eye, Printer, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState({ type: 'all', value: '' });
    const [orderTypeFilter, setOrderTypeFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        fetchInvoices();
    }, [filter]);

    const fetchInvoices = async () => {
        let url = '/invoices';
        if (filter.type !== 'all' && filter.value) {
            url += `?${filter.type}=${filter.value}`;
        }
        const res = await api.get(url);
        setInvoices(res.data);
    };

    const handleFilterChange = (type, value) => {
        setFilter({ type, value });
    };

    const fetchDetails = async (id) => {
        const res = await api.get(`/invoices/${id}`);
        setSelectedInvoice(res.data);
    };

    const handlePrint = (id) => {
        fetchDetails(id);
        setTimeout(() => window.print(), 500);
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = (inv.customer_name || 'Walk-in').toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.toString().includes(searchTerm);
        const matchesType = orderTypeFilter === 'all' || (inv.order_type || 'Offline Order') === orderTypeFilter;
        return matchesSearch && matchesType;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Invoice Registry</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <Search style={{ position: 'absolute', top: '10px', left: '10px', color: '#94a3b8' }} size={20} />
                        <input className="input" style={{ paddingLeft: '3rem' }} placeholder="Search inv # or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <select className="input" style={{ width: '150px' }} value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)}>
                        <option value="all">All Orders</option>
                        <option value="Online Order">Online Orders</option>
                        <option value="Offline Order">Offline Orders</option>
                    </select>
                    <select className="input" style={{ width: '150px' }} value={filter.type} onChange={(e) => handleFilterChange(e.target.value, '')}>
                        <option value="all">All Time</option>
                        <option value="date">Specific Date</option>
                        <option value="month">By Month</option>
                        <option value="year">By Year</option>
                    </select>
                    {filter.type === 'date' && <input type="date" className="input" onChange={(e) => handleFilterChange('date', e.target.value)} />}
                    {filter.type === 'month' && <input type="month" className="input" onChange={(e) => handleFilterChange('month', e.target.value)} />}
                    {filter.type === 'year' && (
                        <select className="input" onChange={(e) => handleFilterChange('year', e.target.value)}>
                            <option value="">Select Year</option>
                            <option value="2026">2026</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Inv #</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total Amount</th>
                            <th>Order Type</th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(inv => (
                            <tr key={inv.id}>
                                <td>#{inv.id}</td>
                                <td>{inv.customer_name || 'Walk-in'}</td>
                                <td>{format(new Date(inv.created_at), 'PPP')}</td>
                                <td>₹{inv.total_amount}</td>
                                <td>
                                    <span style={{
                                        color: (inv.order_type || 'Offline Order') === 'Online Order' ? '#0284c7' : '#475569',
                                        backgroundColor: (inv.order_type || 'Offline Order') === 'Online Order' ? '#e0f2fe' : '#f1f5f9',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}>
                                        {inv.order_type || 'Offline Order'}
                                    </span>
                                </td>
                                <td>
                                    <span style={{
                                        color: '#475569',
                                        backgroundColor: '#f1f5f9',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500
                                    }}>
                                        {inv.payment_method || 'CASH'}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ 
                                        color: inv.status === 'paid' || inv.status === 'Completed' ? '#16a34a' : (inv.status === 'unpaid' ? '#dc2626' : '#d97706'), 
                                        backgroundColor: inv.status === 'paid' || inv.status === 'Completed' ? '#f0fdf4' : (inv.status === 'unpaid' ? '#fee2e2' : '#fff7ed'), 
                                        padding: '0.25rem 0.5rem', 
                                        borderRadius: '0.25rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase'
                                    }}>
                                        {inv.status || 'paid'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => fetchDetails(inv.id)}><Eye size={16} color="#2563eb" /></button>
                                        <button className="btn" style={{ padding: '0.25rem' }} onClick={() => handlePrint(inv.id)}><Printer size={16} color="#64748b" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedInvoice && (
                <div id="print-area" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="card" style={{ width: '600px', backgroundColor: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div>
                                <h2 style={{ color: '#2563eb' }}>Pitshop Inventory</h2>
                                <p>123 Bike Avenue, Moto City</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3>INVOICE #{selectedInvoice.invoice.id}</h3>
                                <p>Date: {format(new Date(selectedInvoice.invoice.created_at), 'PPP')}</p>
                                <p style={{ fontWeight: 500, color: '#64748b' }}>{selectedInvoice.invoice.order_type || 'Offline Order'}</p>
                            </div>
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <h4>BILL TO:</h4>
                            <p>{selectedInvoice.invoice.customer_name}</p>
                            <p>{selectedInvoice.invoice.customer_phone}</p>
                            <p>{selectedInvoice.invoice.customer_address}</p>
                        </div>
                        <table className="table" style={{ marginBottom: '2rem' }}>
                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
                            <tbody>
                                {selectedInvoice.items.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.product_name}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.unit_price}</td>
                                        <td>₹{item.line_total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ marginLeft: 'auto', width: '200px', display: 'grid', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>₹{selectedInvoice.invoice.subtotal}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax:</span><span>₹{selectedInvoice.invoice.tax}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>TOTAL:</span><span>₹{selectedInvoice.invoice.total_amount}</span></div>
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }} className="no-print">
                            <button className="btn btn-primary" onClick={() => window.print()}><Printer size={18} /> Print</button>
                            <button className="btn" style={{ backgroundColor: '#e2e8f0' }} onClick={() => setSelectedInvoice(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                }
            `}</style>
        </div>
    );
};

export default InvoiceHistory;
