import React, { useState, useCallback, useMemo } from 'react';
import { InfoPublicaItem } from '@/services/apiServiceInfoPublica';
import { InfoPublicaNode } from './InfoPublicaNode';
import { Input } from '@/components/ui/input';
import { Search, FolderTree } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InfoPublicaTreeProps {
  items: InfoPublicaItem[];
}

interface NodeState {
  [key: string]: boolean;
}

export const InfoPublicaTree: React.FC<InfoPublicaTreeProps> = ({ items }) => {
  const [expandedNodes, setExpandedNodes] = useState<NodeState>({});
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  }, []);

  // Función recursiva para buscar items
  const searchItems = useCallback((items: InfoPublicaItem[], term: string): InfoPublicaItem[] => {
    if (!term) return items;

    const lowerTerm = term.toLowerCase();
    const results: InfoPublicaItem[] = [];

    const searchRecursive = (item: InfoPublicaItem): InfoPublicaItem | null => {
      const matchesTitle = item.title.toLowerCase().includes(lowerTerm);
      const matchesDescription = item.description?.toLowerCase().includes(lowerTerm);
      
      const filteredChildren = item.children
        .map(child => searchRecursive(child))
        .filter((child): child is InfoPublicaItem => child !== null);

      if (matchesTitle || matchesDescription || filteredChildren.length > 0) {
        return {
          ...item,
          children: filteredChildren
        };
      }

      return null;
    };

    items.forEach(item => {
      const result = searchRecursive(item);
      if (result) results.push(result);
    });

    return results;
  }, []);

  // Expandir todos los nodos cuando hay búsqueda activa
  const filteredItems = useMemo(() => {
    const filtered = searchItems(items, searchTerm);
    
    if (searchTerm) {
      const expandAll = (items: InfoPublicaItem[]) => {
        items.forEach(item => {
          if (!item.isFile) {
            setExpandedNodes(prev => ({ ...prev, [item.id.toString()]: true }));
            if (item.children.length > 0) {
              expandAll(item.children);
            }
          }
        });
      };
      expandAll(filtered);
    }
    
    return filtered;
  }, [items, searchTerm, searchItems]);

  const renderItem = (item: InfoPublicaItem, level: number = 0) => {
    const nodeId = item.id.toString();
    const isExpanded = expandedNodes[nodeId] || !!searchTerm;

    return (
      <div key={item.id} className="mb-1 md:mb-2">
        <InfoPublicaNode
          item={item}
          level={level}
          isExpanded={isExpanded}
          onToggle={() => handleToggle(nodeId)}
          searchTerm={searchTerm}
        />
        
        {isExpanded && item.children.length > 0 && (
          <div className="mt-1 md:mt-2 space-y-1 md:space-y-2">
            {item.children.map(child => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FolderTree className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No hay información pública disponible</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3 md:space-y-4">
      {/* Buscador - Más compacto en móvil */}
      <div className="relative">
        <Search className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 md:w-4 md:h-4" />
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 md:pl-10 h-9 md:h-10 text-sm md:text-base"
        />
      </div>

      {/* Árbol de archivos - Altura ajustada para móvil */}
      <ScrollArea className="h-[calc(100vh-240px)] md:h-[calc(100vh-280px)]">
        <div className="space-y-1 md:space-y-2 pr-2 md:pr-4">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => renderItem(item))
          ) : (
            <div className="text-center py-6 md:py-8 text-muted-foreground">
              <Search className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-2 md:mb-3 opacity-50" />
              <p className="text-sm md:text-base">No se encontraron resultados para "{searchTerm}"</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
