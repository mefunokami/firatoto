import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

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
        }, 4000);
        return () => clearInterval(interval);
    }, [slides.length]);

    const slide = slides[current];
    const slideLink = slide?.link?.trim();
    const isExternalLink = slideLink && /^https?:\/\//i.test(slideLink);

    const slideImage = (
        <motion.img
            key={slide?.image_url}
            src={slide?.image_url}
            alt={slide?.title || 'İşyeri görseli'}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            loading="lazy"
        />
    );

    return (
        <div className="flex-1">
            <div className="relative w-full h-[370px] bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
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
                {/* Metin katmanı ve siyah filtre tamamen kaldırıldı */}
                {/* Slider kontrol butonları */}
                {slides.length > 1 && (
                    <>
                        <button
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors"
                            onClick={() => setCurrent(p => (p - 1 + slides.length) % slides.length)}
                            aria-label="Önceki"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center z-10 transition-colors"
                            onClick={() => setCurrent(p => (p + 1) % slides.length)}
                            aria-label="Sonraki"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`w-3 h-3 rounded-full ${current === idx ? 'bg-yellow-400' : 'bg-white/60'} border border-white transition-colors`}
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