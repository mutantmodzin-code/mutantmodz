import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Slide {
    id: number;
    image_url: string;
    title_white: string;
    title_red: string;
    subtitle: string;
    display_order: number;
}

interface HeroSlideshowProps {
    onNavigate: (page: string) => void;
}

export default function HeroSlideshow({ onNavigate }: HeroSlideshowProps) {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
                const res = await fetch(`${apiUrl}/hero`);
                const data = await res.json();
                setSlides(data.filter((s: any) => s.is_active));
            } catch (err) {
                console.error('Error fetching slides:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    const nextSlide = useCallback(() => {
        if (slides.length <= 1) return;
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        if (slides.length <= 1) return;
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const timer = setInterval(nextSlide, 4000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const variants: Variants = {
        enter: {
            opacity: 0,
        },
        center: {
            zIndex: 1,
            opacity: 1,
            transition: {
                opacity: { duration: 0.8, ease: 'easeInOut' },
            } as any,
        },
        exit: {
            zIndex: 0,
            opacity: 0,
            transition: {
                opacity: { duration: 0.8, ease: 'easeInOut' },
            } as any,
        },
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
        const base = apiUrl.replace('/api', '');
        return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    if (loading) return <div className="h-[50vh] sm:h-[60vh] bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (slides.length === 0) return null;

    return (
        <section className="relative h-[45vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] w-full overflow-hidden bg-black">
            {/* Background Slideshow */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 w-full h-full"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                            style={{ backgroundImage: `url(${getImageUrl(slides[current].image_url)})` }}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-black/20 pointer-events-none" />

            {/* Content */}
            <div className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl"
                >
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tighter uppercase">
                        {slides[current].title_white}
                        {slides[current].title_red && (
                            <span className="block text-red-600 mt-1 filter drop-shadow-lg">
                                {slides[current].title_red}
                            </span>
                        )}
                    </h1>
                    
                    <div className="flex flex-row gap-3 sm:gap-6 justify-center">
                        <button
                            onClick={() => onNavigate('products')}
                            className="group bg-red-600 hover:bg-black text-white px-6 py-3 sm:px-10 sm:py-4 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl shadow-red-600/20"
                        >
                            Explore Store
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => onNavigate('contact')}
                            className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-black text-white px-6 py-3 sm:px-10 sm:py-4 rounded-xl text-sm sm:text-base font-bold transition-all transform active:scale-95"
                        >
                            Get Contact
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-red-600 transition-all group hidden md:block"
                aria-label="Previous slide"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-red-600 transition-all group hidden md:block"
                aria-label="Next slide"
            >
                <ChevronRight size={20} />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > current ? 1 : -1);
                            setCurrent(index);
                        }}
                        className={cn(
                            "h-1.5 transition-all duration-300 rounded-full",
                            current === index ? "w-8 bg-red-600" : "w-3 bg-white/30 hover:bg-white/50"
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
                <span className="text-xs font-black uppercase tracking-[0.3em] ml-1">Scroll</span>
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
}
