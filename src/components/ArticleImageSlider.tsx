
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArticleImage {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
}

interface ArticleImageSliderProps {
  images: ArticleImage[];
  title?: string;
  percentage?: number;
}

const ArticleImageSlider = ({ images, title, percentage = 100 }: ArticleImageSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const preloadImage = useCallback((src: string, index: number) => {
    const img = new Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(index));
    };
    img.src = src;
  }, []);

  useEffect(() => {
    if (images.length > 0) {
      for (let i = 0; i < Math.min(3, images.length); i++) {
        const imageIndex = (currentIndex + i) % images.length;
        if (!loadedImages.has(imageIndex)) {
          preloadImage(images[imageIndex].url, imageIndex);
        }
      }
    }
  }, [currentIndex, images, loadedImages, preloadImage]);

  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  if (images.length === 0) {
    return null;
  }

  const currentImage = images[currentIndex];
  const isCurrentImageLoaded = loadedImages.has(currentIndex);
  const normalizedPercentage = `${Math.min(Math.max(percentage, 1), 100)}%`;

  return (
    <div className="w-full bg-white">
      <div className="max-w-full mx-auto" style={{ width: normalizedPercentage }}>
      <div className="relative w-full bg-gray-900/5 overflow-hidden h-auto rounded-lg">
        <div className="relative w-full h-full flex items-center justify-center">
          {!isCurrentImageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
              <div className="text-white">Cargando...</div>
            </div>
          )}
          <img
            src={currentImage.url}
            alt={currentImage.alternativeText || title || `Imagen ${currentIndex + 1}`}
            className={`block max-w-full w-full h-auto object-contain transition-all duration-500 cursor-default ${
              isCurrentImageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setLoadedImages(prev => new Set(prev).add(currentIndex))}
            draggable={false}
          />
        </div>

        {/* Botones de navegación - Solo si hay más de una imagen */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 hover:opacity-90 transition-all duration-200 z-10 rounded text-white"
              style={{ backgroundColor: '#102D69' }}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:opacity-90 transition-all duration-200 z-10 rounded text-white"
              style={{ backgroundColor: '#102D69' }}
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores de puntos */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 transition-all duration-200 rounded-full ${
                    index === currentIndex
                      ? 'w-8'
                      : 'w-3 hover:opacity-70'
                  }`}
                  style={{ 
                    backgroundColor: index === currentIndex ? '#102D69' : 'rgba(16, 45, 105, 0.5)' 
                  }}
                  aria-label={`Ir a imagen ${index + 1}`}
                />
              ))}
            </div>

            {/* Contador de imágenes */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded text-white text-sm z-10" style={{ backgroundColor: '#102D69' }}>
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}

      </div>
      </div>
    </div>
  );
};

export default ArticleImageSlider;
