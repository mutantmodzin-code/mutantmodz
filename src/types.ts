export interface Product {
    id: string;
    category: string;
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
    isBestSeller?: boolean;
    isNew?: boolean;
    freeShipping?: boolean;
    discount_percent?: number;
}


export type Category = {
    id: string;
    name: string;
    icon: any; // Lucide icon component
};
