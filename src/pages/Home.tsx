import { ArrowRight, Star, Shield, Wrench, Users, TrendingUp } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const featuredProducts = [
    {
      name: 'Premium Full-Face Helmets',
      description: 'DOT certified, aerodynamic design, superior protection',
      price: '₹3,999',
      image: 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      name: 'Bike Modification Parts',
      description: 'Custom exhaust, LED lights, performance upgrades',
      price: '₹1,499',
      image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      name: 'Riding Gear & Accessories',
      description: 'Gloves, jackets, knee guards, premium quality',
      price: '₹2,499',
      image: 'https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];

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
    {
      icon: Shield,
      title: 'Premium Quality',
      description: 'Certified products from trusted brands',
    },
    {
      icon: Users,
      title: 'Expert Advice',
      description: 'Professional guidance for all riders',
    },
    {
      icon: Wrench,
      title: 'Custom Modifications',
      description: 'Personalize your ride with expert mods',
    },
    {
      icon: TrendingUp,
      title: 'Latest Accessories',
      description: 'Always updated with trending products',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <section
        className="relative h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Upgrade Your Ride with
            <span className="block text-red-600 mt-2">Premium Bike Accessories</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
            Coimbatore's trusted destination for helmets, riding gear, and custom bike modifications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('products')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-md text-lg font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105"
            >
              Explore Products <ArrowRight size={20} />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-md text-lg font-semibold transition-all transform hover:scale-105"
            >
              Visit Our Store
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              About <span className="text-red-600">Mutant Modz</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Your one-stop shop for premium bike accessories, helmets, and riding gear in Coimbatore.
              We bring passion and expertise to every rider who walks through our doors.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Featured <span className="text-red-600">Products</span>
            </h2>
            <p className="text-xl text-gray-400">Premium accessories for passionate riders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <div
                key={index}
                className="bg-black rounded-lg overflow-hidden border-2 border-zinc-800 hover:border-red-600 transition-all transform hover:scale-105 cursor-pointer"
                onClick={() => onNavigate('products')}
              >
                <div className="h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-red-600">{product.price}</span>
                    <button className="text-white hover:text-red-600 font-semibold flex items-center gap-1 transition-colors">
                      View Details <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-red-600">Us</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-zinc-900 rounded-lg border-2 border-zinc-800 hover:border-red-600 transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Customer <span className="text-red-600">Reviews</span>
            </h2>
            <p className="text-xl text-gray-400">Trusted by riders across Coimbatore</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-black p-8 rounded-lg border-2 border-zinc-800">
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-red-600 fill-red-600" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{review.review}</p>
                <p className="text-white font-bold">{review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Upgrade Your Ride?
          </h2>
          <p className="text-xl text-white mb-8 opacity-90">
            Visit our store in Coimbatore and explore our premium collection
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-white hover:bg-gray-200 text-red-600 px-8 py-4 rounded-md text-lg font-semibold transition-all transform hover:scale-105"
          >
            Get in Touch
          </button>
        </div>
      </section>
    </div>
  );
}
