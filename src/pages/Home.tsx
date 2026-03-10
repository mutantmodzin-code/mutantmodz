import { useState, useEffect } from 'react';
import { ArrowRight, Star, Shield, Wrench, Users, TrendingUp, ChevronDown, Heart, ShoppingCart } from 'lucide-react';
import { getProducts } from '../utils/storage';
import { Product } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All Products');

  const filters = ['All Products', 'Helmets', 'Bike Accessories', 'Riding Gear', 'Modification Parts'];

  useEffect(() => {
    setIsLoaded(true);
    const fetchProducts = async () => {
      const products = await getProducts();
      setFeaturedProducts(products.slice(0, 3));
    };
    fetchProducts();

    const handleScroll = () => {
      // Optimiziation to not update state unnecessarily when past hero
      if (window.scrollY < window.innerHeight * 1.5) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-12');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
       window.removeEventListener('scroll', handleScroll);
       observer.disconnect();
    }
  }, []);

  const reviews = [
    {
      name: 'Rajesh Kumar',
      review: 'Best place for bike accessories in Coimbatore! Quality products and great service.',
      rating: 5,
    },
    {
      name: 'Arun Prasad',
      review: 'Got my new helmet and riding gloves here. Premium quality at affordable prices!',
      rating: 5,
    },
    {
      name: 'Vikram S',
      review: 'Mutant Modz transformed my bike with their custom modifications. Highly recommended!',
      rating: 5,
    },
  ];

  const features = [
    { icon: Shield, title: 'Premium Quality', description: 'Certified products from trusted brands' },
    { icon: Users, title: 'Expert Advice', description: 'Professional guidance for all riders' },
    { icon: Wrench, title: 'Custom Modifications', description: 'Personalize your ride with expert mods' },
    { icon: TrendingUp, title: 'Latest Accessories', description: 'Always updated with trending products' },
  ];

  return (
    <div className={`min-h-screen bg-zinc-950 overflow-hidden transition-opacity duration-1000 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax / Zoom background */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-75 ease-out"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            transform: `scale(${1.05 + scrollY * 0.0003}) translateY(${scrollY * 0.4}px)`,
          }}
        ></div>
        
        {/* Improved Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-zinc-950"></div>
        
        <div className={`relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-16 transition-all duration-1000 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            Upgrade Your Ride with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 mt-2 filter drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
              Premium Accessories
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-10 leading-relaxed font-light drop-shadow-lg max-w-3xl mx-auto">
            Coimbatore's trusted destination for helmets, riding gear, and custom bike modifications
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => onNavigate('products')}
              className="group bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-1 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_35px_rgba(220,38,38,0.7)] w-full sm:w-auto active:scale-95"
            >
              Explore Products <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="group bg-zinc-900/40 hover:bg-white text-white hover:text-black backdrop-blur-md border border-white/20 hover:border-white px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] w-full sm:w-auto active:scale-95"
            >
              Visit Our Store
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-70' : 'translate-y-10 opacity-0'}`} onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white uppercase tracking-widest font-semibold">Scroll</span>
            <ChevronDown size={28} className="text-white" />
          </div>
        </div>
      </section>

      {/* Our Products */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10 animate-on-scroll opacity-0 translate-y-12 transition-all duration-700 ease-out">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Our <span className="text-red-600">Products</span>
            </h2>
            <p className="text-lg text-zinc-400 font-light tracking-wide">Premium motorcycle accessories for passionate riders</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100 ease-out">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all duration-300 min-h-[48px] touch-manipulation active:scale-95 ${activeFilter === filter ? 'bg-red-600 text-white shadow-[0_5px_15px_rgba(220,38,38,0.4)]' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-500/50 hover:bg-zinc-800'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="group animate-on-scroll opacity-0 translate-y-12 transition-all duration-700 ease-out bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-zinc-800/50 hover:border-red-600/50 transform hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(220,38,38,0.15)] cursor-pointer flex flex-col"
                style={{ transitionDelay: `${index * 150}ms` }}
                onClick={() => onNavigate('products')}
              >
                <div className="h-72 overflow-hidden relative shrink-0">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-80 pointer-events-none"></div>
                  
                  {/* Floating Wishlist Icon */}
                  <button onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-sm hover:bg-red-600 border border-white/10 text-white min-w-[44px] min-h-[44px] rounded-full flex justify-center items-center transition-all duration-300 active:scale-90 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)] touch-manipulation">
                    <Heart size={20} className="hover:fill-white transition-colors" />
                  </button>
                </div>
                
                <div className="p-6 relative z-20 flex-1 flex flex-col bg-zinc-900/95 backdrop-blur-md rounded-t-3xl -mt-6 border-t border-zinc-800/50 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors line-clamp-1">{product.name}</h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(star => <Star key={star} size={14} className="fill-amber-500 text-amber-500" />)}
                    <span className="text-zinc-500 text-xs ml-1">(42)</span>
                  </div>

                  <p className="text-zinc-400 mb-6 line-clamp-2 text-sm leading-relaxed flex-1">{product.description}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-auto">
                    <span className="text-2xl font-black text-white group-hover:text-red-500 transition-colors drop-shadow-md">{product.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.hash = `payment?productId=${product.id}`;
                      }}
                      className="bg-red-600 text-white hover:bg-red-500 w-full sm:w-auto px-5 py-3 min-h-[48px] rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-300 shadow-[0_5px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_8px_25px_rgba(220,38,38,0.5)] active:scale-95 touch-manipulation"
                    >
                      <ShoppingCart size={18} /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              // Skeleton Loading State
              [1,2,3].map(i => (
                 <div key={i} className="animate-pulse bg-zinc-900/50 rounded-2xl h-96 border border-zinc-800/50">
                    <div className="h-72 bg-zinc-800/50 rounded-t-2xl"></div>
                    <div className="p-8">
                       <div className="h-4 bg-zinc-800 rounded w-3/4 mb-4"></div>
                       <div className="h-4 bg-zinc-800 rounded w-1/2 mb-6"></div>
                    </div>
                 </div>
              ))
            )}
          </div>
          
          <div className="mt-16 text-center animate-on-scroll opacity-0 translate-y-12 transition-all duration-700 delay-300 ease-out">
             <button
                onClick={() => onNavigate('products')}
                className="text-white hover:text-red-500 font-semibold tracking-wider uppercase text-sm border-b leading-tight border-white/30 hover:border-red-500 transition-all duration-300 pb-1 inline-flex items-center gap-2 group"
              >
                View All Products <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900 relative overflow-hidden">
        <div className="absolute -left-[20%] -top-[20%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[120px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-12 transition-all duration-700 ease-out">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Why Choose <span className="text-red-600">Us</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group animate-on-scroll opacity-0 translate-y-12 transition-all duration-700 ease-out text-center p-8 bg-black/40 backdrop-blur-md rounded-2xl border border-zinc-800/50 hover:border-red-600/30 hover:bg-zinc-800/50 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(220,38,38,0.1)] cursor-default"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-2xl mb-6 shadow-inner group-hover:bg-red-600/10 transition-colors duration-500 group-hover:rotate-6 transform">
                  <feature.icon size={36} className="text-red-500 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-12 transition-all duration-700 ease-out">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Customer <span className="text-red-600">Reviews</span>
            </h2>
            <p className="text-lg text-zinc-400 font-light tracking-wide">Trusted by riders across Coimbatore</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div 
                key={index} 
                className="group animate-on-scroll opacity-0 translate-y-12 transition-all duration-700 ease-out bg-zinc-900/40 p-10 rounded-3xl border border-zinc-800/80 hover:border-red-600/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-default"
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex gap-1.5 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }} />
                  ))}
                </div>
                <p className="text-zinc-300 mb-8 leading-relaxed font-light italic">"{review.review}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {review.name.charAt(0)}
                  </div>
                  <p className="text-white font-bold tracking-wide">{review.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-red-900">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-900 object-cover opacity-90 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg')] mix-blend-overlay bg-cover bg-center opacity-30"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10 px-4 animate-on-scroll opacity-0 scale-95 transition-all duration-1000 ease-out">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl">
            Ready to Upgrade Your Ride?
          </h2>
          <p className="text-xl text-white/90 mb-10 font-light max-w-2xl mx-auto leading-relaxed">
            Visit our store in Coimbatore and explore our premium collection of accessories, or shop online directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button
              onClick={() => onNavigate('contact')}
              className="bg-white text-red-700 px-10 py-4 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
              Get in Touch
            </button>
             <button
              onClick={() => onNavigate('products')}
              className="bg-red-800/80 hover:bg-red-900 border border-red-400/30 backdrop-blur-sm text-white px-10 py-4 rounded-full text-lg font-bold shadow-lg transform hover:-translate-y-1 transition-all duration-300 active:scale-95"
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
