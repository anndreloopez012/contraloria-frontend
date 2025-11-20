import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, Mail, Book, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Componente SidebarMenu
 * 
 * Menú lateral que se muestra únicamente en la página de inicio.
 * Obtiene los datos desde un archivo JSON simulando una API.
 * Incluye transiciones suaves y navegación fluida.
 * 
 * Estructura:
 * - Título del menú "Servicios a usuarios"
 * - Lista de opciones de servicios con íconos
 * - Transiciones bidireccionales mejoradas
 * - Compatible con React + Astro
 */

// Tipos para el menú
interface MenuItem {
  id: number;
  title: string;
  route: string;
  icon: string;
  description: string;
  color: string;
  bgColor: string;
  priority: number;
  active: boolean;
}

interface SidebarMenuData {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  menuItems: MenuItem[];
}

// Mapeo de iconos de Lucide React
const iconMap = {
  FileText,
  Mail,
  Book,
  RefreshCcw
};

const SidebarMenu = () => {
  const navigate = useNavigate();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [menuData, setMenuData] = useState<SidebarMenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del menú desde JSON
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const response = await fetch('/src/data/sidebarMenuAPI.json');
        const data = await response.json();
        setMenuData(data.sidebarMenu);
      } catch (error) {
        console.error('Error loading sidebar menu data:', error);
        // Datos de fallback con todas las opciones
        setMenuData({
          title: "Servicios a usuarios",
          subtitle: "Accede a todos los servicios disponibles",
          version: "1.1",
          lastUpdated: "2024-12-27",
          menuItems: [
              {
                id: 1,
                title: "Estado de Cuenta",
                route: "/estado-cuenta",
                icon: "FileText",
                description: "Consulta el estado de tu cuenta y movimientos",
                color: "text-primary",
                bgColor: "bg-primary/5 hover:bg-primary/10 border-primary/20",
                priority: 1,
                active: true
              },
              {
                id: 2,
                title: "Solicitud de Finiquito",
                route: "/solicitud-finiquito",
                icon: "FileText",
                description: "Realiza tu solicitud de finiquito en línea",
                color: "text-primary",
                bgColor: "bg-primary/5 hover:bg-primary/10 border-primary/20",
                priority: 2,
                active: true
              },
              {
                id: 3,
                title: "Comunicaciones Electrónicas",
                route: "/comunicaciones-electronicas",
                icon: "Mail",
                description: "Gestiona tus comunicaciones electrónicas",
                color: "text-primary",
                bgColor: "bg-primary/5 hover:bg-primary/10 border-primary/20",
                priority: 3,
                active: true
              },
              {
                id: 4,
                title: "Registro de títulos",
                route: "/registro-titulos",
                icon: "Book",
                description: "Registra y consulta títulos académicos",
                color: "text-primary",
                bgColor: "bg-primary/5 hover:bg-primary/10 border-primary/20",
                priority: 4,
                active: true
              },
              {
                id: 5,
                title: "Actualización de Datos",
                route: "/actualizacion-datos",
                icon: "RefreshCcw",
                description: "Actualiza tu información personal",
                color: "text-primary",
                bgColor: "bg-primary/5 hover:bg-primary/10 border-primary/20",
                priority: 5,
                active: true
              },
              {
                id: 6,
                title: "Declaración Jurada Patrimonial",
                route: "/declaracion-patrimonial",
                icon: "FileText",
                description: "Presenta tu declaración jurada patrimonial",
                color: "text-primary",
                bgColor: "bg-primary/5 hover:bg-primary/10 border-primary/20",
                priority: 6,
                active: true
              },
              {
                id: 7,
                title: "Manuales y Procedimientos",
                route: "/manuales-procedimientos",
                icon: "Book",
                description: "Consulta manuales y procedimientos en PDF",
                color: "text-primary",
                bgColor: "bg-primary/5 hover:bg-primary/10 border-primary/20",
                priority: 7,
                active: true
              }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuData();
  }, []);

  const handleNavigation = (route: string) => {
    if (route === '/') return;
    
    setIsTransitioning(true);
    
    // Añadir clase de transición al body
    if (typeof document !== 'undefined') {
      document.body.classList.add('page-transitioning');
    }

    // Transición mejorada tipo slide
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(route);
        setTimeout(() => {
          setIsTransitioning(false);
          document.body.classList.remove('page-transitioning');
        }, 300);
      });
    } else {
      // Fallback con animación slide personalizada
      if (typeof document !== 'undefined') {
        const mainElement = document.querySelector('main');
        if (mainElement) {
          mainElement.style.transform = 'translateX(-20px)';
          mainElement.style.opacity = '0.8';
          mainElement.style.filter = 'blur(2px)';
          mainElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          
          setTimeout(() => {
            navigate(route);
            mainElement.style.transform = 'translateX(0)';
            mainElement.style.opacity = '1';
            mainElement.style.filter = 'blur(0px)';
            setTimeout(() => {
              setIsTransitioning(false);
              document.body.classList.remove('page-transitioning');
              mainElement.style.transition = '';
            }, 300);
          }, 150);
        } else {
          navigate(route);
          setIsTransitioning(false);
          document.body.classList.remove('page-transitioning');
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200/50 p-6 h-fit sticky top-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!menuData) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 h-fit sticky top-6 transition-all duration-300">
      {/* Header del menú */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-primary mb-2 animate-fade-in-up">
          {menuData.title}
        </h2>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-3 animate-fade-in-scale"></div>
        <p className="text-sm text-gray-600 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {menuData.subtitle}
        </p>
      </div>

      <nav className="space-y-3">
        {menuData.menuItems.map((item, index) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap] || FileText;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`w-full justify-start text-left p-3 h-auto ${item.bgColor} 
                transition-all duration-300 hover:shadow-md border 
                ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}
                animate-fade-in-up relative overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleNavigation(item.route)}
              disabled={item.route === '/' || isTransitioning}
            >
              <div className="flex items-start space-x-3 w-full relative z-10">
                <div className={`flex-shrink-0 p-2 rounded bg-primary/10 shadow-sm ${item.color} transition-all duration-300`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate text-sm">
                      {item.title}
                    </span>
                    {item.route !== '/' && (
                      <ChevronRight className="w-4 h-4 text-gray-400 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            </Button>
          );
        })}
      </nav>

      {/* Footer del menú */}
      <div className="mt-6 pt-4 border-t border-gray-200/50 text-center animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <p className="text-xs text-gray-500">
          Contraloría General de Cuentas
        </p>
        <p className="text-xs text-gray-400 mt-1">
          v{menuData.version} • {menuData.lastUpdated}
        </p>
      </div>
    </div>
  );
};

export default SidebarMenu;
