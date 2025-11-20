
import React, { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { fetchAllMenuItemsForSearch, type SearchMenuItem } from '@/services/apiServiceMenuSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchableItems, setSearchableItems] = useState<SearchMenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Función para obtener el icono dinámicamente
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || LucideIcons.FileText;
  };

  // Cargar todos los items del sitio para búsqueda global
  useEffect(() => {
    const loadSearchData = async () => {
      setIsLoading(true);
      try {
        const items = await fetchAllMenuItemsForSearch();
        setSearchableItems(items);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Cargar datos cuando el modal se abre
    if (isOpen && searchableItems.length === 0) {
      loadSearchData();
    }
  }, [isOpen]);

  // Filtrar resultados basado en el término de búsqueda
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return searchableItems.filter(item =>
      item.title.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term)) ||
      (item.parentTitle && item.parentTitle.toLowerCase().includes(term))
    );
  }, [searchTerm, searchableItems]);

  // Manejar navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleResultClick(filteredResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  // Resetear selección cuando cambian los resultados
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Limpiar búsqueda al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleResultClick = (result: SearchMenuItem) => {
    // Si es una URL externa, abrir en nueva pestaña
    if (result.route.startsWith('http://') || result.route.startsWith('https://')) {
      window.open(result.route, '_blank');
    } else {
      navigate(result.route);
    }
    onClose();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'main': return 'Principal';
      case 'sub': return 'Sección';
      case 'child': return 'Subsección';
      default: return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'main': return 'bg-blue-100 text-blue-800';
      case 'sub': return 'bg-green-100 text-green-800';
      case 'child': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-[9999] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20">
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: '#0E2855' }}>
                Buscar en el sitio
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" style={{ color: '#0E2855' }} />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Escribe para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p>Cargando páginas del sitio...</p>
              </div>
            ) : searchTerm.trim() === '' ? (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Comienza a escribir para buscar en todo el sitio</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p>No se encontraron resultados para "{searchTerm}"</p>
              </div>
            ) : (
              <div className="p-2">
                  {filteredResults.map((result, index) => {
                  const IconComponent = getIcon(result.icon);
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <div
                      key={result.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-50 border-2 border-blue-200 scale-[1.02]' 
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-blue-100' : 'bg-gray-100'
                          }`}
                        >
                          <IconComponent 
                            className={`w-5 h-5 ${
                              isSelected ? 'text-blue-600' : 'text-gray-600'
                            }`} 
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-medium ${
                              isSelected ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {result.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(result.type)}`}>
                              {getTypeLabel(result.type)}
                            </span>
                          </div>
                          
                          {result.parentTitle && (
                            <p className="text-sm text-gray-500 mb-1">
                              En: {result.parentTitle}
                            </p>
                          )}
                          
                          {result.description && (
                            <p className="text-sm text-gray-600 truncate">
                              {result.description}
                            </p>
                          )}
                        </div>
                        
                        <div className={`text-sm px-2 py-1 rounded ${
                          isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          Enter
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>↑↓ Navegar</span>
                <span>Enter Seleccionar</span>
                <span>Esc Cerrar</span>
              </div>
              <span>{filteredResults.length} resultado{filteredResults.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;
