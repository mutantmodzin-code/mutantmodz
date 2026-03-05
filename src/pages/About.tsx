import { Target, Heart, Award, Zap } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To provide every rider with premium quality bike accessories and riding gear that enhance safety, style, and performance.',
    },
    {
      icon: Heart,
      title: 'Our Passion',
      description: 'We live and breathe motorcycles. Our team consists of passionate riders who understand what fellow bikers need.',
    },
    {
      icon: Award,
      title: 'Quality Promise',
      description: 'Every product we offer is carefully selected and tested to meet the highest standards of quality and durability.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We stay ahead of trends, bringing you the latest and most innovative bike accessories and modifications.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      <section
        className="relative h-96 flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1127133/pexels-photo-1127133.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
            About <span className="text-red-600">Mutant Modz</span>
          </h1>
          <p className="text-xl text-gray-300">Your trusted partner in bike customization</p>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Our <span className="text-red-600">Story</span>
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed text-lg">
                <p>
                  Mutant Modz was born from a simple passion - the love for motorcycles and the desire to help fellow riders express themselves through their bikes.
                </p>
                <p>
                  Located in the heart of Coimbatore, opposite Vibgyor School in Uppilipalayam, we started with a vision to become the go-to destination for premium bike accessories and riding gear.
                </p>
                <p>
                  What sets us apart is our deep understanding of rider needs. We're not just a shop - we're a community of bike enthusiasts dedicated to enhancing your riding experience with quality products and expert guidance.
                </p>
                <p>
                  From college students looking for their first helmet to seasoned riders seeking custom modifications, we serve every member of Coimbatore's vibrant biking community with the same passion and commitment.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Bike accessories"
                className="rounded-lg w-full h-64 object-cover border-2 border-red-600"
              />
              <img
                src="https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Helmets"
                className="rounded-lg w-full h-64 object-cover border-2 border-zinc-800 hover:border-red-600 transition-colors mt-8"
              />
              <img
                src="https://images.pexels.com/photos/163210/motorcycles-race-helmets-pilots-163210.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Racing gear"
                className="rounded-lg w-full h-64 object-cover border-2 border-zinc-800 hover:border-red-600 transition-colors"
              />
              <img
                src="https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Custom bikes"
                className="rounded-lg w-full h-64 object-cover border-2 border-zinc-800 hover:border-red-600 transition-colors mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              What <span className="text-red-600">Drives Us</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our core values and commitment to the biking community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-black p-8 rounded-lg border-2 border-zinc-800 hover:border-red-600 transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-6">
                  <value.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Why Riders Choose <span className="text-red-600">Us</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-6">
              <div className="text-5xl font-bold text-red-600 mb-2">500+</div>
              <p className="text-gray-400 text-lg">Happy Customers</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-red-600 mb-2">200+</div>
              <p className="text-gray-400 text-lg">Products Available</p>
            </div>
            <div className="p-6">
              <div className="text-5xl font-bold text-red-600 mb-2">100%</div>
              <p className="text-gray-400 text-lg">Quality Guaranteed</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
