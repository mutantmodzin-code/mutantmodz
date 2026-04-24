import React, { useState, useEffect } from 'react';
import api from '../api';
import { Eye, Printer, Search, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState({ type: 'all', value: '' });
    const [orderTypeFilter, setOrderTypeFilter] = useState('all');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const autoPrintId = queryParams.get('print');

    useEffect(() => {
        fetchInvoices();
        
        if (autoPrintId) {
            handlePrint(autoPrintId);
        }
    }, [filter, autoPrintId]);

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
        try {
            const res = await api.get(`/invoices/${id}`);
            if (res.data && res.data.invoice) {
                setSelectedInvoice(res.data);
                return res.data;
            } else {
                alert("Invoice details not found");
                return null;
            }
        } catch (error) {
            console.error("Fetch details failed:", error);
            alert("Error loading invoice details");
            return null;
        }
    };

    const handlePrint = async (id) => {
        const data = await fetchDetails(id);
        if (data) {
            // Longer delay to ensure React has fully rendered the modal and all its data
            setTimeout(() => {
                window.print();
            }, 1500);
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = (inv.customer_name || 'Walk-in').toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.id.toString().includes(searchTerm);
        const matchesType = orderTypeFilter === 'all' || (inv.order_type || 'Offline Order') === orderTypeFilter;
        return matchesSearch && matchesType;
    });

    const numberToWords = (num) => {
        const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const convert = (n) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
            if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'And ' + convert(n % 100) : '');
            if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? convert(n % 1000) : '');
            if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? convert(n % 100000) : '');
            return convert(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? convert(n % 10000000) : '');
        };

        const result = convert(Math.floor(num));
        return result ? 'Rupees ' + result + 'Only' : '';
    };

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
                    <div className="card" style={{ width: '800px', backgroundColor: 'white', padding: '2rem', borderRadius: 0, border: '1px solid #000', color: '#000' }}>
                        {/* Header Details */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                            <span>GSTIN: 33BUNPN4615A1ZX</span>
                            <div style={{ textAlign: 'right' }}>
                                <div>CELL: 88077 27227</div>
                            </div>
                        </div>

                        {/* Company Header */}
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '2px' }}>MUTANT MODZ</h1>
                            <p style={{ fontSize: '0.7rem', margin: '0.25rem 0', fontWeight: 600 }}>
                                298-300, KAMARAJAR ROAD, OPP. VIBGYOR SCHOOL, UPPILIPALAYAM POST, COIMBATORE-641 015
                            </p>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0', textDecoration: 'underline' }}>TAX INVOICE</h2>
                        </div>

                        {/* Customer and Bill Info Boxes */}
                        <div style={{ display: 'flex', border: '1px solid #000', marginBottom: '1rem' }}>
                            <div style={{ flex: 1, padding: '1rem', borderRight: '1px solid #000' }}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontWeight: 700 }}>To.</span>
                                    <span>{selectedInvoice.invoice?.customer_name || 'Walk-in'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                    <span style={{ fontWeight: 700 }}>Ph:</span>
                                    <span>{selectedInvoice.invoice?.customer_phone || 'N/A'}</span>
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 700 }}>Payment Terms</span>
                                    <span>: {selectedInvoice.invoice.payment_method}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Bill No</span>
                                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>: {selectedInvoice.invoice.id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                    <span style={{ fontWeight: 700 }}>Date</span>
                                    <span>: {format(new Date(selectedInvoice.invoice.created_at), 'dd-MM-yyyy')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', border: '1px solid #000' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #000' }}>
                                    <th style={{ border: '1px solid #000', padding: '0.5rem', width: '50px' }}>S.No</th>
                                    <th style={{ border: '1px solid #000', padding: '0.5rem', textAlign: 'left' }}>Description</th>
                                    <th style={{ border: '1px solid #000', padding: '0.5rem', width: '80px' }}>Qty</th>
                                    <th style={{ border: '1px solid #000', padding: '0.5rem', width: '100px' }}>Rate</th>
                                    <th style={{ border: '1px solid #000', padding: '0.5rem', width: '100px' }}>Dis%</th>
                                    <th style={{ border: '1px solid #000', padding: '0.5rem', width: '120px', textAlign: 'right' }}>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedInvoice.items || []).map((item, idx) => (
                                    <tr key={item.id} style={{ height: '40px' }}>
                                        <td style={{ borderRight: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{idx + 1}</td>
                                        <td style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>
                                            <div style={{ fontWeight: 600 }}>{item.product_name || item.name}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#334155' }}>Inclusive of all taxes</div>
                                        </td>
                                        <td style={{ borderRight: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{item.quantity} Nos</td>
                                        <td style={{ borderRight: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                        <td style={{ borderRight: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>
                                            {parseFloat(item.discount_percent || 0) > 0 ? 
                                                `${parseFloat(item.discount_percent).toFixed(0)}%` : 
                                                ''
                                            }
                                        </td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{parseFloat(item.line_total || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {/* Empty rows to maintain height like in screenshot */}
                                {[...Array(Math.max(0, 8 - selectedInvoice.items.length))].map((_, i) => (
                                    <tr key={`empty-${i}`} style={{ height: '40px' }}>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ borderTop: '2px solid #000', fontWeight: 700 }}>
                                    <td style={{ borderRight: '1px solid #000', padding: '0.5rem' }}></td>
                                    <td style={{ borderRight: '1px solid #000', padding: '0.5rem' }}>Subtotal</td>
                                    <td style={{ borderRight: '1px solid #000', padding: '0.5rem', textAlign: 'center' }}>
                                        {(selectedInvoice.items || []).reduce((sum, i) => sum + (i.quantity || 0), 0)}.000
                                    </td>
                                    <td style={{ borderRight: '1px solid #000', padding: '0.5rem' }}></td>
                                    <td style={{ borderRight: '1px solid #000', padding: '0.5rem' }}></td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{parseFloat(selectedInvoice.invoice?.subtotal || 0).toFixed(2)}</td>
                                </tr>
                                {((selectedInvoice.invoice.delivery_charge && parseFloat(selectedInvoice.invoice.delivery_charge) > 0) || selectedInvoice.invoice.order_type === 'Online Order') && (
                                    <tr style={{ borderTop: '1px solid #000', fontWeight: 700 }}>
                                        <td style={{ borderRight: '1px solid #000', padding: '0.5rem' }}></td>
                                        <td colSpan="4" style={{ borderRight: '1px solid #000', padding: '0.5rem', textAlign: 'right' }}>Delivery Charge</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>{parseFloat(selectedInvoice.invoice.delivery_charge || 0).toFixed(2)}</td>
                                    </tr>
                                )}
                                {(selectedInvoice.items || []).some(i => parseFloat(i.discount_percent || 0) > 0) && (
                                    <tr style={{ borderTop: '1px solid #000', fontWeight: 700 }}>
                                        <td style={{ borderRight: '1px solid #000', padding: '0.5rem' }}></td>
                                        <td colSpan="4" style={{ borderRight: '1px solid #000', padding: '0.5rem', textAlign: 'right', color: '#16a34a' }}>Total Savings</td>
                                        <td style={{ padding: '0.5rem', textAlign: 'right', color: '#16a34a' }}>
                                            ₹{(selectedInvoice.items || []).reduce((sum, item) => {
                                                const originalPrice = parseFloat(item.unit_price || 0) / (1 - (parseFloat(item.discount_percent || 0) / 100));
                                                const savingsPerUnit = isFinite(originalPrice) ? originalPrice - parseFloat(item.unit_price || 0) : 0;
                                                return sum + (savingsPerUnit * (item.quantity || 0));
                                            }, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>

                        {/* Amount in Words and Final Total */}
                        <div style={{ border: '1px solid #000', padding: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>E. & O.E.</span>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'baseline' }}>
                                        <span style={{ fontWeight: 700, marginRight: '1rem' }}>Net Amount:</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{parseFloat(selectedInvoice.invoice?.total_amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569', marginTop: '-2px' }}>(Inclusive of all taxes)</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ border: '1px solid #000', padding: '0.5rem', marginBottom: '2rem', fontWeight: 700 }}>
                            {numberToWords(selectedInvoice.invoice?.total_amount || 0)}
                        </div>

                        {/* Signature */}
                        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                            <div style={{ fontWeight: 700 }}>For MUTANT MODZ</div>
                            <div style={{ marginTop: '3rem', fontSize: '0.8rem', textDecoration: 'overline' }}>Authorised Signatory</div>
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
                    @page {
                        margin: 0;
                        size: auto;
                    }
                    body {
                        background-color: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .no-print, nav, aside, header, .sidebar, .header-actions { 
                        display: none !important; 
                    }
                    #print-area { 
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background-color: white !important;
                        display: block !important;
                        visibility: visible !important;
                        z-index: 9999 !important;
                    }
                    #print-area * {
                        visibility: visible !important;
                    }
                    .card { 
                        border: none !important; 
                        box-shadow: none !important; 
                        width: 100% !important; 
                        max-width: 100% !important;
                        margin: 0 !important; 
                        padding: 1.5cm !important; 
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceHistory;
