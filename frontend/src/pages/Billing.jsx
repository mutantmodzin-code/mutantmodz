import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Plus, Trash, Printer, ShoppingCart, User, PlusCircle, MinusCircle } from 'lucide-react';

const Billing = () => {
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedQty, setSelectedQty] = useState(1);
    const [billItems, setBillItems] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '', address: '' });
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const [skuSearch, setSkuSearch] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCustomers();
    }, []);

    const fetchProducts = async () => {
        const res = await api.get('/products');
        setProducts(res.data);
    };

    const handleSkuSearch = async (e) => {
        const value = e.target.value;
        setSkuSearch(value);
        if (value.length >= 3) {
            const prod = products.find(p => p.sku === value);
            if (prod && prod.stock > 0) {
                addItemToBillDirect(prod);
                setSkuSearch('');
            }
        }
    };

    const addItemToBillDirect = (prod, qty = 1) => {
        const existingItem = billItems.find(item => item.product_id === prod.id);
        if (existingItem) {
            setBillItems(billItems.map(item =>
                item.product_id === prod.id ? { ...item, quantity: item.quantity + qty, line_total: (item.quantity + qty) * item.unit_price } : item
            ));
        } else {
            setBillItems([...billItems, {
                product_id: prod.id,
                name: prod.name,
                quantity: qty,
                unit_price: prod.price,
                purchase_price: prod.purchase_price,
                line_total: prod.price * qty
            }]);
        }
    };

    const fetchCustomers = async () => {
        const res = await api.get('/customers');
        setCustomers(res.data);
    };

    const addItemToBill = () => {
        if (!selectedProduct) return;
        const prod = products.find(p => p.id === parseInt(selectedProduct));
        if (!prod) return;

        const qty = parseInt(selectedQty);
        const existing = billItems.find(item => item.product_id === prod.id);
        const totalRequested = (existing ? existing.quantity : 0) + qty;

        if (totalRequested > prod.stock) {
            return alert(`Not enough stock available for ${prod.name}. Max available: ${prod.stock}`);
        }

        addItemToBillDirect(prod, qty);
        setSelectedProduct('');
        setSelectedQty(1);
    };

    const removeItem = (index) => {
        setBillItems(billItems.filter((_, i) => i !== index));
    };

    const taxable_value = billItems.reduce((sum, item) => sum + item.line_total, 0);
    const gst_rate = 18; // 18% GST default
    const total_gst = taxable_value * (gst_rate / 100);
    const cgst_amount = total_gst / 2;
    const sgst_amount = total_gst / 2;
    const igst_amount = 0; // Assuming local sales for now
    const total = taxable_value + total_gst;

    const handleCreateBill = async () => {
        if (billItems.length === 0) return alert('Add items to bill');
        try {
            let custId = selectedCustomer?.id;
            if (isNewCustomer || !custId) {
                const custRes = await api.post('/customers', customerInfo);
                custId = custRes.data.id;
            }

            // Prepare items with GST details
            const itemsWithGst = billItems.map(item => ({
                ...item,
                gst_percentage: gst_rate,
                cgst_amount: item.line_total * (gst_rate / 200),
                sgst_amount: item.line_total * (gst_rate / 200),
                igst_amount: 0,
                taxable_amount: item.line_total
            }));

            await api.post('/invoices', {
                customer_id: custId,
                items: itemsWithGst,
                subtotal: taxable_value,
                tax: total_gst,
                discount: 0,
                total_amount: total,
                payment_method: 'Cash',
                order_type: 'Offline Order',
                gst_percentage: gst_rate,
                cgst_amount,
                sgst_amount,
                igst_amount,
                taxable_value,
                total_gst
            });
            alert('Invoice created successfully!');
            setBillItems([]);
            setCustomerInfo({ name: '', phone: '', email: '', address: '' });
            setSelectedCustomer(null);
        } catch (error) {
            console.error(error);
            alert('Failed to create invoice: ' + error.message);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            <div>
                <h1 style={{ marginBottom: '2rem', fontSize: '1.875rem', fontWeight: 700 }}>New Billing Invoice</h1>

                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Customer Details</h3>
                    {!isNewCustomer ? (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <select className="input" onChange={(e) => {
                                const c = customers.find(cust => cust.id === parseInt(e.target.value));
                                setSelectedCustomer(c);
                            }}>
                                <option value="">Select Existing Customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                            </select>
                            <button className="btn" style={{ padding: 0, fontWeight: 500, color: '#2563eb' }} onClick={() => setIsNewCustomer(true)}>Or Add New Customer +</button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input className="input" placeholder="Customer Name" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                            <input className="input" placeholder="Phone" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                            <input className="input" placeholder="Email" style={{ gridColumn: 'span 2' }} value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
                            <button className="btn" style={{ gridColumn: 'span 2', padding: 0, color: '#2563eb' }} onClick={() => setIsNewCustomer(false)}>Select Existing</button>
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Select Products</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 80px auto', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block', fontWeight: 600 }}>Quick SKU Scan</label>
                            <input className="input" placeholder="Type SKU..." value={skuSearch} onChange={handleSkuSearch} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block', fontWeight: 600 }}>Manual Product Search</label>
                            <select className="input" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                                <option value="">Choose Product</option>
                                {products.filter(p => p.stock > 0).map(p => (
                                    <option key={p.id} value={p.id} style={{ color: p.stock < 10 ? '#ef4444' : 'inherit' }}>
                                        {p.name} - {p.sku || 'N/A'} (Stock: {p.stock}) (₹{p.price})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', marginBottom: '0.25rem', display: 'block', fontWeight: 600 }}>Qty</label>
                            <input type="number" className="input" min="1" value={selectedQty} onChange={(e) => setSelectedQty(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" onClick={addItemToBill}>Add</button>
                    </div>

                    <table className="table">
                        <thead>
                            <tr>
                                <th>Items</th>
                                <th style={{ textAlign: 'right' }}>Price</th>
                                <th style={{ textAlign: 'center' }}>Qty</th>
                                <th style={{ textAlign: 'right' }}>Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {billItems.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.name}</td>
                                    <td style={{ textAlign: 'right' }}>₹{item.unit_price}</td>
                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>₹{item.line_total.toFixed(2)}</td>
                                    <td><button onClick={() => removeItem(idx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><PlusCircle style={{ transform: 'rotate(45deg)' }} size={16} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShoppingCart size={20} /> Order Summary
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Subtotal (Taxable):</span>
                            <span style={{ fontWeight: 600 }}>₹{taxable_value.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                            <span>CGST (9%):</span>
                            <span>₹{cgst_amount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#64748b' }}>
                            <span>SGST (9%):</span>
                            <span>₹{sgst_amount.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total GST (18%):</span>
                            <span style={{ fontWeight: 600 }}>₹{total_gst.toFixed(2)}</span>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
                            <span style={{ fontWeight: 700 }}>Grand Total:</span>
                            <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1rem' }} onClick={handleCreateBill}>
                        Confirm and Generate Invoice
                    </button>
                </div>

                <div className="card" style={{ backgroundColor: '#2563eb', color: 'white' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Quick Print</h3>
                    <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '1.5rem' }}>Print the last invoice generated instantly.</p>
                    <button className="btn" style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                        <Printer size={18} /> Print Last Bill
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billing;
