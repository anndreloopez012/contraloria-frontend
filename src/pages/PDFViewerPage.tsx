
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, FileText, AlertTriangle, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configurar worker local (sin consultas externas)
(GlobalWorkerOptions as any).workerSrc = pdfjsWorker as any;

const PDFViewerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const pdfUrl = searchParams.get('url') || '';
  const title = searchParams.get('title') || 'Documento PDF';
  const returnPath = searchParams.get('return') || '/';
  const scrollPosition = parseInt(searchParams.get('scroll') || '0');

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);

  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scrollPosition > 0) {
        setTimeout(() => window.scrollTo({ top: scrollPosition, behavior: 'smooth' }), 100);
      }
    };
  }, [scrollPosition]);

  const handleBack = () => {
    if (window.history.length > 1 && returnPath !== '/') {
      navigate(-1);
    } else {
      navigate(returnPath || '/');
    }
  };

  // Renderizar una página específica a imagen
  const renderPage = useCallback(async (pageNum: number, scale: number) => {
    const pdf = pdfDocRef.current;
    if (!pdf) return;
    try {
      const page = await pdf.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current?.clientWidth || 900;
      const baseScale = Math.min((containerWidth - 40) / baseViewport.width, 2);
      const viewport = page.getViewport({ scale: baseScale * scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        await page.render({ canvasContext: context, viewport } as any).promise;
        setPageImage(canvas.toDataURL('image/png'));
      }
    } catch (e) {
      console.error('[PDFViewer] Error renderizando página', e);
    }
  }, []);

  // Cargar PDF
  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;

    const loadPDF = async () => {
      try {
        setLoading(true);
        setHasError(false);
        const loadingTask = getDocument({
          url: pdfUrl,
          disableAutoFetch: false,
          disableStream: false,
          rangeChunkSize: 65536 * 4,
        });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage(1, 1);
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error('[PDFViewer] Error al cargar PDF', e);
          setHasError(true);
          setLoading(false);
        }
      }
    };
    loadPDF();
    return () => { cancelled = true; };
  }, [pdfUrl, renderPage]);

  // Re-renderizar al cambiar página o zoom
  useEffect(() => {
    if (pdfDocRef.current && !loading) {
      renderPage(currentPage, zoom);
    }
  }, [currentPage, zoom, renderPage, loading]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Bloquear clic derecho en el contenedor del PDF
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

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
    <div className="min-h-screen bg-background animate-fade-in flex flex-col select-none" onContextMenu={handleContextMenu}>
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Izquierda: regresar + título */}
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
                <h1 className="text-sm sm:text-lg font-semibold text-foreground line-clamp-1">
                  {title}
                </h1>
              </div>
            </div>

            {/* Derecha: controles de navegación y zoom */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} className="h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground px-1.5 py-0.5 bg-muted rounded whitespace-nowrap">
                {currentPage} / {totalPages}
              </span>
              <Button variant="outline" size="icon" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages} className="h-8 w-8">
                <ChevronRight className="w-4 h-4" />
              </Button>

              <div className="w-px h-4 bg-border mx-1 hidden sm:block" />

              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} disabled={zoom <= 0.5} className="h-8 w-8">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-1 hidden sm:inline">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z + 0.25, 3))} disabled={zoom >= 3} className="h-8 w-8">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenedor del PDF */}
      <main ref={containerRef} className="flex-1 flex items-start justify-center overflow-auto bg-muted/30 p-4">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Cargando documento...</p>
            </div>
          </div>
        )}

        {hasError && !loading && (
          <div className="flex items-center justify-center py-20">
            <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center max-w-md">
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-4">No se puede mostrar el PDF</h2>
              <p className="text-muted-foreground mb-6">Ocurrió un error al cargar el documento.</p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Regresar
              </Button>
            </div>
          </div>
        )}

        {!loading && !hasError && pageImage && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <img
              src={pageImage}
              alt={`Página ${currentPage}`}
              className="max-w-full h-auto pointer-events-none"
              draggable={false}
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default PDFViewerPage;
