import React from 'react';
import { X, Save, Upload, Loader2 } from 'lucide-react';
import { Product } from '../../types';

interface ProductFormProps {
    product: Partial<Product>;
    isEditing: boolean;
    isUploading: boolean;
    selectedFile: File | null;
    onClose: () => void;
    onSave: () => void;
    onChange: (field: string, value: any) => void;
    onFileChange: (file: File | null) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
    product,
    isUploading,
    selectedFile,
    onClose,
    onSave,
    onChange,
    onFileChange
}) => {
    const categories = [
        { id: 'helmets', name: 'Helmets' },
        { id: 'accessories', name: 'Accessories' },
        { id: 'gear', name: 'Riding Gear' },
        { id: 'mods', name: 'Modifications' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h2 className="text-xl font-bold text-white">
                        {product.id ? 'Edit' : 'Add New'} Product
                    </h2>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Product Name</label>
                            <input
                                type="text"
                                value={product.name}
                                onChange={(e) => onChange('name', e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="e.g., MT Revenge 2 Matte Black"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Price</label>
                            <input
                                type="text"
                                value={product.price}
                                onChange={(e) => onChange('price', e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-red-600 outline-none transition-all placeholder:text-zinc-700"
                                placeholder="₹4,999"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                            <select
                                value={product.category}
                                onChange={(e) => onChange('category', e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-red-600 outline-none transition-all appearance-none"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                            <textarea
                                value={product.description}
                                onChange={(e) => onChange('description', e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-white focus:border-red-600 outline-none transition-all h-24 resize-none placeholder:text-zinc-700"
                                placeholder="Describe the product features..."
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Product Image</label>
                            <div className="flex gap-4 items-center">
                                <div className="h-24 w-24 rounded-2xl bg-black border border-zinc-800 overflow-hidden flex-shrink-0">
                                    {(product.image || selectedFile) ? (
                                        <img
                                            src={selectedFile ? URL.createObjectURL(selectedFile) : product.image}
                                            alt="Preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-zinc-700">
                                            <Upload size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="file-upload"
                                        className="hidden"
                                        onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-xl cursor-pointer transition-all"
                                    >
                                        <Upload size={18} />
                                        Choose Image
                                    </label>
                                    <p className="mt-2 text-xs text-zinc-600">Max size: 2MB. Format: JPG, PNG, WEBP</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 border-t border-zinc-800 flex gap-4 bg-zinc-900/50">
                    <button
                        onClick={onSave}
                        disabled={isUploading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/20"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Uploading Image...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Save Product Details
                            </>
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
