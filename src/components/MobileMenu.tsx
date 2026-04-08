import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, Search, PenTool } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import ExternalLinks from './ExternalLinks';
import SocialMenuItems from './SocialMenuItems';
import SearchModal from './SearchModal';
import { useContentAPI } from '@/hooks/useContentAPI';
import * as LucideIcons from 'lucide-react';
import { navigateWithMenuUrl } from '@/utils/menuNavigation';

/**
 * Props del componente MobileMenu
 */
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Componente de menú móvil con navegación multinivel
 * Permite navegar entre los diferentes niveles del menú en dispositivos móviles
 * Ahora con iconos dinámicos desde Lucide React
 */
const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  // Estados para manejar la navegación entre niveles
  const [currentLevel, setCurrentLevel] = useState<'main' | string>('main');
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [selectedSecondLevel, setSelectedSecondLevel] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Obtener datos del contenido
  const { mainNavItems, menuStructure, socialMedia, advertisements, externalLinks, socialMenuItems } = useContentAPI();

  // Función para obtener el icono dinámicamente
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.FileText; // Fallback si no existe el icono
  };

  // Mapeo de iconos de redes sociales
  const socialIconMap: Record<string, React.ComponentType<any>> = {
    facebook: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    twitter: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      </svg>
    ),
    youtube: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    instagram: () => (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C8.396 0 7.989.013 7.041.048 2.51.311.677 2.154.013 7.041.013 7.989 0 8.396 0 12.017c0 3.624.013 4.09.048 5.014.677 4.887 2.154 6.73 7.041 7.394.95.048 1.59.048 4.968.048 3.624 0 4.09-.013 5.014-.048 4.887-.677 6.73-2.154 7.394-7.041.048-.95.048-1.59.048-4.968 0-3.624-.013-4.09-.048-5.014C23.689 2.154 22.212.677 17.331.013 16.383.013 15.983 0 12.017 0zm5.97 22.138c-4.137.474-5.817-.569-6.779-1.531-.962-.962-2.005-2.642-1.531-6.779l.029-.29c.474-4.137.569-5.817 1.531-6.779.962-.962 2.642-2.005 6.779-1.531l.29.029c4.137.474 5.817.569 6.779 1.531.962.962 2.005 2.642 1.531 6.779l-.029.29c-.474 4.137-.569 5.817-1.531 6.779-.962.962-2.642 2.005-6.779 1.531l-.29-.029z"/>
      </svg>
    )
  };

  const handleItemClick = (item: any, route: string) => {
    if (navigateWithMenuUrl(item.url, !!item.target_blank, navigate)) {
      closeMenu();
      return;
    }

    // Si target_blank es true, redirigir a la página de enlaces
    if (item.target_blank) {
      navigate(`/links/${item.route}`);
      closeMenu();
    } else {
      // Comportamiento normal
      navigate(route);
      closeMenu();
    }
  };

  const navigateToLevel = (key: string, title: string) => {
    if (currentLevel === 'main') {
      // Navegando desde el nivel principal a un submenu
      setCurrentLevel(key);
      setNavigationStack([title]);
    } else {
      // Navegando desde el segundo nivel al tercer nivel
      const item = menuStructure[currentLevel]?.find(item => item.key === key);
      if (item && item.children) {
        setSelectedSecondLevel(key);
        setNavigationStack([...navigationStack, item.title]);
      }
    }
  };

  const goBack = () => {
    if (selectedSecondLevel) {
      // Regresando del tercer nivel al segundo
      setSelectedSecondLevel(null);
      setNavigationStack(navigationStack.slice(0, -1));
    } else if (currentLevel !== 'main') {
      // Regresando del segundo nivel al principal
      setCurrentLevel('main');
      setNavigationStack([]);
    }
  };

  const closeMenu = () => {
    setCurrentLevel('main');
    setNavigationStack([]);
    setSelectedSecondLevel(null);
    onClose();
  };

  /**
   * Abre el modal de búsqueda
   */
  const openSearchModal = () => {
    console.log('🔍 Abriendo modal de búsqueda desde menú móvil');
    setIsSearchOpen(true);
  };

  /**
   * Cierra el modal de búsqueda
   */
  const closeSearchModal = () => {
    console.log('❌ Cerrando modal de búsqueda');
    setIsSearchOpen(false);
  };

  /**
   * Navega a la página de artículos
   */
  const navigateToArticles = () => {
    navigate('/articulos');
    closeMenu();
  };

  /**
   * Renderiza contenido especial para secciones específicas
   */
  const renderSpecialContent = (key: string) => {
    if (key === 'redes-sociales' && currentLevel === 'inicio') {
      return (
        <div className="px-4 py-4 space-y-4">
          <h3 className="font-bold text-gray-900">Síguenos en Redes Sociales</h3>
          <div className="grid grid-cols-2 gap-3">
            {socialMedia.map((social, index) => {
              const IconComponent = socialIconMap[social.icon];
              return (
                <button
                  key={index}
                  className="bg-gray-600 text-white p-3 transition-all duration-200 hover:bg-gray-700 flex items-center justify-center space-x-2"
                >
                  <IconComponent />
                  <span className="text-sm font-medium">{social.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (key === 'publicidad' && currentLevel === 'inicio') {
      return (
        <div className="px-4 py-4 space-y-4">
          <h3 className="font-bold text-gray-900">Información Publicitaria</h3>
          <div className="space-y-3">
            {advertisements.map((ad) => (
              <div key={ad.id} className="bg-white border border-gray-300 p-3">
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title}
                  className="w-full h-24 object-cover mb-2"
                />
                <h4 className="font-medium text-sm text-gray-900">{ad.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{ad.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderMainLevel = () => (
    <div className="space-y-2">
      <div className="px-4 py-3 border-b border-gray-300">
        <h2 className="text-lg font-bold text-gray-900">Menú Principal</h2>
      </div>
      
      {/* Botones de búsqueda y artículos - Solo en móvil */}
      <div className="px-4 py-2 border-b border-gray-200 space-y-2">
        <Button
          variant="outline"
          size="sm"
          onClick={openSearchModal}
          className="w-full flex items-center justify-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Buscar</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={navigateToArticles}
          className="w-full flex items-center justify-center space-x-2"
        >
          <PenTool className="w-4 h-4" />
          <span>Sala de Redacción</span>
        </Button>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-2 px-2">
          {mainNavItems.map((item) => {
            const IconComponent = getIcon(item.icon);
            return (
              <button
                key={item.key}
                onClick={() => navigateToLevel(item.key, item.title)}
                className="flex items-center w-full text-left py-3 px-4 font-medium transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              >
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="flex-1">{item.title}</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  /**
   * Renderiza el segundo nivel del menú
   */
  const renderSecondLevel = () => {
    const items = menuStructure[currentLevel] || [];
    const topRoute = mainNavItems.find(i => i.key === currentLevel)?.route || currentLevel;
    
    return (
      <div className="space-y-2">
        <div className="px-4 py-3 border-b border-gray-300">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h2 className="text-lg font-bold text-gray-900">{navigationStack[0]}</h2>
        </div>
        <ScrollArea className="h-96">
          <div className="space-y-2 px-2">
            {items.map((item) => {
              const IconComponent = getIcon(item.icon);
              const specialContent = renderSpecialContent(item.key);
              
              return (
                <div key={item.key} className="space-y-2">
                  {item.children ? (
                    <button
                      onClick={() => navigateToLevel(item.key, item.title)}
                      className="flex items-center w-full text-left py-3 px-4 font-medium transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span className="flex-1">
                        {item.title}
                        {item.target_blank && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                            Externo
                          </span>
                        )}
                      </span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item, `/${topRoute}/${item.route}`)}
                      className="flex items-center w-full text-left py-3 px-4 font-medium transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      <span className="flex-1">
                        {item.title}
                        {item.target_blank && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                            Externo
                          </span>
                        )}
                      </span>
                      {item.images && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 ml-2">
                          {item.images.length} img
                        </span>
                      )}
                    </button>
                  )}
                  
                  {/* Contenido especial para ciertas secciones */}
                  {specialContent && (
                    <div className="ml-4">
                      {specialContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderThirdLevel = () => {
    const items = menuStructure[currentLevel] || [];
    const selectedItem = items.find(item => item.key === selectedSecondLevel);
    const topRoute = mainNavItems.find(i => i.key === currentLevel)?.route || currentLevel;
    
    if (!selectedItem || !selectedItem.children) return null;

    return (
      <div className="space-y-2">
        <div className="px-4 py-3 border-b border-gray-300">
          <button
            onClick={goBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h2 className="text-lg font-bold text-gray-900">{selectedItem.title}</h2>
        </div>
        <ScrollArea className="h-96">
          <div className="space-y-2 px-2">
            {selectedItem.children.map((child) => {
              const IconComponent = getIcon(child.icon);
              return (
                <button
                  key={child.key}
                  onClick={() => handleItemClick(child, `/${topRoute}/${selectedItem.route}/${child.route}`)}
                  className="flex items-center w-full text-left py-3 px-4 font-medium transition-all duration-200 hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  <span className="flex-1">
                    {child.title}
                    {child.target_blank && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                        Externo
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay de fondo */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden animate-fade-in"
        onClick={closeMenu}
      />
      
      {/* Panel del menú móvil flotante */}
      <div className="fixed top-6 right-6 bottom-6 left-6 sm:left-auto sm:right-4 sm:bottom-4 sm:top-20 h-auto w-full sm:w-80 sm:max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl border border-gray-200/30 shadow-2xl rounded-2xl z-50 lg:hidden animate-slide-in-right overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header del menú móvil */}
          <div className="p-4 border-b border-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="/lovable-uploads/be6267fe-c26a-4dd8-bdc3-95323c6a0fd7.png" 
                  alt="CGC Logo" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              <button
                onClick={closeMenu}
                className="p-2 hover:bg-gray-100 transition-colors"
                aria-label="Cerrar menú"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenido del menú con scroll */}
          <div className="flex-1 overflow-hidden py-4">
            {selectedSecondLevel ? renderThirdLevel() : 
             currentLevel !== 'main' ? renderSecondLevel() : 
             renderMainLevel()}
          </div>

          {/* Enlaces externos - Tablet y Móvil */}
          <div className="border-t border-gray-200">
            <ExternalLinks 
              links={externalLinks} 
              variant={window.innerWidth >= 768 ? 'tablet' : 'mobile'}
            />
          </div>

          {/* Elementos del menú social - Móvil */}
          {socialMenuItems.length > 0 && (
            <SocialMenuItems 
              items={socialMenuItems} 
              variant="mobile"
            />
          )}

          {/* Footer del menú móvil */}
          <div className="p-4 border-t border-gray-300">
            <div className="text-xs text-gray-500 text-center">
              Contraloría General de Cuentas
            </div>
          </div>
        </div>
      </div>

      {/* Modal de búsqueda */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={closeSearchModal}
      />
    </>
  );
};

export default MobileMenu;
