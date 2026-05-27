import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUserAuth } from './UserAuthContext';
import { Product } from '../types';
import toast from 'react-hot-toast';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQty: (productId: string, qty: number) => void;
    clearCart: () => void;
    totalCount: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const { user } = useUserAuth();
    const [items, setItems] = useState<CartItem[]>([]);

    // Generate user-specific storage key
    const storageKey = user?.uid ? `mm_cart_${user.uid}` : 'mm_cart_guest';

    // Load cart from localStorage based on user
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            setItems(saved ? JSON.parse(saved) : []);
        } catch {
            setItems([]);
        }
    }, [storageKey, user?.uid]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(items));
    }, [items, storageKey]);

    const addToCart = (product: Product, quantity: number = 1) => {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]);
        }
        
        toast.success('Added to cart!', {
            icon: '🔥',
            style: { border: '1px solid #dc2626' }
        });
        
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i =>
                    i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(prev => prev.filter(i => i.product.id !== productId));
    };

    const updateQty = (productId: string, qty: number) => {
        if (qty <= 0) { removeFromCart(productId); return; }
        setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    };

    const clearCart = () => setItems([]);

    const totalCount = items.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = items.reduce((s, i) => {
        const price = parseFloat(String(i.product.price).replace(/[^0-9.]/g, ''));
        return s + (isNaN(price) ? 0 : price * i.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totalCount, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
