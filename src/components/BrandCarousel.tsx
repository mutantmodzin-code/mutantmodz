import React from 'react';
import { motion } from 'framer-motion';
const brands = [
    { name: 'KTM', logo: 'https://companieslogo.com/img/orig/KTM.VI-5110996c.png?t=1632517855' },
    { name: 'Yamaha', logo: 'https://companieslogo.com/img/orig/7272.T-7e04058d.png?t=1633519391' },
    { name: 'Suzuki', logo: 'https://companieslogo.com/img/orig/7269.T-2f085c8e.png?t=1633512399' },
    { name: 'Bajaj', logo: 'https://companieslogo.com/img/orig/BAJAJ-AUTO.NS-7e5c54e6.png?t=1632543940' },
    { name: 'Honda', logo: 'https://companieslogo.com/img/orig/HMC-4054a10c.png?t=1633439405' },
    { name: 'Hero', logo: 'https://companieslogo.com/img/orig/HEROMOTOCO.NS-12c82305.png?t=1633481498' },
    { name: 'Triumph', logo: 'https://companieslogo.com/img/orig/Triumph_Motorcycles-f3e1b1d3.png?t=1633515437' },
    { name: 'Kawasaki', logo: 'https://companieslogo.com/img/orig/7012.T-05e80816.png?t=1633501490' },
    { name: 'BMW', logo: 'https://companieslogo.com/img/orig/BMW.DE-d4a97401.png?t=1633190835' },
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
                        x: [0, -(140 + 24) * brands.length],
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 25,
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
                                borderColor: 'rgba(220, 38, 38, 0.5)', // red-600
                                boxShadow: '0 0 20px rgba(220, 38, 38, 0.2)'
                            }}
                            className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl w-[140px] h-[100px] flex items-center justify-center p-6 cursor-pointer transition-all group shrink-0"
                        >
                            <img
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                                loading="lazy"
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
