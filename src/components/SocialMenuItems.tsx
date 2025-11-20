
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type SocialMenuItem } from '@/services/apiServiceBottomSocialMenu';

interface SocialMenuItemsProps {
  items: SocialMenuItem[];
  variant: 'desktop' | 'mobile';
}

/**
 * Componente para mostrar elementos del menú social
 * Maneja la navegación según target_blank y muestra tooltips
 */
const SocialMenuItems: React.FC<SocialMenuItemsProps> = ({ items, variant }) => {
  const navigate = useNavigate();

  const handleItemClick = (item: SocialMenuItem) => {
    if (item.target_blank && item.route) {
      navigate(`/links/${item.route}`);
    }
    // Si target_blank es false, no hacer nada (solo icono sin funcionalidad)
  };

  if (variant === 'desktop') {
    return (
      <div className="flex items-center space-x-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative group"
            title={item.title}
          >
            <button
              onClick={() => handleItemClick(item)}
              className={`w-32 h-32 flex items-center justify-center rounded-lg transition-all duration-200 ${
                item.target_blank 
                  ? 'hover:bg-white/10 cursor-pointer hover:scale-105' 
                  : 'cursor-default'
              }`}
              disabled={!item.target_blank}
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-28 h-28 object-contain"
                />
              ) : (
                <div className="w-28 h-28 bg-white/20 rounded flex items-center justify-center text-2xl text-white font-medium">
                  {item.title.charAt(0)}
                </div>
              )}
            </button>
            
            {/* Tooltip para desktop */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
              {item.title}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Variant mobile - Ajustado para ser más compacto
  return (
    <div className="px-4 py-3 border-t border-gray-200">
      <div className="flex items-center justify-center space-x-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`h-10 px-3 flex items-center justify-center rounded-lg transition-all duration-200 ${
              item.target_blank 
                ? 'hover:bg-gray-100 cursor-pointer hover:scale-105' 
                : 'cursor-default'
            } bg-white border border-gray-200 shadow-sm`}
            disabled={!item.target_blank}
            title={item.title}
          >
            {item.imageUrl ? (
              <img 
                src={item.imageUrl}
                alt={item.title}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-600 font-semibold">
                {item.title.charAt(0)}
              </div>
            )}
            <span className="text-xs text-gray-600 ml-2 font-medium">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialMenuItems;
