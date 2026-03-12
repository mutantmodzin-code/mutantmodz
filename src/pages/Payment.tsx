import { useState, useEffect } from 'react';
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
    Truck
} from 'lucide-react';
import { getProducts, createInvoice, createCustomer } from '../utils/storage';

export default function Payment() {
    const [product, setProduct] = useState<any>(null);
    const [paymentDone, setPaymentDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');

    // Customer Detail State
    const [customer, setCustomer] = useState({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        state: 'Tamil Nadu',
        zip: ''
    });

    useEffect(() => {
        const fetchProduct = async () => {
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            const productId = params.get('productId');

            const products = await getProducts();
            const selectedProduct = products.find((p: any) => p.id === productId || p.id === Number(productId)?.toString());

            if (selectedProduct) {
                setProduct(selectedProduct);
            }
        };
        fetchProduct();
    }, []);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const processOrder = async () => {
        try {
            // 1. Create/Update Customer
            const customerRes = await createCustomer({
                name: `${customer.firstName} ${customer.lastName}`,
                phone: customer.phone,
                email: customer.email,
                address: `${customer.address}, ${customer.city}, ${customer.state} - ${customer.zip}`
            });

            // 2. Prepare Invoice Data
            const subtotal = priceNum;
            const tax = subtotal * 0.18;
            const totalAmt = subtotal + tax + shippingNum;

            const invoiceData = {
                customer_id: customerRes.id,
                order_type: 'Online Order',
                subtotal: subtotal,
                tax: tax,
                discount: 0,
                total_amount: totalAmt,
                payment_method: paymentMethod === 'cod' ? 'COD' : 'Online',
                gst_percentage: 18,
                items: [{
                    product_id: parseInt(product.id),
                    quantity: 1,
                    unit_price: subtotal,
                    line_total: subtotal,
                    gst_percentage: 18,
                    taxable_amount: subtotal
                }]
            };

            // 3. Create Invoice (Backend handles stock deduction)
            await createInvoice(invoiceData);

            setPaymentDone(true);
        } catch (error: any) {
            alert(error.message || 'Failed to process order sequence.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Preliminary Stock Check (Backend will also check during transaction)
        try {
            const freshProducts = await getProducts();
            const freshProd = freshProducts.find(p => p.id === product.id);
            if (!freshProd || (freshProd as any).stock <= 0) {
                // alert('Order Aborted: Target item is currently out of stock.');
                // setIsLoading(false);
                // return;
            }
        } catch (err) { }

        if (paymentMethod === 'cod') {
            await processOrder();
            return;
        }

        const res = await loadRazorpayScript();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsLoading(false);
            return;
        }

        const options = {
            key: 'rzp_test_SOlLKQpQcZ29sB',
            amount: Math.round(total * 100),
            currency: 'INR',
            name: 'MutantModz',
            description: `Payment for ${product.name}`,
            image: 'https://cdn.razorpay.com/logos/FFxP8XfW1m9M0t_medium.png',
            handler: async function (_response: any) {
                await processOrder();
            },
            prefill: {
                name: `${customer.firstName} ${customer.lastName}`,
                email: customer.email,
                contact: customer.phone
            },
            theme: {
                color: '#dc2626'
            }
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
            alert(`Payment failed! Reason: ${response.error.description}`);
            setIsLoading(false);
        });
        paymentObject.open();
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20">
                <div className="text-center space-y-6 animate-on-scroll">
                    <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto border border-zinc-800">
                        <Package size={40} className="text-zinc-600" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Payment Failed</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No product sequence detected in core.</p>
                </div>
            </div>
        );
    }

    if (paymentDone) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20 px-4">
                <div className="text-center bg-zinc-900 border border-white/5 p-16 rounded-[4rem] shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-red-600/20">
                        <Check size={48} className="text-red-600" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Order Decoded</h2>
                    <p className="text-zinc-500 mb-12 font-medium leading-relaxed">Your hardware request for <span className="text-white">{product.name}</span> has been successfully logged.</p>
                    <a href="/" className="inline-block w-full bg-white hover:bg-red-600 hover:text-white text-black px-8 py-6 rounded-2xl font-black text-[10px] tracking-[0.4em] transition-all uppercase">
                        Back to Homepage
                    </a>
                </div>
            </div>
        );
    }

    const priceNum = parseFloat(product.price.replace(/[^0-9.]/g, '')) || 0;
    const shippingNum = 100;
    const total = priceNum + shippingNum;
    const currencyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

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
                                <SectionHeader title="Currency Bridge" icon={ShieldCheck} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {[
                                        { id: 'razorpay', label: 'RAZORPAY GATEWAY', icon: ShieldCheck },
                                        { id: 'cod', label: 'CASH ON DELIVERY', icon: Truck },
                                        { id: 'card', label: 'DIRECT CARD', icon: CreditCard },
                                        { id: 'upi', label: 'UPI PAYMENT', icon: Smartphone },
                                        { id: 'netbanking', label: 'BANK TRANSFER', icon: Building2 },
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

                            <div className="flex gap-8 items-center bg-black/40 p-6 rounded-[2.5rem] border border-zinc-900">
                                <div className="w-24 h-24 bg-white rounded-2xl p-4 flex-shrink-0 relative">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-600 text-white text-[10px] font-black rounded-xl flex items-center justify-center border-4 border-zinc-950">1</div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest leading-tight">{product.name}</h4>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Standard Issue</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-10 border-t border-zinc-800/50">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Subtotal</span>
                                    <span className="text-sm font-black text-white uppercase">{product.price}</span>
                                </div>
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Logistics</span>
                                    <span className="text-sm font-black text-white uppercase">₹100.00</span>
                                </div>
                                <div className="flex justify-between items-center p-8 bg-zinc-950 rounded-[2rem] border border-zinc-900 mt-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">Total Value</span>
                                        <p className="text-[9px] text-zinc-600 font-black uppercase">Incl. GST @ 18%</p>
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
                                    <>Pay Now <ShieldCheck size={18} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
