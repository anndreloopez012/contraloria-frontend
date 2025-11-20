
/**
 * Componente PDFViewer
 * 
 * Visualizador avanzado de documentos PDF integrado en el sistema.
 * Proporciona una experiencia completa de visualización sin necesidad
 * de salir de la aplicación web.
 * 
 * Características principales:
 * - Visualización de PDFs embebidos con Google Docs Viewer
 * - Modo pantalla completa con toggle
 * - Interfaz responsive y adaptativa
 * - Controles de navegación integrados
 * - Overlay de carga con animaciones
 * - Soporte para múltiples navegadores
 * 
 * Compatibilidad:
 * - React 18+
 * - Tailwind CSS 3+
 * - Lucide React Icons
 * - Shadcn/ui Button Component
 * 
 * @author Sistema de Gestión Documental
 * @version 2.2 - Con Google Docs Viewer para evitar CSP
 * @since 2024-12-01
 */

import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Eye, AlertCircle, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { secureDownloadPDF, sanitizeFilename } from '@/utils/secureDownload';
import { toast } from 'sonner';

/**
 * Props del componente PDFViewer
 */
interface PDFViewerProps {
  /** URL del archivo PDF a visualizar */
  pdfUrl: string;
  /** Título del documento para mostrar en el header */
  title: string;
  /** Estado de visibilidad del modal */
  isOpen: boolean;
  /** Función callback para cerrar el visualizador */
  onClose: () => void;
}

/**
 * Estados internos del visualizador
 */
interface ViewerState {
  isFullscreen: boolean;    // Estado de pantalla completa
  isLoading: boolean;      // Estado de carga del PDF
  hasError: boolean;       // Estado de error en la carga
  loadTimeout: boolean;    // Timeout de carga
  useGoogleViewer: boolean; // Usar Google Docs Viewer como fallback
}

/**
 * Componente principal PDFViewer
 * 
 * @param props - Propiedades del componente
 * @returns JSX.Element | null
 */
