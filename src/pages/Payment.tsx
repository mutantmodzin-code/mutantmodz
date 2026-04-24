import { useState, useEffect } from 'react';
import {
    Package,
    ChevronDown,
    ShieldCheck,
    Lock,
    CreditCard,
    Smartphone,
    ArrowLeft,
    Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { getProducts, getCombos, getGarageSale } from '../utils/storage';
import { Product } from '../types';

const SectionHeader = ({ title, icon: Icon }: { title: string, icon?: any }) => (
    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800/50">
        {Icon && <Icon size={16} className="text-red-600" />}
        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{title}</h3>
    </div>
);

const Label = ({ children, required = false }: { children: React.ReactNode, required?: boolean }) => (
    <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3 ml-1">
        {children} {required && <span className="text-red-600">*</span>}
    </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
        {...props}
        className={`w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-4 px-6 text-white text-xs font-bold focus:border-red-600 outline-none transition-colors placeholder:text-zinc-800 uppercase ${props.className || ''}`}
    />
);

export default function Payment() {
    const { items: cartItems, totalPrice: cartTotalPrice, clearCart } = useCart();
    const { user } = useUserAuth();
    const [paymentDone, setPaymentDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [deliveryCharge, setDeliveryCharge] = useState(100);
    const [buyNowProduct, setBuyNowProduct] = useState<{product: Product, quantity: number} | null>(null);
    const orderProcessed = { current: false };

    useEffect(() => {
        const checkBuyNow = async () => {
            const hash = window.location.hash;
            if (!hash.includes('productId=')) return;

            const params = new URLSearchParams(hash.split('?')[1]);
            const productId = params.get('productId');
            const type = params.get('type');
            const quantity = parseInt(localStorage.getItem('checkout_quantity') || '1');

            if (productId) {
                setIsLoading(true);
                try {
                    let product: Product | undefined;
                    if (type === 'combo') {
                        const combos = await getCombos();
                        product = combos.find(c => c.id === productId);
                    } else if (type === 'garage') {
                        const garage = await getGarageSale();
                        product = garage.find(g => g.id === productId);
                    } else {
                        const products = await getProducts();
                        product = products.find(p => p.id === productId);
                    }

                    if (product) {
                        setBuyNowProduct({ product, quantity });
                    }
                } catch (error) {
                    console.error('Error fetching buy now product:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        checkBuyNow();
    }, []);

    // Combine items: Use buyNowProduct if available, otherwise use cartItems
    const items = buyNowProduct ? [buyNowProduct] : cartItems;
    const totalPrice = buyNowProduct 
        ? parseFloat(String(buyNowProduct.product.price).replace(/[^0-9.]/g, '')) * buyNowProduct.quantity
        : cartTotalPrice;

    const [customer, setCustomer] = useState({
        email: user?.email || '',
        firstName: user?.displayName?.split(' ')[0] || '',
        lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: 'Tamil Nadu',
        zip: ''
    });

    const calculateDeliveryCharge = (state: string) => {
        if (!state) return;
        
        const southStates = ['Karnataka', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Goa', 'Puducherry'];
        let totalCharge = 0;

        items.forEach(item => {
            const prod = item.product;
            let charge = 0;
            
            if (state === 'Tamil Nadu') {
                charge = Number(prod.delivery_tn) || 0;
            } else if (southStates.includes(state)) {
                charge = Number(prod.delivery_south) || 0;
            } else {
                charge = Number(prod.delivery_north) || 0;
            }
            
            totalCharge += charge * item.quantity;
        });

        // Minimum default if no charges set
        if (totalCharge === 0 && items.length > 0) totalCharge = 100;

        setDeliveryCharge(Math.min(totalCharge, 300));
    };

    useEffect(() => {
        calculateDeliveryCharge(customer.state);
    }, [items, customer.state]);
    // Constant for Razorpay Key (User can replace with their actual key in .env)
    const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Redirect if no items
    if (items.length === 0 && !paymentDone) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20 px-4">
                <div className="text-center space-y-6 animate-on-scroll">
                    <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto border border-zinc-800">
                        <Package size={40} className="text-zinc-600" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{isLoading ? 'Loading Checkout...' : 'Your Cart is Empty'}</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{isLoading ? 'Please wait while we prepare your checkout...' : 'Please add products to your cart to proceed.'}</p>
                    {!isLoading && (
                        <a href="/#products" className="inline-block w-full bg-white hover:bg-red-600 hover:text-white text-black px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all uppercase mt-8">
                            Continue Shopping
                        </a>
                    )}
                </div>
            </div>
        );
    }

    const processOrder = async (razorpayPaymentId?: string) => {
        // Idempotency guard: if order was already processed, do nothing
        if (orderProcessed.current) return;
        orderProcessed.current = true;

        try {
            if (!user) {
                alert('Please log in to complete the order');
                orderProcessed.current = false;
                return;
            }
            if (isNaN(Number(user.uid))) {
                alert('Session expired due to a security update. Please log out and log back in.');
                orderProcessed.current = false;
                return;
            }

            const shippingNum = deliveryCharge;
            const subtotal = totalPrice;
            const totalAmt = subtotal + shippingNum;

            // Build items array from current items (either Buy Now or Cart)
            const apiItems = items.map(item => {
                // Determine if this is a specialized "Builder" item or a standard catalog product
                // Standard products (even if flagged as garage_sale/combo) belong to the 'products' table
                // Specialized items (category 'combos' or 'garage-sale') belong to their respective tables
                const isVirtualCombo = item.product.category === 'combos';
                const isVirtualGarageSale = item.product.category === 'garage-sale';

                return {
                    product_id: (isVirtualCombo || isVirtualGarageSale) ? null : Number(item.product.id),
                    combo_id: isVirtualCombo ? Number(item.product.id) : null,
                    garage_sale_id: isVirtualGarageSale ? Number(item.product.id) : null,
                    quantity: item.quantity,
                    unit_price: parseFloat(String(item.product.price).replace(/[^0-9.]/g, '')),
                    line_total: parseFloat(String(item.product.price).replace(/[^0-9.]/g, '')) * item.quantity,
                    gst_percentage: 0,
                    taxable_amount: parseFloat(String(item.product.price).replace(/[^0-9.]/g, '')) * item.quantity,
                    selected_size: (item as any).size || null,
                    discount_percent: parseFloat(String(item.product.discount_percent || 0))
                };
            });

            // Create invoice using API
            const authToken = localStorage.getItem('auth_token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const invoiceResponse = await fetch(`${apiUrl}/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    customer_id: user.uid,
                    order_type: 'Online Order',
                    subtotal: subtotal,
                    tax: 0,
                    discount: 0,
                    total_amount: totalAmt,
                    payment_method: paymentMethod.toUpperCase(),
                    payment_id: razorpayPaymentId,
                    gst_percentage: 0,
                    items: apiItems,
                    shipping_address: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.zip}`,
                    delivery_charge: deliveryCharge
                })
            });

            if (!invoiceResponse.ok) {
                const errorData = await invoiceResponse.json();
                throw new Error(errorData.error || errorData.message || 'Failed to create invoice');
            }

            // Clear data after successful order
            if (!buyNowProduct) clearCart();
            else {
                localStorage.removeItem('checkout_quantity');
                localStorage.removeItem('checkout_size');
            }
            setPaymentDone(true);
        } catch (error: any) {
            orderProcessed.current = false;
            alert(error.message || 'Failed to process order. Please try again.');
            console.error('Order processing error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;
        
        // Basic validation
        if (!customer.address || !customer.zip || !customer.phone) {
            alert('Please complete searching the arsenal... I mean, shipping details.');
            return;
        }

        setIsLoading(true);

        try {
            // Load Razorpay Script
            const res = await loadRazorpayScript();
            if (!res) {
                alert('Razorpay SDK failed to load. Please check your internet connection.');
                setIsLoading(false);
                return;
            }

            const shippingNum = deliveryCharge;
            const subtotal = totalPrice;
            const totalAmt = subtotal + shippingNum;

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: Math.round(totalAmt * 100), // Amount in paise
                currency: 'INR',
                name: 'MUTANT MODZ',
                description: `Order for ${items.length} products`,
                handler: function (response: any) {
                    processOrder(response.razorpay_payment_id);
                },
                prefill: {
                    name: `${customer.firstName} ${customer.lastName}`,
                    email: customer.email,
                    contact: customer.phone,
                },
                notes: {
                    address: customer.address,
                },
                theme: {
                    color: '#dc2626', // Red-600
                },
                modal: {
                    ondismiss: function () {
                        setIsLoading(false);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (error: any) {
            alert(error.message || 'Payment initiation failed');
            setIsLoading(false);
        }
    };

    if (paymentDone) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20 px-4">
                <div className="text-center bg-zinc-900 border border-white/5 p-16 rounded-[4rem] shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-red-600/20">
                        <Check size={48} className="text-red-600" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Order Confirmed</h2>
                    <p className="text-zinc-500 mb-12 font-medium leading-relaxed">Your order for <span className="text-white">{items.length} unit{items.length !== 1 ? 's' : ''}</span> has been successfully placed.</p>
                    <div className="space-y-4">
                        <a href="/#orders" className="inline-block w-full bg-white hover:bg-red-600 hover:text-white text-black px-8 py-6 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all uppercase">
                            View Order Details
                        </a>
                        <a href="/#products" className="inline-block w-full bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-6 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all uppercase">
                            Continue Shopping
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const shippingNum = deliveryCharge;
    const subtotal = totalPrice;
    const total = subtotal + shippingNum;
    const currencyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });


    return (
        <div className="min-h-screen bg-zinc-950 pt-32 pb-24 px-4 sm:px-12">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-16 space-y-4">
                    <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
                        <ArrowLeft size={14} /> Back to Products
                    </button>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">ORDER <span className="text-zinc-800">CHECKOUT</span></h1>
                </div>

                <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-12 xl:col-span-7 space-y-12">
                        <div className="glass-card p-10 sm:p-16 rounded-[4rem] border border-white/5 space-y-16">

                            <div className="animate-on-scroll">
                                <SectionHeader title="Contact Info" icon={Lock} />
                                <div className="space-y-8">
                                    <div>
                                        <Label required>Email Address</Label>
                                        <Input
                                            type="email"
                                            required
                                            placeholder="name@domain.com"
                                            value={customer.email}
                                            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="animate-on-scroll">
                                <SectionHeader title="Shipping Details" icon={Smartphone} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label required>Full Name</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                type="text"
                                                required
                                                placeholder="First"
                                                value={customer.firstName}
                                                onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                                            />
                                            <Input
                                                type="text"
                                                required
                                                placeholder="Last"
                                                value={customer.lastName}
                                                onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label required>Phone Number</Label>
                                        <Input
                                            type="tel"
                                            required
                                            placeholder="+91 XXX XXX XXXX"
                                            value={customer.phone}
                                            onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mt-8 space-y-8">
                                    <div>
                                        <Label required>Address</Label>
                                        <Input
                                            type="text"
                                            placeholder="Street, Building, Apartment"
                                            required
                                            value={customer.address}
                                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div>
                                            <Label required>City</Label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="City Name"
                                                value={customer.city}
                                                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}

                                            />
                                        </div>
                                        <div>
                                            <Label required>State</Label>
                                            <div className="relative">
                                                <select
                                                     required
                                                    className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl py-4 px-6 text-white text-xs font-bold appearance-none cursor-pointer focus:border-red-600 outline-none uppercase tracking-widest"
                                                    value={customer.state}
                                                    onChange={(e) => {
                                                        setCustomer({ ...customer, state: e.target.value });
                                                        calculateDeliveryCharge(e.target.value);
                                                    }}
                                                >
                                                    <option>Tamil Nadu</option>
                                                    <option>Karnataka</option>
                                                    <option>Kerala</option>
                                                    <option>Puducherry</option>
                                                    <option>Andhra Pradesh</option>
                                                    <option>Telangana</option>
                                                    <option>Maharashtra</option>
                                                    <option>Goa</option>
                                                    <option>Delhi</option>
                                                    <option>Gujarat</option>
                                                    <option>Rajasthan</option>
                                                    <option>Uttar Pradesh</option>
                                                    <option>West Bengal</option>
                                                    <option>Madhya Pradesh</option>
                                                    <option>Punjab</option>
                                                    <option>Haryana</option>
                                                    <option>Bihar</option>
                                                    <option>Odisha</option>
                                                    <option>Assam</option>
                                                    <option>Jharkhand</option>
                                                    <option>Uttarakhand</option>
                                                    <option>Himachal Pradesh</option>
                                                    <option>Chhattisgarh</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>Pincode</Label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="6-digit Pincode"
                                                value={customer.zip}
                                                onChange={(e) => setCustomer({ ...customer, zip: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="animate-on-scroll">
                                <SectionHeader title="Payment Method" icon={CreditCard} />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {[
                                        { id: 'razorpay', label: 'RAZORPAY', image: '/Razorpay-Logo.jpg' },
                                        { id: 'upi', label: 'UPI / GPAY', image: '/UPI-apps.avif' },
                                        { id: 'card', label: 'BANK CARD', image: '/world-debit-card.png' },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`relative flex flex-col items-center justify-center gap-4 p-8 rounded-[2rem] border transition-all duration-500 text-center group overflow-hidden
                                                ${paymentMethod === method.id ? 'bg-red-600/5 border-red-600 shadow-[0_20px_50px_rgba(220,38,38,0.15)] scale-105' : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-800'}`}
                                        >
                                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center p-3 transition-all duration-700 bg-white shadow-inner ${paymentMethod === method.id ? 'scale-110 shadow-xl' : 'group-hover:scale-105'}`}>
                                                <img 
                                                    src={method.image} 
                                                    alt={method.label} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <span className={`text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 ${paymentMethod === method.id ? 'text-white' : 'text-zinc-600'}`}>{method.label}</span>
                                            
                                            {paymentMethod === method.id && (
                                                <>
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/10 blur-2xl rounded-full"></div>
                                                    <div className="absolute top-4 right-4 bg-red-600 text-white p-1 rounded-full shadow-lg animate-in zoom-in spin-in-90 duration-500">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] text-center bg-zinc-900/50 py-4 rounded-xl border border-white/5">
                                    Secure encryption active via Razorpay protocol 2.0
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-5">
                        <div className="glass-card p-10 rounded-[3rem] border border-white/5 sticky top-32 space-y-10 animate-on-scroll">
                            <SectionHeader title="Order Summary" />

                            {/* Order Items List */}
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {items.map((item, idx) => {
                                    const itemPrice = parseFloat(String(item.product.price).replace(/[^0-9.]/g, ''));
                                    const itemTotal = itemPrice * item.quantity;
                                    const imageUrl = Array.isArray(item.product.images) && item.product.images.length > 0 
                                        ? item.product.images[0] 
                                        : item.product.image;

                                    return (
                                        <div key={idx} className="flex gap-4 p-4 bg-black/40 rounded-2xl border border-zinc-800">
                                            <div className="w-20 h-20 bg-white rounded-lg p-2 flex-shrink-0">
                                                <img src={imageUrl} alt={item.product.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-black text-white uppercase tracking-wider truncate">{item.product.name}</h4>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Qty: {item.quantity} { (item as any).size ? `| Size: ${(item as any).size}` : '' }</p>
                                                <p className="text-sm font-black text-red-600 mt-2">{currencyFormat.format(itemTotal)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-sm font-black text-white uppercase">{currencyFormat.format(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Delivery</span>
                                    <span className="text-sm font-black uppercase flex items-center gap-2">
                                        <span className={deliveryCharge === 100 ? 'text-green-500' : deliveryCharge === 200 ? 'text-yellow-500' : 'text-red-500'}>{currencyFormat.format(deliveryCharge)}</span>
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-8 bg-zinc-950 rounded-[2rem] border border-zinc-900 mt-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Total Amount</span>
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] text-zinc-600 font-black uppercase">Incl. Shipping</p>
                                            <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">(Incl. of all taxes)</p>
                                        </div>
                                    </div>
                                    <span className="text-4xl font-black text-white tracking-tighter">{currencyFormat.format(total)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white hover:bg-zinc-200 text-black py-8 rounded-[2rem] font-black text-[10px] tracking-[0.5em] uppercase transition-all shadow-2xl active:scale-95 disabled:opacity-20 flex items-center justify-center gap-4"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    <>Place Order <ShieldCheck size={18} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
