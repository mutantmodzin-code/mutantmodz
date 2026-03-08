import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Package } from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, uploadImage } from './utils/storage';
import { Product } from './types';

export default function App() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: '',
        category: 'helmets',
        image: '',
    });

    const fetchProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSave = async () => {
        if (currentProduct.name && currentProduct.price) {
            let imageUrl = currentProduct.image || '';

            if (selectedFile) {
                setIsUploading(true);
                const base64 = await uploadImage(selectedFile);
                if (base64) {
                    imageUrl = base64;
                }
                setIsUploading(false);
            }

            await saveProduct({
                ...currentProduct,
                image: imageUrl,
                id: currentProduct.id || Date.now().toString(),
            } as Product);
            await fetchProducts();
            setIsEditing(false);
            setSelectedFile(null);
            setCurrentProduct({
                name: '',
                description: '',
                price: '',
                category: 'helmets',
                image: '',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await deleteProduct(id);
            await fetchProducts();
        }
    };

    const handleEdit = (product: Product) => {
        setCurrentProduct(product);
        setIsEditing(true);
    };

    const categories = [
        { id: 'helmets', name: 'Helmets' },
        { id: 'accessories', name: 'Accessories' },
        { id: 'gear', name: 'Riding Gear' },
        { id: 'mods', name: 'Modifications' },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 lg:px-8">
            <nav className="border-b border-zinc-800 py-6 mb-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="text-2xl font-bold">
                        <span className="text-white">MUTANT</span>
                        <span className="text-red-600 ml-2">ADMIN</span>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-bold text-white">
                        Inventory <span className="text-red-600">Management</span>
                    </h1>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold flex items-center gap-2 transition-all"
                        >
                            <Plus size={20} /> Add New Product
                        </button>
                    )}
                </div>

                {isEditing && (
                    <div className="bg-zinc-900 p-8 rounded-lg border-2 border-red-600 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {currentProduct.id ? 'Edit' : 'Add'} Product
                            </h2>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-400 mb-2">Product Name</label>
                                <input
                                    type="text"
                                    value={currentProduct.name}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                    className="w-full bg-black border-2 border-zinc-800 rounded-md py-3 px-4 text-white focus:border-red-600 outline-none transition-all"
                                    placeholder="Enter product name"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">Price (e.g., ₹4,999)</label>
                                <input
                                    type="text"
                                    value={currentProduct.price}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })}
                                    className="w-full bg-black border-2 border-zinc-800 rounded-md py-3 px-4 text-white focus:border-red-600 outline-none transition-all"
                                    placeholder="Enter price"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 mb-2">Description</label>
                                <textarea
                                    value={currentProduct.description}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                    className="w-full bg-black border-2 border-zinc-800 rounded-md py-3 px-4 text-white focus:border-red-600 outline-none transition-all h-32"
                                    placeholder="Enter product description"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">Category</label>
                                <select
                                    value={currentProduct.category}
                                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                                    className="w-full bg-black border-2 border-zinc-800 rounded-md py-3 px-4 text-white focus:border-red-600 outline-none transition-all"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-2">Product Image</label>
                                <div className="flex flex-col gap-4">
                                    {(currentProduct.image || selectedFile) && (
                                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-zinc-800 bg-black">
                                            <img
                                                src={selectedFile ? URL.createObjectURL(selectedFile) : currentProduct.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        className="w-full bg-black border-2 border-zinc-800 rounded-md py-3 px-4 text-white focus:border-red-600 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isUploading}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white px-8 py-3 rounded-md font-semibold flex items-center gap-2 transition-all"
                            >
                                {isUploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} /> Save Product
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-md font-semibold transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div
                            key={product.id}
                            className="bg-zinc-900 rounded-lg overflow-hidden border-2 border-zinc-800 hover:border-red-600 transition-all group"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={product.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-white">{product.name}</h3>
                                    <span className="text-red-600 font-bold">{product.price}</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {product.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <Package size={14} />
                                    {product.category}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
