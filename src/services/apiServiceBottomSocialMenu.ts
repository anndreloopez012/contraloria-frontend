
/**
 * Servicio para consumir el API de menú social de CGC (Strapi v5)
 * Obtiene elementos del menú social para mostrar en el header y menú móvil
 */

import { getApiHost, getBearerToken, absUrl } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/menu-items`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'filters[menu][slug][$eq]=menu-social&populate=*'
};

// Interface para la imagen de Strapi
interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: {
      ext: string;
      url: string;
      hash: string;
      mime: string;
      name: string;
      path?: string;
      size: number;
      width: number;
      height: number;
      sizeInBytes: number;
    };
    small?: {
      ext: string;
      url: string;
      hash: string;
      mime: string;
      name: string;
      path?: string;
      size: number;
      width: number;
      height: number;
      sizeInBytes: number;
    };
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// Interface para el elemento de menú social de Strapi
interface StrapiSocialMenuItem {
  id: number;
  documentId: string;
  title: string;
  url?: string;
  route?: string;
  description?: string;
  target_blank: boolean;
  icon?: string;
  order?: number;
  active: boolean;
  text_color?: string;
  text_color_hover?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  menu: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  children: any[];
  images: StrapiImage[];
  parent?: any;
}

// Interface para la respuesta de Strapi
interface StrapiSocialMenuResponse {
  data: StrapiSocialMenuItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Interface para el elemento de menú social transformado
export interface SocialMenuItem {
  id: number;
  title: string;
  route?: string;
  target_blank: boolean;
  active: boolean;
  imageUrl?: string;
}

/**
 * Transforma un elemento de Strapi a la estructura esperada
 */
const transformStrapiSocialMenuItem = (item: StrapiSocialMenuItem): SocialMenuItem => {
  // Obtener la mejor imagen disponible (preferir thumbnail, luego original)
  let imageUrl: string | undefined;
  
  if (item.images && item.images.length > 0) {
    const image = item.images[0];
    imageUrl = image.formats?.thumbnail?.url || image.url;
    
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = absUrl(imageUrl);
    }
  }

  return {
    id: item.id,
    title: item.title,
    route: item.route,
    target_blank: item.target_blank,
    active: item.active,
    imageUrl
  };
};

/**
 * Obtiene los elementos del menú social desde el API de Strapi v5
 */
export const fetchSocialMenuItems = async (): Promise<SocialMenuItem[]> => {
  try {
    const url = `${API_CONFIG.BASE_URL}?${API_CONFIG.ENDPOINT_PARAMS}`;
    logger.log('Fetching social menu items from Strapi v5:', url);

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

    const data: StrapiSocialMenuResponse = await response.json();
    logger.log('Raw Strapi v5 social menu response:', data);

    // Transformar datos y filtrar solo los activos
    const transformedItems = data.data
      .filter(item => item.active)
      .map(transformStrapiSocialMenuItem);
    
    logger.log('Transformed social menu items:', transformedItems);

    // Guardar en localStorage para caché
    localStorage.setItem('cgc_social_menu_cache', JSON.stringify({
      data: transformedItems,
      timestamp: Date.now()
    }));

    return transformedItems;
  } catch (error) {
    logger.error('Error fetching social menu items from Strapi v5:', error);
    
    // Intentar usar caché si existe
    const cachedData = localStorage.getItem('cgc_social_menu_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Si el caché tiene menos de 1 hora, usarlo
        if (cacheAge < 3600000) {
          logger.log('Using cached social menu data');
          return parsed.data;
        }
      } catch (cacheError) {
        logger.error('Error parsing cached social menu data:', cacheError);
      }
    }
    
    // Si todo falla, retornar array vacío
    return [];
  }
};

/**
 * Limpia el caché del menú social
 */
export const clearSocialMenuCache = () => {
  localStorage.removeItem('cgc_social_menu_cache');
};
