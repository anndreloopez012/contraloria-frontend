
import React from 'react';
import { OrganigramaItem } from '@/services/apiServiceOrganigrama';
import { OrganigramaLevel } from './OrganigramaLevel';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Info } from 'lucide-react';

interface OrganigramaInteractivoProps {
  items: OrganigramaItem[];
}

export const OrganigramaInteractivo: React.FC<OrganigramaInteractivoProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Organigrama no disponible
        </h3>
        <p className="text-muted-foreground max-w-md">
          No se pudieron cargar los datos del organigrama en este momento. 
          Por favor, intenta nuevamente más tarde.
        </p>
      </div>
    );
  }

  // Crear el nodo raíz para el organigrama
  const rootNode: OrganigramaItem = {
    id: "root",
    documentId: 'root',
    title: 'Contraloría General de Cuentas',
    description: 'Estructura Organizacional',
    url: null,
    route: null,
    target_blank: false,
    active: true,
    text_color: null,
    text_color_hover: null,
    children: items
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Organigrama Interactivo
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explora la estructura organizacional de la Contraloría General de Cuentas de Guatemala
          </p>
        </div>
      </div>

      {/* Organigrama */}
      <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50/50 py-8 px-4">
        <OrganigramaLevel items={[rootNode]} level={0} />
      </div>

      {/* Instrucciones */}
      <div className="container mx-auto px-4 py-8">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Cómo usar el organigrama:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Haz clic en las flechas para expandir o contraer las secciones</li>
                  <li>• Los elementos con enlaces son clicables para navegar</li>
                  <li>• El organigrama es completamente responsivo y se adapta a tu dispositivo</li>
                  <li>• Los colores indican diferentes niveles jerárquicos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
