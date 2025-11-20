import React, { useState, useEffect } from 'react';
import { fetchOrganigramaData, clearOrganigramaCache, type OrganigramaItem } from '@/services/apiServiceOrganigrama';
import { fetchInfoGeneral } from '@/services/apiServiceInfoGeneral';
import { OrganigramaInteractivo } from '@/components/OrganigramaInteractivo';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Building2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEOOptimization } from '@/hooks/useSEOOptimization';

const OrganigramaPage: React.FC = () => {
  const navigate = useNavigate();
  const [organigramaData, setOrganigramaData] = useState<OrganigramaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // SEO Optimization
  useSEOOptimization({
    title: 'Organigrama Interactivo',
    description: 'Estructura organizacional interactiva de la Contraloría General de Cuentas de Guatemala. Explora las diferentes dependencias y áreas de trabajo.',
    keywords: 'organigrama, estructura organizacional, contraloría general cuentas, guatemala, dependencias, áreas trabajo',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Organigrama Interactivo - CGC Guatemala",
      "description": "Estructura organizacional interactiva de la Contraloría General de Cuentas",
      "mainEntity": {
        "@type": "Organization",
        "name": "Contraloría General de Cuentas",
        "alternateName": "CGC Guatemala"
      }
    }
  });

  const loadOrganigramaData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Cargando datos del organigrama...');
      const [data, globalInfo] = await Promise.all([
        fetchOrganigramaData(),
        fetchInfoGeneral()
      ]);
      setOrganigramaData(data);
      setPdfUrl(globalInfo.organigramaPdf?.url || null);
      console.log('✅ Organigrama cargado exitosamente:', data.length, 'elementos');
      console.log('✅ PDF URL:', globalInfo.organigramaPdf?.url);
    } catch (err) {
      console.error('❌ Error loading organigrama data:', err);
      setError('No se pudo cargar el organigrama. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganigramaData();
  }, []);

  const handleRefresh = async () => {
    console.log('🔄 Actualizando organigrama...');
    // Limpiar caché antes de recargar
    clearOrganigramaCache();
    localStorage.removeItem('cgc_global_info_cache');
    await loadOrganigramaData();
  };

  const handlePdfClick = () => {
    console.log('📄 Click en PDF, URL disponible:', pdfUrl);
    if (pdfUrl) {
      navigate(`/pdf-viewer?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent('Organigrama PDF')}&return=${encodeURIComponent('/organigrama')}`);
    } else {
      console.warn('No hay PDF disponible para el organigrama');
      // Forzar actualización de datos
      handleRefresh();
      alert('Actualizando datos del organigrama. Intenta nuevamente en un momento.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <Skeleton className="h-8 w-80 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="ml-8 space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Alert className="mb-6">
            <Building2 className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {error}
            </AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Button onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Organigrama</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              onClick={handlePdfClick}
              className="gap-2 bg-[#2680C4] hover:bg-[#1a6ba8] text-white"
              title={!pdfUrl ? 'PDF no disponible actualmente' : 'Ver organigrama en PDF'}
            >
              <FileText className="h-4 w-4" />
              Organigrama Aprovado PDF
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>
      </div>
      
      <OrganigramaInteractivo items={organigramaData} />
    </div>
  );
};

export default OrganigramaPage;
