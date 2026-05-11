import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2, Eye, ChevronLeft, ChevronRight, Download, Copy, Check, File, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchArticleBySlug, Article, ArticleBlock } from '@/services/apiServiceArticles';
import { convertToEmbedUrl } from '@/utils/videoUtils';
import { ContentRenderer } from '@/utils/markdownProcessor';
import ArticleImageSlider from '@/components/ArticleImageSlider';
import { useToast } from '@/hooks/use-toast';
import { useSEOOptimization } from '@/hooks/useSEOOptimization';
import { useGlobalInfo } from '@/hooks/useGlobalInfo';

interface ImageSliderState {
  currentIndex: number;
}

interface VideoSliderState {
  currentIndex: number;
  isPlaying: boolean;
  isModalOpen: boolean;
  modalVideoIndex: number;
}

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { globalInfo } = useGlobalInfo();
  
  // Estados principales
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUrlCopied, setIsUrlCopied] = useState(false);

  // Estados para manejo de sliders - solo imágenes simplificado
  const [imageSliders, setImageSliders] = useState<{[key: string]: ImageSliderState}>({});
  const [videoSliders, setVideoSliders] = useState<{[key: string]: VideoSliderState}>({});

  // Generar descripción SEO basada en el artículo
  const generateDescription = (article: Article | null): string => {
    if (!article) return 'Información oficial de la Contraloría General de Cuentas de Guatemala';
    
    // Si hay SEO description, usarla (max 160 caracteres)
    if (article.seo?.metaDescription) {
      return article.seo.metaDescription.substring(0, 160);
    }
    
    // Si hay descripción del artículo, usarla
    if (article.description) {
      return article.description.substring(0, 160);
    }
    
    // Descripción por defecto
    return `${article.title} - Artículo de la Contraloría General de Cuentas de Guatemala`;
  };

  // Generar keywords basadas en el artículo
  const generateKeywords = (article: Article | null): string => {
    const baseKeywords = 'Contraloría General de Cuentas, CGC Guatemala, auditoría gubernamental, fiscalización';
    
    if (!article) return baseKeywords;
    
    const titleKeywords = article.title?.toLowerCase() || '';
    const categoryKeywords = article.category?.name?.toLowerCase() || '';
    const seoKeywords = article.seo?.keywords || '';
    
    return `${titleKeywords}, ${categoryKeywords}, ${seoKeywords}, ${baseKeywords}`;
  };

  // Optimización SEO dinámica
  useSEOOptimization({
    title: article?.seo?.metaTitle || 
           (article?.title 
             ? `${article.title} | ${globalInfo?.siteName || 'CGC Guatemala'}`
             : `${globalInfo?.siteName || 'CGC Guatemala'} - Artículos`),
    description: generateDescription(article),
    keywords: generateKeywords(article),
    canonical: article?.seo?.canonicalURL || `${window.location.origin}${window.location.pathname}`,
    ogImage: article?.image?.formats?.large?.url ||
             article?.image?.url ||
             globalInfo?.favicon?.url,
    structuredData: article ? {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.seo?.metaTitle || article.title,
      "description": generateDescription(article),
      "image": article.image ? (article.image.formats?.large?.url || article.image.url) : undefined,
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt,
      "author": article.author && article.author.length > 0 ? {
        "@type": "Person",
        "name": article.author[0].name
      } : {
        "@type": "Organization",
        "name": globalInfo?.siteName || "Contraloría General de Cuentas"
      },
      "publisher": {
        "@type": "GovernmentOrganization",
        "name": globalInfo?.siteName || "Contraloría General de Cuentas",
        "url": window.location.origin
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    } : undefined
  });

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) {
        setError('No se proporcionó un slug válido');
        setIsLoading(false);
        return;
      }

      console.log('[ArticleDetailPage] Iniciando carga de artículo para slug:', slug);
      setIsLoading(true);
      setError(null);
      
      try {
        const articleData = await fetchArticleBySlug(slug);
        
        if (articleData) {
          console.log('[ArticleDetailPage] Artículo cargado exitosamente:', articleData.title);
          setArticle(articleData);
        } else {
          console.log('[ArticleDetailPage] No se encontró artículo para el slug:', slug);
          setError(`No se encontró el artículo: ${slug}`);
        }
      } catch (err) {
        console.error('[ArticleDetailPage] Error al cargar artículo:', err);
        setError('Error al cargar el artículo desde el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  const handleBackToArticles = () => {
    navigate('/articulos');
  };

  const handleViewPDF = (pdfUrl: string, title: string) => {
    // Navegar a la página PDF viewer con parámetros
    const params = new URLSearchParams({
      url: pdfUrl,
      title: title,
      return: `/articulos/${slug}`,
      scroll: window.scrollY.toString()
    });
    
    navigate(`/pdf-viewer?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (article: Article): string => {
    if (article.image) {
      return article.image.formats?.large?.url || 
             article.image.formats?.medium?.url || 
             article.image.url;
    }
    return '/lovable-uploads/be6267fe-c26a-4dd8-bdc3-95323c6a0fd7.png'; // fallback
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

  // Image slider functions simplificadas
  const getImageSliderState = (itemId: string): ImageSliderState => {
    return imageSliders[itemId] || { currentIndex: 0 };
  };

  const updateImageSliderState = (itemId: string, updates: Partial<ImageSliderState>) => {
    setImageSliders(prev => ({
      ...prev,
      [itemId]: { ...getImageSliderState(itemId), ...updates }
    }));
  };

  // Video slider functions (mantener igual)
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

  const handleShare = async () => {
    if (!article) return;

    const shareData = {
      title: article.title,
      text: article.description || article.title,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported (mainly on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast({
          title: "Compartido exitosamente",
          description: "El artículo ha sido compartido.",
        });
      } else if (navigator.share) {
        // Fallback for browsers that support share but not canShare
        await navigator.share(shareData);
        toast({
          title: "Compartido exitosamente",
          description: "El artículo ha sido compartido.",
        });
      } else {
        // Desktop fallback: try to copy to clipboard first
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Enlace copiado",
            description: "El enlace se ha copiado al portapapeles. Puedes pegarlo en cualquier aplicación.",
          });
        } catch (clipboardError) {
          // Final fallback: show share options manually
          const shareText = `${article.title}\n\n${shareData.text}\n\n${window.location.href}`;
          
          // Try to open mail client
          const mailtoLink = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(shareText)}`;
          window.open(mailtoLink, '_blank');
          
          toast({
            title: "Cliente de correo abierto",
            description: "Se ha abierto tu cliente de correo para compartir el artículo.",
          });
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
      
      // Ultimate fallback: try different sharing methods
      try {
        const shareText = `${article.title}\n\n${shareData.text}\n\n${window.location.href}`;
        
        // Try WhatsApp Web (works on both mobile and desktop)
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        
        toast({
          title: "WhatsApp abierto",
          description: "Se ha abierto WhatsApp para compartir el artículo.",
        });
      } catch (fallbackError) {
        toast({
          title: "Error al compartir",
          description: "No se pudo compartir el artículo. Usa el botón 'Copiar URL' como alternativa.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsUrlCopied(true);
      
      toast({
        title: "URL copiada",
        description: "El enlace del artículo se ha copiado al portapapeles.",
      });

      // Reset icon after 2 seconds
      setTimeout(() => {
        setIsUrlCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el enlace. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const renderPDFContent = (block: ArticleBlock) => {
    const buttonColor = block.color_bottom || '#072B5A';
    const normalizedPercentage = `${Math.min(Math.max(Number(block.percentage) || 100, 1), 100)}%`;
    
    return (
      <div className="p-6 transition-all duration-200 animate-fade-in h-full bg-white rounded-lg shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {block.title}
          </h3>

          {block.pdfImage && (
            <div className="flex justify-center mb-4">
              <div className="max-w-full" style={{ width: normalizedPercentage }}>
                <img
                  src={block.pdfImage.url}
                  alt={block.pdfImage.alternativeText || block.title}
                  className="block max-w-full w-full h-auto object-contain rounded"
                />
              </div>
            </div>
          )}
          
          {block.description && (
            <div className="text-sm leading-relaxed mb-4">
              <ContentRenderer content={block.description} className="text-sm [&_*]:text-muted-foreground" />
            </div>
          )}
        </div>

        {block.pdf && block.pdf.length > 0 && (
          <div className="flex gap-3">
            <Button
              className="flex-1 transition-colors duration-200"
              style={{ backgroundColor: buttonColor }}
              size="sm"
              onClick={() => handleViewPDF(block.pdf[0].url, block.title)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ver Documento
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="transition-colors duration-200"
              onClick={async () => {
                const { secureDownloadPDF, sanitizeFilename } = await import('@/utils/secureDownload');
                const { toast } = await import('sonner');
                
                try {
                  await secureDownloadPDF({
                    url: block.pdf[0].url,
                    filename: sanitizeFilename(block.title),
                    onError: (error) => {
                      console.error('[ArticleDetailPage] Error descargando:', error);
                      toast.error('No se pudo descargar el PDF. Por favor, inténtelo de nuevo.');
                    }
                  });
                  toast.success('Descarga iniciada correctamente');
                } catch (error) {
                  console.error('[ArticleDetailPage] Error:', error);
                }
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderImageContent = (block: ArticleBlock) => {
    if (!block.image) return null;

    // Normalize image to always be an array
    const images = Array.isArray(block.image) ? block.image : [block.image];
    
    if (images.length === 0) return null;
    
    return (
      <div className="py-6 transition-all duration-200 animate-fade-in-up h-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {block.title}
          </h3>
        </div>

        <ArticleImageSlider images={images} title={block.title} percentage={block.percentage || 100} />
      </div>
    );
  };

  const renderVideoContent = (block: ArticleBlock) => {
    return (
      <div className="py-6 transition-all duration-200 animate-fade-in-up h-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {block.title}
          </h3>
        </div>

        <div className="h-64 relative group rounded-lg overflow-hidden">
          {block.iframe ? (
            <iframe
              src={convertToEmbedUrl(block.iframe.url)}
              title={block.title}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : block.video ? (
            <video
              src={block.video}
              controls
              className="w-full h-full rounded-lg object-cover"
            />
          ) : null}
        </div>
      </div>
    );
  };

  const renderRichTextContent = (block: ArticleBlock) => {
    return (
      <div className="py-6 transition-all duration-200 animate-fade-in-up h-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {block.title}
          </h3>
        </div>

        <div className="mb-6">
          <ContentRenderer 
            content={block.content || ''} 
            className="prose-strong:font-bold prose-em:italic"
          />
        </div>
      </div>
    );
  };

  const renderAudioContent = (block: ArticleBlock) => {
    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up h-full flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {block.title}
          </h3>
        </div>

        {block.description && (
          <div className="text-sm leading-relaxed mb-4">
            <ContentRenderer content={block.description} className="text-sm [&_*]:text-muted-foreground" />
          </div>
        )}

        <div className="flex items-center justify-center mb-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-8">
          <Music className="w-16 h-16 text-primary" />
        </div>

        {block.file && (
          <div className="mb-4">
            <audio 
              controls 
              className="w-full"
              src={block.file.url}
            >
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        )}
      </div>
    );
  };

  const renderMediaContent = (block: ArticleBlock) => {
    const handleDownload = async () => {
      if (block.file?.url) {
        const { secureDownloadPDF, sanitizeFilename } = await import('@/utils/secureDownload');
        const { toast } = await import('sonner');
        
        try {
          await secureDownloadPDF({
            url: block.file.url,
            filename: sanitizeFilename(block.file.name || block.title || 'archivo'),
            onError: (error) => {
              toast.error('Error al descargar archivo', {
                description: error.message
              });
            }
          });
        } catch (error) {
          console.error('[ArticleDetailPage] Error en descarga:', error);
        }
      }
    };

    return (
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up h-full flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {block.title}
          </h3>
        </div>

        {block.mediaImage && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={block.mediaImage}
              alt={block.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {block.description && (
          <div className="text-sm leading-relaxed mb-4">
            <ContentRenderer content={block.description} className="text-sm [&_*]:text-muted-foreground" />
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <File className="w-4 h-4" />
              {block.file?.ext?.toUpperCase()} 
              {block.file?.size && ` • ${(block.file.size / 1024 / 1024).toFixed(1)} MB`}
            </span>
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

  const renderBlock = (block: ArticleBlock) => {
    switch (block.__component) {
      case 'shared.pdf':
        return renderPDFContent(block);
      case 'shared.image':
        return renderImageContent(block);
      case 'shared.video':
        return renderVideoContent(block);
      case 'shared.rich-text':
        return renderRichTextContent(block);
      case 'shared.audio':
        return renderAudioContent(block);
      case 'shared.media':
        return renderMediaContent(block);
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Cargando artículo...</p>
          <p className="text-muted-foreground text-sm mt-2">Obteniendo la información más reciente</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in max-w-md mx-auto p-8">
          <div className="bg-amber-100 border-2 border-amber-300 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Artículo no encontrado</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {error || 'El artículo que buscas no está disponible en este momento.'}
          </p>
          <Button onClick={handleBackToArticles}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Artículos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botón de regreso */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={handleBackToArticles}
            className="transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Artículos
          </Button>
        </div>

        {/* Header del artículo */}
        <div className="mb-8">
          {/* Imagen principal */}
          <div className="relative h-64 md:h-96 overflow-hidden rounded-lg mb-6">
            <img
              src={getImageUrl(article)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Categoría en la imagen - Fixed to handle single category object */}
            {article.category && (
              <div className="absolute top-4 left-4">
                <span 
                  className="px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded"
                >
                  {article.category.name}
                </span>
              </div>
            )}
          </div>

          {/* Título y metadatos */}
          <h1 className="text-4xl font-bold text-foreground mb-4">{article.title}</h1>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {article.description}
          </p>

          {/* Metadatos */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-8">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(article.publishedAt)}
            </div>
            {article.author && article.author.length > 0 && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {article.author.map(author => author.name).join(', ')}
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              {isUrlCopied ? (
                <Check className="w-4 h-4 mr-2 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {isUrlCopied ? 'Copiado' : 'Copiar URL'}
            </Button>
          </div>
        </div>

        {/* Contenido del artículo */}
        {article.block && article.block.length > 0 && (
          <div className="flex flex-wrap justify-center items-start gap-6 w-full animate-fade-in">
            {article.block.map((block) => (
              <div 
                key={block.id} 
                className={`${getFlexWidthClass(block.col || 12)} animate-fade-in`}
              >
                {renderBlock(block)}
              </div>
            ))}
          </div>
        )}

        {/* Sin contenido disponible */}
        {(!article.block || article.block.length === 0) && (
          <div className="text-center py-12 animate-fade-in">
            <div className="bg-muted border-2 border-border rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-3">
              Contenido en desarrollo
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              El contenido de este artículo está siendo preparado. Por favor, vuelve más tarde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
