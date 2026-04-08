
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useContentAPI } from '@/hooks/useContentAPI';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { navigateWithMenuUrl } from '@/utils/menuNavigation';

interface SimpleMegaMenuProps {
  isOpen: boolean;
  activeMenu: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Mega menú simple y profesional con diseño limpio
 * Estructura de dos columnas: categorías principales y subcategorías
 * Con iconos dinámicos desde Lucide React y transiciones suaves de entrada y salida
 */
const SimpleMegaMenu: React.FC<SimpleMegaMenuProps> = ({ 
  isOpen, 
  activeMenu, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  const navigate = useNavigate();
  const { menuStructure, mainNavItems } = useContentAPI();

  // Función para obtener el icono dinámicamente
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.FileText; // Fallback si no existe el icono
  };

  const handleItemClick = (item: any, route: string) => {
    if (navigateWithMenuUrl(item.url, !!item.target_blank, navigate)) {
      return;
    }

    // Si target_blank es true, redirigir a la página de enlaces
    if (item.target_blank) {
      navigate(`/links/${item.route}`);
    } else {
      // Comportamiento normal
      navigate(route);
    }
  };

  if (!activeMenu) return null;

  const items = menuStructure[activeMenu as keyof typeof menuStructure] || [];
  const topRoute = mainNavItems.find(i => i.key === activeMenu)?.route || (activeMenu as string);

  return (
    <>
      <style>
        {`
          .fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <div
        className={`fixed left-0 right-0 z-50 shadow-2xl border-t backdrop-blur-lg pointer-events-auto ${
          isOpen ? 'mega-menu-enter' : 'mega-menu-exit'
        } 
        top-14 sm:top-16 md:top-18 lg:top-20 xl:top-22`}
        style={{ 
          backgroundColor: 'rgba(14, 40, 85, 0.95)',
          borderTopColor: '#B09B57',
          display: isOpen || !isOpen ? 'block' : 'none',
          animationFillMode: 'forwards'
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="max-w-full mx-auto px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-h-[80vh] overflow-y-auto">
            {items.map((item, index) => {
              const IconComponent = getIcon(item.icon);
              const hasChildren = item.children && item.children.length > 0;
              const isClickable = !hasChildren;
              
              return (
                <div 
                  key={index} 
                  className="group fade-in" 
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div 
                    className={`flex items-center p-2 sm:p-3 md:p-4 rounded-lg transition-all duration-300 border border-transparent ${
                      isClickable 
                        ? 'cursor-pointer hover:scale-[1.02]' 
                        : 'cursor-default'
                    }`}
                    style={{
                      backgroundColor: isClickable ? 'transparent' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (isClickable) {
                        e.currentTarget.style.backgroundColor = '#B09B57';
                        e.currentTarget.style.borderColor = '#B09B57';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isClickable) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                    onClick={() => isClickable ? handleItemClick(item, `/${topRoute}/${item.route}`) : undefined}
                  >
                    <div 
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mr-2 sm:mr-3 md:mr-4 transition-all duration-300 flex-shrink-0 ${
                        isClickable 
                          ? 'group-hover:scale-110' 
                          : ''
                      }`}
                      style={{
                        backgroundColor: isClickable ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
                      }}
                    >
                      <IconComponent 
                        className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors duration-300" 
                        style={{ color: '#ffffff' }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 
                        className="font-semibold transition-colors duration-300 text-sm sm:text-base"
                        style={{ color: '#ffffff' }}
                      >
                        {item.title}
                        {item.target_blank && (
                          <span 
                            className="ml-2 text-xs px-1 py-0.5 rounded animate-pulse"
                            style={{ 
                              backgroundColor: 'rgba(176, 155, 87, 0.2)', 
                              color: '#B09B57' 
                            }}
                          >
                            Externo
                          </span>
                        )}
                      </h3>
                      {hasChildren && (
                        <p 
                          className="text-xs sm:text-sm mt-1 hidden sm:block"
                          style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          {item.children.length} servicios disponibles
                        </p>
                      )}
                    </div>
                    {isClickable && (
                      <ArrowRight 
                        className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" 
                        style={{ color: '#ffffff' }}
                      />
                    )}
                  </div>
                  
                  {/* Subcategorías - Mostrar todas */}
                  {hasChildren && (
                    <div className="ml-8 sm:ml-12 md:ml-16 mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {item.children.map((child, childIndex) => {
                        const ChildIconComponent = getIcon(child.icon);
                        return (
                          <div 
                            key={childIndex}
                            className="flex items-center text-xs sm:text-sm cursor-pointer py-1 sm:py-2 px-1 sm:px-2 rounded transition-all duration-200 hover:translate-x-1 fade-in"
                            style={{ 
                              color: 'rgba(255,255,255,0.8)',
                              animationDelay: `${(index * 50) + (childIndex * 25)}ms` 
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#B09B57';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                            }}
                            onClick={() => handleItemClick(child, `/${topRoute}/${item.route}/${child.route}`)}
                          >
                            <ChildIconComponent 
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" 
                              style={{ color: 'rgba(255,255,255,0.6)' }}
                            />
                            <span className="truncate">{child.title}</span>
                            {child.target_blank && (
                              <span 
                                className="ml-1 text-xs"
                                style={{ color: '#B09B57' }}
                              >
                                ↗
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleMegaMenu;
