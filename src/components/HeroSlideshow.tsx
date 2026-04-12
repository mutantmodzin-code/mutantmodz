import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getMediaUrl } from '../utils/url';

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

    if (loading) return <div className="h-[50vh] sm:h-[60vh] bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (slides.length === 0) return null;

    return (
        <section className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-x-hidden bg-black">
            {/* 1. Main Banner Image Area (Force Full Width) */}
            <div className="relative h-[65vh] sm:h-[75vh] md:h-[80vh] w-full overflow-hidden">
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
                        {/* Use real img tag with object-fit for the edge-to-edge guarantee */}
                        <img
                            src={getMediaUrl(slides[current].image_url)}
                            alt={slides[current].title_red || 'Hero Banner'}
                            className="w-full h-full object-cover transition-transform duration-1000 scale-105"
                        />
                        {/* Gradient Overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
                    </motion.div>
                </AnimatePresence>

                {/* Content - Hero Text Overlay */}
                <div className="relative z-20 h-full flex items-center justify-center px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.85] tracking-tighter uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            {slides[current].title_white}
                            {slides[current].title_red && (
                                <span className="block text-red-600 filter drop-shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                                    {slides[current].title_red}
                                </span>
                            )}
                        </h1>
                        <p className="mt-8 text-zinc-300 text-sm sm:text-xl font-bold uppercase tracking-[0.4em] max-w-3xl mx-auto opacity-70">
                            {slides[current].subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > current ? 1 : -1);
                                setCurrent(index);
                            }}
                            className={cn(
                                "h-1 transition-all duration-700 rounded-full",
                                current === index ? "w-16 bg-red-600" : "w-6 bg-white/20 hover:bg-white/40"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* 2. Primary CTA Space - Relocated Below Banner Image */}
            <div className="bg-zinc-950 border-b border-white/5 py-12 sm:py-20 px-6">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button
                        onClick={() => onNavigate('products')}
                        className="w-full sm:w-auto h-[70px] px-12 bg-red-600 hover:bg-red-700 hover:scale-105 text-white rounded-full text-lg font-black uppercase tracking-widest transition-all shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] flex items-center justify-center gap-3"
                    >
                        Explore Store <ArrowRight size={24} />
                    </button>
                    <button
                        onClick={() => onNavigate('contact')}
                        className="w-full sm:w-auto h-[70px] px-12 bg-zinc-900 border border-zinc-800 hover:border-red-600 hover:text-red-500 hover:scale-105 text-zinc-300 rounded-full text-lg font-black uppercase tracking-widest transition-all"
                    >
                        Get Contact
                    </button>
                </div>
            </div>

            {/* Navigation Arrows (Hidden and desktop) */}
            <button
                onClick={prevSlide}
                className="absolute left-8 top-[40vh] -translate-y-1/2 z-30 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-red-600 transition-all hidden lg:block group"
                aria-label="Previous slide"
            >
                <ChevronLeft size={28} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-8 top-[40vh] -translate-y-1/2 z-30 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-red-600 transition-all hidden lg:block group"
                aria-label="Next slide"
            >
                <ChevronRight size={28} />
            </button>
        </section>
    );
}
