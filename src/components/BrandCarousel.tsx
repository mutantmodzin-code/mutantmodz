import React from 'react';
import { motion } from 'framer-motion';
const brands = [
    {
        name: 'KTM',
        logo: 'https://www.carlogos.org/logo/KTM-logo-2560x1440.png',
        image: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
        name: 'Yamaha',
        logo: 'https://www.carlogos.org/logo/Yamaha-logo-1920x1080.png',
        image: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
        name: 'Suzuki',
        logo: 'https://www.carlogos.org/logo/Suzuki-logo-1920x1080.png',
        image: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
        name: 'Bajaj',
        logo: 'https://www.carlogos.org/logo/Bajaj-logo-640x334.png',
        image: 'https://images.pexels.com/photos/1715184/pexels-photo-1715184.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
        name: 'Honda',
        logo: 'https://www.carlogos.org/car-logos/honda-logo.png',
        image: 'https://images.pexels.com/photos/4006151/pexels-photo-4006151.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
        name: 'Hero',
        logo: 'https://www.carlogos.org/logo/Hero-MotoCorp-logo.png',
        image: 'https://images.pexels.com/photos/2790396/pexels-photo-2790396.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
        name: 'Triumph',
        logo: 'https://www.carlogos.org/logo/Triumph-logo.png',
        image: 'https://images.pexels.com/photos/2088210/pexels-photo-2088210.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
        name: 'Kawasaki',
        logo: 'https://www.carlogos.org/logo/Kawasaki-logo.png',
        image: 'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
        name: 'BMW',
        logo: 'https://www.carlogos.org/car-logos/bmw-logo.png',
        image: 'https://images.pexels.com/photos/104842/bmw-vehicle-ride-bike-104842.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
];

interface BrandCarouselProps {
    onNavigate: (page: string) => void;
}

export const BrandCarousel: React.FC<BrandCarouselProps> = ({ onNavigate }) => {
    const handleBrandClick = (brandName: string) => {
        onNavigate(`products?brand=${brandName.toLowerCase()}`);
    };

    // Duplicate brands to create an infinite loop effect
    const duplicatedBrands = [...brands, ...brands, ...brands];

    return (
        <section className="py-12 bg-black overflow-hidden relative border-y border-zinc-800/50">
            {/* Edge Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 mb-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center">Trusted Parts for Premium Brands</p>
            </div>

            <div className="flex select-none">
                <motion.div
                    animate={{
                        x: [0, -(180 + 24) * brands.length],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 35, // Slightly slower for larger cards
                            ease: "linear",
                        },
                    }}
                    className="flex gap-6 px-3"
                >
                    {duplicatedBrands.map((brand, index) => (
                        <motion.div
                            key={`${brand.name}-${index}`}
                            onClick={() => handleBrandClick(brand.name)}
                            whileHover={{
                                scale: 1.05,
                                borderColor: 'rgba(220, 38, 38, 0.8)', // red-600
                                boxShadow: '0 0 30px rgba(220, 38, 38, 0.4)'
                            }}
                            className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-2xl w-[180px] h-[120px] cursor-pointer transition-all group shrink-0"
                        >
                            {/* Bike Background Image */}
                            <img
                                src={brand.image}
                                alt={`${brand.name} bike`}
                                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500"
                                loading="lazy"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />

                            {/* Logo and Name Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                                <img
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    className="max-w-[70%] max-h-[50%] object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('opacity-0');
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.add('opacity-100', 'text-xl');
                                    }}
                                    loading="lazy"
                                />
                                <span className="mt-2 text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    {brand.name}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
