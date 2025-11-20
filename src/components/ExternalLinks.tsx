import React from 'react';
import { ExternalLink as ExternalLinkIcon, Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { type ExternalLink } from '@/services/apiServiceLinkBlank';

interface ExternalLinksProps {
  links: ExternalLink[];
  variant?: 'desktop' | 'mobile' | 'tablet';
  className?: string;
}

/**
 * Componente para mostrar enlaces externos con tooltips
 * Maneja diferentes variantes para desktop, tablet y móvil
 */
const ExternalLinks: React.FC<ExternalLinksProps> = ({ 
  links, 
  variant = 'desktop',
  className = '' 
}) => {
  if (!links || links.length === 0) return null;

  const iconMap: Record<string, React.ComponentType<any>> = {
    ExternalLink: ExternalLinkIcon,
    Globe,
    // Agregar más iconos según sea necesario
  };

  const handleLinkClick = (link: ExternalLink) => {
    if (link.target === '_blank') {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link.url;
    }
  };

  // Variante para desktop - Botones horizontales
  if (variant === 'desktop') {
    return (
      <TooltipProvider>
        <div className={`flex items-center space-x-1 ${className}`}>
          {links.map((link) => {
            const IconComponent = iconMap[link.icon || 'ExternalLink'] || ExternalLinkIcon;
            
            return (
              <Tooltip key={link.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="flex items-center px-3 py-2 font-medium transition-all duration-200 hover:bg-white/10 text-white text-sm rounded-md"
                    aria-label={link.tooltip}
                  >
                    {link.imageUrl ? (
                      <img 
                        src={link.imageUrl} 
                        alt={link.title}
                        className="w-4 h-4 object-contain"
                      />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{link.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  // Variante para tablet - Lista con íconos
  if (variant === 'tablet') {
    return (
      <div className={`w-full ${className}`}>
        <div className="px-4 py-2 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Enlaces Rápidos</h3>
          <div className="grid grid-cols-2 gap-2">
            {links.map((link) => {
              const IconComponent = iconMap[link.icon || 'ExternalLink'] || ExternalLinkIcon;
              
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-md"
                  title={link.tooltip}
                >
                  {link.imageUrl ? (
                    <img 
                      src={link.imageUrl} 
                      alt={link.title}
                      className="w-4 h-4 object-contain mr-2 flex-shrink-0"
                    />
                  ) : (
                    <IconComponent className="w-4 h-4 mr-2" />
                  )}
                  <span className="truncate">{link.title}</span>
                  {link.target === '_blank' && (
                    <ExternalLinkIcon className="w-3 h-3 ml-1 flex-shrink-0 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Variante para móvil - Lista vertical completa
  if (variant === 'mobile') {
    return (
      <div className={`w-full ${className}`}>
        <div className="px-4 py-3 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Enlaces Externos</h3>
          <div className="space-y-2">
            {links.map((link) => {
              const IconComponent = iconMap[link.icon || 'ExternalLink'] || ExternalLinkIcon;
              
              return (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link)}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-md text-left"
                  title={link.tooltip}
                >
                  {link.imageUrl ? (
                    <img 
                      src={link.imageUrl} 
                      alt={link.title}
                      className="w-4 h-4 object-contain mr-3 flex-shrink-0"
                    />
                  ) : (
                    <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                  )}
                  <span className="flex-1">{link.title}</span>
                  {link.target === '_blank' && (
                    <ExternalLinkIcon className="w-3 h-3 ml-2 flex-shrink-0 opacity-60" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ExternalLinks;