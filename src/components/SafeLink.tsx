
import React from 'react';
import { sanitizeUrl, sanitizeText } from '@/utils/security';

interface SafeLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: '_blank' | '_self';
  rel?: string;
  title?: string;
  onClick?: () => void;
}

/**
 * Componente de enlace seguro que sanitiza URLs y previene vulnerabilidades
 */
export const SafeLink: React.FC<SafeLinkProps> = ({
  href,
  children,
  className = '',
  target = '_self',
  rel,
  title,
  onClick
}) => {
  const safeHref = sanitizeUrl(href);
  const safeTitle = title ? sanitizeText(title) : undefined;
  
  // Para enlaces externos, añadir rel="noopener noreferrer" por seguridad
  const safeRel = target === '_blank' 
    ? `noopener noreferrer ${rel || ''}`.trim()
    : rel;

  // Si la URL no es válida, renderizar como span
  if (safeHref === '#' && href !== '#') {
    return (
      <span className={className} title="Enlace no válido">
        {children}
      </span>
    );
  }

  return (
    <a
      href={safeHref}
      className={className}
      target={target}
      rel={safeRel}
      title={safeTitle}
      onClick={onClick}
    >
      {children}
    </a>
  );
};