const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  title, 
  isOpen, 
  onClose 
}) => {
  // Estados del visualizador
  const [viewerState, setViewerState] = useState<ViewerState>({
    isFullscreen: false,
    isLoading: true,
    hasError: false,
    loadTimeout: false,
    useGoogleViewer: true // Usar Google Docs Viewer por defecto para evitar CSP
  });

  /**
   * Genera URL para Google Docs Viewer
   */
  const getGoogleViewerUrl = (url: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  /**
   * Efecto para manejar el estado de carga del PDF
   * Se ejecuta cuando se abre el modal o cambia la URL
   */
  useEffect(() => {
    if (isOpen && pdfUrl) {
      console.log('[PDFViewer] Iniciando carga de PDF:', pdfUrl);
      
      // Resetear estados al abrir
      setViewerState(prev => ({
        ...prev,
        isLoading: true,
        hasError: false,
        loadTimeout: false,
        useGoogleViewer: true
      }));

      // Timer para timeout de carga
      const loadTimer = setTimeout(() => {
        console.log('[PDFViewer] Timeout de carga alcanzado');
        setViewerState(prev => ({
          ...prev,
          isLoading: false,
          loadTimeout: true
        }));
      }, 8000); // 8 segundos de timeout

      // Cleanup del timer
      return () => clearTimeout(loadTimer);
    }
  }, [isOpen, pdfUrl]);

  /**
   * Efecto para manejar teclas de escape
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        console.log('[PDFViewer] Cerrando con tecla Escape');
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * Abre el PDF en una nueva ventana
   */
  const handleOpenInNewWindow = () => {
    console.log('[PDFViewer] Abriendo PDF en nueva ventana:', pdfUrl);
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  /**
   * Descarga el PDF directamente
   */
  const handleDownload = async () => {
    try {
      await secureDownloadPDF({
        url: pdfUrl,
        filename: sanitizeFilename(title),
        onError: (error) => {
          toast.error('Error al descargar PDF', {
            description: error.message
          });
        }
      });
    } catch (error) {
      console.error('[PDFViewer] Error en descarga:', error);
    }
  };

  /**
   * Alterna el modo pantalla completa
   */
  const toggleFullscreen = () => {
    const newFullscreenState = !viewerState.isFullscreen;
    console.log('[PDFViewer] Cambiando a modo:', newFullscreenState ? 'pantalla completa' : 'ventana');
    
    setViewerState(prev => ({
      ...prev,
      isFullscreen: newFullscreenState
    }));
  };

  /**
   * Maneja el cierre del visualizador
   * Resetea todos los estados y ejecuta callback
   */
  const handleClose = () => {
    console.log('[PDFViewer] Cerrando visualizador');
    
    // Resetear estados
    setViewerState({
      isFullscreen: false,
      isLoading: true,
      hasError: false,
      loadTimeout: false,
      useGoogleViewer: true
    });
    
    // Ejecutar callback de cierre
    onClose();
  };

  /**
   * Maneja eventos del iframe para controlar estados de carga
   */
  const handleIframeLoad = () => {
    console.log('[PDFViewer] PDF cargado exitosamente');
    setViewerState(prev => ({
      ...prev,
      isLoading: false,
      hasError: false
    }));
  };

  const handleIframeError = () => {
    console.error('[PDFViewer] Error al cargar PDF');
    setViewerState(prev => ({
      ...prev,
      isLoading: false,
      hasError: true
    }));
  };

  /**
   * Maneja clics en el overlay para cerrar
   * Solo cierra si se hace clic fuera del contenido
   */
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // No renderizar si no está abierto
  if (!isOpen) {
    return null;
  }

  // Validación de URL
  if (!pdfUrl) {
    console.warn('[PDFViewer] URL de PDF no proporcionada');
    return null;
  }

  // Usar Google Docs Viewer para evitar problemas de CSP
  const iframeUrl = getGoogleViewerUrl(pdfUrl);

  return (
    <div 
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center transition-all duration-300 animate-fade-in ${
        viewerState.isFullscreen ? 'p-0' : 'p-4'
      }`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-viewer-title"
    >
      <div 
        className={`bg-white rounded-lg shadow-2xl flex flex-col transition-all duration-300 animate-scale-in ${
          viewerState.isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-6xl h-[90vh] max-h-[900px]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header del visualizador con controles */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <Eye className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h3 
              id="pdf-viewer-title"
              className="text-lg font-semibold text-gray-900 truncate"
              title={title}
            >
              {title}
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Google Viewer
            </span>
          </div>
          
          {/* Controles del header */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Botón descargar PDF */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="hover:bg-green-50 hover:border-green-300 transition-all duration-300"
              title="Descargar PDF"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>

            {/* Botón abrir en nueva ventana */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewWindow}
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              title="Abrir en nueva ventana"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir
            </Button>
            
            {/* Botón de pantalla completa */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              title={viewerState.isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {viewerState.isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  Ventana
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Pantalla completa
                </>
              )}
            </Button>
            
            {/* Botón de cerrar */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="hover:bg-red-50 hover:border-red-300 transition-all duration-300"
              title="Cerrar visualizador"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contenedor principal del PDF */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {/* Iframe del PDF */}
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title={`Visualizador PDF: ${title}`}
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
          
          {/* Overlay de carga */}
          {viewerState.isLoading && !viewerState.hasError && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center animate-fade-in">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Cargando documento PDF...</p>
                <p className="text-gray-500 text-sm mt-2">
                  Usando Google Docs Viewer...
                </p>
              </div>
            </div>
          )}

          {/* Overlay de error */}
          {viewerState.hasError && (
            <div className="absolute inset-0 bg-white/95 flex items-center justify-center animate-fade-in">
              <div className="text-center max-w-md px-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error al cargar PDF
                </h3>
                <p className="text-gray-600 mb-6">
                  No se pudo cargar el documento PDF. Puedes intentar abrirlo en una nueva ventana.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleOpenInNewWindow}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir en nueva ventana
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con información adicional */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center flex-shrink-0">
          <p className="text-xs text-gray-500">
            Presiona <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">ESC</kbd> para cerrar
            {!viewerState.isFullscreen && (
              <> • Clic fuera del documento para cerrar</>
            )}
            • Visualizando con Google Docs
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
