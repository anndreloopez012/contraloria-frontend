/**
 * Servicio específico para el search del header
 * Obtiene TODOS los menús sin filtros para búsqueda global en el sitio
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API - SIN FILTRO de slug para obtener TODAS las páginas
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/menus`,
  BEARER_TOKEN: getBearerToken(),
  // Sin filtro de slug - obtiene todos los menús del sitio
  ENDPOINT_PARAMS: 'populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][children][populate]=children'
};

// Interfaces para Strapi v5
interface StrapiMenuItem {
  id: number;
  documentId: string;
  title: string;
  url?: string;
  description?: string;
  target_blank: boolean;
  icon?: string;
  route?: string;
  active?: boolean;
  order?: number;
  children: StrapiMenuItem[];
}

interface StrapiMenuResponse {
  data: Array<{
    id: number;
    documentId: string;
    title: string;
    slug: string;
    items: StrapiMenuItem[];
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface SearchMenuItem {
  id: string;
  title: string;
  description?: string;
  route: string;
  icon: string;
  type: 'main' | 'sub' | 'child';
  parentTitle?: string;
  menuSlug: string;
}

/**
 * Mapeo de iconos por defecto basado en el título
 */
const getDefaultIcon = (title: string): string => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('inicio')) return 'Home';
  if (titleLower.includes('nosotros')) return 'Users';
  if (titleLower.includes('legislac')) return 'Scale';
  if (titleLower.includes('servicio')) return 'Settings';
  if (titleLower.includes('publicac')) return 'BookOpen';
  if (titleLower.includes('enlace')) return 'Link';
  if (titleLower.includes('contact')) return 'Phone';
  if (titleLower.includes('historia')) return 'FileText';
  if (titleLower.includes('autoridad')) return 'Users';
  if (titleLower.includes('filosofia')) return 'Award';
  if (titleLower.includes('ubicac')) return 'MapPin';
  if (titleLower.includes('estructura')) return 'Building';
  if (titleLower.includes('oficina')) return 'Building';
  if (titleLower.includes('region')) return 'MapPin';
  if (titleLower.includes('delegac')) return 'MapPin';
  if (titleLower.includes('audit')) return 'FileText';
  if (titleLower.includes('informe')) return 'FileText';
  if (titleLower.includes('boletin')) return 'BookOpen';
  if (titleLower.includes('portal')) return 'Globe';
  if (titleLower.includes('organismo')) return 'Globe';
  if (titleLower.includes('sistema')) return 'Settings';
  
  return 'FileText';
};

/**
 * Convierte un item de Strapi en una ruta navegable
 */
const getItemRoute = (item: StrapiMenuItem, parentRoute?: string): string => {
  const itemKey = item.route || item.title.toLowerCase().replace(/\s+/g, '-');
  
  // Si tiene URL externa, usarla
  if (item.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
    return item.url;
  }
  
  // Construir ruta interna
  if (parentRoute) {
    return `${parentRoute}/${itemKey}`;
  }
  
  return `/${itemKey}`;
};

/**
 * Aplana recursivamente los items del menú para búsqueda
 */
const flattenMenuItems = (
  items: StrapiMenuItem[], 
  menuSlug: string,
  parentRoute: string = '',
  parentTitle: string = '',
  type: 'main' | 'sub' | 'child' = 'main'
): SearchMenuItem[] => {
  const result: SearchMenuItem[] = [];
  
  items.forEach(item => {
    const route = getItemRoute(item, parentRoute);
    const icon = item.icon || getDefaultIcon(item.title);
    
    // Agregar el item actual
    result.push({
      id: `${menuSlug}-${item.documentId}`,
      title: item.title,
      description: item.description || `Información sobre ${item.title}`,
      route,
      icon,
      type,
      parentTitle: parentTitle || undefined,
      menuSlug
    });
    
    // Procesar hijos recursivamente
    if (item.children && item.children.length > 0) {
      const childType: 'sub' | 'child' = type === 'main' ? 'sub' : 'child';
      const newParentTitle = parentTitle 
        ? `${parentTitle} > ${item.title}` 
        : item.title;
      
      const childItems = flattenMenuItems(
        item.children,
        menuSlug,
        route,
        newParentTitle,
        childType
      );
      
      result.push(...childItems);
    }
  });
  
  return result;
};

/**
 * Obtiene TODOS los items de TODOS los menús para búsqueda global
 */
export const fetchAllMenuItemsForSearch = async (): Promise<SearchMenuItem[]> => {
  try {
    const url = `${API_CONFIG.BASE_URL}?${API_CONFIG.ENDPOINT_PARAMS}`;
    logger.log('Fetching ALL menu items for search from Strapi v5:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const data: StrapiMenuResponse = await response.json();
    logger.log('Raw Strapi v5 response for search:', data);

    // Procesar TODOS los menús, no solo uno
    const allSearchItems: SearchMenuItem[] = [];
    
    data.data.forEach(menu => {
      if (menu.items && menu.items.length > 0) {
        const menuItems = flattenMenuItems(menu.items, menu.slug);
        allSearchItems.push(...menuItems);
      }
    });

    logger.log(`Total search items from all menus: ${allSearchItems.length}`);
    
    // Guardar en localStorage para caché
    localStorage.setItem('cgc_search_cache', JSON.stringify({
      data: allSearchItems,
      timestamp: Date.now()
    }));

    return allSearchItems;
  } catch (error) {
    logger.error('Error fetching menu items for search from Strapi v5:', error);
    
    // Intentar usar caché si existe
    const cachedData = localStorage.getItem('cgc_search_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Si el caché tiene menos de 1 hora, usarlo
        if (cacheAge < 3600000) {
          logger.log('Using cached search data');
          return parsed.data;
        }
      } catch (cacheError) {
        logger.error('Error parsing cached search data:', cacheError);
      }
    }
    
    // Si todo falla, retornar array vacío
    return [];
  }
};

/**
 * Limpia el caché del search
 */
export const clearSearchCache = () => {
  localStorage.removeItem('cgc_search_cache');
};
