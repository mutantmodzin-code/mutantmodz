import { useState, useEffect } from 'react';
import { Package, CheckCircle2, ChevronDown, PlusCircle } from 'lucide-react';
import { getProducts } from '../utils/storage';

export default function Payment() {
    const [product, setProduct] = useState<any>(null);
    const [paymentDone, setPaymentDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [sameAsShipping, setSameAsShipping] = useState(true);

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

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const res = await loadRazorpayScript();

        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setIsLoading(false);
            return;
        }

        const options = {
            key: 'rzp_test_SOlLKQpQcZ29sB', // Replace with your actual Razorpay Key ID
            amount: Math.round(total * 100), // Amount in paise
            currency: 'INR',
            name: 'MutantModz',
            description: `Payment for ${product.name}`,
            image: 'https://cdn.razorpay.com/logos/FFxP8XfW1m9M0t_medium.png', // Replace with your actual logo
            handler: function (_response: any) {
                // Payment successful
                setPaymentDone(true);
                setIsLoading(false);
            },
            prefill: {
                name: 'Guest User',
                email: 'customer@example.com',
                contact: '9999999999',
                ...(paymentMethod === 'upi' && { method: 'upi' }),
                ...(paymentMethod === 'netbanking' && { method: 'netbanking' }),
                ...(paymentMethod === 'card' && { method: 'card' })
            },
            notes: {
                address: 'MutantModz India'
            },
            theme: {
                color: '#dc2626' // Red color to match the theme
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
                <div className="text-center">
                    <Package size={64} className="text-gray-800 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Product Selected</h2>
                    <p className="text-gray-400">Please select a product from our shop to proceed with payment.</p>
                </div>
            </div>
        );
    }

    if (paymentDone) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20 px-4">
                <div className="text-center bg-zinc-900 border border-zinc-800 p-10 sm:p-14 rounded-xl shadow-xl shadow-black/50 max-w-md w-full animate-in zoom-in-95 duration-500">
                    <CheckCircle2 size={80} className="text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Payment Successful!</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">Your order for <span className="text-white font-semibold">{product.name}</span> has been placed successfully.</p>
                    <a href="/" className="inline-flex w-full justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-md font-bold text-sm tracking-wide transition-colors uppercase">
                        Return to Home
                    </a>
                </div>
            </div>
        );
    }

    // Try to parse price to calculate total; robust parsing
    const numericPriceString = product.price.replace(/[^0-9.]/g, '');
    let priceNum = 0;
    if (numericPriceString) {
        priceNum = parseFloat(numericPriceString);
    }
    const shippingNum = 100;
    const subtotal = priceNum;
    const total = subtotal + shippingNum;

    // Formatting currency in Indian Rupee format, but if your price uses different symbol we try to match it
    const currencyFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
    const formattedTotal = priceNum > 0 ? currencyFormat.format(total) : product.price;

    const SectionHeader = ({ title }: { title: string }) => (
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 mt-8 first:mt-0 pb-2 border-b border-zinc-800">{title}</h3>
    );

    const Label = ({ children, required = false }: { children: React.ReactNode, required?: boolean }) => (
        <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1">
            {children} {required && <span className="text-red-600">*</span>}
        </label>
    );

    const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input
            {...props}
            className={`w-full bg-black border border-zinc-800 rounded-md py-2.5 px-4 text-white text-sm focus:border-red-600 outline-none transition-colors placeholder:text-zinc-600 ${props.className || ''}`}
        />
    );

    return (
        <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* LEFT COLUMN: Checkout Form */}
                    <div className="lg:col-span-8 space-y-0 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800 shadow-xl shadow-black/50">

                        {/* MY CONTACT */}
                        <div className="p-6 sm:p-8">
                            <SectionHeader title="My Contact" />

                            <div className="bg-black/50 border border-zinc-800 rounded-md p-4 text-center text-sm text-gray-400 mb-6 font-medium">
                                Already have an account? <a href="#" className="text-red-500 hover:text-red-400 underline decoration-red-500/50 underline-offset-2">Log in</a>
                            </div>

                            <div className="relative flex py-2 items-center mb-6">
                                <div className="flex-grow border-t border-zinc-800"></div>
                                <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs uppercase tracking-wider font-semibold">Or continue as a guest</span>
                                <div className="flex-grow border-t border-zinc-800"></div>
                            </div>

                            <div className="space-y-4 max-w-2xl">
                                <div>
                                    <Label required>Email address</Label>
                                    <Input type="email" required />
                                    <p className="text-[10px] text-gray-500 mt-1 ml-1">Order number and receipt will be sent to this email address.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="create-account" className="w-4 h-4 rounded border-zinc-700 bg-black text-red-600 focus:ring-red-600 focus:ring-offset-black accent-red-600" />
                                    <label htmlFor="create-account" className="text-sm text-gray-300 select-none cursor-pointer">Create an account (optional)</label>
                                </div>
                            </div>
                        </div>

                        {/* SHIPPING TO */}
                        <div className="p-6 sm:p-8">
                            <SectionHeader title="Shipping To" />

                            <div className="space-y-5 max-w-2xl">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <Label required>First name</Label>
                                        <Input type="text" required />
                                    </div>
                                    <div>
                                        <Label required>Last name</Label>
                                        <Input type="text" required />
                                    </div>
                                </div>

                                <div className="pt-1">
                                    <button type="button" className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-400 font-medium transition-colors">
                                        <PlusCircle size={14} /> Add company name (optional)
                                    </button>
                                </div>

                                <div>
                                    <Label required>Country / Region</Label>
                                    <div className="w-full bg-black border border-zinc-800 rounded-md py-2.5 px-4 text-white text-sm font-semibold flex items-center justify-between opacity-80 cursor-not-allowed">
                                        India
                                    </div>
                                </div>

                                <div>
                                    <Label required>Street address</Label>
                                    <Input type="text" placeholder="House number and street name" required />
                                </div>

                                <div className="pt-1">
                                    <button type="button" className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-400 font-medium transition-colors">
                                        <PlusCircle size={14} /> Add flat, suite, unit, etc. (optional)
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <Label required>Town / City</Label>
                                        <Input type="text" required />
                                    </div>
                                    <div>
                                        <Label required>State</Label>
                                        <div className="relative">
                                            <select required className="w-full bg-black border border-zinc-800 rounded-md py-2.5 px-4 text-white text-sm focus:border-red-600 outline-none transition-colors appearance-none cursor-pointer">
                                                <option value="" disabled selected>Select an option...</option>
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Kerala">Kerala</option>
                                                <option value="Tamil Nadu">Tamil Nadu</option>
                                                <option value="Telangana">Telangana</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Delhi">Delhi</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label required>PIN Code</Label>
                                    <Input type="text" required className="sm:w-1/2" />
                                </div>
                            </div>
                        </div>

                        {/* SHIPPING METHOD */}
                        <div className="p-6 sm:p-8 flex flex-col items-start">
                            <SectionHeader title="Shipping Method" />
                            <div className="w-full max-w-2xl">
                                <label className="flex items-center justify-between p-4 border border-red-600 bg-red-600/5 rounded-md cursor-pointer transition-colors w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-2 rounded-full bg-black"></div>
                                        </div>
                                        <span className="text-sm text-white font-medium">Flat rate</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">₹100.00</span>
                                </label>
                            </div>
                        </div>

                        {/* ADDITIONAL NOTES */}
                        <div className="p-6 sm:p-8">
                            <SectionHeader title="Additional Notes" />
                            <button type="button" className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-400 font-medium transition-colors">
                                <PlusCircle size={14} /> Add order notes (optional)
                            </button>
                        </div>

                        {/* BILLING TO */}
                        <div className="p-6 sm:p-8">
                            <SectionHeader title="Billing To" />
                            <div className="mb-6 max-w-2xl">
                                <label className="flex items-center gap-2 cursor-pointer w-max">
                                    <input
                                        type="checkbox"
                                        checked={sameAsShipping}
                                        onChange={(e) => setSameAsShipping(e.target.checked)}
                                        className="w-4 h-4 rounded border-zinc-700 bg-black focus:ring-red-600 accent-red-600"
                                    />
                                    <span className="text-sm text-gray-300 select-none">Same as shipping address</span>
                                </label>
                            </div>

                            {!sameAsShipping && (
                                <div className="space-y-5 mb-6 p-5 bg-black rounded-md border border-zinc-800 max-w-2xl animate-in slide-in-from-top-2 duration-300">
                                    <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">Please provide your billing details</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <Label required>First name</Label>
                                            <Input type="text" required={!sameAsShipping} />
                                        </div>
                                        <div>
                                            <Label required>Last name</Label>
                                            <Input type="text" required={!sameAsShipping} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label required>Street address</Label>
                                        <Input type="text" required={!sameAsShipping} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <Label required>Town / City</Label>
                                            <Input type="text" required={!sameAsShipping} />
                                        </div>
                                        <div>
                                            <Label required>PIN Code</Label>
                                            <Input type="text" required={!sameAsShipping} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="max-w-2xl">
                                <Label required>Phone</Label>
                                <Input type="tel" required className="sm:w-1/2" />
                            </div>
                        </div>

                        {/* COUPON */}
                        <div className="p-6 sm:p-8">
                            <button type="button" className="text-red-500 text-sm flex items-center gap-1.5 hover:text-red-400 font-medium transition-colors">
                                <PlusCircle size={14} /> Add coupon code
                            </button>
                        </div>

                        {/* PAYMENT METHOD */}
                        <div className="p-6 sm:p-8">
                            <SectionHeader title="Payment Method" />

                            <div className="border border-zinc-800 rounded-md overflow-hidden bg-black divide-y divide-zinc-800 max-w-2xl">
                                {[
                                    { id: 'card', label: 'Credit / Debit Card' },
                                    { id: 'upi', label: 'UPI / QR Code' },
                                    { id: 'netbanking', label: 'NetBanking' },
                                    { id: 'razorpay', label: 'Razorpay (All Methods)' }
                                ].map((method) => (
                                    <label key={method.id} className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${paymentMethod === method.id ? 'bg-zinc-900 border-l-4 border-l-red-600' : 'hover:bg-zinc-900/50 border-l-4 border-l-transparent'}`}>
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === method.id ? 'border-red-600 bg-red-600' : 'border-zinc-600'}`}>
                                            {paymentMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                                        </div>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={() => setPaymentMethod(method.id)}
                                            className="hidden"
                                        />
                                        <span className={`text-sm ${paymentMethod === method.id ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>{method.label}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="max-w-2xl">
                                <p className="text-xs text-gray-500 mt-6 leading-relaxed">
                                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="#" className="text-red-500 hover:text-red-400 hover:underline">privacy policy</a>.
                                </p>

                                <div className="mt-6">
                                    <label className="flex items-start gap-2 cursor-pointer">
                                        <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-zinc-700 bg-black text-red-600 focus:ring-red-600 accent-red-600" />
                                        <span className="text-sm text-gray-300 leading-snug">
                                            I have read and agree to the website <a href="#" className="text-red-500 hover:text-red-400 hover:underline inline-flex items-center">terms and conditions</a> <span className="text-red-600 ml-0.5">*</span>
                                        </span>
                                    </label>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-800">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-md font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                        ) : (
                                            "Place order"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden sticky top-32 shadow-xl shadow-black/50">
                            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/80 backdrop-blur">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order Summary</h3>
                                <a href="#" className="text-xs font-semibold text-gray-400 hover:text-white underline decoration-zinc-600 hover:decoration-zinc-400 underline-offset-4 transition-all">Edit cart</a>
                            </div>

                            <div className="p-6 border-b border-zinc-800">
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-white rounded-md p-1 relative flex-shrink-0 border border-zinc-800 self-start">
                                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                                            1
                                        </div>
                                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="text-xs font-bold text-white uppercase leading-snug mb-1.5 pr-2">{product.name}</h4>
                                        <p className="text-xs text-gray-500 font-medium">{product.price}</p>
                                    </div>
                                    <div className="text-sm font-bold text-white text-right self-start whitespace-nowrap">
                                        {product.price}<br />
                                        <span className="text-[9px] text-gray-500 font-normal tracking-wide">(incl. tax)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-4 text-sm border-b border-zinc-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400">Subtotal</span>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-white">{product.price}</span><br />
                                        <span className="text-[9px] text-gray-500">(incl. tax)</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400">Shipping</span>
                                    <span className="text-sm font-bold text-white">₹100.00</span>
                                </div>
                            </div>

                            <div className="p-6 bg-black/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-white uppercase tracking-wider">Total</span>
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-red-500">{formattedTotal}</span><br />
                                        <span className="text-[9px] text-gray-500">(includes ₹183.05 GST@18%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
