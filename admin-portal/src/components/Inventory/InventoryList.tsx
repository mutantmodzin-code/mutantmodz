import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { Product } from '../../types';

interface InventoryListProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ products, onEdit, onDelete }) => {
    return (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-zinc-900/50 border-b border-zinc-800">
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Product</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Price</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-zinc-800/20 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700 flex-shrink-0">
                                        <img
                                            src={product.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80'}
                                            alt={product.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{product.name}</p>
                                        <p className="text-zinc-500 text-xs line-clamp-1">{product.description}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider border border-zinc-700">
                                    <Package size={10} />
                                    {product.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-red-600 font-bold tracking-tight">
                                {product.price}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
