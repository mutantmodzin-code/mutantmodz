export interface Product {
    id: string;
    category: string;
    name: string;
    description: string;
    price: string;
    stock: number;
    image: string;
    images?: string[];
}

export type Category = {
    id: string;
    name: string;
    icon: any; // Lucide icon component
};
