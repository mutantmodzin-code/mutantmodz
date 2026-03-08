import { Product } from '../types';
import { supabase } from './supabase';

export const getProducts = async (): Promise<Product[]> => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            return data as Product[];
        }

        // Fallback to initial products if DB is empty
        return initialProducts;
    } catch (error) {
        console.error('Error fetching products from Supabase:', error);
        return initialProducts;
    }
};

export const saveProduct = async (product: Product) => {
    try {
        const { id, ...productData } = product;

        let result;
        if (id && isNaN(Number(id))) { // Real UUID or just a string ID
            result = await supabase
                .from('products')
                .upsert({ id, ...productData });
        } else {
            result = await supabase
                .from('products')
                .insert([productData]);
        }

        if (result.error) throw result.error;
    } catch (error) {
        console.error('Error saving product to Supabase:', error);
    }
};

export const deleteProduct = async (id: string) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting product from Supabase:', error);
    }
};

const initialProducts: Product[] = [
    {
        id: '1',
        category: 'helmets',
        name: 'MT Revenge 2 Full-Face Helmet',
        description: 'Aerodynamic design with superior ventilation',
        price: '₹4,999',
        image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '2',
        category: 'helmets',
        name: 'SMK Twister Captain Helmet',
        description: 'DOT certified with anti-fog visor',
        price: '₹3,499',
        image: 'https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '3',
        category: 'helmets',
        name: 'Axor Apex Hunter Helmet',
        description: 'Lightweight with dual visor system',
        price: '₹5,499',
        image: 'https://images.pexels.com/photos/4488662/pexels-photo-4488662.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '4',
        category: 'accessories',
        name: 'LED Headlight Kit',
        description: 'Ultra-bright 6000K white light',
        price: '₹1,999',
        image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '5',
        category: 'accessories',
        name: 'Custom Exhaust System',
        description: 'Enhanced sound and performance',
        price: '₹3,999',
        image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '6',
        category: 'accessories',
        name: 'Mobile Holder Mount',
        description: '360° rotation with secure grip',
        price: '₹499',
        image: 'https://images.pexels.com/photos/1127133/pexels-photo-1127133.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '7',
        category: 'gear',
        name: 'Riding Gloves Pro',
        description: 'Knuckle protection with touchscreen compatibility',
        price: '₹899',
        image: 'https://images.pexels.com/photos/6873876/pexels-photo-6873876.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '8',
        category: 'gear',
        name: 'Riding Jacket',
        description: 'Waterproof with CE approved armor',
        price: '₹4,499',
        image: 'https://images.pexels.com/photos/6873871/pexels-photo-6873871.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '9',
        category: 'gear',
        name: 'Knee & Elbow Guards',
        description: 'Adjustable straps with impact protection',
        price: '₹1,299',
        image: 'https://images.pexels.com/photos/7243409/pexels-photo-7243409.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '10',
        category: 'mods',
        name: 'Performance Air Filter',
        description: 'Increased airflow and engine efficiency',
        price: '₹1,799',
        image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '11',
        category: 'mods',
        name: 'LED Strip Lights',
        description: 'RGB color changing with remote',
        price: '₹899',
        image: 'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: '12',
        category: 'mods',
        name: 'Carbon Fiber Tank Pad',
        description: 'Premium look with scratch protection',
        price: '₹699',
        image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
];
