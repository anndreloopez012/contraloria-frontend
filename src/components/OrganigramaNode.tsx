

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OrganigramaItem } from '@/services/apiServiceOrganigrama';
import { SafeLink } from '@/components/SafeLink';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, ExternalLink, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganigramaNodeProps {
  item: OrganigramaItem;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  isRoot?: boolean;
}

export const OrganigramaNode: React.FC<OrganigramaNodeProps> = ({ 
  item, 
  level, 
  isExpanded, 
  onToggle,
  isRoot = false
}) => {
  const navigate = useNavigate();
  const hasRoute = item.route && item.route.trim() !== '';
  const hasUrl = item.url && item.url.trim() !== '';
  const isClickable = hasRoute || hasUrl;
  const hasChildren = item.children && item.children.length > 0;
  
  const getHref = () => {
    if (hasUrl) return item.url;
    if (hasRoute) return item.route;
    return undefined;
  };

  const getTarget = () => {
    if (hasUrl && item.target_blank) return '_blank';
    return '_self';
  };

  const handleClick = () => {
    if (hasRoute) {
      // Para rutas internas, navegar con path absoluto agregando "/" al inicio
      const cleanRoute = item.route.startsWith('/') ? item.route : `/${item.route}`;
      navigate(cleanRoute);
    } else if (hasUrl) {
      // Para URLs externas, usar window.open si es target_blank
      if (item.target_blank) {
        window.open(item.url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = item.url;
      }
    }
  };

  // Colores según el nivel
  const getNodeColors = () => {
    if (isRoot) return {
      bg: 'bg-gradient-to-br from-primary/90 to-primary',
      text: 'text-primary-foreground',
      border: 'border-primary',
      icon: 'text-primary-foreground'
    };
    
    const colors = [
      { bg: 'bg-gradient-to-br from-[#c2a650] to-[#a8924a]', text: 'text-white', border: 'border-[#c2a650]', icon: 'text-white' },
      { bg: 'organigrama-orange-bg', text: 'organigrama-orange-text', border: 'organigrama-orange-border', icon: 'organigrama-orange-icon' },
      { bg: 'organigrama-light-blue-bg', text: 'organigrama-light-blue-text', border: 'organigrama-light-blue-border', icon: 'organigrama-light-blue-icon' },
      { bg: 'bg-gradient-to-br from-[#2680C4] to-[#1a6ba8]', text: 'text-white', border: 'border-[#2680C4]', icon: 'text-white' },
    ];
    
    return colors[level % colors.length];
  };

  const colors = getNodeColors();

  const NodeContent = ({ children }: { children: React.ReactNode }) => {
    if (isClickable) {
      return (
        <div 
          className="block w-full h-full cursor-pointer"
          onClick={handleClick}
        >
          {children}
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Nodo principal */}
      <Card className={cn(
        "relative transition-all duration-300 hover:shadow-xl border-2 min-w-[280px] max-w-[320px]",
        colors.border,
        colors.bg,
        isClickable && "cursor-pointer hover:scale-105 transform",
        !item.active && "opacity-70"
      )}>
        <NodeContent>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar/Icon - Solo mostrar en nivel root */}
              {isRoot && (
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                  "bg-primary-foreground/20"
                )}>
                  <Building2 className={cn("w-6 h-6", colors.icon)} />
                </div>
              )}
              
              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className={cn(
                      "font-semibold leading-tight",
                      colors.text,
                      isRoot ? "text-lg" : "text-base"
                    )}>
                      {item.title}
                    </h3>
                    
                    {item.description && (
                      <p className={cn(
                        "text-xs mt-1 opacity-80 leading-relaxed",
                        colors.text
                      )}>
                        {item.description}
                      </p>
                    )}
                    
                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.active && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          Activo
                        </Badge>
                      )}
                      {hasUrl && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                          Externo
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Iconos de acción */}
                  <div className="flex flex-col gap-1">
                    {/* Solo mostrar icono de enlace si tiene route o url válida */}
                    {isClickable && (
                      <ExternalLink className={cn("w-4 h-4", colors.icon)} />
                    )}
                    
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggle();
                        }}
                        className={cn(
                          "p-1 h-6 w-6 hover:bg-white/20",
                          colors.text
                        )}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </NodeContent>
      </Card>

      {/* Línea vertical hacia abajo si tiene hijos expandidos */}
      {hasChildren && isExpanded && (
        <div className="w-0.5 h-6 bg-border mt-2"></div>
      )}
      
      {/* Línea horizontal para conectar hermanos */}
      {hasChildren && isExpanded && item.children.length > 1 && (
        <div className="w-full h-0.5 bg-border relative">
          <div className="absolute left-1/2 top-0 w-0.5 h-6 bg-border -translate-x-0.5"></div>
        </div>
      )}
    </div>
  );
};

