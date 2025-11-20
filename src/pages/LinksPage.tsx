import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import { fetchContentLinkBySlug, type ContentLinkData } from '@/services/apiServiceContentLink';
import { getImageDominantColor, getTextClasses } from '@/utils/colorUtils';

/**
 * Página para manejar contenido específico por slug con diseño personalizado
 */
const LinksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contentData, setContentData] = useState<ContentLinkData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textClasses, setTextClasses] = useState({
    heading: 'text-gray-900',
    body: 'text-gray-700', 
    muted: 'text-gray-500',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    border: 'border-gray-200',
    overlay: 'bg-white/90'
  });

  useEffect(() => {
    const loadContent = async () => {
      if (!id) {
        setError('No se especificó el slug del contenido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log(`🚀 Cargando contenido para slug: "${id}"`);
        
        const data = await fetchContentLinkBySlug(id);
        
        if (data) {
          setContentData(data);
          console.log('✅ Contenido cargado exitosamente:', data);
          
          // Analizar color de fondo para ajustar textos
          if (data.backgroundImage?.url) {
            try {
              const dominantColor = await getImageDominantColor(data.backgroundImage.url);
              const adaptiveClasses = getTextClasses(dominantColor);
              setTextClasses(adaptiveClasses);
              console.log('🎨 Color dominante detectado:', dominantColor, 'Clases aplicadas:', adaptiveClasses);
            } catch (error) {
              console.warn('⚠️ No se pudo analizar el color de la imagen:', error);
              // Usar clases para fondo oscuro por defecto cuando hay imagen
              setTextClasses({
                heading: 'text-white',
                body: 'text-white/90',
                muted: 'text-white/60',
                button: 'bg-white text-gray-900 hover:bg-white/90',
                border: 'border-white/20',
                overlay: 'bg-black/20'
              });
            }
          } else {
            // Sin imagen de fondo - usar fondo blanco y textos oscuros
            setTextClasses({
              heading: 'text-gray-900',
              body: 'text-gray-700',
              muted: 'text-gray-500',
              button: 'bg-blue-600 hover:bg-blue-700 text-white',
              border: 'border-gray-200',
              overlay: 'bg-white/90'
            });
          }
        } else {
          setError('No se encontró contenido para este enlace');
        }
      } catch (err) {
        console.error('❌ Error al cargar contenido:', err);
        setError('Error al cargar el contenido');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [id]);

  // Función para obtener la mejor imagen según el dispositivo
  const getBestImageUrl = (image?: ContentLinkData['image'], size: 'large' | 'medium' | 'small' = 'large') => {
    if (!image) return '';
    
    // Intentar obtener el formato solicitado, sino usar la imagen original
    if (image.formats && image.formats[size]) {
      return image.formats[size]!.url;
    }
    
    return image.url;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  if (error || !contentData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-bold text-red-800 mb-4">
              Error al cargar contenido
            </h1>
            <p className="text-red-600 mb-6">
              {error || 'No se encontró contenido para este enlace'}
            </p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Imagen de fondo - Solo en desktop y cuando existe */}
      {contentData.backgroundImage && (
        <div 
          className="hidden lg:block absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${getBestImageUrl(contentData.backgroundImage, 'large')})`
          }}
        >
          {/* Overlay adaptivo para mejorar legibilidad */}
          <div className={`absolute inset-0 ${textClasses.overlay}`}></div>
        </div>
      )}

      {/* Fondo blanco cuando no hay imagen o en móvil/tablet */}
      <div className={`${contentData.backgroundImage ? 'lg:hidden' : ''} absolute inset-0 bg-white`}></div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          
          {/* Botón de regreso */}
          <div className="flex justify-start mb-8">
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className={`backdrop-blur-sm transition-colors duration-200 ${
                contentData.backgroundImage 
                  ? 'bg-white/90 hover:bg-white lg:bg-white/20 lg:text-white lg:border-white/30 lg:hover:bg-white/30'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </div>

          {/* Logo CGC arriba del título */}
          <div className="mb-6">
            <img
              src="/lovable-uploads/6f80a8af-c17a-43df-b4ab-facc8aee75ec.png"
              alt="CGC - Contraloría General de Cuentas"
              className="w-full max-w-lg mx-auto h-auto"
              loading="lazy"
            />
          </div>

          {/* Título principal */}
          <div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-2 leading-tight transition-colors duration-200 ${
              contentData.backgroundImage 
                ? `text-gray-900 lg:${textClasses.heading}`
                : textClasses.heading
            }`}>
              {contentData.title}
            </h1>
          </div>

          {/* Botón de enlace externo */}
          <div className="py-4">
            <Button
              onClick={() => window.open(contentData.url, '_blank', 'noopener,noreferrer')}
              className={`${textClasses.button} px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
              size="lg"
            >
              <ExternalLink className="h-5 w-5 mr-3" />
              Visitar Enlace
            </Button>
          </div>

          {/* Descripción */}
          <div className="max-w-xl mx-auto">
            <p className={`text-lg lg:text-xl leading-relaxed font-medium transition-colors duration-200 ${
              contentData.backgroundImage 
                ? `text-gray-700 lg:${textClasses.body}`
                : textClasses.body
            }`}>
              {contentData.description}
            </p>
          </div>

          {/* Imagen del contenido */}
          {contentData.image && (
            <div className="mt-12">
              <div className={`backdrop-blur-sm rounded-2xl p-6 lg:p-8 shadow-xl transition-colors duration-200 ${
                contentData.backgroundImage 
                  ? 'bg-white/90 lg:bg-white/10'
                  : 'bg-gray-50'
              }`}>
                <img
                  src={getBestImageUrl(contentData.image, 'large')}
                  alt={contentData.image.alternativeText || contentData.title}
                  className="w-full max-w-md mx-auto h-auto rounded-lg shadow-lg"
                  loading="lazy"
                />
                {contentData.image.caption && (
                  <p className={`mt-4 text-sm italic transition-colors duration-200 ${
                    contentData.backgroundImage 
                      ? `text-gray-600 lg:${textClasses.muted}`
                      : textClasses.muted
                  }`}>
                    {contentData.image.caption}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className={`mt-16 pt-8 border-t transition-colors duration-200 ${
            contentData.backgroundImage 
              ? `border-gray-200 lg:${textClasses.border}`
              : textClasses.border
          }`}>
            <p className={`text-sm transition-colors duration-200 ${
              contentData.backgroundImage 
                ? `text-gray-500 lg:${textClasses.muted}`
                : textClasses.muted
            }`}>
              Contraloría General de Cuentas - Guatemala
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinksPage;
