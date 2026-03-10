import { useState, useEffect } from 'react';
import {
    Plus,
    Package,
    AlertCircle,
    TrendingUp,
    Users,
    Activity
} from 'lucide-react';
import { getProducts, saveProduct, deleteProduct, uploadImage } from './utils/storage';
import { Product } from './types';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { StatsCard } from './components/Dashboard/StatsCard';
import { InventoryList } from './components/Inventory/InventoryList';
import { ProductForm } from './components/Inventory/ProductForm';
import { Toast, ToastProps } from './components/UI/Toast';

export default function App() {
    const [products, setProducts] = useState<Product[]>([]);
    const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);
    const [activeTab, setActiveTab] = useState('dashboard');

    const addToast = (message: string, type: 'success' | 'error') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
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
            try {
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
                addToast(`Product ${currentProduct.id ? 'updated' : 'added'} successfully!`, 'success');
                setIsEditing(false);
                setSelectedFile(null);
                resetForm();
            } catch (error) {
                addToast('Failed to save product. Please try again.', 'error');
            }
        }
    };

    const resetForm = () => {
        setCurrentProduct({
            name: '',
            description: '',
            price: '',
            category: 'helmets',
            image: '',
        });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                await fetchProducts();
                addToast('Product deleted successfully.', 'success');
            } catch (error) {
                addToast('Failed to delete product.', 'error');
            }
        }
    };

    const handleEdit = (product: Product) => {
        setCurrentProduct(product);
        setIsEditing(true);
    };

    const renderView = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Dashboard <span className="text-red-600">Overview</span></h1>
                                <p className="text-zinc-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Real-time analytics and inventory status</p>
                            </div>
                            <div className="flex gap-3">
                                <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">System Live</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard
                                title="Total Products"
                                value={products.length}
                                icon={Package}
                                trend={{ value: '+12%', isPositive: true }}
                                color="red"
                            />
                            <StatsCard
                                title="Active Categories"
                                value={new Set(products.map(p => p.category)).size}
                                icon={TrendingUp}
                                color="blue"
                            />
                            <StatsCard
                                title="Total Users"
                                value="1,284"
                                icon={Users}
                                trend={{ value: '+5.4%', isPositive: true }}
                                color="green"
                            />
                            <StatsCard
                                title="System Load"
                                value="24%"
                                icon={Activity}
                                color="yellow"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Package className="text-red-600" size={20} />
                                        Recent Inventory Updates
                                    </h2>
                                    <button
                                        onClick={() => setActiveTab('inventory')}
                                        className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest border-b border-zinc-800 pb-1"
                                    >
                                        View All
                                    </button>
                                </div>
                                <InventoryList
                                    products={products.slice(0, 5)}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>

                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 h-fit space-y-6">
                                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    <AlertCircle className="text-red-600" size={20} />
                                    Quick Actions
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => { setIsEditing(true); resetForm(); }}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group"
                                    >
                                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                        Add New Product
                                    </button>
                                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all">
                                        Generate Inventory Report
                                    </button>
                                    <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all">
                                        Export Data (CSV)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'inventory':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight">Inventory <span className="text-red-600">Management</span></h1>
                                <p className="text-zinc-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Track and manage your product catalog</p>
                            </div>
                            <button
                                onClick={() => { setIsEditing(true); resetForm(); }}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                            >
                                <Plus size={20} /> Add New Product
                            </button>
                        </div>
                        <InventoryList
                            products={products}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                );
            default:
                return <div className="text-white p-20 text-center">Section under construction</div>;
        }
    };

    return (
        <div className="min-h-screen bg-black flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="flex-1 flex flex-col min-h-screen">
                <Header />

                <main className="flex-1 p-8 bg-black">
                    <div className="max-w-7xl mx-auto">
                        {renderView()}
                    </div>
                </main>
            </div>

            {isEditing && (
                <ProductForm
                    product={currentProduct}
                    isEditing={isEditing}
                    isUploading={isUploading}
                    selectedFile={selectedFile}
                    onClose={() => setIsEditing(false)}
                    onSave={handleSave}
                    onChange={(field, value) => setCurrentProduct({ ...currentProduct, [field]: value })}
                    onFileChange={(file) => setSelectedFile(file)}
                />
            )}

            <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </div>
    );
}
