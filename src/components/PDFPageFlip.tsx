import React, { useRef, useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
// @ts-ignore - Vite loads worker as URL
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configurar el worker de PDF.js (ESM worker)
(GlobalWorkerOptions as any).workerSrc = pdfjsWorker as any;

interface PDFPageFlipProps {
  pdfUrl: string;
  title: string;
}

interface PageProps {
  children?: React.ReactNode;
  pageNumber?: number;
}

// Componente para cada página del libro
const Page = React.forwardRef<HTMLDivElement, PageProps>((props, ref) => {
  return (
    <div ref={ref} className="page-wrapper bg-white shadow-lg">
      {props.children}
    </div>
  );
});
Page.displayName = 'Page';

const PDFPageFlip: React.FC<PDFPageFlipProps> = ({ pdfUrl, title }) => {
  const bookRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const cacheRef = useRef<Map<number, string>>(new Map());

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [pageBitmaps, setPageBitmaps] = useState<(string | null)[]>([]);
  const isMobile = useIsMobile();

  const renderPage = async (pageNum: number) => {
    if (cacheRef.current.has(pageNum)) return;
    const pdf = pdfDocRef.current;
    if (!pdf) return;
    try {
      const page = await pdf.getPage(pageNum);
      const baseViewport = page.getViewport({ scale: 1 });
      const desiredWidth = isMobile ? 700 : 1100;
      const scale = Math.min(2, desiredWidth / baseViewport.width);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (context) {
        await (page.render({ canvasContext: context, viewport } as any).promise);
        const dataUrl = canvas.toDataURL('image/png');
        cacheRef.current.set(pageNum, dataUrl);
        setPageBitmaps(prev => {
          const count = pdfDocRef.current?.numPages || prev.length || totalPages || 0;
          const arr = (prev.length === count && count > 0) ? [...prev] : Array(count).fill(null);
          arr[pageNum - 1] = dataUrl;
          return arr;
        });
      }
    } catch (e) {
      console.error('Error renderizando página', e);
    }
  };

  // Cargar el PDF con pdf.js y prerender páginas iniciales
  useEffect(() => {
    let cancelled = false;
    const loadPDF = async () => {
      try {
        setLoading(true);
        setPdfError(false);
        cacheRef.current.clear();
        const loadingTask = getDocument({ url: pdfUrl });
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setPageBitmaps(Array(pdf.numPages).fill(null));
        // Pre-render primeras páginas
        const primes = [1, 2, 3, 4].filter(n => n <= pdf.numPages);
        await Promise.all(primes.map(n => renderPage(n)));
        if (!cancelled) setLoading(false);
      } catch (e) {
        if (!cancelled) {
          console.error('Error al cargar el PDF', e);
          setPdfError(true);
          setLoading(false);
        }
      }
    };
    loadPDF();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, isMobile]);


  const ensurePagesForIndex = (idx: number) => {
    const candidates = new Set<number>();
    const p = idx;
    if (p >= 1 && p <= totalPages) candidates.add(p);
    if (!isMobile && p + 1 <= totalPages) candidates.add(p + 1);
    if (p - 1 >= 1) candidates.add(p - 1);
    if (!isMobile && p + 2 <= totalPages) candidates.add(p + 2);
    candidates.forEach(n => renderPage(n));
  };

  const handlePageFlip = (e: any) => {
    const idx = e.data as number;
    setCurrentPage(idx);
    ensurePagesForIndex(idx);
  };

  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 2));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (pdfError) {
    return (
      <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg" style={{ height: '600px' }}>
        <div className="text-center">
          <X className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Error al cargar el PDF</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Controles */}
      <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={zoom >= 2}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <X className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Visor del libro */}
      <div 
        className="flex items-center justify-center p-4 md:p-8 bg-muted/30 overflow-hidden relative" 
        style={{ height: isFullscreen ? 'calc(100vh - 160px)' : isMobile ? '500px' : '700px' }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <div 
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {/* @ts-ignore - react-pageflip types are incomplete */}
          <HTMLFlipBook
            ref={bookRef}
            width={isMobile ? 280 : 420}
            height={isMobile ? 400 : 580}
            size="stretch"
            minWidth={isMobile ? 250 : 380}
            maxWidth={isMobile ? 320 : 480}
            minHeight={isMobile ? 360 : 520}
            maxHeight={isMobile ? 440 : 640}
            showCover={true}
            flippingTime={600}
            usePortrait={isMobile}
            startPage={0}
            drawShadow={true}
            onFlip={handlePageFlip}
            mobileScrollSupport={true}
            swipeDistance={30}
            showPageCorners={true}
            disableFlipByClick={false}
            useMouseEvents={true}
            clickEventForward={true}
            style={{ margin: '0 auto' }}
            className="pdf-flip-book"
          >
            {/* Portada */}
            <Page>
              <div className="flex items-center justify-center p-6 md:p-8 h-full border border-border">
                <div className="text-center">
                  <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                  <div className="w-full h-px bg-border my-4" />
                  <p className="text-sm text-gray-600">Documento PDF</p>
                  <p className="text-xs text-gray-500 mt-2">{totalPages} páginas</p>
                  <p className="text-xs text-gray-400 mt-4">
                    Desliza o usa los botones para navegar
                  </p>
                </div>
              </div>
            </Page>

            {/* Páginas del PDF renderizadas con pdf.js */}
            {Array.from({ length: totalPages }).map((_, index) => (
              <Page key={index} pageNumber={index + 1}>
                <div className="w-full h-full border border-border overflow-hidden bg-white relative">
                  {pageBitmaps[index] ? (
                    <img
                      src={pageBitmaps[index] as string}
                      alt={`Página ${index + 1}`}
                      className="w-full h-full object-contain select-none"
                      draggable={false}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
              </Page>
            ))}
          </HTMLFlipBook>
        </div>
      </div>

      {/* Navegación con botones */}
      <div className="flex items-center justify-between gap-4 p-4 bg-background/95 backdrop-blur-sm border-t border-border rounded-b-lg">
        <Button
          variant="outline"
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex-1 md:flex-none"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-3 py-1 bg-muted rounded-md font-medium">
            {currentPage + 1} / {totalPages + 1}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={nextPage}
          disabled={currentPage >= totalPages}
          className="flex-1 md:flex-none"
        >
          Siguiente
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PDFPageFlip;
