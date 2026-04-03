import { useState } from 'react';
import {
    Package,
    ChevronDown,
    ShieldCheck,
    Lock,
    CreditCard,
    Smartphone,
    Building2,
    ArrowLeft,
    Check,
    Truck,
    X
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';

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
    const { items: cartItems, totalPrice, clearCart } = useCart();
    const { user } = useUserAuth();
    const [paymentDone, setPaymentDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const orderProcessed = { current: false };

    // Customer Detail State
    const [customer, setCustomer] = useState({
        email: user?.email || '',
        firstName: user?.name?.split(' ')[0] || '',
        lastName: user?.name?.split(' ').slice(1).join(' ') || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: 'Tamil Nadu',
        zip: ''
    });

    // Redirect if no cart items
    if (cartItems.length === 0 && !paymentDone) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20 px-4">
                <div className="text-center space-y-6 animate-on-scroll">
                    <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto border border-zinc-800">
                        <Package size={40} className="text-zinc-600" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Cart Empty</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Please add items to proceed with checkout.</p>
                    <a href="/products" className="inline-block w-full bg-white hover:bg-red-600 hover:text-white text-black px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all uppercase mt-8">
                        Continue Shopping
                    </a>
                </div>
            </div>
        );
    }

    const processOrder = async () => {
        // Idempotency guard: if order was already processed, do nothing
        if (orderProcessed.current) return;
        orderProcessed.current = true;

        try {
            if (!user) {
                alert('Please log in to complete the order');
                orderProcessed.current = false;
                return;
            }

            const shippingNum = 100;
            const subtotal = totalPrice;
            const tax = subtotal * 0.18;
            const totalAmt = subtotal + tax + shippingNum;

            // Build items array from cart
            const items = cartItems.map(cartItem => ({
                product_id: cartItem.product.id,
                quantity: cartItem.quantity,
                unit_price: parseFloat(String(cartItem.product.price).replace(/[^0-9.]/g, '')),
                line_total: parseFloat(String(cartItem.product.price).replace(/[^0-9.]/g, '')) * cartItem.quantity,
                gst_percentage: 18,
                taxable_amount: parseFloat(String(cartItem.product.price).replace(/[^0-9.]/g, '')) * cartItem.quantity
            }));

            // Create invoice using API
            const authToken = localStorage.getItem('auth_token');
            const invoiceResponse = await fetch('http://localhost:3001/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    customer_id: user.uid,
                    order_type: 'Online Order',
                    subtotal: subtotal,
                    tax: tax,
                    discount: 0,
                    total_amount: totalAmt,
                    payment_method: paymentMethod.toUpperCase(),
                    gst_percentage: 18,
                    items: items,
                    shipping_address: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.zip}`
                })
            });

            if (!invoiceResponse.ok) {
                const errorData = await invoiceResponse.json();
                throw new Error(errorData.message || 'Failed to create invoice');
            }

            // Clear cart after successful order
            clearCart();
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
        setIsLoading(true);

        try {
            await processOrder();
        } catch (error: any) {
            alert(error.message || 'Payment processing failed');
            setIsLoading(false);
            orderProcessed.current = false;
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
                    <p className="text-zinc-500 mb-12 font-medium leading-relaxed">Your order for <span className="text-white">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span> has been successfully placed.</p>
                    <div className="space-y-4">
                        <a href="/orders" className="inline-block w-full bg-white hover:bg-red-600 hover:text-white text-black px-8 py-6 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all uppercase">
                            View Order Details
                        </a>
                        <a href="/products" className="inline-block w-full bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-6 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all uppercase">
                            Continue Shopping
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const shippingNum = 100;
    const subtotal = totalPrice;
    const tax = subtotal * 0.18;
    const total = subtotal + tax + shippingNum;
    const currencyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });


    return (
        <div className="min-h-screen bg-zinc-950 pt-32 pb-24 px-4 sm:px-12">
            <div className="max-w-[1400px] mx-auto">
                <div className="mb-16 space-y-4">
                    <button onClick={() => window.history.back()} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
                        <ArrowLeft size={14} /> Back to Gear
                    </button>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">CHECKOUT <span className="text-zinc-800">PROTOCOL</span></h1>
                </div>

                <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-12 xl:col-span-7 space-y-12">
                        <div className="glass-card p-10 sm:p-16 rounded-[4rem] border border-white/5 space-y-16">

                            <div className="animate-on-scroll">
                                <SectionHeader title="Authentication" icon={Lock} />
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
                                        <Label required>Designation</Label>
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
                                        <Label required>Contact Frequency</Label>
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
                                        <Label required>Sector Address</Label>
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
                                                placeholder="HUB"
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
                                                    onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
                                                >
                                                    <option>Tamil Nadu</option>
                                                    <option>Karnataka</option>
                                                    <option>Kerala</option>
                                                    <option>Maharashtra</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label required>Access Code</Label>
                                            <Input
                                                type="text"
                                                required
                                                placeholder="PIN"
                                                value={customer.zip}
                                                onChange={(e) => setCustomer({ ...customer, zip: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="animate-on-scroll">
                                <SectionHeader title="Payment Method" icon={CreditCard} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {[
                                        { id: 'cod', label: 'CASH ON DELIVERY', icon: Truck },
                                    ].map((method) => (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`flex items-center gap-4 p-6 rounded-[2rem] border transition-all text-left
                                                ${paymentMethod === method.id ? 'bg-red-600 border-red-600 shadow-xl' : 'bg-black/40 border-zinc-800 hover:border-zinc-700'}`}
                                        >
                                            <method.icon size={20} className={paymentMethod === method.id ? 'text-white' : 'text-zinc-600'} />
                                            <span className={`text-[10px] font-black tracking-widest uppercase ${paymentMethod === method.id ? 'text-white' : 'text-zinc-500'}`}>{method.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-12 xl:col-span-5">
                        <div className="glass-card p-10 rounded-[3rem] border border-white/5 sticky top-32 space-y-10 animate-on-scroll">
                            <SectionHeader title="Order Summary" />

                            {/* Cart Items List */}
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {cartItems.map((item, idx) => {
                                    const itemPrice = parseFloat(String(item.product.price).replace(/[^0-9.]/g, ''));
                                    const itemTotal = itemPrice * item.quantity;
                                    return (
                                        <div key={idx} className="flex gap-4 p-4 bg-black/40 rounded-2xl border border-zinc-800">
                                            <div className="w-20 h-20 bg-white rounded-lg p-2 flex-shrink-0">
                                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-black text-white uppercase tracking-wider truncate">{item.product.name}</h4>
                                                <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1">Qty: {item.quantity}</p>
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
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">GST (18%)</span>
                                    <span className="text-sm font-black text-white uppercase">{currencyFormat.format(tax)}</span>
                                </div>
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Shipping</span>
                                    <span className="text-sm font-black text-white uppercase">{currencyFormat.format(shippingNum)}</span>
                                </div>
                                <div className="flex justify-between items-center p-8 bg-zinc-950 rounded-[2rem] border border-zinc-900 mt-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Total Amount</span>
                                        <p className="text-[9px] text-zinc-600 font-black uppercase">Incl. GST & Shipping</p>
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
