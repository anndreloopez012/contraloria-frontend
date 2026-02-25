import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Search, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, X, Maximize, File, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchPageContent, ContentItem, PageContent } from '@/services/apiServicePages';
import { convertToEmbedUrl } from '@/utils/videoUtils';
import { ContentRenderer } from '@/utils/markdownProcessor';
import PDFPageFlip from '@/components/PDFPageFlip';
import { useSEOOptimization } from '@/hooks/useSEOOptimization';
import { useGlobalInfo } from '@/hooks/useGlobalInfo';

interface ImageSliderState {
  currentIndex: number;
  isModalOpen: boolean;
  modalImageIndex: number;
  zoomLevel: number;
  imagePosition: { x: number; y: number };
}

interface VideoSliderState {
  currentIndex: number;
  isPlaying: boolean;
  isModalOpen: boolean;
  modalVideoIndex: number;
}

const extractSlugFromPath = (section: string | undefined): string => {
  if (!section) return 'historia';
  
  const parts = section.split('/');
  const slug = parts[parts.length - 1];
  
  console.log('[MenuPage] Extrayendo slug de:', section, '-> resultado:', slug);
  return slug;
};

const MenuPage = () => {
  const { section } = useParams<{ section: string }>();
  const navigate = useNavigate();
  const { globalInfo } = useGlobalInfo();
  
  // Estados principales
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para manejo de sliders (quitamos los estados del PDF viewer)
  const [imageSliders, setImageSliders] = useState<{[key: string]: ImageSliderState}>({});
  const [videoSliders, setVideoSliders] = useState<{[key: string]: VideoSliderState}>({});

  // Generar descripción SEO basada en el contenido
  const generateDescription = (content: PageContent | null): string => {
    if (!content) return 'Información oficial de la Contraloría General de Cuentas de Guatemala';
    
    // Si hay descripción del contenido, usarla
    if (content.description) {
      return String(content.description).substring(0, 160);
    }
    
    // Si hay contenido, usar el primer elemento con descripción
    const contentWithDesc = content.content?.find(item => item.description);
    
    if (contentWithDesc?.description) {
      return String(contentWithDesc.description).substring(0, 160);
    }
    
    // Descripción por defecto
    return `${content.title} - Información oficial de la Contraloría General de Cuentas de Guatemala`;
  };

  // Generar keywords basadas en el contenido
  const generateKeywords = (content: PageContent | null): string => {
    const baseKeywords = 'Contraloría General de Cuentas, CGC Guatemala, auditoría gubernamental, fiscalización';
    
    if (!content) return baseKeywords;
    
    const titleKeywords = content.title?.toLowerCase() || '';
    const sectionKeywords = section?.replace(/\//g, ', ').replace(/-/g, ' ') || '';
    
    return `${titleKeywords}, ${sectionKeywords}, ${baseKeywords}`;
  };

  // Optimización SEO dinámica
  useSEOOptimization({
    title: pageContent?.seo?.metaTitle || 
           (pageContent?.title 
             ? `${pageContent.title} | ${globalInfo?.siteName || 'CGC Guatemala'}`
             : `${globalInfo?.siteName || 'CGC Guatemala'} - Información Oficial`),
    description: pageContent?.seo?.metaDescription || generateDescription(pageContent),
    keywords: generateKeywords(pageContent),
    canonical: `${window.location.origin}${window.location.pathname}`,
    ogImage: pageContent?.seo?.shareImage ||
             pageContent?.content?.find(item => item.type === 'image')?.images?.[0]?.src || 
             globalInfo?.favicon?.url,
    structuredData: pageContent ? {
      "@context": "https://schema.org",
      "@type": "GovernmentService",
      "name": pageContent.seo?.metaTitle || pageContent.title,
      "description": pageContent.seo?.metaDescription || generateDescription(pageContent),
      "provider": {
        "@type": "GovernmentOrganization",
        "name": globalInfo?.siteName || "Contraloría General de Cuentas",
        "url": window.location.origin
      },
      "serviceType": "Información Gubernamental",
      "areaServed": {
        "@type": "Country",
        "name": "Guatemala"
      },
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": window.location.href,
        "serviceType": "Online"
      },
      ...(pageContent.content && pageContent.content.length > 0 && {
        "hasPart": pageContent.content
          .filter(item => item.type === 'pdf')
          .slice(0, 5)
          .map(item => ({
            "@type": "DigitalDocument",
            "name": item.title,
            "description": item.description,
            "encodingFormat": "application/pdf",
            "url": item.url
          }))
      })
    } : undefined
  });

  useEffect(() => {
    const loadPageContent = async () => {
      console.log('[MenuPage] Iniciando carga de contenido para sección:', section);
      setIsLoading(true);
      setError(null);
      
      try {
        const slug = extractSlugFromPath(section);
        console.log('[MenuPage] Consultando API real para slug:', slug);
        
        const content = await fetchPageContent(slug);
        
        if (content) {
          console.log('[MenuPage] Contenido cargado exitosamente desde API real:', content.title);
          console.log('[MenuPage] Elementos de contenido:', content.content?.length || 0);
          setPageContent(content);
          setSelectedCategory('Todos');

          // Validar si solo hay un PDF sin ningún otro contenido
          const safeContent = content.content || [];
          const pdfItems = safeContent.filter(item => item && typeof item === 'object' && item.type === 'pdf');
          const nonPdfItems = safeContent.filter(item => item && typeof item === 'object' && item.type !== 'pdf');

          // Caso 2: Solo un PDF y nada más → Redirigir automáticamente al visualizador
          if (pdfItems.length === 1 && nonPdfItems.length === 0) {
            console.log('[MenuPage] Solo un PDF sin otro contenido, redirigiendo automáticamente...');
            const pdfItem = pdfItems[0];
            const params = new URLSearchParams({
              url: String(pdfItem.url || ''),
              title: String(pdfItem.title || 'Documento PDF'),
              return: window.location.pathname,
              scroll: '0'
            });
            navigate(`/pdf-viewer?${params.toString()}`, { replace: true });
          }
        } else {
          console.log('[MenuPage] No se encontró contenido para el slug:', slug);
          setError(`No se encontró contenido para la sección: ${slug}`);
        }
      } catch (err) {
        console.error('[MenuPage] Error al cargar contenido desde API real:', err);
        setError('Error al cargar el contenido desde el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageContent();
  }, [section, navigate]);

  // Validación y separación segura del contenido
  const safeContent = pageContent?.content || [];
  
  // Ordenar todo el contenido por el campo order
  const sortedContent = [...safeContent].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const nonPdfContent = sortedContent
    .filter(item => item && typeof item === 'object' && item.type !== 'pdf');
  
  const pdfContent = sortedContent
    .filter(item => item && typeof item === 'object' && item.type === 'pdf');

  // Extraer categorías de los PDFs - nueva estructura del API
  const extractCategoriesFromPDF = (item: ContentItem): string[] => {
    if (!item || typeof item !== 'object') return [];
    
    // Verificar si existe la propiedad category y es un array
    if (item.category && Array.isArray(item.category)) {
      return item.category
        .filter(cat => cat && typeof cat === 'object' && cat.title)
        .map(cat => String(cat.title));
    }
    
    return [];
  };

  // Función para obtener todas las categorías únicas de los PDFs
  const getAllPDFCategories = (): string[] => {
    const allCategories = new Set<string>();
    
    pdfContent.forEach(item => {
      const categories = extractCategoriesFromPDF(item);
      categories.forEach(cat => allCategories.add(cat));
    });
    
    return Array.from(allCategories);
  };

  const pdfCategories = ['Todos', ...getAllPDFCategories()];

  // Detectar versiones disponibles en los PDFs basándose en las descripciones
  const detectPDFVersions = (): string[] => {
    const versions = new Set<string>();
    const versionKeywords = [
      'Versión Contraloría General de Cuentas',
      'Versión Arte Final',
      'Versión Diario de Centroamérica'
    ];

    pdfContent.forEach(item => {
      const description = String(item.description || '');
      versionKeywords.forEach(version => {
        if (description.includes(version)) {
          versions.add(version);
        }
      });
    });

    return Array.from(versions);
  };

  const availableVersions = detectPDFVersions();

  const getVersionColor = (version: string): string | undefined => {
    if (version.includes('Diario de Centroamérica')) return '#0075bf';
    if (version.includes('Contraloría General de Cuentas')) return '#0075bf';
    if (version.includes('Arte Final')) return '#878787';
    return undefined;
  };

  const getVersionFromDescription = (description: string): string | null => {
    const knownVersions = [
      'Versión Contraloría General de Cuentas',
      'Versión Arte Final',
      'Versión Diario de Centroamérica'
    ];

    const matchedVersion = knownVersions.find(version => description.includes(version));
    return matchedVersion || null;
  };

  // Establecer versión por defecto cuando se detectan versiones
  useEffect(() => {
    if (availableVersions.length > 0 && selectedVersion === null) {
      // Si existe "Versión Contraloría General de Cuentas", usarla como predeterminada
      if (availableVersions.includes('Versión Contraloría General de Cuentas')) {
        setSelectedVersion('Versión Contraloría General de Cuentas');
      } else {
        // Si no, usar la primera versión disponible
        setSelectedVersion(availableVersions[0]);
      }
    } else if (availableVersions.length === 0 && selectedVersion !== null) {
      // Si no hay versiones disponibles, resetear
      setSelectedVersion(null);
    }
  }, [availableVersions.length, pdfContent.length]);

  const filteredPdfContent = pdfContent.filter(item => {
    if (!item || typeof item !== 'object') return false;
    
    // Obtener categorías del item actual
    const itemCategories = extractCategoriesFromPDF(item);
    
    // Verificar si coincide con la categoría seleccionada
    const matchesCategory = selectedCategory === 'Todos' || 
                           itemCategories.includes(selectedCategory);
    
    // Verificar si coincide con la versión seleccionada (si hay versiones disponibles)
    const description = String(item.description || '');
    const matchesVersion = !selectedVersion || description.includes(selectedVersion);
    
    // Verificar si coincide con el término de búsqueda
    const title = String(item.title || '');
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesVersion && matchesSearch;
  });

  const filteredNonPdfContent = nonPdfContent.filter(item => item && typeof item === 'object');

  const handleViewPDF = (item: ContentItem) => {
    if (!item || typeof item !== 'object') return;
    console.log('[MenuPage] Navegando a visualizador PDF:', item.title);
    
    // Obtener posición actual de scroll
    const currentScrollY = window.scrollY;
    
    // Navegar a la página del visualizador PDF con parámetros
    const params = new URLSearchParams({
      url: String(item.url || ''),
      title: String(item.title || 'Documento PDF'),
      return: window.location.pathname,
      scroll: currentScrollY.toString()
    });
    
    navigate(`/pdf-viewer?${params.toString()}`);
  };

  const handleDownloadPDF = async (item: ContentItem) => {
    if (!item || typeof item !== 'object' || !item.url) return;
    
    const { secureDownloadPDF, sanitizeFilename } = await import('@/utils/secureDownload');
    const { toast } = await import('sonner');
    
    console.log('[MenuPage] Iniciando descarga PDF:', item.title);
    try {
      await secureDownloadPDF({
        url: String(item.url),
        filename: sanitizeFilename(String(item.title || 'documento')),
        onError: (error) => {
          console.error('[MenuPage] Error descargando:', error);
          toast.error('No se pudo descargar el PDF. Por favor, inténtelo de nuevo.');
        }
      });
      toast.success('Descarga iniciada correctamente');
    } catch (error) {
      console.error('[MenuPage] Error:', error);
    }
  };

  // Image slider functions
  const getImageSliderState = (itemId: string): ImageSliderState => {
    return imageSliders[itemId] || {
      currentIndex: 0,
      isModalOpen: false,
      modalImageIndex: 0,
      zoomLevel: 1,
      imagePosition: { x: 0, y: 0 }
    };
  };

  const updateImageSliderState = (itemId: string, updates: Partial<ImageSliderState>) => {
    setImageSliders(prev => ({
      ...prev,
      [itemId]: { ...getImageSliderState(itemId), ...updates }
    }));
  };

  const nextImageSlide = (itemId: string, totalImages: number) => {
    const current = getImageSliderState(itemId).currentIndex;
    updateImageSliderState(itemId, {
      currentIndex: current === totalImages - 1 ? 0 : current + 1
    });
  };

  const prevImageSlide = (itemId: string, totalImages: number) => {
    const current = getImageSliderState(itemId).currentIndex;
    updateImageSliderState(itemId, {
      currentIndex: current === 0 ? totalImages - 1 : current - 1
    });
  };

  const openImageModal = (itemId: string, imageIndex: number) => {
    updateImageSliderState(itemId, {
      isModalOpen: true,
      modalImageIndex: imageIndex,
      zoomLevel: 1,
      imagePosition: { x: 0, y: 0 }
    });
  };

  const closeImageModal = (itemId: string) => {
    updateImageSliderState(itemId, {
      isModalOpen: false,
      zoomLevel: 1,
      imagePosition: { x: 0, y: 0 }
    });
  };

  // Video slider functions
  const getVideoSliderState = (itemId: string): VideoSliderState => {
    return videoSliders[itemId] || {
      currentIndex: 0,
      isPlaying: true,
      isModalOpen: false,
      modalVideoIndex: 0
    };
  };

  const updateVideoSliderState = (itemId: string, updates: Partial<VideoSliderState>) => {
    setVideoSliders(prev => ({
      ...prev,
      [itemId]: { ...getVideoSliderState(itemId), ...updates }
    }));
  };

  const nextVideoSlide = (itemId: string, totalVideos: number) => {
    const current = getVideoSliderState(itemId).currentIndex;
    updateVideoSliderState(itemId, {
      currentIndex: current === totalVideos - 1 ? 0 : current + 1
    });
  };

  const prevVideoSlide = (itemId: string, totalVideos: number) => {
    const current = getVideoSliderState(itemId).currentIndex;
    updateVideoSliderState(itemId, {
      currentIndex: current === 0 ? totalVideos - 1 : current - 1
    });
  };

  const openVideoModal = (itemId: string, videoIndex: number) => {
    updateVideoSliderState(itemId, {
      isModalOpen: true,
      modalVideoIndex: videoIndex
    });
  };

  const closeVideoModal = (itemId: string) => {
    updateVideoSliderState(itemId, {
      isModalOpen: false
    });
  };

  const renderPDFContent = (item: ContentItem) => {
    if (!item || typeof item !== 'object') return null;
    
    // Obtener categorías del PDF
    const itemCategories = extractCategoriesFromPDF(item);
    const itemDescription = String(item.description || '');
    const detectedVersion = getVersionFromDescription(itemDescription);
    const versionColor = detectedVersion ? getVersionColor(detectedVersion) : undefined;
    const buttonColor = versionColor || item.buttonColor || '#072B5A';
    
    return (
      <div className="p-6 transition-all duration-200 animate-fade-in h-full bg-white rounded-lg shadow-sm border border-border">
        {item.thumbnail && (
          <div className="relative h-48 w-full overflow-hidden group mb-4 rounded-lg">
            <img
              src={String(item.thumbnail)}
              alt={String(item.title || '')}
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded">
                {String(item.subtype || 'PDF')}
              </span>
            </div>
            
            {item.size && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded">
                  {String(item.size)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
            {String(item.title || '')}
          </h3>
          <img 
            src="/lovable-uploads/61d9626e-e3c2-4b14-b4e7-7069de2e0ecc.png" 
            alt="Decorative border" 
            className="w-full h-2 object-cover mb-4"
          />
          
          {/* Imagen del PDF centrada debajo del título */}
          {item.pdfImage && (
            <div className="flex justify-center mb-4">
              <img
                src={item.pdfImage}
                alt={String(item.title || '')}
                className="max-w-full h-auto max-h-32 object-contain rounded"
              />
            </div>
          )}
          
          {item.description && (
            <div className="text-sm leading-relaxed mb-4">
              <ContentRenderer content={String(item.description)} className="text-sm [&_*]:text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          {itemCategories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {itemCategories.map((category, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-muted text-foreground font-medium rounded text-xs"
                >
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground mb-4">
          Actualizado: {String(item.lastUpdated || '')}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleViewPDF(item)}
            className="flex-1 transition-colors duration-200"
            style={{ backgroundColor: buttonColor }}
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Documento
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDownloadPDF(item)}
            size="sm"
            className="transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderImageContent = (item: ContentItem) => {
    if (!item || typeof item !== 'object') return null;
    
    const sliderState = getImageSliderState(String(item.id));
    const isMultipleImages = item.images && Array.isArray(item.images) && item.images.length > 1;
    
    if (!item.images || !Array.isArray(item.images) || item.images.length === 0) return null;

    return (
      <div className="py-6 transition-all duration-200 animate-fade-in-up h-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {String(item.title || '')}
          </h3>
        </div>

        <div className="relative mb-6">
          {isMultipleImages ? (
            <div className="relative w-full overflow-hidden rounded-lg">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${sliderState.currentIndex * 100}%)` }}
              >
                {item.images.map((image, index) => (
                  <div key={image.id} className="w-full flex-shrink-0 relative group">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-auto object-contain cursor-pointer"
                      onClick={() => openImageModal(item.id, index)}
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={() => prevImageSlide(item.id, item.images!.length)}
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => nextImageSlide(item.id, item.images!.length)}
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {item.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => updateImageSliderState(item.id, { currentIndex: index })}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === sliderState.currentIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full relative group rounded-lg overflow-hidden">
              <img
                src={item.images[0].src}
                alt={item.images[0].alt}
                className="w-full h-auto object-contain cursor-pointer"
                onClick={() => openImageModal(item.id, 0)}
              />
            </div>
          )}
        </div>

        {sliderState.isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 animate-fade-in">
            <div className="absolute inset-0 flex items-center justify-center p-0">
              <div 
                className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <img
                  src={item.images![sliderState.modalImageIndex].src}
                  alt={item.images![sliderState.modalImageIndex].alt}
                  className="w-full h-full object-contain transition-transform duration-200 select-none"
                  style={{
                    transform: `scale(${sliderState.zoomLevel}) translate(${sliderState.imagePosition.x / sliderState.zoomLevel}px, ${sliderState.imagePosition.y / sliderState.zoomLevel}px)`,
                    cursor: sliderState.zoomLevel > 1 ? 'grab' : 'default'
                  }}
                  draggable={false}
                />
              </div>
              
              <Button
                onClick={() => closeImageModal(item.id)}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full z-10"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                <Button
                  onClick={() => updateImageSliderState(item.id, { zoomLevel: Math.min(sliderState.zoomLevel + 0.25, 3) })}
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full"
                  disabled={sliderState.zoomLevel >= 3}
                >
                  <ZoomIn className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => updateImageSliderState(item.id, { zoomLevel: Math.max(sliderState.zoomLevel - 0.25, 0.5) })}
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full"
                  disabled={sliderState.zoomLevel <= 0.5}
                >
                  <ZoomOut className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => updateImageSliderState(item.id, { zoomLevel: 1, imagePosition: { x: 0, y: 0 } })}
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              {item.images!.length > 1 && (
                <>
                  <Button
                    onClick={() => {
                      const newIndex = sliderState.modalImageIndex === 0 ? item.images!.length - 1 : sliderState.modalImageIndex - 1;
                      updateImageSliderState(item.id, { modalImageIndex: newIndex, zoomLevel: 1, imagePosition: { x: 0, y: 0 } });
                    }}
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>

                  <Button
                    onClick={() => {
                      const newIndex = sliderState.modalImageIndex === item.images!.length - 1 ? 0 : sliderState.modalImageIndex + 1;
                      updateImageSliderState(item.id, { modalImageIndex: newIndex, zoomLevel: 1, imagePosition: { x: 0, y: 0 } });
                    }}
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-4 right-4 text-center z-10">
                <h3 className="text-white text-xl font-semibold drop-shadow-lg">
                  {item.images![sliderState.modalImageIndex].title}
                </h3>
                <div className="text-white/70 text-sm mt-1">
                  {sliderState.zoomLevel > 1 && "Arrastra para mover la imagen"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVideoContent = (item: ContentItem) => {
    if (!item || typeof item !== 'object') return null;
    
    const sliderState = getVideoSliderState(String(item.id));
    const isMultipleVideos = item.videos && Array.isArray(item.videos) && item.videos.length > 1;
    
    if (!item.videos || !Array.isArray(item.videos) || item.videos.length === 0) return null;

    return (
      <div className="py-6 transition-all duration-200 animate-fade-in-up h-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {String(item.title || '')}
          </h3>
          <img 
            src="/lovable-uploads/61d9626e-e3c2-4b14-b4e7-7069de2e0ecc.png" 
            alt="Decorative border" 
            className="w-full h-2 object-cover mb-4"
          />
        </div>

        <div className="relative mb-6">
          {isMultipleVideos ? (
            <div className="relative">
              <div className="h-64 relative group rounded-lg overflow-hidden">
                {item.videos[sliderState.currentIndex].type === 'iframe' ? (
                  <iframe
                    src={convertToEmbedUrl(item.videos[sliderState.currentIndex].src)}
                    title={item.videos[sliderState.currentIndex].title}
                    className="w-full h-full rounded-lg"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <video
                    src={item.videos[sliderState.currentIndex].src}
                    controls
                    className="w-full h-full rounded-lg object-cover"
                    poster={item.videos[sliderState.currentIndex].thumbnail}
                  />
                )}
                
                <Button
                  onClick={() => openVideoModal(item.id, sliderState.currentIndex)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={() => prevVideoSlide(item.id, item.videos!.length)}
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <Button
                onClick={() => nextVideoSlide(item.id, item.videos!.length)}
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {item.videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => updateVideoSliderState(item.id, { currentIndex: index })}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === sliderState.currentIndex ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute top-2 left-2 right-2">
                <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                  {item.videos[sliderState.currentIndex].title}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 relative group rounded-lg overflow-hidden">
              {item.videos[0].type === 'iframe' ? (
                <iframe
                  src={convertToEmbedUrl(item.videos[0].src)}
                  title={item.videos[0].title}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <video
                  src={item.videos[0].src}
                  controls
                  className="w-full h-full rounded-lg object-cover"
                  poster={item.videos[0].thumbnail}
                />
              )}
              
              <Button
                onClick={() => openVideoModal(item.id, 0)}
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm hover:bg-black/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Actualizado: {item.lastUpdated}</span>
        </div>

        {sliderState.isModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 animate-fade-in">
            <div className="absolute inset-0 flex items-center justify-center p-0">
              <div className="relative w-full h-full">
                {item.videos![sliderState.modalVideoIndex].type === 'iframe' ? (
                  <iframe
                    src={convertToEmbedUrl(item.videos![sliderState.modalVideoIndex].src)}
                    title={item.videos![sliderState.modalVideoIndex].title}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={item.videos![sliderState.modalVideoIndex].src}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                    poster={item.videos![sliderState.modalVideoIndex].thumbnail}
                  />
                )}
              </div>
              
              <Button
                onClick={() => closeVideoModal(item.id)}
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full z-10"
              >
                <X className="w-6 h-6" />
              </Button>

              {item.videos!.length > 1 && (
                <>
                  <Button
                    onClick={() => {
                      const newIndex = sliderState.modalVideoIndex === 0 ? item.videos!.length - 1 : sliderState.modalVideoIndex - 1;
                      updateVideoSliderState(item.id, { modalVideoIndex: newIndex });
                    }}
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>

                  <Button
                    onClick={() => {
                      const newIndex = sliderState.modalVideoIndex === item.videos!.length - 1 ? 0 : sliderState.modalVideoIndex + 1;
                      updateVideoSliderState(item.id, { modalVideoIndex: newIndex });
                    }}
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-4 right-4 text-center z-10">
                <h3 className="text-white text-xl font-semibold drop-shadow-lg">
                  {item.videos![sliderState.modalVideoIndex].title}
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContentType = (item: ContentItem) => {
    if (!item || typeof item !== 'object') return null;
    
    return (
      <div className="py-6 transition-all duration-200 animate-fade-in-up h-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {String(item.title || '')}
          </h3>
          <img 
            src="/lovable-uploads/61d9626e-e3c2-4b14-b4e7-7069de2e0ecc.png" 
            alt="Decorative border" 
            className="w-full h-2 object-cover mb-4"
          />
        </div>

        <div className="mb-6">
          <ContentRenderer 
            content={String(item.content || '')} 
            className="prose-strong:font-bold prose-em:italic"
          />
        </div>
      </div>
    );
  };

  const renderMediaContent = (item: ContentItem) => {
    if (!item || typeof item !== 'object') return null;

    const handleDownload = async () => {
      if (item.fileUrl) {
        const { secureDownloadPDF, sanitizeFilename } = await import('@/utils/secureDownload');
        const { toast } = await import('sonner');
        
        try {
          await secureDownloadPDF({
            url: item.fileUrl,
            filename: sanitizeFilename(item.fileName || item.title || 'archivo'),
            onError: (error) => {
              toast.error('Error al descargar archivo', {
                description: error.message
              });
            }
          });
        } catch (error) {
          console.error('[MenuPage] Error en descarga:', error);
        }
      }
    };

    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up h-full flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {String(item.title || '')}
          </h3>
          <img 
            src="/lovable-uploads/61d9626e-e3c2-4b14-b4e7-7069de2e0ecc.png" 
            alt="Decorative border" 
            className="w-full h-2 object-cover mb-4"
          />
        </div>

        {item.mediaImage && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={item.mediaImage} 
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {item.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {String(item.description)}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <File className="w-4 h-4" />
              {String(item.fileType).toUpperCase()} {item.fileSize && `• ${item.fileSize}`}
            </span>
            <span>Actualizado: {item.lastUpdated}</span>
          </div>

          <Button
            onClick={handleDownload}
            className="w-full"
            variant="default"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Archivo
          </Button>
        </div>
      </div>
    );
  };

  const renderAudioContent = (item: ContentItem) => {
    if (!item || typeof item !== 'object') return null;
    
    if (!item.audios || !Array.isArray(item.audios) || item.audios.length === 0) return null;

    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up h-full flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {String(item.title || '')}
          </h3>
          <img 
            src="/lovable-uploads/61d9626e-e3c2-4b14-b4e7-7069de2e0ecc.png" 
            alt="Decorative border" 
            className="w-full h-2 object-cover mb-4"
          />
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {String(item.description)}
          </p>
        )}

        <div className="flex items-center justify-center mb-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8">
          <Music className="w-16 h-16 text-primary" />
        </div>

        <div className="mb-4">
          <audio 
            controls 
            className="w-full"
            src={item.audios[0].src}
          >
            Tu navegador no soporta el elemento de audio.
          </audio>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Audio MP3</span>
          <span>Actualizado: {item.lastUpdated}</span>
        </div>
      </div>
    );
  };

  // Helper para generar las clases CSS basado en col para sistema flexible centrado
  const getFlexWidthClass = (col: number) => {
    // Sistema de 12 columnas usando flexbox centrado
    // Móvil: siempre full width
    // Tablet (md): elementos grandes=12, medianos=6, pequeños proporcional
    // Desktop (lg): valor original de col
    switch(col) {
      case 12: return 'w-full';
      case 6: return 'w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(50%-0.75rem)]';
      case 4: return 'w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]';
      case 3: return 'w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]';
      case 8: return 'w-full md:w-full lg:w-[calc(66.667%-0.5rem)]';
      case 9: return 'w-full md:w-full lg:w-[calc(75%-0.375rem)]';
      case 2: return 'w-full md:w-[calc(33.333%-1rem)] lg:w-[calc(16.667%-1.25rem)]';
      case 1: return 'w-full md:w-[calc(25%-1.125rem)] lg:w-[calc(8.333%-1.375rem)]';
      case 5: return 'w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(41.667%-0.875rem)]';
      case 7: return 'w-full md:w-full lg:w-[calc(58.333%-0.625rem)]';
      case 10: return 'w-full md:w-full lg:w-[calc(83.333%-0.25rem)]';
      case 11: return 'w-full md:w-full lg:w-[calc(91.667%-0.125rem)]';
      default: return `w-full lg:w-[calc(${(col/12)*100}%-0.75rem)]`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Cargando contenido desde el servidor...</p>
          <p className="text-muted-foreground text-sm mt-2">Obteniendo la información más reciente</p>
        </div>
      </div>
    );
  }

  if (error || !pageContent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in max-w-md mx-auto p-8">
          <div className="bg-muted border-2 border-border rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Contenido en construcción</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Esta sección está siendo actualizada con nueva información. Por favor, inténtalo de nuevo más tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Contenido de la página */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">{String(pageContent.title || '')}</h1>
          <p className="text-muted-foreground max-w-4xl mx-auto">{String(pageContent.description || '')}</p>
        </div>

        {/* CONTENIDO NO-PDF CON FLEXBOX CENTRADO */}
        {filteredNonPdfContent.length > 0 && (
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex flex-wrap justify-center items-start gap-6 w-full">
              {filteredNonPdfContent.map((item) => {
                if (!item || typeof item !== 'object') return null;
                
                return (
                  <div 
                    key={String(item.id)} 
                    className={`${getFlexWidthClass(Number(item.col) || 12)} animate-fade-in`}
                  >
                    {item.type === 'image' && renderImageContent(item)}
                    {item.type === 'video' && renderVideoContent(item)}
                    {item.type === 'content' && renderContentType(item)}
                    {item.type === 'media' && renderMediaContent(item)}
                    {item.type === 'audio' && renderAudioContent(item)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Caso 3: Un solo PDF con otro contenido → Mostrar con PageFlip (sin filtros) */}
        {pdfContent.length === 1 && nonPdfContent.length > 0 && (
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <PDFPageFlip 
              pdfUrl={String(pdfContent[0].url || '')} 
              title={String(pdfContent[0].title || 'Documento PDF')}
            />
          </div>
        )}

        {/* BARRA DE BÚSQUEDA Y FILTROS (SOLO SI HAY MÚLTIPLES PDFs) */}
        {pdfContent.length > 1 && (
          <div className="mb-6 bg-background/50 backdrop-blur-sm border border-border rounded-lg p-3 shadow-sm animate-fade-in" style={{ animationDelay: '300ms' }}>
            {/* Búsqueda */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar documentos PDF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border bg-background rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Filtros por versión (si existen versiones) */}
            {availableVersions.length > 0 && (
              <div className="mb-3">
                <label className="text-xs font-semibold text-foreground mb-2 block">
                  Filtrar por versión:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableVersions.map((version) => {
                    const color = getVersionColor(version);
                    const isSelected = selectedVersion === version;
                    return (
                      <Button
                        key={version}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedVersion(version)}
                        className={`h-8 px-3 text-xs font-medium transition-all duration-200 ${
                          isSelected ? 'shadow-sm text-white' : 'hover:bg-muted'
                        }`}
                        style={isSelected && color ? { backgroundColor: color, borderColor: color } : undefined}
                      >
                        {version}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtros por categoría */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block">
                Filtrar por categoría:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {pdfCategories.map((category) => (
                  <Button
                    key={String(category)}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(String(category))}
                    className={`h-7 px-3 text-xs font-medium transition-all duration-200 ${
                      selectedCategory === category 
                        ? 'shadow-sm' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    {String(category)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PDF CON FLEXBOX CENTRADO (SOLO SI HAY MÚLTIPLES PDFs) */}
        {pdfContent.length > 1 && filteredPdfContent.length > 0 && (
          <div className="flex flex-wrap justify-center items-start gap-6 w-full animate-fade-in" style={{ animationDelay: '500ms' }}>
            {filteredPdfContent.map((item) => {
              if (!item || typeof item !== 'object') return null;
              
              return (
                <div 
                  key={String(item.id)} 
                  className={`${getFlexWidthClass(Number(item.col) || 12)} animate-fade-in`}
                >
                  {renderPDFContent(item)}
                </div>
              );
            })}
          </div>
        )}

        {/* Mensaje cuando no hay resultados DE PDFS (SOLO SI HAY MÚLTIPLES PDFs) */}
        {pdfContent.length > 1 && filteredPdfContent.length === 0 && (
          <div className="text-center py-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="bg-muted border-2 border-border rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-3">
              No se encontraron documentos PDF
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              No hay documentos PDF que coincidan con tu búsqueda. Intenta con otros términos o explora otras categorías.
            </p>
          </div>
        )}

        {/* Mensaje cuando no hay contenido en absoluto */}
        {filteredNonPdfContent.length === 0 && pdfContent.length === 0 && (
          <div className="text-center py-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="bg-muted border-2 border-border rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-3">
              Contenido en construcción
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Esta sección está siendo actualizada con nueva información. Por favor, inténtalo de nuevo más tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
