import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticlesSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  resultsCount: number;
}

const ArticlesSearchModal: React.FC<ArticlesSearchModalProps> = ({
  isOpen,
  onClose,
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  resultsCount
}) => {
  const [showCategories, setShowCategories] = useState(false);

  // Limpiar estados al cerrar modal
  useEffect(() => {
    if (!isOpen) {
      setShowCategories(false);
    }
  }, [isOpen]);

  // Manejar escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
              <h2 className="text-xl font-semibold text-primary">
                Buscar Artículos
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en artículos..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg"
                autoFocus
              />
            </div>

            {/* Categories Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowCategories(!showCategories)}
              className="w-full justify-between rounded-xl"
            >
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar por categoría
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {selectedCategory}
              </span>
            </Button>
          </div>

          {/* Categories Section */}
          {showCategories && (
            <div className="p-6 border-b border-gray-200 bg-gray-50/50 animate-fade-in">
              <h3 className="text-sm font-medium text-foreground flex items-center mb-3">
                <Tag className="w-4 h-4 mr-2" />
                Selecciona una categoría
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onCategoryChange(category);
                      setShowCategories(false);
                    }}
                    className={`transition-all duration-200 rounded-lg text-xs justify-start ${
                      selectedCategory === category 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'hover:bg-white/80'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Results Info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Esc Cerrar</span>
                {(searchTerm || selectedCategory !== 'Todos') && (
                  <span className="text-primary font-medium">
                    {resultsCount} resultado{resultsCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticlesSearchModal;