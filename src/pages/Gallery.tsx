import { useState } from 'react';
import { X } from 'lucide-react';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    {
      url: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Premium Helmets',
      category: 'helmets',
    },
    {
      url: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Custom Bikes',
      category: 'bikes',
    },
    {
      url: 'https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Racing Gear',
      category: 'gear',
    },
    {
      url: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Bike Modifications',
      category: 'mods',
    },
    {
      url: 'https://images.pexels.com/photos/1127133/pexels-photo-1127133.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Sport Bikes',
      category: 'bikes',
    },
    {
      url: 'https://images.pexels.com/photos/4488662/pexels-photo-4488662.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Helmet Collection',
      category: 'helmets',
    },
    {
      url: 'https://images.pexels.com/photos/6873876/pexels-photo-6873876.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Riding Gloves',
      category: 'gear',
    },
    {
      url: 'https://images.pexels.com/photos/6873871/pexels-photo-6873871.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Protective Gear',
      category: 'gear',
    },
    {
      url: 'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'LED Accessories',
      category: 'accessories',
    },
    {
      url: 'https://images.pexels.com/photos/7243409/pexels-photo-7243409.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Safety Equipment',
      category: 'gear',
    },
    {
      url: 'https://images.pexels.com/photos/1149601/pexels-photo-1149601.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Custom Painted Bikes',
      category: 'bikes',
    },
    {
      url: 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Street Bikes',
      category: 'bikes',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <section className="bg-black py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            Our <span className="text-red-600">Gallery</span>
          </h1>
          <p className="text-xl text-gray-400">
            Explore our collection of helmets, bikes, and accessories
          </p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square"
                onClick={() => setSelectedImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg">{image.title}</h3>
                  </div>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-600 transition-colors duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Follow Us on <span className="text-red-600">Instagram</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Stay updated with our latest products, custom builds, and community events
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-md text-lg font-semibold transition-all transform hover:scale-105"
          >
            Follow @mutantmodz
          </a>
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-red-600 transition-colors"
          >
            <X size={40} />
          </button>
          <img
            src={selectedImage}
            alt="Gallery"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
