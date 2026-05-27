import React, { useState, useEffect } from 'react';
import api from '../api';
import { Package, MapPin, Mail, Phone, ShoppingBag, CheckCircle, Clock, Calendar, CreditCard, Banknote } from 'lucide-react';

const OnlineOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const [deliveryDates, setDeliveryDates] = useState({});

    useEffect(() => {
        fetchOrders();
    }, [selectedDate]);

    const handleDateChange = (orderId, date) => {
        setDeliveryDates(prev => ({ ...prev, [orderId]: date }));
    };

    const markAsShipped = async (orderId) => {
        const deliveryDate = deliveryDates[orderId];
        if (!deliveryDate) {
            alert('Please select a delivery date first');
            return;
        }

        try {
            await api.patch(`/invoices/${orderId}/status`, { 
                status: 'Shipped',
                expected_delivery: deliveryDate
            });
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Shipped', expected_delivery: deliveryDate } : o));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status.');
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const query = selectedDate ? `?date=${selectedDate}` : '';
            const res = await api.get(`/invoices/online/all${query}`);
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch online orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsCompleted = async (orderId) => {
        try {
            await api.patch(`/invoices/${orderId}/status`, { status: 'Completed' });
            // Update local state
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status.');
        }
    };

    if (loading && orders.length === 0) {
        return <div style={{ padding: '2rem' }}>Loading online orders...</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Online Orders</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                    <Calendar size={18} color="#64748b" />
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ border: 'none', outline: 'none', color: '#334155', fontWeight: 600, fontSize: '0.875rem', background: 'transparent' }}
                    />
                    {selectedDate && (
                        <button 
                            onClick={() => setSelectedDate('')} 
                            style={{ 
                                marginLeft: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '4px', 
                                padding: '2px 6px', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' 
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                        <p>No online orders found.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #e2e8f0' }}>
                            {/* Order Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '0.75rem', backgroundColor: '#f0f9ff', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Order #ONL-{order.id}</h3>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            <Clock size={12} /> {new Date(order.created_at).toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {/* Payment Method Badge */}
                                    <div style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '9999px', 
                                        fontSize: '0.7rem', 
                                        fontWeight: 700, 
                                        textTransform: 'uppercase',
                                        backgroundColor: order.payment_method === 'COD' ? '#fff7ed' : '#eff6ff',
                                        color: order.payment_method === 'COD' ? '#ea580c' : '#2563eb',
                                        border: order.payment_method === 'COD' ? '1px solid #fed7aa' : '1px solid #bfdbfe',
                                        display: 'flex', alignItems: 'center', gap: '0.35rem'
                                    }}>
                                        {order.payment_method === 'COD' || order.payment_method === 'cod' ? <Banknote size={13} /> : <CreditCard size={13} />}
                                        {['razorpay', 'upi', 'card', 'netbanking'].includes(order.payment_method?.toLowerCase()) ? order.payment_method.toUpperCase() : (order.payment_method || 'Online')}
                                    </div>
                                    <div style={{ 
                                        padding: '0.25rem 0.75rem', 
                                        borderRadius: '9999px', 
                                        fontSize: '0.75rem', 
                                        fontWeight: 700, 
                                        textTransform: 'uppercase',
                                        backgroundColor: order.status === 'Completed' || order.status === 'paid' ? '#dcfce7' : (order.status === 'unpaid' ? '#fee2e2' : '#fef3c7'),
                                        color: order.status === 'Completed' || order.status === 'paid' ? '#16a34a' : (order.status === 'unpaid' ? '#dc2626' : '#d97706')
                                    }}>
                                        {order.status || 'Pending'}
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                                            ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>(Incl. {parseFloat(order.delivery_charge || 0).toFixed(0)} Delivery)</div>
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8' }}>(Inclusive of all taxes)</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', paddingTop: '0.5rem' }}>
                                {/* Customer Details */}
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Info</h4>
                                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                                        <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem' }}>{order.customer_name} (ID: #{order.customer_id})</p>
                                        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {order.customer_email || 'N/A'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {order.customer_phone || 'N/A'}</div>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><MapPin size={14} style={{ marginTop: '0.125rem', flexShrink: 0 }} /> <span style={{ lineHeight: 1.4 }}>{order.customer_address || 'N/A'}</span></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware Specs</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} style={{ backgroundColor: '#fff', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ width: 40, height: 40, backgroundColor: '#f1f5f9', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                                    {item.image_url ? (
                                                        <img src={(function() {
                                                            try {
                                                              const parsed = JSON.parse(item.image_url);
                                                              return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : item.image_url;
                                                            } catch(e) { return item.image_url; }
                                                          })()} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <Package size={20} style={{ margin: '10px auto', color: '#94a3b8', display: 'block' }} />
                                                    )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.125rem' }}>{item.product_name}</p>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.75rem' }}>
                                                        <span style={{ color: '#64748b' }}>ID: #{item.product_id}</span>
                                                        {item.selected_size && <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#0f172a' }}>Size: {item.selected_size}</span>}
                                                        {item.selected_color && <span style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, color: '#0f172a' }}>Color/Finish: {item.selected_color}</span>}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>x{item.quantity}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', marginTop: '0.5rem' }}>
                                {order.status !== 'Shipped' && order.status !== 'Completed' ? (
                                    <>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Set Delivery Date</label>
                                            <input 
                                                type="date" 
                                                value={deliveryDates[order.id] || ''}
                                                onChange={(e) => handleDateChange(order.id, e.target.value)}
                                                style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.4rem 0.75rem', fontSize: '0.875rem', outline: 'none' }}
                                            />
                                        </div>
                                        <button 
                                            className="btn btn-primary" 
                                            style={{ height: 'fit-content', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#dc2626', borderColor: '#dc2626', fontWeight: 800, padding: '0.6rem 1.25rem' }}
                                            onClick={() => markAsShipped(order.id)}
                                        >
                                            <Package size={16} /> Mark as Shipped
                                        </button>
                                    </>
                                ) : order.status === 'Shipped' ? (
                                    <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '1rem', border: '1px solid #dcfce7' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#16a34a' }}>
                                            <Clock size={20} />
                                            <div>
                                                <p style={{ fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase' }}>In Transit</p>
                                                {order.expected_delivery && <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Expected: {new Date(order.expected_delivery).toLocaleDateString('en-IN')}</p>}
                                            </div>
                                        </div>
                                        <button 
                                            className="btn btn-success" 
                                            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#fff', fontWeight: 800, padding: '0.5rem 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            onClick={() => markAsCompleted(order.id)}
                                        >
                                            <CheckCircle size={14} /> Mark as Delivered
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '1rem', border: '1px solid #dcfce7' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#16a34a' }}>
                                            <CheckCircle size={20} />
                                            <div>
                                                <p style={{ fontWeight: 800, fontSize: '0.875rem', textTransform: 'uppercase' }}>Completed & Delivered</p>
                                                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>Order successfully processed</p>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>
                                            Finalized
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OnlineOrders;
