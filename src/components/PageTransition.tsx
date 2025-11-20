
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Componente para manejar transiciones suaves entre páginas
 * Proporciona animaciones de entrada y salida mejoradas
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const location = useLocation();

  useEffect(() => {
    // Cuando cambia la ruta, iniciar transición de salida
    setIsVisible(false);
    
    // Después de la animación de salida, actualizar el contenido y mostrar
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  useEffect(() => {
    // Mostrar el contenido inicial al montar
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes smoothFadeIn {
            from {
              opacity: 0;
              transform: translateY(15px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes smoothFadeOut {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateY(-10px) scale(0.98);
            }
          }
          
          .page-enter {
            animation: smoothFadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          
          .page-exit {
            animation: smoothFadeOut 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}
      </style>
      <div 
        className={`transition-all duration-400 ease-out ${
          isVisible ? 'page-enter' : 'page-exit'
        }`}
        style={{ 
          opacity: isVisible ? 1 : 0,
          transform: isVisible 
            ? 'translateY(0) scale(1)' 
            : 'translateY(15px) scale(0.98)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
        {displayChildren}
      </div>
    </>
  );
};

export default PageTransition;
