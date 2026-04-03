import { useState, useEffect } from 'react';
import { useUserAuth } from '../context/UserAuthContext';
import { ShoppingBag, Calendar, DollarSign, Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

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
    items: OrderItem[];
}

const API_URL = import.meta.env.VITE_API_URL;

export default function MyOrders() {
    const { user, isLoggedIn } = useUserAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [creatingTestOrder, setCreatingTestOrder] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            setError('Please login to view your orders');
            setLoading(false);
            return;
        }

        fetchOrders();
    }, [isLoggedIn, user?.uid]);

    const createTestOrder = async () => {
        try {
            setCreatingTestOrder(true);
            const response = await fetch(`${API_URL}/test-orders/create-test-order/${user?.uid}`, {
                method: 'POST'
            });

            if (response.ok) {
                console.log('✅ Test order created');
                fetchOrders();
            } else {
                throw new Error('Failed to create test order');
            }
        } catch (err) {
            console.error('Error creating test order:', err);
            setError(err instanceof Error ? err.message : 'Failed to create test order');
        } finally {
            setCreatingTestOrder(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError('');

            if (!user?.uid) {
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('auth_token');
            console.log('🔐 Auth Token:', token ? 'Present' : 'Missing');
            console.log('👤 User UID:', user?.uid);
            
            if (!token) {
                setError('Authentication token missing. Please login again.');
                setLoading(false);
                return;
            }

            const url = `${API_URL}/invoices/customer/${user.uid}`;
            console.log('📍 Fetching from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ Response Status:', response.status);
            const data = await response.json();
            console.log('📦 Response Data:', data);

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            setOrders(Array.isArray(data) ? data : []);
            if (data.length === 0) {
                setError('');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to load orders';
            console.error('❌ Error:', errorMsg);
            setError(errorMsg);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'paid':
                return <CheckCircle2 size={20} className="text-green-500" />;
            case 'pending':
            case 'unpaid':
                return <Clock size={20} className="text-yellow-500" />;
            default:
                return <ShoppingBag size={20} className="text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered':
            case 'paid':
                return 'bg-green-500/10 text-green-400 border border-green-500/20';
            case 'pending':
            case 'unpaid':
                return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
            default:
                return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-black pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-600/10 border border-red-600/30 rounded-2xl p-8 text-center">
                        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-black text-white mb-2">Login Required</h2>
                        <p className="text-zinc-400">Please login to view your orders</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
                        My Orders
                    </h1>
                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
                        Track and manage your purchases
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-red-600" size={48} />
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="bg-red-600/10 border border-red-600/30 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
                            <p className="text-red-400 font-bold">{error}</p>
                        </div>
                    </div>
                )}

                {/* No Orders */}
                {!loading && orders.length === 0 && !error && (
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center space-y-6">
                        <div>
                            <ShoppingBag size={48} className="mx-auto text-zinc-600 mb-4" />
                            <h3 className="text-2xl font-black text-white mb-2">No Orders Yet</h3>
                            <p className="text-zinc-400 max-w-md mx-auto">
                                Start shopping to place your first order
                            </p>
                        </div>
                        <button
                            onClick={createTestOrder}
                            disabled={creatingTestOrder}
                            className="mx-auto px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white font-black uppercase text-sm rounded-xl transition-colors"
                        >
                            {creatingTestOrder ? 'Creating Test Order...' : 'Create Test Order'}
                        </button>
                    </div>
                )}

                {/* Orders List */}
                {!loading && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer"
                                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                            >
                                {/* Order Header */}
                                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <ShoppingBag size={24} className="text-red-600" />
                                            <div>
                                                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Order #</p>
                                                <p className="text-white text-xl font-black">{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Calendar size={16} />
                                                {formatDate(order.created_at)}
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <DollarSign size={16} />
                                                ₹{order.total_amount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </div>
                                </div>

                                {/* Order Items (Expanded) */}
                                {selectedOrder?.id === order.id && (
                                    <div className="p-6 bg-black/20 border-t border-white/5 space-y-4">
                                        <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4">
                                            Order Items
                                        </h4>
                                        {order.items && order.items.length > 0 ? (
                                            <div className="space-y-3">
                                                {order.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5"
                                                    >
                                                        {item.image_url && (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.product_name}
                                                                className="w-16 h-16 rounded-lg object-cover bg-zinc-800"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-white font-bold">{item.product_name}</p>
                                                            <p className="text-zinc-400 text-sm">
                                                                Qty: {item.quantity} × ₹{item.price}
                                                            </p>
                                                        </div>
                                                        <p className="text-red-600 font-black">
                                                            ₹{(item.quantity * item.price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-zinc-500 text-sm">No items found</p>
                                        )}

                                        {/* Order Summary */}
                                        <div className="pt-4 border-t border-white/5 space-y-2">
                                            <div className="flex justify-between text-zinc-400 text-sm">
                                                <span>Payment Method:</span>
                                                <span className="text-white font-bold">{order.payment_method}</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-400 text-sm">
                                                <span>Order Type:</span>
                                                <span className="text-white font-bold">{order.order_type}</span>
                                            </div>
                                            <div className="flex justify-between text-white font-black text-lg pt-2 border-t border-white/5">
                                                <span>Total:</span>
                                                <span className="text-red-600">₹{order.total_amount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
