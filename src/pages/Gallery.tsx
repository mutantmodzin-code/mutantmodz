import { useState, useEffect } from 'react';
import { X, Instagram, Maximize2, Camera } from 'lucide-react';
import { updatePageSEO, PAGE_SEO } from '../utils/seo';

export default function Gallery() {
  useEffect(() => {
    updatePageSEO(PAGE_SEO.gallery);
  }, []);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    {
      url: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Premium Helmets',
      category: 'PROTECTION',
    },
    {
      url: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Custom Bikes',
      category: 'DESIGN',
    },
    {
      url: 'https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Racing Gear',
      category: 'PERFORMANCE',
    },
    {
      url: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Bike Modifications',
      category: 'CUSTOM',
    },
    {
      url: 'https://images.pexels.com/photos/1127133/pexels-photo-1127133.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Sport Bikes',
      category: 'POWER',
    },
    {
      url: 'https://images.pexels.com/photos/4488662/pexels-photo-4488662.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Helmet Collection',
      category: 'STYLE',
    },
    {
      url: 'https://images.pexels.com/photos/6873876/pexels-photo-6873876.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Riding Gloves',
      category: 'GEAR',
    },
    {
      url: 'https://images.pexels.com/photos/6873871/pexels-photo-6873871.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Protective Gear',
      category: 'SAFETY',
    },
    {
      url: 'https://images.pexels.com/photos/3311574/pexels-photo-3311574.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'LED Accessories',
      category: 'DYNAMICS',
    },
    {
      url: 'https://images.pexels.com/photos/7243409/pexels-photo-7243409.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Safety Equipment',
      category: 'ESSENTIALS',
    },
    {
      url: 'https://images.pexels.com/photos/1149601/pexels-photo-1149601.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Custom Painted Bikes',
      category: 'ARTISTRY',
    },
    {
      url: 'https://images.pexels.com/photos/2393816/pexels-photo-2393816.jpeg?auto=compress&cs=tinysrgb&w=800',
      title: 'Street Bikes',
      category: 'URBAN',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 pt-20">
      {/* Editorial Header */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/1149601/pexels-photo-1149601.jpeg?auto=compress&cs=tinysrgb&w=1600"
            className="w-full h-full object-cover opacity-30 scale-110 blur-sm"
            alt="background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 px-4">
          <div className="inline-flex items-center gap-3 bg-red-600/10 border border-red-600/20 px-4 py-2 rounded-full mb-4">
            <Camera size={14} className="text-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] text-red-500 uppercase">Visual Archive</span>
          </div>
          <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter uppercase leading-none">
            THE <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800">GALLERY</span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-500 font-bold tracking-widest text-xs uppercase leading-relaxed">
            Exploring the fusion of high-performance engineering and underground aesthetic.
          </p>
        </div>
      </section>

      {/* Cinematic Grid */}
      <section className="py-24 px-4 sm:px-12 bg-zinc-950">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] aspect-[4/5] bg-zinc-900 border border-zinc-900 transition-all duration-700 hover:border-red-600/50"
                onClick={() => setSelectedImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                />

                {/* Overlay Interface */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-red-600 text-[10px] font-black tracking-[0.5em] uppercase">{image.category}</span>
                    <h3 className="text-white font-black text-3xl tracking-tighter uppercase leading-tight">{image.title}</h3>
                    <div className="pt-4 flex items-center gap-4">
                      <div className="h-px w-12 bg-zinc-800 group-hover:w-20 transition-all duration-500"></div>
                      <Maximize2 size={16} className="text-zinc-500" />
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/10">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Callout */}
      <section className="py-40 px-4 sm:px-6 lg:px-8 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-block p-6 rounded-[3rem] bg-zinc-950 border border-zinc-800 shadow-2xl">
            <Instagram size={48} className="text-red-600" />
          </div>
          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white tracking-tighter uppercase leading-none">
              Follow the <span className="text-red-600">Evolution</span>
            </h2>
            <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase max-w-lg mx-auto leading-relaxed">
              Daily updates of custom builds, new components, and community highlights.
            </p>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-4 bg-white hover:bg-red-600 hover:text-white text-black px-12 py-6 rounded-2xl text-[10px] font-black tracking-[0.4em] uppercase transition-all transform hover:scale-105 shadow-2xl"
          >
            Connect @mutantmodz
          </a>
        </div>
      </section>

      {/* Fullscreen Viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8 backdrop-blur-xl animate-in fade-in duration-500"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-12 right-12 text-white/50 hover:text-red-600 transition-colors bg-white/5 p-4 rounded-2xl border border-white/5"
          >
            <X size={24} />
          </button>

          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Gallery Preview"
              className="max-w-full max-h-full object-contain rounded-[2rem] shadow-2xl ring-1 ring-white/10 p-2 bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

