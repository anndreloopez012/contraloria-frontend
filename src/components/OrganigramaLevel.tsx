
import React, { useState, useCallback } from 'react';
import { OrganigramaItem } from '@/services/apiServiceOrganigrama';
import { OrganigramaNode } from './OrganigramaNode';

interface OrganigramaLevelProps {
  items: OrganigramaItem[];
  level: number;
}

interface NodeState {
  [key: string]: boolean;
}

export const OrganigramaLevel: React.FC<OrganigramaLevelProps> = ({ items, level }) => {
  const [expandedNodes, setExpandedNodes] = useState<NodeState>(() => {
    // Los nodos de nivel 0 y 1 están expandidos por defecto
    const initialState: NodeState = {};
    items.forEach(item => {
      initialState[item.id] = level <= 1;
    });
    return initialState;
  });

  const handleToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      {/* Contenedor de nodos del nivel actual */}
      <div className={`
        flex justify-center items-start gap-8 flex-wrap
        ${items.length === 1 ? 'justify-center' : 'justify-center'}
      `}>
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center">
            <OrganigramaNode
              item={item}
              level={level}
              isExpanded={expandedNodes[item.id] || false}
              onToggle={() => handleToggle(item.id)}
              isRoot={level === 0}
            />
            
            {/* Renderizar hijos si están expandidos */}
            {expandedNodes[item.id] && item.children && item.children.length > 0 && (
              <div className="mt-8">
                <OrganigramaLevel
                  items={item.children}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
