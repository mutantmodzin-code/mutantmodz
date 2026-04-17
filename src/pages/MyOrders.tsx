import { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { 
  ShoppingBag, Calendar, DollarSign, Loader2, AlertCircle, 
  CheckCircle2, Clock, Truck, Package, ArrowRight,
  TrendingUp, MapPin, Receipt, ShieldCheck
} from 'lucide-react';

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    price: number;
    product_name: string;
    image_url?: string;
}

interface Order {
    id: number;
    customer_id: number;
    status: string;
    total_amount: number;
    payment_method: string;
    order_type: string;
    created_at: string;
    shipped_at?: string;
    expected_delivery?: string;
    items: OrderItem[];
}

const API_URL = import.meta.env.VITE_API_URL;

export default function MyOrders() {
    const { user, isLoggedIn } = useUserAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoggedIn) {
            setError('Please login to view your orders');
            setLoading(false);
            return;
        }
        fetchOrders();
    }, [isLoggedIn, user?.uid]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('auth_token');
            if (!token || !user?.uid) return;

            const response = await fetch(`${API_URL}/invoices/customer/${user.uid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load orders');
            
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Database connection error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusStep = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'completed' || s === 'delivered') return 3;
        if (s === 'shipped') return 2;
        return 1; // Pending / Paid
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 flex items-center justify-center">
                <div className="bg-zinc-900 border border-white/10 p-12 rounded-[2.5rem] text-center max-w-lg w-full shadow-2xl">
                    <ShieldCheck size={64} className="text-red-600 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Login Required</h2>
                    <p className="text-zinc-500 mb-8 font-bold uppercase tracking-widest text-[10px]">Please sign in to view your order history</p>
                    <button className="w-full py-4 bg-red-600 text-white font-black uppercase rounded-2xl hover:bg-red-700 transition-all">Sign In</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1400px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-600/20 px-4 py-1.5 rounded-full mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em]">Operational Manifest 2026</span>
                        </div>
                        <h1 className="text-6xl sm:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                            MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">ORDERS</span>
                        </h1>
                        <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.4em]">Tracking & Purchase history</p>
                    </div>
                    {orders.length > 0 && (
                        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active Orders</p>
                                <p className="text-3xl font-black text-white">{orders.filter(o => o.status !== 'Completed').length}</p>
                            </div>
                            <div className="w-px h-12 bg-white/10"></div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Delivered</p>
                                <p className="text-3xl font-black text-white">{orders.filter(o => o.status === 'Completed').length}</p>
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="animate-spin text-red-600" size={64} strokeWidth={3} />
                        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Loading your orders...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-600/5 border border-red-600/20 rounded-[2rem] p-12 text-center max-w-2xl mx-auto backdrop-blur-3xl">
                        <AlertCircle className="text-red-600 mx-auto mb-6" size={48} />
                        <p className="text-white font-black uppercase tracking-widest mb-6">{error}</p>
                        <button onClick={fetchOrders} className="px-8 py-3 bg-red-600 text-white font-black uppercase rounded-xl hover:bg-red-700 transition-all text-xs">Retry Connection</button>
                    </div>
                )}

                {/* Orders Feed */}
                {!loading && orders.length > 0 && (
                    <div className="grid gap-8">
                        {orders.map((order) => {
                            const step = getStatusStep(order.status);
                            const isExpanded = selectedOrder === order.id;

                            return (
                                <div 
                                    key={order.id}
                                    className={`group relative bg-zinc-900/40 border transition-all duration-700 overflow-hidden ${
                                        isExpanded ? 'border-red-600/30 rounded-[3rem] shadow-[0_0_50px_rgba(220,38,38,0.1)]' : 'border-white/5 rounded-[2.5rem] hover:border-white/20'
                                    }`}
                                >
                                    <div className="p-8 sm:p-12">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                                            {/* Left Info: ID & Date */}
                                            <div className="flex items-center gap-8">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-950 rounded-3xl flex items-center justify-center border border-white/5 group-hover:border-red-600/50 transition-colors">
                                                    <Package size={32} className="text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-1">Order ID #{order.id}</p>
                                                    <p className="text-white text-2xl sm:text-3xl font-black uppercase tracking-tight">Placed on {formatDate(order.created_at)}</p>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Method: {order.payment_method}</span>
                                                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">Type: {order.order_type}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle Info: Live Tracker */}
                                            <div className="flex-1 max-w-xl">
                                                <div className="relative pt-6">
                                                    {/* Progress Line */}
                                                    <div className="absolute top-[34px] left-0 right-0 h-[2px] bg-zinc-800">
                                                        <div 
                                                            className="h-full bg-red-600 transition-all duration-1000"
                                                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    
                                                    {/* Steps */}
                                                    <div className="relative flex justify-between">
                                                        {[
                                                            { label: 'Confirmed', icon: CheckCircle2 },
                                                            { label: 'In Transit', icon: Truck },
                                                            { label: 'Delivered', icon: Package }
                                                        ].map((s, i) => {
                                                            const Icon = s.icon;
                                                            const isActive = step >= i + 1;
                                                            return (
                                                                <div key={i} className="flex flex-col items-center gap-4">
                                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10 ${
                                                                        isActive ? 'bg-red-600 border-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-950 border-zinc-800 text-zinc-700'
                                                                    }`}>
                                                                        <Icon size={20} />
                                                                    </div>
                                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-zinc-700'}`}>{s.label}</p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Info: Financials & Action */}
                                            <div className="flex flex-col sm:flex-row items-center gap-8 min-w-[240px] lg:justify-end">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Amount</p>
                                                    <p className="text-4xl font-black text-white">₹{Number(order.total_amount || 0).toLocaleString('en-IN')}</p>
                                                </div>
                                                <button 
                                                    onClick={() => setSelectedOrder(isExpanded ? null : order.id)}
                                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                                        isExpanded ? 'bg-red-600 text-white rotate-90' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-red-600/20'
                                                    }`}
                                                >
                                                    <ArrowRight size={24} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Shipment Intel (if shipped/expected) */}
                                        {(order.shipped_at || order.expected_delivery) && !isExpanded && (
                                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-6 animate-in slide-in-from-left-4 duration-500">
                                                <div className="flex items-center gap-3 text-red-500 bg-red-600/10 px-6 py-3 rounded-2xl border border-red-600/20">
                                                    <Truck size={18} />
                                                    <span className="text-[11px] font-black uppercase tracking-widest">
                                                        {order.status === 'Completed' ? 'Package Delivered' : (order.status === 'Shipped' ? 'In Transit' : 'Arrival Expected')}: {order.expected_delivery ? formatDate(order.expected_delivery) : 'Pending Update'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Intel Section */}
                                    {isExpanded && (
                                        <div className="px-8 pb-12 sm:px-12 animate-in fade-in slide-in-from-top-4 duration-700">
                                            <div className="grid lg:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                                                {/* Line Items */}
                                                <div>
                                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                                        <Receipt size={14} className="text-red-600" /> Order Summary
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {order.items.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-6 p-6 bg-zinc-950/50 rounded-3xl border border-white/5 hover:border-red-600/20 transition-all">
                                                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shrink-0">
                                                                    <img 
                                                                        src={item.image_url || 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg'} 
                                                                        alt={item.product_name} 
                                                                        className="w-full h-full object-cover opacity-80"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-white font-black uppercase tracking-tight leading-tight">{item.product_name}</p>
                                                                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">
                                                                        Qty: {item.quantity} units @ ₹{Number(item.price || 0).toLocaleString('en-IN')}
                                                                    </p>
                                                                </div>
                                                                <p className="text-lg font-black text-white">₹{(Number(item.quantity) * Number(item.price || 0)).toLocaleString('en-IN')}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Delivery Intel */}
                                                <div>
                                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                                        <MapPin size={14} className="text-red-600" /> Delivery Details
                                                    </h3>
                                                    <div className="bg-zinc-950/50 rounded-3xl p-8 border border-white/5 space-y-8">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Current Status</p>
                                                                <p className={`text-sm font-black uppercase tracking-widest ${order.status === 'Completed' ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {order.status === 'Completed' ? 'Delivered' : order.status}
                                                                </p>
                                                            </div>
                                                            <TrendingUp size={24} className="text-zinc-800" />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-8">
                                                            <div>
                                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Payment Method</p>
                                                                <p className="text-[11px] font-bold text-white uppercase">{order.payment_method}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Transaction Link</p>
                                                                <p className="text-[11px] font-bold text-white uppercase">{order.order_type}</p>
                                                            </div>
                                                        </div>

                                                        {order.expected_delivery && (
                                                            <div className="pt-8 border-t border-white/5">
                                                                <div className="flex items-center gap-4 text-green-500">
                                                                    <Truck size={24} />
                                                                    <div>
                                                                        <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">Estimated Arrival</p>
                                                                        <p className="text-xl font-black uppercase tracking-tighter">{formatDate(order.expected_delivery)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && orders.length === 0 && !error && (
                    <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                        <ShoppingBag size={80} className="text-zinc-900 mx-auto mb-8" strokeWidth={1} />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">No Orders Found</h3>
                        <p className="text-zinc-600 max-w-sm mx-auto font-bold uppercase tracking-widest text-[10px] leading-relaxed mb-12">
                            You haven't placed any orders yet. Explore our arsenal of products.
                        </p>
                        <button className="px-12 py-5 bg-white text-black font-black uppercase rounded-2xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95 text-xs tracking-widest">
                            Shop Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
