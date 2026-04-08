import React, { useEffect, useState } from 'react';
import { fetchNivelMenuData, type LevelMenuItem } from '@/services/apiServiceNivelMenu';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { navigateWithMenuUrl } from '@/utils/menuNavigation';

/**
 * LevelMenu
 * - 2 columnas en desktop, 1 columna en móvil.
 * - Primer nivel:
 *   - Si tiene hijos: solo texto (sin hover/click) con negrita y tamaño grande.
 *   - Si no tiene hijos: clickable + hover animado con negrita y tamaño grande.
 * - Segundo nivel: clickable + hover animado con texto normal y tamaño menor.
 * - Colores: usa text_color y text_color_hover del API si existen.
 */
const LevelMenu: React.FC = () => {
  const [items, setItems] = useState<LevelMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LevelMenuItem | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchNivelMenuData();
      setItems(data);
      setLoading(false);
    };
    load();
  }, []);

  // Función para filtrar elementos
  const filterItems = (items: LevelMenuItem[], term: string): LevelMenuItem[] => {
    if (!term.trim()) return items;
    
    return items.map(parent => {
      // Filtrar hijos que coincidan con el término de búsqueda
      const filteredChildren = parent.children?.filter(child =>
        child.title.toLowerCase().includes(term.toLowerCase())
      ) || [];
      
      // Si el padre coincide con el término o tiene hijos que coinciden, incluirlo
      if (parent.title.toLowerCase().includes(term.toLowerCase()) || filteredChildren.length > 0) {
        return {
          ...parent,
          children: filteredChildren
        };
      }
      
      return null;
    }).filter(Boolean) as LevelMenuItem[];
  };

  const filteredItems = filterItems(items, searchTerm);

  // Divide en dos columnas balanceadas
  const left: LevelMenuItem[] = [];
  const right: LevelMenuItem[] = [];
  filteredItems.forEach((item, idx) => (idx % 2 === 0 ? left : right).push(item));

  const defaultText = '#FFFFFF';
  const defaultHover = '#F5C842';

  const navigateToItem = (item: LevelMenuItem) => {
    // Prioridad 1: Si hay URL del API, usarla normalizada
    if (navigateWithMenuUrl(item.url, item.blank, navigate)) {
      return;
    }
    
    // Prioridad 2: Si no hay URL pero hay href (fallback)
    if (item.blank && item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Prioridad 3: Navegación interna con slug
    if (!item.blank && item.slug) {
      navigate(`/${item.slug}`);
    }
  };

  const handleClick = (item: LevelMenuItem, isSecondLevel: boolean = false) => {
    if (item.children && item.children.length > 0) return; // Primer nivel con hijos: no hace nada
    
    // Si es segundo nivel y tiene imagen, mostrar modal
    if (isSecondLevel && item.imageUrl) {
      setSelectedItem(item);
      setModalOpen(true);
      return;
    }
    
    // Si no tiene imagen o es primer nivel, navegar directamente
    navigateToItem(item);
  };

  const handleModalNavigate = () => {
    if (selectedItem) {
      setModalOpen(false);
      // Pequeño delay para que se complete la animación de cierre
      setTimeout(() => {
        navigateToItem(selectedItem);
      }, 200);
    }
  };

  const renderLink = (item: LevelMenuItem, isFirstLevelClickable: boolean) => {
    const clickable = isFirstLevelClickable || (item.children?.length ?? 0) === 0;
    const textColor = item.textColor || defaultText;
    const hoverColor = item.textColorHover || defaultHover;

    if (!clickable) {
      // Solo texto (sin hover) - Primer nivel con hijos
      return (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h3
              className="font-bold text-xl md:text-2xl lg:text-3xl tracking-tight"
              style={{ color: textColor }}
            >
              {item.title}
            </h3>
          </div>
        </div>
      );
    }

    // Clickable con animación de hover - Primer nivel sin hijos
    return (
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <button
            type="button"
            onClick={() => handleClick(item)}
            className="story-link font-bold text-xl md:text-2xl lg:text-3xl tracking-tight transition-all duration-200 hover:translate-x-1"
            style={{ color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
            aria-label={item.title}
            title={item.title}
          >
            {item.title}
          </button>
        </div>
      </div>
    );
  };

  const renderChild = (child: LevelMenuItem) => {
    const textColor = child.textColor || defaultText;
    const hoverColor = child.textColorHover || defaultHover;

    return (
      <li key={child.id} className="group">
        <div className="flex items-center gap-3 py-2">
          <div className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-yellow-400 transition-colors duration-200" />
          <button
            type="button"
            onClick={() => handleClick(child, true)}
            className="story-link text-base md:text-lg font-normal transition-all duration-200 hover:translate-x-1"
            style={{ color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = textColor)}
            aria-label={child.title}
            title={child.title}
          >
            {child.title}
          </button>
        </div>
      </li>
    );
  };

  if (loading) {
    return (
      <section className="w-full py-10" style={{ backgroundColor: '#0C2D69' }}>
        <div className="container mx-auto px-4">
          {/* Filtro de búsqueda - loading state */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <div className="h-12 bg-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 ml-4">
                  <div className="w-2 h-2 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-8 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 ml-4">
                  <div className="w-2 h-2 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-5 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!items.length) return null;

  const Column = ({ data }: { data: LevelMenuItem[] }) => (
    <div className="space-y-8">
      {data.map((parent) => {
        const hasChildren = parent.children && parent.children.length > 0;
        return (
          <div key={parent.id} className="p-6">
            {renderLink(parent, !hasChildren)}
            {hasChildren && (
              <div className="ml-7">
                <ul className="space-y-1 pl-4">
                  {parent.children.map((c) => renderChild(c))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <section className="w-full py-12" style={{ backgroundColor: '#0C2D69' }}>
        <div className="container mx-auto px-4">
          {/* Filtro de búsqueda centrado */}
          <div className="flex justify-center mb-8">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/60" />
              </div>
              <input
                type="text"
                placeholder="Buscar en el menú..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-200"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/60 hover:text-white transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Mensaje cuando no hay resultados */}
          {searchTerm && filteredItems.length === 0 && (
            <div className="text-center py-8">
              <div className="text-white/60 text-lg">
                No se encontraron resultados para "{searchTerm}"
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          {/* Contenido del menú */}
          {filteredItems.length > 0 && (
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Línea divisoria vertical solo en lg+ */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
              <Column data={left} />
              <Column data={right} />
            </div>
          )}
        </div>
      </section>

      {/* Modal de vista previa */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-center mb-4">
              {selectedItem?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 py-2">
            {selectedItem?.imageUrl ? (
              <div className="w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden p-4">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.imageAlt || selectedItem.title}
                  className="w-full h-auto max-h-[60vh] object-contain animate-fade-in"
                  loading="eager"
                  style={{ animationDelay: '100ms' }}
                />
              </div>
            ) : (
              <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-500">No hay imagen disponible</p>
              </div>
            )}
            <Button
              onClick={handleModalNavigate}
              className="w-full max-w-md animate-fade-in"
              size="lg"
              style={{ animationDelay: '200ms' }}
            >
              Ir a {selectedItem?.title}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LevelMenu;
