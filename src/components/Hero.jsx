import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK_IMAGES = [
    { image_url: '/isyeri6.webp', title: '' },
    { image_url: '/isyeri5.webp', title: '' },
    { image_url: '/isyeri3.webp', title: '' },
    { image_url: '/isyeri4.webp', title: '' },
];

const Hero = ({ small }) => {
    const [current, setCurrent] = useState(0);
    const [slides, setSlides] = useState(FALLBACK_IMAGES);

    useEffect(() => {
        fetch('/api/homepage_sliders.php')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setSlides(data);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000); // 4000'den 5000'e cikardik, daha sakin gecis.
        return () => clearInterval(interval);
    }, [slides.length]);

    const slide = slides[current];
    const slideLink = slide?.link?.trim();
    const isExternalLink = slideLink && /^https?:\/\//i.test(slideLink);

    const slideImage = (
        <>
            <motion.img
                key={slide?.image_url}
                src={slide?.image_url}
                alt={slide?.title || 'Fırat Oto'}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                loading="lazy"
            />
            {/* Soft Gradient Overlay for premium look and text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-0 pointer-events-none" />
        </>
    );

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto md:px-4 mt-4 md:mt-6">
            <div className="relative w-full h-[250px] md:h-[450px] bg-secondary md:rounded-2xl overflow-hidden flex items-center justify-center shadow-soft group">
                <AnimatePresence initial={false}>
                    {slideLink ? (
                        isExternalLink ? (
                            <a href={slideLink} target="_blank" rel="noopener noreferrer" className="absolute inset-0 block">
                                {slideImage}
                            </a>
                        ) : (
                            <Link to={slideLink.startsWith('/') ? slideLink : `/${slideLink}`} className="absolute inset-0 block">
                                {slideImage}
                            </Link>
                        )
                    ) : (
                        slideImage
                    )}
                </AnimatePresence>

                {/* Slider kontrol butonları (Sadece Hover'da belirir) */}
                {slides.length > 1 && (
                    <>
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-10 transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                            onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
                            aria-label="Önceki"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center z-10 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                            onClick={() => setCurrent(p => (p + 1) % slides.length)}
                            aria-label="Sonraki"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        {/* Noktalar */}
                        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                                        current === idx 
                                            ? 'bg-primary w-6 md:w-8' 
                                            : 'bg-white/50 hover:bg-white/80 dark:bg-card/80'
                                    }`}
                                    onClick={() => setCurrent(idx)}
                                    aria-label={`Slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Hero;