import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sliderImages = [
    '/isyeri6.webp',
    '/isyeri5.webp',
    '/isyeri3.webp',
    '/isyeri4.webp',
];

const Hero = ({ small }) => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % sliderImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-1">
            <div className="relative w-full h-[370px] bg-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
                <AnimatePresence initial={false}>
                    <motion.img
                        key={sliderImages[current]}
                        src={sliderImages[current]}
                        alt="İşyeri görseli"
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        loading="lazy"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-black/30"></div>
                <motion.div 
                    className="relative text-center text-white p-4 md:p-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <p className="mt-2 text-base md:text-lg max-w-2xl drop-shadow-md">Aracınız için en iyi yedek parçalar bir tık uzağınızda.</p>
                </motion.div>
                {/* Slider kontrol butonları */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {sliderImages.map((_, idx) => (
                        <button
                            key={idx}
                            className={`w-3 h-3 rounded-full ${current === idx ? 'bg-yellow-400' : 'bg-white/60'} border border-white`}
                            onClick={() => setCurrent(idx)}
                            aria-label={`Slide ${idx+1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hero;