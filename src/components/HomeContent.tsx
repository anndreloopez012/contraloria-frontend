
import React, { useEffect, useState } from 'react';
import ImageSlider from './ImageSlider';
import { useContentAPI } from '@/hooks/useContentAPI';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { fetchOnlineServices, type OnlineServiceItem } from '@/services/apiServiceOnline';
import { useIsMobile } from '@/hooks/use-mobile';
import LevelMenu from './LevelMenu';
import HomeContentLoader from './HomeContentLoader';
import { ContentRenderer } from '@/utils/markdownProcessor';
import SocialMediaEmbeds from './SocialMediaEmbeds';

/**
 * Componente HomeContent con masonry layout que respeta alturas fijas
 * 
 * Alturas: col 1-5 = 150px, col 6-12 = 400px
 * Sistema de posicionamiento que evita superposiciones
 * Responsive: oculta col 6+ en móvil/tablet, 3 por fila en tablet, 2 por fila en móvil
 */

const HomeContent = () => {
  const { homeIntroData, isLoading } = useContentAPI();
  const [onlineServices, setOnlineServices] = useState<OnlineServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [masonryItems, setMasonryItems] = useState<(OnlineServiceItem & { x: number, y: number })[]>([]);
  const [contentReady, setContentReady] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Detectar tamaño de pantalla usando una sola fuente de verdad
  const getScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) {
      return 'mobile';
    } else if (width < 1024) {
      return 'tablet';
    }
    return 'desktop';
  };

  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>(getScreenSize);

  // Actualizar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const newSize = getScreenSize();
      setScreenSize(newSize);
      console.log('📱 Tamaño de pantalla detectado:', newSize, 'Ancho:', window.innerWidth);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Cargar servicios sin caché
  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);
      try {
        localStorage.removeItem('cgc_online_services_cache');
        const services = await fetchOnlineServices();
        console.log('🔄 Servicios cargados:', services);
        setOnlineServices(services);
      } catch (error) {
        console.error('❌ Error al cargar servicios:', error);
        setOnlineServices([]);
      }
      setServicesLoading(false);
    };

    loadServices();
  }, []);

  // Marcar contenido como listo cuando todo esté cargado
  useEffect(() => {
    if (!isLoading && !servicesLoading) {
      const timer = setTimeout(() => {
        setContentReady(true);
      }, 300); // Pequeño delay para suavizar la transición
      return () => clearTimeout(timer);
    }
  }, [isLoading, servicesLoading]);

  // Función para obtener altura fija
  const getItemHeight = (col: number) => {
    return col >= 6 && col <= 12 ? 400 : 150;
  };

  // Filtrar servicios según el tamaño de pantalla - CORREGIDO
  const getFilteredServices = () => {
    console.log('🔍 Filtrando servicios para pantalla:', screenSize);
    console.log('📋 Total servicios antes del filtro:', onlineServices.length);
    
    if (screenSize === 'mobile' || screenSize === 'tablet') {
      // En móvil y tablet, solo mostrar servicios con col <= 5
      const filtered = onlineServices.filter(service => service.col <= 5);
      console.log('✅ Servicios filtrados para', screenSize, ':', filtered.length);
      return filtered;
    }
    
    console.log('💻 Mostrando todos los servicios para desktop:', onlineServices.length);
    return onlineServices;
  };

  // Algoritmo de masonry responsive - MEJORADO
  useEffect(() => {
    console.log('🔄 Recalculando layout masonry para:', screenSize);
    
    const filteredServices = getFilteredServices();
    if (filteredServices.length === 0) {
      console.log('⚠️ No hay servicios para mostrar');
      return;
    }

    console.log('🎯 Servicios a posicionar:', filteredServices.map(s => ({ nombre: s.nombre, col: s.col })));

    const containerWidth = 100; // 100% del contenedor
    const itemsWithPositions: (OnlineServiceItem & { x: number, y: number })[] = [];
    
    // Configuración de columnas según el tamaño de pantalla
    let totalColumns = 12;
    let itemsPerRow = 12;
    
    if (screenSize === 'mobile') {
      totalColumns = 2;
      itemsPerRow = 2;
    } else if (screenSize === 'tablet') {
      totalColumns = 3;
      itemsPerRow = 3;
    }
    
    console.log('📐 Configuración de layout:', { totalColumns, itemsPerRow, screenSize });
    
    // Mantener registro de las alturas ocupadas en cada columna
    const columnHeights = new Array(totalColumns).fill(0);

    filteredServices.forEach((item, index) => {
      let itemWidth = 1; // Por defecto, cada item ocupa 1 columna en responsive
      
      if (screenSize === 'desktop') {
        itemWidth = Math.max(1, Math.min(12, item.col));
      }
      
      const itemHeight = getItemHeight(item.col);
      
      console.log(`🎯 Procesando ${item.nombre}: ancho=${itemWidth}cols, altura=${itemHeight}px, pantalla=${screenSize}`);
      
      let bestPosition = { col: 0, height: Infinity };
      
      if (screenSize === 'desktop') {
        // Lógica original para desktop
        for (let startCol = 0; startCol <= 12 - itemWidth; startCol++) {
          const maxHeightInRange = Math.max(...columnHeights.slice(startCol, startCol + itemWidth));
          if (maxHeightInRange < bestPosition.height) {
            bestPosition = { col: startCol, height: maxHeightInRange };
          }
        }
        
        // Actualizar las alturas de todas las columnas ocupadas
        for (let col = bestPosition.col; col < bestPosition.col + itemWidth; col++) {
          columnHeights[col] = bestPosition.height + itemHeight;
        }
        
        itemsWithPositions.push({
          ...item,
          x: (bestPosition.col / 12) * containerWidth,
          y: bestPosition.height
        });
      } else {
        // Lógica responsive para móvil y tablet
        const colIndex = index % totalColumns;
        const currentHeight = columnHeights[colIndex];
        
        columnHeights[colIndex] = currentHeight + itemHeight + 16; // 16px de gap
        
        itemsWithPositions.push({
          ...item,
          x: (colIndex / totalColumns) * containerWidth,
          y: currentHeight
        });
      }
    });

    console.log('🚀 Posiciones finales:', itemsWithPositions.map(item => ({
      nombre: item.nombre,
      col: item.col,
      altura: getItemHeight(item.col),
      x: item.x,
      y: item.y,
      pantalla: screenSize
    })));

    setMasonryItems(itemsWithPositions);
  }, [onlineServices, screenSize]); // Dependencia corregida

  const handleServiceClick = (blank: boolean, url: string | null, slug: string) => {
    if (blank && url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (!blank && slug) {
      navigate(`/${slug}`);
      return;
    }
    console.log('ℹ️ Servicio sin acción definida');
  };

  // Mostrar loader mientras carga
  if (!contentReady) {
    return <HomeContentLoader />;
  }

  return (
    <div className={`bg-white min-h-screen transition-opacity duration-500 ${contentReady ? 'opacity-100' : 'opacity-0'}`}>
      {/* Slider */}
      <section className="animate-fade-in">
        <div className="w-full">
          <ImageSlider />
        </div>
      </section>

      {/* Header Image o título de Servicios en Línea */}
      <section className="w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
        {homeIntroData?.headerImage ? (
          <div className="w-full">
            <img
              src={homeIntroData.headerImage.formats?.large || homeIntroData.headerImage.src}
              alt={homeIntroData.headerImage.alt}
              title={homeIntroData.headerImage.title}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-block">
              <h2 className="text-3xl font-bold text-blue-900 mb-3">SERVICIOS EN LÍNEA</h2>
              <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            </div>
          </div>
        )}
      </section>

      {/* Descripción */}
      {homeIntroData?.description && (
        <section className="w-full py-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <ContentRenderer 
                content={homeIntroData.description}
                className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-800 font-light tracking-wide prose-p:text-gray-800 prose-strong:text-gray-900 prose-strong:font-semibold"
              />
            </div>
          </div>
        </section>
      )}

      {/* Servicios en línea - Masonry Layout Responsive */}
      {masonryItems && masonryItems.length > 0 && (
        <section className="w-full animate-fade-in" style={{ animationDelay: '600ms' }}>
          {/* Calcular altura total del contenedor */}
          {(() => {
            const maxY = Math.max(...masonryItems.map(item => item.y + getItemHeight(item.col)));
            console.log('📏 Altura total del contenedor:', maxY + 16);
            
            return (
              <div className="relative w-full" style={{ height: `${maxY + 16}px` }}>
                {masonryItems.map((item, index) => {
                  let widthPercentage = (item.col / 12) * 100;
                  
                  // Ajustar ancho según el tamaño de pantalla
                  if (screenSize === 'mobile') {
                    widthPercentage = 50; // 2 por fila
                  } else if (screenSize === 'tablet') {
                    widthPercentage = 33.333; // 3 por fila
                  }
                  
                  const itemHeight = getItemHeight(item.col);
                  const isInteractive = item.col <= 5; // Solo columnas 1-5 son interactivas
                    
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className="absolute"
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}px`,
                        width: `${widthPercentage}%`,
                        height: `${itemHeight}px`,
                      }}
                    >
                      {isInteractive ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => handleServiceClick(item.blank, item.url, item.slug)}
                              className="group relative w-full h-full bg-white transition-all duration-300 flex items-center justify-center overflow-hidden block border-0 p-0"
                              aria-label={item.nombre}
                              title={item.nombre}
                            >
                              {/* Efecto hover con degradado radial animado */}
                              <div className="absolute inset-0 bg-gradient-radial from-blue-200 via-blue-100 via-60% to-white opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform scale-0 group-hover:scale-150 origin-center"></div>
                              
                              <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
                                {item.logoUrl ? (
                                  <img
                                    src={item.logoUrl}
                                    alt={item.logoAlt}
                                    className="max-w-full max-h-full object-contain transition-colors duration-300"
                                    loading="lazy"
                                    style={{
                                      maxWidth: screenSize === 'mobile' ? '80%' : screenSize === 'tablet' ? '85%' : '100%',
                                      maxHeight: screenSize === 'mobile' ? '80%' : screenSize === 'tablet' ? '85%' : '100%',
                                      width: 'auto',
                                      height: 'auto',
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <span className={`text-gray-600 text-center font-medium px-4 ${
                                      screenSize === 'mobile' ? 'text-xs' : screenSize === 'tablet' ? 'text-sm' : 'text-sm'
                                    }`}>{item.nombre}</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{item.nombre}</span>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        /* Elemento no interactivo para columnas 6+ */
                        <div className="relative w-full h-full bg-white flex items-center justify-center overflow-hidden">
                          <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt={item.logoAlt}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-gray-600 text-center font-medium px-4 text-sm">{item.nombre}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}

      {/* Marco decorativo superior para Level Menu */}
      <div className="w-full animate-fade-in" style={{ animationDelay: '750ms' }}>
        <img
          src="/lovable-uploads/582131e8-907a-4e9d-b30d-e0842c778174.png"
          alt="Marco decorativo superior"
          className="w-full h-auto object-cover block"
          loading="lazy"
        />
      </div>

      {/* Level Menu con fondo personalizado */}
      <div className="animate-fade-in" style={{ animationDelay: '800ms', backgroundColor: '#0C2D69' }}>
        <LevelMenu />
        {/* Cintillo blanco CGC en la parte inferior */}
        <div className="w-full pb-[10px]">
          <img 
            src="/lovable-uploads/5b557e87-5018-4741-8991-1a1a27558793.png" 
            alt="Cintillo blanco CGC" 
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Sección de Redes Sociales */}
      <div className="animate-fade-in" style={{ animationDelay: '1000ms' }}>
        <SocialMediaEmbeds />
      </div>
    </div>
  );
};

export default HomeContent;
