export interface Product {
    id: string;
    category: string;
    category_id?: number | string;
    category_name?: string;
    name: string;
    description: string;
    price: string;
    stock: number;
    image: string;
    images?: string[];
    date_added?: string;
    price_num: number;
    brand?: string;
    bike_brand?: string;
    bike_model?: string;
    sub_category?: string;
    sub_category_type?: string;
    isNew?: boolean;
    created_at?: string;
    freeShipping?: boolean;
    discount_percent?: number;
    is_garage_sale?: boolean;
    is_combo?: boolean;
    combo_type?: string;
    garage_sale_type?: string;
    delivery_tn?: number;
    delivery_south?: number;
    delivery_north?: number;
}


export type Category = {
    id: string;
    name: string;
    icon: any; // Lucide icon component
};
