
/**
 * Servicio para consumir el API de menús de CGC (Strapi v5)
 * Maneja las llamadas HTTP y transformación de datos específicamente para menús
 */

import { MenuItem } from '@/hooks/useContentAPI';
import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/menus`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'filters[slug][$eq]=menu&populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][children][populate]=children'
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
 * Transforma un elemento de Strapi v5 a la estructura MenuItem esperada
 */
const transformStrapiMenuItem = (item: StrapiMenuItem, parentKey?: string): MenuItem => {
  const key = item.title.toLowerCase().replace(/\s+/g, '-');
  const route = item.route || key;
  
  const transformedItem: MenuItem = {
    icon: item.icon || getDefaultIcon(item.title),
    title: item.title,
    key: key,
    route,
    description: item.description || `Información sobre ${item.title}`,
    color: `bg-blue-50/60 border-blue-200/40`,
    iconColor: 'text-blue-600',
    target_blank: item.target_blank || false
  };

  // Si tiene children, los transformamos recursivamente
  if (item.children && item.children.length > 0) {
    transformedItem.children = item.children.map(child => 
      transformStrapiMenuItem(child, key)
    );
  }

  return transformedItem;
};

/**
 * Transforma la respuesta de Strapi v5 a la estructura esperada por los componentes
 */
const transformStrapiResponse = (strapiResponse: StrapiMenuResponse) => {
  try {
    if (!strapiResponse.data || strapiResponse.data.length === 0) {
      throw new Error('No menu data found in API response');
    }

    const menuData = strapiResponse.data[0];
    const items = menuData.items;

    // Transformar items principales para mainNavItems
    const mainNavItems: MenuItem[] = items.map(item => transformStrapiMenuItem(item));

    // Crear estructura de menú anidado
    const menuStructure: Record<string, MenuItem[]> = {};
    
    items.forEach(item => {
      const key = item.title.toLowerCase().replace(/\s+/g, '-');
      
      if (item.children && item.children.length > 0) {
        // Si tiene hijos, usar los hijos como estructura del menú
        menuStructure[key] = item.children.map(child => transformStrapiMenuItem(child, key));
      } else {
        // Si no tiene hijos, crear una entrada básica
        menuStructure[key] = [transformStrapiMenuItem(item)];
      }
    });

    logger.log('Strapi v5 response transformed successfully:', { mainNavItems, menuStructure });
    
    return {
      mainNavItems,
      menuStructure
    };
  } catch (error) {
    logger.error('Error transforming Strapi v5 response:', error);
    throw error;
  }
};

/**
 * Obtiene los datos del menú desde el API de Strapi v5
 */
export const fetchMenuData = async () => {
  try {
    const url = `${API_CONFIG.BASE_URL}?${API_CONFIG.ENDPOINT_PARAMS}`;
    logger.log('Fetching menu data from Strapi v5:', url);

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
    logger.log('Raw Strapi v5 response:', data);

    const transformedData = transformStrapiResponse(data);
    
    // Guardar en localStorage para caché
    localStorage.setItem('cgc_menu_cache', JSON.stringify({
      data: transformedData,
      timestamp: Date.now()
    }));

    return transformedData;
  } catch (error) {
    logger.error('Error fetching menu data from Strapi v5:', error);
    
    // Intentar usar caché si existe
    const cachedData = localStorage.getItem('cgc_menu_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Si el caché tiene menos de 1 hora, usarlo
        if (cacheAge < 3600000) {
          logger.log('Using cached menu data');
          return parsed.data;
        }
      } catch (cacheError) {
        logger.error('Error parsing cached data:', cacheError);
      }
    }
    
    // Si todo falla, lanzar error
    throw error;
  }
};

/**
 * Limpia el caché del menú
 */
export const clearMenuCache = () => {
  localStorage.removeItem('cgc_menu_cache');
};

/**
 * Verifica si el API está disponible
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_CONFIG.BASE_URL, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`
      }
    });
    return response.ok;
  } catch {
    return false;
  }
};
