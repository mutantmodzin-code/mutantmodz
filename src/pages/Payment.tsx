import { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, Truck, Package, CheckCircle2 } from 'lucide-react';
import { getProducts } from '../utils/storage';

export default function Payment() {
    const [product, setProduct] = useState<any>(null);
    const [paymentDone, setPaymentDone] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate payment
        setTimeout(() => {
            setIsLoading(false);
            setPaymentDone(true);
        }, 2000);
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
                <div className="max-w-md w-full bg-zinc-900 p-12 rounded-2xl border-2 border-red-600 text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Payment Successful!</h2>
                    <p className="text-gray-400 mb-8">
                        Thank you for your purchase of <span className="text-white font-bold">{product.name}</span>.
                        We've sent a confirmation email to your registered address.
                    </p>
                    <button
                        onClick={() => window.location.hash = 'home'}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Product Summary */}
                    <div className="order-2 md:order-1">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                            <Package className="text-red-600" /> Order Summary
                        </h2>
                        <div className="bg-zinc-900 rounded-2xl border-2 border-zinc-800 p-6 overflow-hidden">
                            <div className="aspect-square rounded-xl overflow-hidden mb-6">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                            <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-zinc-800">
                                {product.description}
                            </p>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Price</span>
                                    <span className="text-white font-medium">{product.price}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Shipping</span>
                                    <span className="text-green-500 font-medium">FREE</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
                                <span className="text-xl font-bold text-white">Total Amount</span>
                                <span className="text-3xl font-bold text-red-600">{product.price}</span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                    <Truck size={18} className="text-red-600" />
                                </div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Fast Delivery</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                    <ShieldCheck size={18} className="text-red-600" />
                                </div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Secure Payment</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                    <Package size={18} className="text-red-600" />
                                </div>
                                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Premium Quality</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="order-1 md:order-2">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                            <CreditCard className="text-red-600" /> Payment Details
                        </h2>
                        <form onSubmit={handlePayment} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Card Holder Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. JOHN DOE"
                                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl py-4 px-6 text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-400 ml-1">Card Number</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl py-4 px-6 text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700 font-mono"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                                        <div className="w-8 h-5 bg-zinc-800 rounded shadow-inner"></div>
                                        <div className="w-8 h-5 bg-zinc-800 rounded shadow-inner"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400 ml-1">Expiry Date</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="MM / YY"
                                        className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl py-4 px-6 text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700 font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400 ml-1">CVV</label>
                                    <input
                                        required
                                        type="text"
                                        maxLength={3}
                                        placeholder="***"
                                        className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl py-4 px-6 text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 group"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Pay {product.price}
                                            <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-gray-500 text-xs mt-6 flex items-center justify-center gap-2">
                                    <ShieldCheck size={14} /> Your transaction is secured with end-to-end encryption
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
