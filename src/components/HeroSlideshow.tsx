import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const images = [
    'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/262667/pexels-photo-262667.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/104842/bmw-vehicle-ride-bike-104842.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/1029141/pexels-photo-1029141.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/5956934/pexels-photo-5956934.jpeg?auto=compress&cs=tinysrgb&w=1920',
];

interface HeroSlideshowProps {
    onNavigate: (page: string) => void;
}

export default function HeroSlideshow({ onNavigate }: HeroSlideshowProps) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % images.length);
    }, []);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + images.length) % images.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(nextSlide, 4000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const variants: Variants = {
        enter: () => ({
            opacity: 0,
            scale: 1.1,
        }),
        center: {
            zIndex: 1,
            opacity: 1,
            scale: 1,
            transition: {
                opacity: { duration: 1, ease: 'easeInOut' },
                scale: { duration: 10, ease: 'linear' }, // Ken Burns effect
            } as any,
        },
        exit: {
            zIndex: 0,
            opacity: 0,
            transition: {
                opacity: { duration: 1, ease: 'easeInOut' },
            } as any,
        },
    };

    return (
        <section className="relative h-[50vh] sm:h-[70vh] md:h-[80vh] lg:h-screen w-full overflow-hidden bg-black">
            {/* Background Slideshow */}
            <div className="absolute inset-0 z-0 scale-110 sm:scale-100">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 w-full h-full"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.x > 100) prevSlide();
                            else if (info.offset.x < -100) nextSlide();
                        }}
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${images[current]})` }}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-red-600/10 via-transparent to-red-600/10 animate-pulse duration-[4000ms] pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-black/40 pointer-events-none" />

            {/* Content */}
            <motion.div
                style={{ y: y1, opacity }}
                className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-5xl"
                >
                    <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-[1.1] tracking-tighter uppercase">
                        Upgrade Your Ride with
                        <span className="block text-red-600 mt-1 sm:mt-2 filter drop-shadow-lg">Premium Gear</span>
                    </h1>
                    <p className="text-sm sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-10 leading-relaxed max-w-3xl mx-auto font-medium opacity-95">
                        Trusted destination for helmets, riding gear, and custom modifications
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-6 sm:px-0">
                        <button
                            onClick={() => onNavigate('products')}
                            className="group bg-red-600 hover:bg-red-700 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-xl text-base sm:text-lg font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl shadow-red-600/20"
                        >
                            Explore Store
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => onNavigate('contact')}
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-black text-white px-8 py-4 sm:px-10 sm:py-5 rounded-xl text-base sm:text-lg font-bold transition-all transform active:scale-95"
                        >
                            Get Contact
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white hover:text-black transition-all group hidden md:block"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} className="group-active:scale-90 transition-transform" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-4 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-white hover:text-black transition-all group hidden md:block"
                aria-label="Next slide"
            >
                <ChevronRight size={24} className="group-active:scale-90 transition-transform" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2.5 sm:gap-3">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > current ? 1 : -1);
                            setCurrent(index);
                        }}
                        className={cn(
                            "h-1.5 sm:h-2 transition-all duration-300 rounded-full",
                            current === index ? "w-8 sm:w-10 bg-red-600" : "w-3 sm:w-4 bg-white/30 hover:bg-white/50"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Scroll Down Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 hidden lg:flex flex-col items-center gap-2 text-white/50 cursor-pointer"
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] ml-1">Scroll</span>
                <div className="w-px h-12 bg-white/20 relative">
                    <motion.div
                        animate={{ top: ['0%', '70%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-600 rounded-full"
                    />
                </div>
            </motion.div>

            {/* Parallax elements (Hidden on small mobile) */}
            <motion.div
                style={{ y: y2 }}
                className="absolute top-20 right-20 w-64 h-64 bg-red-600/5 rounded-full blur-[100px] pointer-events-none z-10 hidden sm:block"
            />
            <motion.div
                style={{ y: y1 }}
                className="absolute bottom-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none z-10 hidden sm:block"
            />
        </section>
    );
};
