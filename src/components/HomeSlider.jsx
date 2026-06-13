import React, { useEffect, useState } from 'react';

const SLIDER_API = '/api/homepage_sliders.php';

export default function HomeSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    fetch(SLIDER_API)
      .then(res => res.json())
      .then(setSlides);
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const id = setInterval(() => {
        setCurrent(c => (c + 1) % slides.length);
      }, 5000);
      setIntervalId(id);
      return () => clearInterval(id);
    }
  }, [slides]);

  if (!slides.length) return null;

  const goTo = idx => {
    setCurrent(idx);
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg bg-white">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
        >
          <div className="flex flex-col md:flex-row items-center h-80 md:h-96">
            <div className="flex-1 flex flex-col justify-center items-start p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
                {slide.title}
              </h2>
              <p className="text-base md:text-lg text-gray-700 mb-4">{slide.description}</p>
              {slide.link && (
                <a href={slide.link} className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded transition">Detaylı Bilgi</a>
              )}
            </div>
            <div className="flex-1 flex justify-center items-center h-full">
              <img src={slide.image_url} alt={slide.title} className="object-contain h-60 md:h-80 w-auto" width="400" height="320" loading={i === 0 ? "eager" : "lazy"} fetchpriority={i === 0 ? "high" : "auto"} />
            </div>
          </div>
        </div>
      ))}
      {/* Slider Kontrolleri */}
      <div className="absolute left-0 right-0 bottom-4 flex justify-center gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full border-2 ${i === current ? 'bg-yellow-500 border-yellow-500' : 'bg-white border-gray-300'} transition`}
            onClick={() => goTo(i)}
            aria-label={`Slider ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 