import React, { useState, useEffect } from 'react';
import { 
  Home, Users, FileText, Settings, BookOpen, Link, Phone, ArrowRight,
  ArrowLeft, Building, Scale, Award, GraduationCap, MapPin, Globe, Mail, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useContentAPI } from '@/hooks/useContentAPI';
import { useNavigate } from 'react-router-dom';

/**
 * Props del componente BentoMegaMenu
 */
interface BentoMegaMenuProps {
  isOpen: boolean;
  activeMenu: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Componente BentoMegaMenu
 * Menú desplegable estilo bento con tres columnas: redes/imágenes, nivel 2, nivel 3
 */
const BentoMegaMenu: React.FC<BentoMegaMenuProps> = ({ 
  isOpen, 
  activeMenu, 
  onMouseEnter, 
  onMouseLeave 
}) => {
  const navigate = useNavigate();
  const [activeLevel, setActiveLevel] = useState<'main' | string>('main');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState<string[]>([]);
  const [selectedSecondLevel, setSelectedSecondLevel] = useState<string | null>(null);
  const [menuWidth, setMenuWidth] = useState<'normal' | 'half' | 'expanded'>('normal');

  const { mainNavItems, menuStructure, socialMedia, sliderImages } = useContentAPI();

  const iconMap: Record<string, React.ComponentType<any>> = {
    Home, Users, FileText, Settings, BookOpen, Link, Phone, Building, 
    Scale, Award, GraduationCap, MapPin, Globe, Mail
  };

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

  useEffect(() => {
    if (activeMenu && isOpen) {
      setActiveLevel(activeMenu);
      setBreadcrumb([mainNavItems.find(item => item.key === activeMenu)?.title || '']);
      setSelectedSecondLevel(null);
      setMenuWidth('half');
    } else {
      setActiveLevel('main');
      setBreadcrumb([]);
      setSelectedSecondLevel(null);
      setMenuWidth('normal');
    }
  }, [activeMenu, isOpen, mainNavItems]);

  const handleItemClick = (key: string, title?: string) => {
    const items = menuStructure[activeLevel as keyof typeof menuStructure] || [];
    const item = items.find(item => item.key === key);
    
    if (item && item.children) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setSelectedSecondLevel(key);
        setMenuWidth('expanded');
        setIsTransitioning(false);
      }, 150);
    } else {
      // Navegar a la página correspondiente
      const route = `/${activeLevel}/${key}`;
      navigate(route);
    }
  };

  const handleThirdLevelClick = (parentKey: string, childKey: string) => {
    const route = `/${activeLevel}/${parentKey}/${childKey}`;
    navigate(route);
  };

  const handleBackClick = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setSelectedSecondLevel(null);
      setMenuWidth('half');
      setIsTransitioning(false);
    }, 150);
  };

  const renderMainLevel = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {mainNavItems.map((item, index) => {
        const IconComponent = iconMap[item.icon];
        return (
          <div 
            key={index} 
            className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] group hover:border-primary/30"
            onClick={() => handleItemClick(item.key)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                {IconComponent && <IconComponent className="w-6 h-6 text-primary" />}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        );
      })}
    </div>
  );

  const renderThreeColumnLevel = () => {
    const items = menuStructure[activeLevel as keyof typeof menuStructure] || [];
    const title = breadcrumb[breadcrumb.length - 1] || '';
    
    const selectedItem = selectedSecondLevel ? 
      items.find(item => item.key === selectedSecondLevel) : null;
    
    return (
      <div className={`grid gap-6 h-full transition-all duration-300 ${
        selectedItem && selectedItem.children ? 'grid-cols-3' : 'grid-cols-2'
      }`}>
        {/* Columna 1: Redes Sociales e Imágenes */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Conecta</h3>
          
          {/* Redes Sociales */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Síguenos</h4>
            <div className="grid grid-cols-2 gap-2">
              {socialMedia.map((social, index) => {
                const IconComponent = socialIconMap[social.icon];
                return (
                  <button
                    key={index}
                    className="bg-primary text-white p-3 rounded-lg transition-all duration-200 hover:scale-110 shadow-md flex items-center justify-center hover:bg-primary/90"
                    aria-label={`Seguir en ${social.name}`}
                  >
                    <IconComponent />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Galería de Imágenes */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Galería</h4>
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent>
                  {sliderImages.map((image, index) => (
                    <CarouselItem key={image.id} className="basis-full">
                      <div className="bg-white border border-gray-100 rounded-lg p-1">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <p className="text-xs text-center mt-1 text-gray-700">{image.title}</p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="h-6 w-6 -left-2" />
                <CarouselNext className="h-6 w-6 -right-2" />
              </Carousel>
            </div>
          </div>
        </div>

        {/* Columna 2: Opciones de Segundo Nivel */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          
          <ScrollArea className="h-80">
            <div className="space-y-3 pr-4">
              {items.map((item, index) => {
                const IconComponent = iconMap[item.icon];
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                      selectedSecondLevel === item.key 
                        ? 'bg-primary/10 border-primary/30 shadow-md transform scale-[1.02]' 
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md hover:scale-[1.01] hover:border-primary/20'
                    }`}
                    onClick={() => item.children ? handleItemClick(item.key, item.title) : handleItemClick(item.key)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {IconComponent && <IconComponent className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            {item.title}
                          </h4>
                          {item.children && <ArrowRight className="w-4 h-4 text-gray-400" />}
                        </div>
                        {item.children && (
                          <p className="text-sm text-gray-500 mt-1">
                            {item.children.length} opciones disponibles
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Columna 3: Opciones de Tercer Nivel */}
        {selectedItem && selectedItem.children && (
          <div className={`space-y-4 border-l border-gray-200 pl-6 transition-all duration-300 ${
            isTransitioning ? 'opacity-0 transform translate-x-4' : 'opacity-100 transform translate-x-0'
          }`}>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackClick}
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">{selectedItem.title}</h3>
            
            <ScrollArea className="h-80">
              <div className="space-y-2 pr-4">
                {selectedItem.children.map((child, index) => {
                  const IconComponent = iconMap[child.icon];
                  return (
                    <div 
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all duration-200 hover:scale-[1.01] hover:border-primary/20"
                      onClick={() => handleThirdLevelClick(selectedItem.key, child.key)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {IconComponent && <IconComponent className="w-4 h-4 text-gray-600" />}
                        </div>
                        <h4 className="font-medium text-gray-900">
                          {child.title}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const getMaxWidth = () => {
    switch (menuWidth) {
      case 'half':
        return '900px';
      case 'expanded':
        return '1400px';
      default:
        return '1200px';
    }
  };

  return (
    <div 
      className="fixed top-20 left-0 right-0 z-40"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      
      <div className="relative mx-auto transition-all duration-500 ease-out" style={{
        maxWidth: getMaxWidth()
      }}>
        <div className={`bg-white border border-gray-200 shadow-xl mx-4 lg:mx-8 rounded-lg p-6 lg:p-8 transition-all duration-500 min-h-[400px] ${
          isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}>
          {activeLevel === 'main' 
            ? renderMainLevel() 
            : renderThreeColumnLevel()
          }
        </div>
      </div>
    </div>
  );
};

export default BentoMegaMenu;
