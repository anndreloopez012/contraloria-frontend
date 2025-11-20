
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Download, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize2, Minimize2, Eye, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { secureDownloadPDF, sanitizeFilename } from '@/utils/secureDownload';
import { toast } from 'sonner';

/**
 * Página dedicada para visualizar PDFs
 * Incluye controles de zoom, rotación, descarga y navegación
 */
const PDFViewerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Obtener parámetros de la URL
  const pdfUrl = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'Documento PDF';
  const returnPath = searchParams.get('return') || '/';
  const scrollPosition = parseInt(searchParams.get('scroll') || '0');

  // Estados para controles del PDF
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMethod, setViewMethod] = useState<'iframe' | 'google' | 'direct'>('google');
  const [hasError, setHasError] = useState(false);

  // Restaurar posición de scroll al regresar
  useEffect(() => {
    return () => {
      if (scrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }, 100);
      }
    };
  }, [scrollPosition]);

  const handleBack = () => {
    // Si hay historial previo, regresar a la página anterior
    // Si no hay historial (acceso directo), ir al returnPath o home
    if (window.history.length > 1 && returnPath !== '/') {
      navigate(-1);
    } else {
      navigate(returnPath || '/');
    }
  };

  const handleDownload = async () => {
    try {
      await secureDownloadPDF({
        url: pdfUrl,
        filename: sanitizeFilename(title),
        onError: (error) => {
          console.error('[PDFViewerPage] Error descargando:', error);
          toast.error('No se pudo descargar el PDF. Por favor, inténtelo de nuevo.');
        }
      });
      toast.success('Descarga iniciada correctamente');
    } catch (error) {
      console.error('[PDFViewerPage] Error:', error);
    }
  };

  const handleOpenDirect = () => {
    window.open(pdfUrl, '_blank');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotateLeft = () => {
    setRotation(prev => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation(prev => prev + 90);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleIframeError = () => {
    console.log('Error cargando iframe, intentando con Google Docs Viewer');
    setHasError(true);
  };

  // URLs para diferentes métodos de visualización
  const getViewerUrl = () => {
    switch (viewMethod) {
      case 'google':
        return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
      case 'direct':
        return pdfUrl;
      default:
        return pdfUrl;
    }
  };

  if (!pdfUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">PDF no encontrado</h1>
          <p className="text-muted-foreground mb-6">No se especificó un documento para visualizar.</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Regresar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header con controles */}
      <header className="bg-background/95 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleBack}
                className="hover:bg-accent transition-colors shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Regresar</span>
              </Button>
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm sm:text-lg font-semibold text-foreground line-clamp-1">
                    {title}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Visualizador de documentos PDF
                  </p>
                </div>
              </div>
            </div>

            {/* Controles del PDF */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {!hasError && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="hover:bg-accent h-8 w-8"
                  >
                    <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  
                  <span className="text-xs sm:text-sm text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1 bg-muted rounded hidden xs:inline-block">
                    {Math.round(zoom * 100)}%
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="hover:bg-accent h-8 w-8"
                  >
                    <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>

                  <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-2 hidden sm:block"></div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRotateLeft}
                    className="hover:bg-accent h-8 w-8 hidden xs:flex"
                  >
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRotateRight}
                    className="hover:bg-accent h-8 w-8 hidden xs:flex"
                  >
                    <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>

                  <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-2 hidden sm:block"></div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="hover:bg-accent h-8 w-8 hidden md:flex"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </Button>

                  <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-2 hidden md:block"></div>
                </>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenDirect}
                className="hover:bg-accent h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2">Abrir</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleDownload}
                className="hover:bg-accent h-8 w-8 sm:h-9 sm:w-auto sm:px-3"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-2">Descargar</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor del PDF */}
      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {hasError ? (
            // Mostrar opciones alternativas cuando hay error
            <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center animate-scale-in">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                No se puede mostrar el PDF
              </h2>
              <p className="text-muted-foreground mb-6">
                El servidor no permite mostrar este documento incrustado por razones de seguridad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleOpenDirect} className="bg-primary hover:bg-primary/90">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir en Nueva Ventana
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button 
                  onClick={() => {
                    setViewMethod('google');
                    setHasError(false);
                  }} 
                  variant="outline"
                >
                  Intentar con Google Viewer
                </Button>
              </div>
            </div>
          ) : (
            // Mostrar PDF
            <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-scale-in">
              <div 
                className="pdf-container transition-transform duration-300 ease-in-out"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <iframe
                  src={getViewerUrl()}
                  title={title}
                  className="w-full h-[calc(100vh-180px)] border-0"
                  style={{ minHeight: '600px' }}
                  onError={handleIframeError}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PDFViewerPage;
