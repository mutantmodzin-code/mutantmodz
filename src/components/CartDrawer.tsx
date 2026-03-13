import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (page: string) => void;
}

export default function CartDrawer({ isOpen, onClose, onNavigate }: CartDrawerProps) {
    const { items, removeFromCart, updateQty, totalCount, totalPrice } = useCart();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-zinc-950 border-l border-white/5 z-[70] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <ShoppingCart size={20} className="text-red-500" />
                        <h2 className="text-white font-black uppercase tracking-widest text-sm">Cart</h2>
                        {totalCount > 0 && (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{totalCount}</span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-xl">
                        <X size={20} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-white/5">
                                <ShoppingCart size={32} className="text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-white font-black uppercase tracking-widest text-sm">Cart is empty</p>
                                <p className="text-zinc-600 text-xs mt-2 uppercase tracking-widest">Add products to get started</p>
                            </div>
                            <button
                                onClick={() => { onClose(); onNavigate('products'); }}
                                className="px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-red-700 transition-colors"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        items.map(({ product, quantity }) => {
                            const imgSrc = product.images?.[0] || product.image || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=200';
                            const price = parseFloat(String(product.price).replace(/[^0-9.]/g, ''));
                            return (
                                <div key={product.id} className="flex gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 group">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                                        <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-red-500 text-[9px] font-black uppercase tracking-widest mb-1">{product.category}</div>
                                        <h4 className="text-white text-sm font-black uppercase tracking-tight leading-tight mb-2 truncate">{product.name}</h4>
                                        <div className="text-white font-black text-base">₹{isNaN(price) ? product.price : (price * quantity).toLocaleString('en-IN')}</div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQty(product.id, quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="text-white text-sm font-black w-6 text-center">{quantity}</span>
                                                <button
                                                    onClick={() => updateQty(product.id, quantity + 1)}
                                                    disabled={quantity >= product.stock}
                                                    className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-40"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(product.id)}
                                                className="text-zinc-600 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-zinc-800"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-white/5 px-6 py-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-zinc-400 font-black uppercase tracking-widest text-xs">Total</span>
                            <span className="text-white font-black text-xl">₹{totalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <button
                            onClick={() => { onClose(); onNavigate('payment'); }}
                            className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-700 transition-all active:scale-95 shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                        >
                            Proceed to Checkout
                        </button>
                        <button
                            onClick={() => { onClose(); onNavigate('products'); }}
                            className="w-full py-3 bg-zinc-900/50 text-zinc-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:text-white hover:bg-zinc-800 transition-all border border-white/5"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
