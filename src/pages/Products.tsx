import { useState } from 'react';
import { Shield, Wrench, Shirt, Cog } from 'lucide-react';

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products', icon: Cog },
    { id: 'helmets', name: 'Helmets', icon: Shield },
    { id: 'accessories', name: 'Bike Accessories', icon: Wrench },
    { id: 'gear', name: 'Riding Gear', icon: Shirt },
    { id: 'mods', name: 'Modification Parts', icon: Cog },
  ];

  const products = [
    {
      category: 'helmets',
      name: 'MT Revenge 2 Full-Face Helmet',
      description: 'Aerodynamic design with superior ventilation',
      price: '₹4,999',
      image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'helmets',
      name: 'SMK Twister Captain Helmet',
      description: 'DOT certified with anti-fog visor',
      price: '₹3,499',
      image: 'https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'helmets',
      name: 'Axor Apex Hunter Helmet',
      description: 'Lightweight with dual visor system',
      price: '₹5,499',
      image: 'https://images.pexels.com/photos/4488662/pexels-photo-4488662.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'accessories',
      name: 'LED Headlight Kit',
      description: 'Ultra-bright 6000K white light',
      price: '₹1,999',
      image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'accessories',
      name: 'Custom Exhaust System',
      description: 'Enhanced sound and performance',
      price: '₹3,999',
      image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'accessories',
      name: 'Mobile Holder Mount',
      description: '360° rotation with secure grip',
      price: '₹499',
      image: 'https://images.pexels.com/photos/1127133/pexels-photo-1127133.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'gear',
      name: 'Riding Gloves Pro',
      description: 'Knuckle protection with touchscreen compatibility',
      price: '₹899',
      image: 'https://images.pexels.com/photos/6873876/pexels-photo-6873876.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'gear',
      name: 'Riding Jacket',
      description: 'Waterproof with CE approved armor',
      price: '₹4,499',
      image: 'https://images.pexels.com/photos/6873871/pexels-photo-6873871.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'gear',
      name: 'Knee & Elbow Guards',
      description: 'Adjustable straps with impact protection',
      price: '₹1,299',
      image: 'https://images.pexels.com/photos/7243409/pexels-photo-7243409.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'mods',
      name: 'Performance Air Filter',
      description: 'Increased airflow and engine efficiency',
      price: '₹1,799',
      image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'mods',
      name: 'LED Strip Lights',
      description: 'RGB color changing with remote',
      price: '₹899',
      image: 'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      category: 'mods',
      name: 'Carbon Fiber Tank Pad',
      description: 'Premium look with scratch protection',
      price: '₹699',
      image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Our <span className="text-red-600">Products</span>
          </h1>
          <p className="text-xl text-gray-400">Premium bike accessories for passionate riders</p>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900 sticky top-20 z-40 border-b-2 border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-semibold transition-all ${
                  selectedCategory === cat.id
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
                  key={index}
                  className="bg-zinc-900 rounded-lg overflow-hidden border-2 border-zinc-800 hover:border-red-600 transition-all transform hover:scale-105 cursor-pointer group"
                >
                  <div className="h-64 overflow-hidden bg-black">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-red-600">{product.price}</span>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors">
                        Enquire
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
