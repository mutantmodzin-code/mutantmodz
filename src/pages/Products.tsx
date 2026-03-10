import { useState, useEffect } from 'react';
import { Shield, Wrench, Shirt, Cog, ShoppingCart } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';

interface ProductsProps {
  onNavigate: (page: string) => void;
}

export default function Products({ }: ProductsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const brandMatch = hash.match(/[?&]brand=([^&]+)/);
      if (brandMatch) {
        setSelectedBrand(brandMatch[1].toLowerCase());
      } else {
        setSelectedBrand(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const categories = [
    { id: 'all', name: 'All Products', icon: Cog },
    { id: 'helmets', name: 'Helmets', icon: Shield },
    { id: 'accessories', name: 'Bike Accessories', icon: Wrench },
    { id: 'gear', name: 'Riding Gear', icon: Shirt },
    { id: 'mods', name: 'Modification Parts', icon: Cog },
  ];

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesBrand = !selectedBrand ||
      p.name.toLowerCase().includes(selectedBrand) ||
      p.description.toLowerCase().includes(selectedBrand) ||
      (p as any).brand?.toLowerCase() === selectedBrand;
    return matchesCategory && matchesBrand;
  });

  const handleBuyNow = (productId: string) => {
    window.location.hash = `payment?productId=${productId}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Our <span className="text-red-600">Products</span>
          </h1>
          <p className="text-xl text-gray-400">Premium bike accessories for passionate riders</p>
          {selectedBrand && (
            <div className="mt-6 inline-flex items-center gap-3 bg-red-600/20 border border-red-600/30 px-4 py-2 rounded-full">
              <span className="text-red-600 font-bold uppercase text-xs tracking-widest">Brand: {selectedBrand}</span>
              <button
                onClick={() => window.location.hash = 'products'}
                className="text-white hover:text-red-600 transition-colors text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900 sticky top-20 z-40 border-b-2 border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all ${selectedCategory === cat.id
                  ? 'bg-red-600 text-white'
                  : 'bg-black text-gray-400 hover:bg-zinc-800 hover:text-white border-2 border-zinc-800'
                  }`}
              >
                <cat.icon size={20} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl">No products found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  onClick={() => window.location.hash = `productDetails?productId=${product.id}`}
                  className="bg-zinc-900 rounded-lg overflow-hidden border-2 border-zinc-800 hover:border-red-600 transition-all transform hover:scale-105 cursor-pointer group"
                >
                  <div className="h-64 overflow-hidden bg-white flex items-center justify-center p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-600">{product.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors flex items-center gap-2"
                      >
                        <ShoppingCart size={16} /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Looking for Something Specific?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Visit our store or call us to discuss your requirements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+919876543210"
              className="bg-white hover:bg-gray-200 text-red-600 px-8 py-4 rounded-md text-lg font-semibold transition-all inline-block"
            >
              Call Now: +91 98765 43210
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-zinc-900 text-white px-8 py-4 rounded-md text-lg font-semibold transition-all inline-block"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
