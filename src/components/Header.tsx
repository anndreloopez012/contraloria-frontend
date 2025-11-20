import React, { useState } from 'react';
import { ChevronDown, Menu, X, Home, Users, Scale, Settings, BookOpen, Link, Phone, Search, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SimpleMegaMenu from './SimpleMegaMenu';
import MobileMenu from './MobileMenu';
import ExternalLinks from './ExternalLinks';
import SocialMenuItems from './SocialMenuItems';
import SearchModal from './SearchModal';
import { useContentAPI } from '@/hooks/useContentAPI';
import { useGlobalInfo } from '@/hooks/useGlobalInfo';

interface HeaderProps {
  showSidebarButton?: boolean;
  onSidebarButtonClick?: () => void;
}

/**
 * Componente Header principal
 * Maneja la navegación principal con menú flotante y menú móvil adaptativo
 * 
 * Características:
 * - Header fijo con backdrop blur
 * - Mega menú pegado directamente al nav
 * - Navegación responsive con iconos
 * - Estados de hover mejorados
 * - Ajuste automático de tamaño según espacio disponible
 * - Modal de búsqueda con autocomplete
 * - Botón de artículos para acceder a la sala de redacción
 */
const Header: React.FC<HeaderProps> = ({ showSidebarButton = false, onSidebarButtonClick }) => {
  // Estados para controlar la apertura de menús
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Hook para navegación
  const navigate = useNavigate();

  // Obtener contenido desde la API simulada
  const { mainNavItems, externalLinks, socialMenuItems, isLoading } = useContentAPI();

  // Nuevo: info global (favicon + nombre)
  const { globalInfo } = useGlobalInfo();

  // Mapeo de iconos de string a componentes de React
  const iconMap: Record<string, React.ComponentType<any>> = {
    Home, Users, Scale, Settings, BookOpen, Link, Phone
  };

  /**
   * Maneja la navegación a la página principal
   */
  const handleLogoClick = () => {
    navigate('/');
  };

  /**
   * Maneja el evento de mouse enter para mostrar el mega menú
   */
  const handleMouseEnter = (key: string) => {
    setActiveMegaMenu(key);
  };

  /**
   * Maneja el evento de mouse leave para ocultar el mega menú
   */
  const handleMouseLeave = () => {
    setActiveMegaMenu(null);
  };

  /**
   * Alterna el estado del menú móvil
   */
  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  /**
   * Abre el modal de búsqueda
   */
  const openSearchModal = () => {
    setIsSearchOpen(true);
  };

  /**
   * Navega a la página de artículos
   */
  const navigateToArticles = () => {
    navigate('/articulos');
  };

  // Mostrar loading si los datos aún se están cargando
  if (isLoading) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50">
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/30 rounded-3xl shadow-2xl mx-auto max-w-7xl h-16 flex items-center justify-center">
          <div className="animate-pulse text-gray-500">Cargando...</div>
        </div>
      </div>
    );
  }

  // Elegimos la mejor URL disponible para el logo desde el API global
  const logoUrl =
    globalInfo?.favicon?.formats?.small ||
    globalInfo?.favicon?.formats?.thumbnail ||
    globalInfo?.favicon?.url ||
    '/lovable-uploads/be6267fe-c26a-4dd8-bdc3-95323c6a0fd7.png'; // fallback actual

  const logoAlt = globalInfo?.siteName || 'CGC Logo';

  return (
    <>
      {/* Header flotante estilo gobierno */}
      <div className="fixed top-0 left-0 right-0 w-full z-50 backdrop-blur-md bg-white/95 shadow-lg border-b border-gray-200/30">
        <header className="w-full">
          <div className="px-1 sm:px-2">
            <div className="flex items-center justify-between h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20">
              {/* Logo del gobierno - Izquierda */}
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                  <div className="relative">
                    {/* Logo principal con imagen (responsive más ajustado) - Clickeable */}
                    <img 
                      src={logoUrl}
                      alt={logoAlt}
                      className="h-8 sm:h-10 md:h-12 lg:h-14 xl:h-16 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={handleLogoClick}
                    />
                  </div>
                  {/* Nueva imagen del slogan (responsive más ajustado) - Clickeable */}
                  <div className="relative">
                    <img 
                      src="/lovable-uploads/7101cad0-e8e9-44fc-bafc-0a86f30c38f4.png"
                      alt="Prevención y buena gobernanza construyen Confianza"
                      className="h-6 sm:h-7 md:h-8 lg:h-10 xl:h-12 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={handleLogoClick}
                    />
                  </div>
                </div>
              </div>

              {/* Navegación centrada - Desktop */}
              <div className="hidden lg:flex flex-1 justify-center">
                <nav className="flex items-center">
                  {mainNavItems.map((item) => {
                    const IconComponent = iconMap[item.icon];
                    return (
                      <div
                        key={item.key}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(item.key)}
                      >
                        <button 
                          className="flex items-center px-1 lg:px-2 xl:px-3 py-2 font-medium transition-all duration-200 border-r last:border-r-0"
                          style={{ 
                            color: '#0E2855',
                            borderColor: '#0E2855',
                            fontSize: 'clamp(0.5rem, 1.2vw, 0.875rem)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#B09B57';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#0E2855';
                          }}
                        >
                          {IconComponent && <IconComponent className="w-3 h-3 lg:w-4 lg:h-4 mr-1 flex-shrink-0" />}
                          {/* Texto adaptativo según el espacio disponible más agresivo */}
                          <span className="hidden 2xl:inline whitespace-nowrap text-xs lg:text-sm">{item.title}</span>
                          <span className="2xl:hidden xl:inline hidden whitespace-nowrap text-xs">{item.title.length > 10 ? item.title.slice(0, 8) + '...' : item.title}</span>
                          <span className="xl:hidden lg:inline whitespace-nowrap text-xs">{item.title.slice(0, 5)}...</span>
                          <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                        </button>
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Navegación tablet - Aparece entre md y lg */}
              <div className="hidden md:flex lg:hidden flex-1 justify-center">
                <nav className="flex items-center">
                  {mainNavItems.slice(0, 4).map((item) => {
                    const IconComponent = iconMap[item.icon];
                    return (
                      <div
                        key={item.key}
                        className="relative"
                        onMouseEnter={() => handleMouseEnter(item.key)}
                      >
                        <button 
                          className="flex items-center px-1 py-2 font-medium transition-all duration-200 border-r last:border-r-0"
                          style={{ 
                            color: '#0E2855',
                            borderColor: '#0E2855',
                            fontSize: '0.625rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#B09B57';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#0E2855';
                          }}
                        >
                          {IconComponent && <IconComponent className="w-3 h-3 mr-1 flex-shrink-0" />}
                          <span className="whitespace-nowrap text-xs">{item.title.slice(0, 4)}...</span>
                          <ChevronDown className="w-3 h-3 ml-1 flex-shrink-0" />
                        </button>
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Botones de la derecha */}
              <div className="flex items-center justify-end space-x-1 flex-shrink-0">
                {/* Botón de búsqueda - Desktop y Tablet */}
                <div className="hidden md:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openSearchModal}
                    className="hover:bg-gray-100 p-2 rounded-full transition-all duration-200 hover:scale-105"
                    style={{ color: '#0E2855' }}
                    title="Buscar en el menú"
                  >
                    <Search className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>

                {/* Botón de artículos - Desktop y Tablet */}
                <div className="hidden md:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={navigateToArticles}
                    className="hover:bg-gray-100 p-2 rounded-full transition-all duration-200 hover:scale-105"
                    style={{ color: '#0E2855' }}
                    title="Sala de Redacción"
                  >
                    <PenTool className="w-4 h-4 lg:w-5 lg:h-5" />
                  </Button>
                </div>

                {/* Enlaces externos - Desktop (ahora a la derecha) */}
                <div className="hidden lg:flex">
                  <ExternalLinks 
                    links={externalLinks} 
                    variant="desktop"
                  />
                </div>

                {/* Elementos del menú social - Desktop (ahora a la derecha) */}
                {socialMenuItems.length > 0 && (
                  <div className="hidden lg:flex">
                    <SocialMenuItems 
                      items={socialMenuItems} 
                      variant="desktop"
                    />
                  </div>
                )}

                {/* Botón de menú móvil principal - Aparece en md y menores - Alineado a la derecha */}
                <div className="lg:hidden ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMobileMenu}
                    className="hover:bg-gray-100 p-1 ml-auto"
                    style={{ color: '#0E2855' }}
                    aria-label="Toggle mobile menu"
                  >
                    {isMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Borde inferior decorativo */}
        <div className="w-full h-2 overflow-hidden">
          <img 
            src="/lovable-uploads/e4678256-47ea-4a80-ae44-c35764cc63ed.png"
            alt="Borde decorativo"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Espaciador para el header flotante */}
      <div className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20"></div>

      {/* Mega menú de escritorio - Flotante y completamente responsivo */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
        onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
        onMouseLeave={handleMouseLeave}
      >
        <SimpleMegaMenu 
          isOpen={!!activeMegaMenu} 
          activeMenu={activeMegaMenu}
          onMouseEnter={() => setActiveMegaMenu(activeMegaMenu)}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Menú móvil */}
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Modal de búsqueda */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Header;
