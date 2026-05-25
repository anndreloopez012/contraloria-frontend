import React, { useEffect } from 'react';
import { useContentAPI } from '@/hooks/useContentAPI';
import { useNavigate } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { navigateWithMenuUrl } from '@/utils/menuNavigation';

const ImageSlider = () => {
  const { sliderImages, isLoading } = useContentAPI();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const navigate = useNavigate();

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Función helper para obtener src seguro
  const getSafeSrc = (image: any) => {
    let src = '';
    if (typeof image === 'string') src = image;
    else if (image?.src) src = image.src;
    else if (image?.url) src = image.url;
    
    if (!src) return '';
    
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    if (src.startsWith('/')) {
      const baseHost = 'https://cgc-adm.server-softplus.plus';
      return `${baseHost}${src}`;
    }
    
    const baseHost = 'https://cgc-adm.server-softplus.plus';
    return `${baseHost}/uploads/${src}`;
  };
  
  // Función helper para obtener alt seguro
  const getSafeAlt = (image: any, index: number) => {
    if (image?.alt) return image.alt;
    if (image?.alternativeText) return image.alternativeText;
    if (image?.title) return image.title;
    if (image?.name) return image.name;
    return `Imagen ${index + 1}`;
  };

  const handleSlideClick = (image: any) => {
    if (!image?.url) return;
    navigateWithMenuUrl(image.url, false, navigate);
  };

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Cargando imágenes...</span>
      </div>
    );
  }

  if (sliderImages.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">No hay imágenes disponibles</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="bg-gray-900">
          {sliderImages.map((image, index) => (
            <CarouselItem key={index} className="relative">
              <div
                className={`relative w-full flex items-center justify-center bg-gray-900 ${image.url ? 'cursor-pointer' : ''}`}
                onClick={() => handleSlideClick(image)}
                role={image.url ? 'link' : undefined}
                tabIndex={image.url ? 0 : -1}
                onKeyDown={(event) => {
                  if (!image.url) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleSlideClick(image);
                  }
                }}
              >
                <img
                  src={getSafeSrc(image)}
                  alt={getSafeAlt(image, index)}
                  className="w-full h-auto object-contain max-h-[70vh]"
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious 
          className="left-4 text-white border-white/20 hover:bg-white/20"
          style={{ backgroundColor: '#102D69' }}
        />
        <CarouselNext 
          className="right-4 text-white border-white/20 hover:bg-white/20"
          style={{ backgroundColor: '#102D69' }}
        />

        {/* Indicadores de puntos */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`h-3 transition-all duration-200 rounded-full ${
                index === current ? 'w-8' : 'w-3 hover:opacity-70'
              }`}
              style={{ 
                backgroundColor: index === current ? '#102D69' : 'rgba(16, 45, 105, 0.5)' 
              }}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>

      {/* Marco decorativo inferior */}
      <img
        src="/lovable-uploads/522cf9b1-e45a-45e8-b704-fd8abf0c817d.png"
        alt="Marco decorativo inferior"
        className="w-full object-cover block"
        loading="lazy"
      />
    </div>
  );
};

export default ImageSlider;
