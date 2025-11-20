
import React from 'react';
import { useGlobalInfo } from '@/hooks/useGlobalInfo';

/**
 * Componente sin UI que aplica SEO e íconos globales.
 * Se monta una sola vez en App.
 */
const GlobalHead: React.FC = () => {
  useGlobalInfo();
  return null;
};

export default GlobalHead;
