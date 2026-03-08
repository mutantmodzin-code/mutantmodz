export interface Product {
    id: string;
    category: string;
    name: string;
    description: string;
    price: string;
    image: string;
}

export type Category = {
    id: string;
    name: string;
    icon: any; // Lucide icon component
};
