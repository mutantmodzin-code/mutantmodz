import { useState, useEffect } from 'react';
import {
    Heart,
    Phone,
    DollarSign,
    CheckCircle,
    Users,
    Clock,
    Facebook,
    Twitter,
    Phone as WhatsApp, // Use Phone as placeholder for Whatsapp
    ShoppingCart,
    Minus,
    Plus
} from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';

export default function ProductDetails() {
    const [product, setProduct] = useState<Product | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedSize, setSelectedSize] = useState('L');
    const [selectedTexture, setSelectedTexture] = useState('MATTE');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            window.scrollTo(0, 0);
            const params = new URLSearchParams(window.location.hash.split('?')[1]);
            const productId = params.get('productId');

            const products = await getProducts();
            setAllProducts(products);
            const selectedProduct = products.find((p: any) => p.id === productId || p.id === Number(productId)?.toString());

            if (selectedProduct) {
                setProduct(selectedProduct);
                setMainImage(selectedProduct.image);
            }
        };
        fetchProduct();

        // Listen to hash changes in case user clicks a related product
        const handleHashChange = () => fetchProduct();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (!product) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center pt-20">
                <p className="text-gray-400 text-xl">Loading product details...</p>
            </div>
        );
    }

    // Gallery of 4 images (fake the gallery by using the same image + slightly tinted versions or just repeating)
    const galleryImages = [
        product.image,
        product.image,
        product.image,
        product.image
    ];

    const handleBuyNow = () => {
        window.location.hash = `payment?productId=${product.id}`;
    };

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-zinc-950 pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="text-sm text-gray-400 mb-8 flex items-center gap-2">
                    <a href="#home" className="hover:text-red-500 transition-colors">Home</a>
                    <span>&gt;</span>
                    <a href="#products" className="hover:text-red-500 transition-colors uppercase">{product.category}</a>
                    <span>&gt;</span>
                    <span className="text-gray-200 uppercase">{product.name}</span>
                </div>

                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

                    {/* Images */}
                    <div className="flex flex-col gap-4">
                        <div className="aspect-square bg-white rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center relative group">
                            {/* Using white bg for image block to match the clean product screenshot style, or keeping it dark if we prefer. But the screenshot has white background for images. */}
                            <img src={mainImage} alt={product.name} className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        {/* Thumbnails */}
                        <div className="grid grid-cols-4 gap-4">
                            {galleryImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setMainImage(img)}
                                    className={`aspect-square bg-white rounded-lg border-2 overflow-hidden flex items-center justify-center p-2 
                    ${mainImage === img ? 'border-red-600' : 'border-zinc-800 hover:border-gray-500'} transition-all`}
                                >
                                    <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col text-white">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4 uppercase">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-gray-400 text-sm">SKU: N/A</span>
                            <span className="bg-[#e6f4ea] text-[#1e8e3e] px-2 py-1 rounded text-xs font-bold leading-none flex items-center gap-1">
                                <CheckCircle size={12} /> In Stock
                            </span>
                        </div>

                        <div className="text-4xl font-bold mb-6 text-white">{product.price}</div>

                        <button className="bg-[#1ebe5d] hover:bg-[#179a4a] text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center w-full sm:w-auto gap-2 mb-8 transition-colors">
                            <WhatsApp size={20} /> Order on WhatsApp
                        </button>

                        {/* Options */}
                        <div className="space-y-6 mb-8 border-t border-b border-zinc-800 py-6">
                            {/* Size */}
                            <div>
                                <p className="text-sm text-gray-400 mb-3">Size</p>
                                <div className="flex gap-3">
                                    {['S', 'M', 'L', 'XL'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors
                        ${selectedSize === size ? 'border-red-600 text-red-600 bg-red-600/10' : 'border-zinc-700 text-gray-300 hover:border-gray-500'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Texture */}
                            <div>
                                <p className="text-sm text-gray-400 mb-3">Texture</p>
                                <div className="flex gap-3">
                                    {['MATTE', 'GLOSSY'].map(texture => (
                                        <button
                                            key={texture}
                                            onClick={() => setSelectedTexture(texture)}
                                            className={`px-4 py-2 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors
                        ${selectedTexture === texture ? 'border-red-600 text-red-600 bg-red-600/10' : 'border-zinc-700 text-gray-300 hover:border-gray-500'}`}
                                        >
                                            {texture}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Add to cart / quantity row */}
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                                <div className="flex items-center border border-zinc-700 rounded-md bg-zinc-900 w-32">
                                    <button onClick={decreaseQuantity} className="p-3 text-gray-400 hover:text-white transition-colors">
                                        <Minus size={16} />
                                    </button>
                                    <span className="flex-1 text-center font-semibold text-white">{quantity}</span>
                                    <button onClick={increaseQuantity} className="p-3 text-gray-400 hover:text-white transition-colors">
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center gap-2 transition-colors">
                                    <ShoppingCart size={20} /> Add to basket
                                </button>

                                <button onClick={handleBuyNow} className="flex-1 bg-white hover:bg-gray-200 text-black font-bold py-3 px-6 rounded-md flex items-center justify-center transition-colors">
                                    Buy Now
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <button className="w-10 h-10 border border-zinc-700 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors">
                                <Heart size={20} />
                            </button>
                            <span className="text-gray-400 text-sm">Did you like this product? Add to favorites now and follow the product.</span>
                        </div>

                        {/* Specialist Info */}
                        <div className="mb-8">
                            <p className="text-gray-400 text-sm mb-1">Have a Question? Ask a Specialist</p>
                            <p className="text-xl font-bold flex items-center gap-2">
                                <Phone size={20} className="text-red-600" /> 91594 33122
                            </p>
                        </div>

                        {/* Badges Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 text-gray-400"><DollarSign size={20} /></div>
                                <div>
                                    <h4 className="font-semibold text-sm">Low Prices</h4>
                                    <p className="text-xs text-gray-500 leading-tight mt-1">Price match guarantee</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 text-gray-400"><CheckCircle size={20} /></div>
                                <div>
                                    <h4 className="font-semibold text-sm">Guaranteed Fitment.</h4>
                                    <p className="text-xs text-gray-500 leading-tight mt-1">Always the correct part</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 text-gray-400"><Users size={20} /></div>
                                <div>
                                    <h4 className="font-semibold text-sm">In-House Experts.</h4>
                                    <p className="text-xs text-gray-500 leading-tight mt-1">We know our products</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="mt-1 text-gray-400"><Clock size={20} /></div>
                                <div>
                                    <h4 className="font-semibold text-sm">Easy Returns.</h4>
                                    <p className="text-xs text-gray-500 leading-tight mt-1">Quick & Hassle Free</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-6">
                            <p className="text-sm text-gray-400 mb-4">
                                <span className="text-gray-500">Categories:</span> <span className="uppercase">{product.category}</span>, Uncategorized
                            </p>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                    <Facebook size={16} fill="currentColor" stroke="none" />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                    <Twitter size={16} fill="currentColor" stroke="none" />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-opacity">
                                    <WhatsApp size={16} fill="currentColor" stroke="none" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Tabs Section */}
                <div className="border-b border-zinc-800 mb-8">
                    <div className="flex gap-8">
                        {['description', 'additional information', 'reviews (0)'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 text-sm font-semibold capitalize transition-colors relative
                  ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-20 text-gray-300">
                    {activeTab === 'description' && (
                        <div className="animate-in fade-in duration-300">
                            <h3 className="text-2xl font-bold text-white mb-6 uppercase">{product.name}</h3>
                            <p className="leading-relaxed whitespace-pre-line mb-6">
                                {product.description}
                            </p>
                            <p className="leading-relaxed">
                                The ultimate full-face helmet designed for riders who seek performance, comfort, and style in every journey features a sleek and modern shape that combines sporty flair with elegance - perfect for your everyday adventures.
                                <br /><br />
                                It comes with a removable and washable inner liner to keep you feeling fresh no matter the distance. The eyeglass-friendly harness ensures a secure and safe fit for all riders, while the one-touch visor, optically corrected for clarity, provides an ultra-wide field of vision and is Pinlock® 70 ready to tackle any weather.
                            </p>
                        </div>
                    )}
                    {activeTab === 'additional information' && (
                        <div className="animate-in fade-in duration-300 w-full max-w-2xl">
                            <table className="w-full text-sm border-collapse">
                                <tbody>
                                    <tr className="border-b border-zinc-800">
                                        <td className="py-3 font-semibold text-gray-400 w-1/3">Weight</td>
                                        <td className="py-3">0.9 kg</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="py-3 font-semibold text-gray-400">Size</td>
                                        <td className="py-3">S, M, L, XL</td>
                                    </tr>
                                    <tr className="border-b border-zinc-800">
                                        <td className="py-3 font-semibold text-gray-400">Texture</td>
                                        <td className="py-3">MATTE, GLOSSY</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeTab === 'reviews (0)' && (
                        <div className="animate-in fade-in duration-300">
                            <p className="text-gray-400">There are no reviews yet.</p>
                            <div className="mt-6">
                                <p className="mb-4">Be the first to review "{product.name}"</p>
                                {/* Form placeholder */}
                                <div className="bg-zinc-900 p-6 rounded-lg max-w-2xl border border-zinc-800">
                                    <p className="text-sm text-gray-500 mb-4">Your email address will not be published. Required fields are marked *</p>
                                    <div>
                                        <p className="text-sm mb-2 text-gray-400">Your rating *</p>
                                        <div className="flex gap-1 mb-4 text-gray-600">
                                            {[1, 2, 3, 4, 5].map(star => <Heart key={star} size={16} />)}
                                        </div>
                                    </div>
                                    <textarea className="w-full bg-black border border-zinc-800 rounded p-3 text-white mb-4 min-h-[100px]" placeholder="Your review *"></textarea>
                                    <button className="bg-red-600 text-white px-6 py-2 rounded font-semibold hover:bg-red-700">Submit</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-8 border-b border-zinc-800 pb-4">Related products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((p) => (
                                <a
                                    key={p.id}
                                    href={`#productDetails?productId=${p.id}`}
                                    className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-red-600 transition-all group block"
                                >
                                    {/* Product Card based on the screenshot */}
                                    <div className="relative aspect-square bg-white border-b border-zinc-800">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300" />
                                        <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-all border border-gray-100">
                                            <Heart size={14} />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-bold text-gray-200 mb-1 line-clamp-2 uppercase">{p.name}</h3>
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(star => <Heart key={star} size={10} className="text-yellow-500 fill-yellow-500" />)}
                                            <span className="text-[10px] text-gray-500 ml-1">1 review</span>
                                        </div>
                                        <div className="text-lg font-bold text-red-600 mb-3">{p.price}</div>
                                        <div className="flex items-center gap-1 text-[#1e8e3e] text-xs font-semibold">
                                            <CheckCircle size={10} /> In Stock
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
