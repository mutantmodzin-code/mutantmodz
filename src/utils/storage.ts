import { Product } from '../types';
import { getMediaUrl } from './url';


const API_URL = import.meta.env.VITE_API_URL;

export const getProducts = async (): Promise<Product[]> => {
    try {
        const url = API_URL ? `${API_URL}/products` : '/api/products';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        // Ensure data is an array
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('API returned invalid data format');

        // Map backend product (PostgreSQL) to main app's premium Product type
        return data.map((p: any) => {
            let images: string[] = [];
            try {
                if (p.image_url && p.image_url.startsWith('[')) {
                    images = JSON.parse(p.image_url).filter((url: string) => url !== '');
                } else if (p.image_url) {
                    images = [p.image_url];
                }
            } catch (e) {
                images = p.image_url ? [p.image_url] : [];
            }

            return {
                id: p.id.toString(),
                category: p.category_name?.toLowerCase() || 'accessories',
                name: p.name,
                description: p.description || `${p.brand} professional grade hardware`,
                price: p.price?.toString().includes('₹') ? p.price : `₹${parseFloat(p.price).toLocaleString('en-IN')}`,
                price_num: parseFloat(p.price) || 0,
                stock: parseInt(p.stock) || 0,
                image: getMediaUrl(images[0] || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'),
                images: images.length > 0 ? images.map(img => getMediaUrl(img)) : [getMediaUrl('https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600')],
                brand: p.brand || '',
                bike_brand: p.bike_brand || '',
                bike_model: p.bike_model || '',
                sub_category: p.sub_category || '',
                sub_category_type: p.sub_category_type || '',
                date_added: p.created_at || undefined,
                created_at: p.created_at || undefined,
                is_garage_sale: p.is_garage_sale || false,
                is_combo: p.is_combo || false,
                combo_type: p.combo_type || '',
                delivery_tn: parseFloat(p.delivery_tn) || 0,
                delivery_south: parseFloat(p.delivery_south) || 0,
                delivery_north: parseFloat(p.delivery_north) || 0,
                discount_percent: parseFloat(p.discount_percent) || 0,
                size_stock: (() => {
                    if (!p.size_stock) return undefined;
                    if (typeof p.size_stock === 'object') return p.size_stock;
                    try { return JSON.parse(p.size_stock); } catch { return undefined; }
                })()
            };

        });
    } catch (error) {
        console.error('Database connection failed. Using fallback mock data for demo:', error);
        
        // Fallback Premium Mock Data for Demo
        return [
            {
                id: 'mock-1', category: 'helmets', name: 'LS2 FF800 Storm II Matte Black',
                description: 'KPA shell with integrated sun visor and Pinlock Max Vision included.',
                price: '₹10,500', price_num: 10500, stock: 15, brand: 'LS2',
                image: 'https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=600',
                images: ['https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=600']
            },
            {
                id: 'mock-2', category: 'gear', name: 'Rynox Stealth Evo V3 Jacket',
                description: 'All-weather adventure touring jacket with Level 2 armor.',
                price: '₹12,450', price_num: 12450, stock: 8, brand: 'Rynox',
                image: 'https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=600',
                images: ['https://images.pexels.com/photos/3215594/pexels-photo-3215594.jpeg?auto=compress&cs=tinysrgb&w=600'],
                is_garage_sale: true
            },
            {
                id: 'mock-3', category: 'accessories', name: 'HJG Owl Night Drive LED (Pair)',
                description: 'Intense 60W CREE LED fog lights for superior visibility.',
                price: '₹2,999', price_num: 2999, stock: 25, brand: 'HJG',
                image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
                images: ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600']
            },
            {
                id: 'mock-4', category: 'luggage', name: 'Viaterra Claw Mini Tail Bag',
                description: '35L universal tail bag with rain cover and bungee mounts.',
                price: '₹3,850', price_num: 3850, stock: 12, brand: 'Viaterra',
                image: 'https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=600',
                images: ['https://images.pexels.com/photos/2516423/pexels-photo-2516423.jpeg?auto=compress&cs=tinysrgb&w=600'],
                is_combo: true,
                combo_type: 'General Combos'
            },
            {
                id: 'mock-5', category: 'accessories', name: 'DynaMount Master Phone Holder',
                description: 'Vibration dampened aluminium mobile mount with one-click lock.',
                price: '₹1,599', price_num: 1599, stock: 45, brand: 'DynaMount',
                image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600',
                images: ['https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600']
            },
            {
                id: 'mock-6', category: 'protection', name: 'Axor Apex Venomous Helmet',
                description: 'DOT & ECE certified with dual spoiler and pinlock ready visor.',
                price: '₹5,450', price_num: 5450, stock: 20, brand: 'Axor',
                image: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=600',
                images: ['https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=600']
            }
        ];
    }
};

export const saveProduct = async (_product: Product) => {
    // Managed via Administrative Interface in /frontend
    console.warn('Direct save from main interface is deprecated. Use Management Portal.');
};

export const deleteProduct = async (_id: string) => {
    // Managed via Administrative Interface in /frontend
    console.warn('Direct delete from main interface is deprecated. Use Management Portal.');
};

export const getNewArrivals = async (): Promise<Product[]> => {
    try {
        const url = API_URL ? `${API_URL}/products/new-arrivals` : '/api/products/new-arrivals';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch new arrivals');

        const data = await response.json();
        if (!Array.isArray(data)) return [];

        return data.map((p: any) => {
            let images: string[] = [];
            try {
                if (p.image_url && p.image_url.startsWith('[')) {
                    images = JSON.parse(p.image_url).filter((url: string) => url !== '');
                } else if (p.image_url) {
                    images = [p.image_url];
                }
            } catch {
                images = p.image_url ? [p.image_url] : [];
            }
            return {
                id: p.id.toString(),
                category: p.category_name?.toLowerCase() || 'accessories',
                category_name: p.category_name || '',
                name: p.name,
                description: p.description || '',
                price: `₹${parseFloat(p.price).toLocaleString('en-IN')}`,
                price_num: parseFloat(p.price) || 0,
                stock: parseInt(p.stock) || 0,
                image: getMediaUrl(images[0] || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'),
                images: images.length > 0 ? images.map(img => getMediaUrl(img)) : [getMediaUrl('https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600')],
                brand: p.brand || '',
                bike_brand: p.bike_brand || '',
                bike_model: p.bike_model || '',
                sub_category: p.sub_category || '',
                sub_category_type: p.sub_category_type || '',
                date_added: p.created_at || undefined,
                created_at: p.created_at || undefined,
                is_combo: p.is_combo || false,
                delivery_tn: parseFloat(p.delivery_tn) || 0,
                delivery_south: parseFloat(p.delivery_south) || 0,
                delivery_north: parseFloat(p.delivery_north) || 0,
                discount_percent: parseFloat(p.discount_percent) || 0,
                size_stock: (() => {
                    if (!p.size_stock) return undefined;
                    if (typeof p.size_stock === 'object') return p.size_stock;
                    try { return JSON.parse(p.size_stock); } catch { return undefined; }
                })()
            };
        });
    } catch (error) {
        console.error('Failed to fetch new arrivals:', error);
        return [];
    }
};

export const createInvoice = async (invoiceData: any) => {
    try {
        const response = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invoiceData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create invoice');
        }
        return await response.json();
    } catch (error) {
        console.error('Invoice creation failed:', error);
        throw error;
    }
};

export const createCustomer = async (customerData: any) => {
    try {
        const response = await fetch(`${API_URL}/customers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        if (!response.ok) throw new Error('Failed to create customer');
        return await response.json();
    } catch (error) {
        console.error('Customer creation failed:', error);
        throw error;
    }
};

export const getCombos = async (): Promise<Product[]> => {
    try {
        const url = API_URL ? `${API_URL}/combos` : '/api/combos';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch combos');
        
        const data = await response.json();
        // Ensure data is an array
        const combosArray = Array.isArray(data) ? data : [];
        return combosArray.map((c: any) => ({
            id: c.id.toString(),
            category: 'combos',
            category_name: c.category_name || '',
            name: c.name,
            description: c.description || '',
            price: `₹${parseFloat(c.price).toLocaleString('en-IN')}`,
            price_num: parseFloat(c.price) || 0,
            stock: parseInt(c.stock) || 0,
            image: getMediaUrl(c.image_url || c.images?.[0] || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'),
            images: (c.images || [c.image_url || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600']).map((img: string) => getMediaUrl(img)),
            brand: c.brand || '',
            sub_category: c.sub_category || '',
            sub_category_type: c.sub_category_type || '',
            is_combo: true,
            sku: c.sku || '',
            combo_type: c.combo_type || 'General Combos',
            delivery_tn: parseFloat(c.delivery_tn) || 0,
            delivery_south: parseFloat(c.delivery_south) || 0,
            delivery_north: parseFloat(c.delivery_north) || 0,
            discount_percent: parseFloat(c.discount_percent) || 0,
            size_stock: (() => {
                if (!c.size_stock) return undefined;
                if (typeof c.size_stock === 'object') return c.size_stock;
                try { return JSON.parse(c.size_stock); } catch { return undefined; }
            })()
        }));
    } catch (error) {
        console.error('Failed to fetch combos:', error);
        return [];
    }
};

export const getGarageSale = async (): Promise<Product[]> => {
    try {
        const url = API_URL ? `${API_URL}/garage-sale` : '/api/garage-sale';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch garage sale items');
        
        const data = await response.json();
        // Ensure data is an array
        const garageSaleArray = Array.isArray(data) ? data : [];
        return garageSaleArray.map((g: any) => ({
            id: g.id.toString(),
            category: 'garage-sale',
            category_name: g.category_name || '',
            name: g.name,
            description: g.description || '',
            price: `₹${parseFloat(g.price).toLocaleString('en-IN')}`,
            price_num: parseFloat(g.price) || 0,
            stock: parseInt(g.stock) || 0,
            image: getMediaUrl(g.image_url || g.images?.[0] || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'),
            images: (g.images || [g.image_url || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600']).map((img: string) => getMediaUrl(img)),
            brand: g.brand || '',
            sub_category: g.sub_category || '',
            sub_category_type: g.sub_category_type || '',
            is_garage_sale: true,
            sku: g.sku || '',
            garage_sale_type: g.garage_sale_type || 'Clearance',
            delivery_tn: parseFloat(g.delivery_tn) || 0,
            delivery_south: parseFloat(g.delivery_south) || 0,
            delivery_north: parseFloat(g.delivery_north) || 0,
            discount_percent: parseFloat(g.discount_percent) || 0,
            size_stock: (() => {
                if (!g.size_stock) return undefined;
                if (typeof g.size_stock === 'object') return g.size_stock;
                try { return JSON.parse(g.size_stock); } catch { return undefined; }
            })()
        }));
    } catch (error) {
        console.error('Failed to fetch garage sale items:', error);
        return [];
    }
};

export const getPromoBanners = async () => {
    try {
        const url = API_URL ? `${API_URL}/promo` : '/api/promo';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch promo banners');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch promo banners:', error);
        return [];
    }
};
