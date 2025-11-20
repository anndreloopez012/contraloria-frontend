import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { InfoPublicaTree } from '@/components/InfoPublicaTree';
import { fetchInfoPublicaData, InfoPublicaItem } from '@/services/apiServiceInfoPublica';
import { FolderTree, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PageInfoPublic = () => {
  const [items, setItems] = useState<InfoPublicaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchInfoPublicaData();
        setItems(data);
      } catch (error) {
        console.error('Error loading información pública:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <>
      <Helmet>
        <title>Información Pública | Contraloría General de Cuentas</title>
        <meta 
          name="description" 
          content="Accede a la información pública de la Contraloría General de Cuentas de Guatemala. Documentos, informes y recursos organizados para transparencia ciudadana." 
        />
        <meta name="keywords" content="información pública, transparencia, CGC Guatemala, documentos públicos" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">
          {/* Header - Compacto en móvil */}
          <div className="mb-4 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                <FolderTree className="w-5 h-5 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-foreground">
                  Información Pública
                </h1>
                <p className="text-xs md:text-base text-muted-foreground mt-0.5 md:mt-1">
                  Accede a documentos, informes y recursos públicos organizados
                </p>
              </div>
            </div>

            {/* Info card - Compacto en móvil */}
            <Card className="p-3 md:p-4 bg-primary/5 border-primary/20">
              <div className="flex gap-2 md:gap-3">
                <Info className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs md:text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">¿Cómo usar esta sección?</p>
                  <ul className="space-y-0.5 md:space-y-1 list-disc list-inside">
                    <li>Haz clic en las <strong>carpetas</strong> para expandir y ver su contenido</li>
                    <li>Haz clic en los <strong>archivos</strong> para acceder al documento</li>
                    <li>Usa el <strong>buscador</strong> para encontrar información específica</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>

          {/* Content - Menos padding en móvil */}
          <Card className="p-3 md:p-6">
            {isLoading ? (
              <div className="space-y-3 md:space-y-4">
                <Skeleton className="h-8 md:h-10 w-full" />
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 md:h-16 w-full" />
                ))}
              </div>
            ) : (
              <InfoPublicaTree items={items} />
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

export default PageInfoPublic;
