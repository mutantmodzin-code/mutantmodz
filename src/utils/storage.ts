import { Product } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();

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
                image: images[0] || 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
                images: images.length > 0 ? images : ['https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'],
                brand: p.brand || '',
                date_added: p.created_at || null
            };
        });
    } catch (error) {
        console.error('Database connection failed. Ensure backend is running:', error);
        return [];
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
