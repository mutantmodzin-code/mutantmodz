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
    isBestSeller?: boolean;
    isNew?: boolean;
    freeShipping?: boolean;
}

export type Category = {
    id: string;
    name: string;
    icon: any; // Lucide icon component
};
