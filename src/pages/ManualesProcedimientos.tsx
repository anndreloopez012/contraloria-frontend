import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PDFViewer from '@/components/PDFViewer';

/**
 * Página Manuales y Procedimientos
 * 
 * Muestra un listado elegante de documentos PDF disponibles.
 * Incluye funcionalidad de:
 * - Visualización de PDFs integrada
 * - Búsqueda de documentos
 * - Descarga directa
 * - Categorización de documentos
 * 
 * Compatible con React + Astro
 */

interface PDFDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  lastUpdated: string;
  url: string;
  downloadCount: number;
}

// Datos simulados de PDFs (en producción vendría de API)
const pdfDocuments: PDFDocument[] = [
  {
    id: '1',
    title: 'Manual de Auditoría Gubernamental',
    description: 'Guía completa para la realización de auditorías en el sector público',
    category: 'Auditoría',
    size: '2.5 MB',
    lastUpdated: '2024-12-15',
    url: '/placeholder.pdf',
    downloadCount: 1245
  },
  {
    id: '2',
    title: 'Procedimientos de Control Interno',
    description: 'Normativas y procedimientos para el control interno institucional',
    category: 'Control Interno',
    size: '1.8 MB',
    lastUpdated: '2024-12-10',
    url: '/placeholder.pdf',
    downloadCount: 987
  },
  {
    id: '3',
    title: 'Manual de Declaraciones Patrimoniales',
    description: 'Guía para la presentación de declaraciones juradas patrimoniales',
    category: 'Declaraciones',
    size: '3.2 MB',
    lastUpdated: '2024-12-08',
    url: '/placeholder.pdf',
    downloadCount: 756
  },
  {
    id: '4',
    title: 'Procedimientos de Fiscalización',
    description: 'Metodología y procedimientos para procesos de fiscalización',
    category: 'Fiscalización',
    size: '4.1 MB',
    lastUpdated: '2024-12-05',
    url: '/placeholder.pdf',
    downloadCount: 654
  },
  {
    id: '5',
    title: 'Manual de Organización y Functions',
    description: 'Estructura organizacional y funciones institucionales',
    category: 'Organización',
    size: '2.9 MB',
    lastUpdated: '2024-12-01',
    url: '/placeholder.pdf',
    downloadCount: 543
  }
];

const categories = ['Todos', 'Auditoría', 'Control Interno', 'Declaraciones', 'Fiscalización', 'Organización'];

const ManualesProcedimientos = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = pdfDocuments.filter(doc => {
    const matchesCategory = selectedCategory === 'Todos' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleViewPDF = (pdfDocument: PDFDocument) => {
    console.log('[ManualesProcedimientos] Navegando a visualizador PDF:', pdfDocument.title);
    
    // Obtener posición actual de scroll
    const currentScrollY = window.scrollY;
    
    // Navegar a la página del visualizador PDF con parámetros
    const params = new URLSearchParams({
      url: pdfDocument.url,
      title: pdfDocument.title,
      return: '/manuales-procedimientos',
      scroll: currentScrollY.toString()
    });
    
    navigate(`/pdf-viewer?${params.toString()}`);
  };

  const handleDownloadPDF = async (pdfDocument: PDFDocument) => {
    const { secureDownloadPDF, sanitizeFilename } = await import('@/utils/secureDownload');
    const { toast } = await import('sonner');
    
    try {
      await secureDownloadPDF({
        url: pdfDocument.url,
        filename: sanitizeFilename(pdfDocument.title),
        onError: (error) => {
          console.error('[ManualesProcedimientos] Error descargando:', error);
          toast.error('No se pudo descargar el PDF. Por favor, inténtelo de nuevo.');
        }
      });
      toast.success('Descarga iniciada correctamente');
    } catch (error) {
      console.error('[ManualesProcedimientos] Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Manuales y Procedimientos
                </h1>
                <p className="text-sm text-gray-600">
                  Documentos y guías oficiales de la CGC
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barra de búsqueda y filtros */}
        <div className="mb-8 bg-white/60 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros por categoría */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 
                    "bg-blue-600 hover:bg-blue-700" : 
                    "hover:bg-blue-50"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Listado de documentos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((pdfDocument, index) => (
            <div
              key={pdfDocument.id}
              className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header del documento */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {pdfDocument.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {pdfDocument.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metadatos */}
              <div className="px-6 py-4 bg-gray-50/50">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {pdfDocument.category}
                  </span>
                  <span>{pdfDocument.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Actualizado: {pdfDocument.lastUpdated}</span>
                  <span>{pdfDocument.downloadCount} descargas</span>
                </div>
              </div>

              {/* Acciones */}
              <div className="p-6 pt-4 flex gap-3">
                <Button
                  onClick={() => handleViewPDF(pdfDocument)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(pdfDocument)}
                  size="sm"
                  className="hover:bg-green-50 hover:border-green-300"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda o selecciona una categoría diferente.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManualesProcedimientos;
