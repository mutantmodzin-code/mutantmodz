import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getMediaUrl, getApiUrl } from '../utils/url';

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
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const apiUrl = getApiUrl();
                const res = await fetch(`${apiUrl}/hero`);
                const data = await res.json();
                
                // Ensure data is an array before filtering
                const slidesArray = Array.isArray(data) ? data : [];
                const activeSlides = slidesArray.filter((s: any) => s.is_active);
                
                setSlides(activeSlides);

                // PERFORMANCE BOOST: Eagerly pre-load all hero images into browser cache instantly 
                // after the API resolves, so they don't wait for React hydration/animations.
                activeSlides.forEach((slide: Slide) => {
                    if (slide.image_url) {
                        const img = new Image();
                        img.src = getMediaUrl(slide.image_url);
                    }
                });
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

    if (loading) return <div className="aspect-[16/9] sm:h-[60vh] bg-black flex items-center justify-center"><div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (slides.length === 0) return null;

    return (
        <section className="relative w-full overflow-hidden bg-black">
            {/* 1. Main Banner Image Area (Force Full Width) */}
            <div className="relative aspect-[16/9] sm:h-[75vh] md:h-[80vh] w-full overflow-hidden">
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
                            {...({ fetchpriority: "high" } as any)}
                            src={getMediaUrl(slides[current].image_url)}
                            alt={slides[current].title_red || 'Hero Banner'}
                            loading="eager"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-1000 scale-100 sm:scale-105"
                        />
                        {/* Enhanced Gradient Overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/50" />
                    </motion.div>
                </AnimatePresence>

                {/* Content - Hero Text Overlay */}
                <div className="relative z-20 h-full flex items-center justify-center px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center w-full max-w-5xl"
                    >
                        <h1 className="text-3xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black text-white leading-[0.85] tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                            {slides[current].title_white}
                            {slides[current].title_red && (
                                <span className="block text-red-600 filter drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] mt-1 sm:mt-0">
                                    {slides[current].title_red}
                                </span>
                            )}
                        </h1>
                        <p className="mt-4 sm:mt-8 text-zinc-300 text-[9px] sm:text-lg md:text-xl font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] max-w-2xl mx-auto opacity-90 drop-shadow-md">
                            {slides[current].subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > current ? 1 : -1);
                                setCurrent(index);
                            }}
                            className={cn(
                                "h-1 transition-all duration-700 rounded-full",
                                current === index ? "w-8 sm:w-16 bg-red-600" : "w-3 sm:w-6 bg-white/30 hover:bg-white/50"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* 2. Primary CTA Space - Relocated Below Banner Image */}
            <div className="bg-zinc-950 border-b border-white/5 py-10 sm:py-20 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => onNavigate('products')}
                        className="w-full sm:w-[280px] h-14 sm:h-[70px] px-8 sm:px-12 bg-red-600 hover:bg-red-700 hover:scale-[1.02] text-white rounded-2xl sm:rounded-full text-xs sm:text-lg font-black uppercase tracking-widest transition-all shadow-2xl shadow-red-600/30 flex items-center justify-center gap-3 active:scale-95"
                    >
                        Explore Store <ArrowRight size={20} />
                    </button>
                    <button
                        onClick={() => onNavigate('contact')}
                        className="w-full sm:w-[280px] h-14 sm:h-[70px] px-8 sm:px-12 bg-zinc-900 border border-white/10 hover:border-red-600 hover:text-red-500 hover:scale-[1.02] text-zinc-300 rounded-2xl sm:rounded-full text-xs sm:text-lg font-black uppercase tracking-widest transition-all active:scale-95"
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
