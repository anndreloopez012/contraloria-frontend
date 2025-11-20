
/**
 * Servicio para consumir el API de enlaces externos de CGC (Strapi v5)
 * Maneja las llamadas HTTP y transformación de datos específicamente para enlaces con target_blank
 */

import { getApiHost, getBearerToken, absUrl } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API (estandarizada y con el mismo token que apiServiceMenu)
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/menu-items`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'filters[menu][slug][$eq]=menu-link-blank&populate=*'
};

// Interfaces para Strapi v5 - Enlaces externos (menu-items)
interface StrapiImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiLinkItem {
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
  images?: StrapiImage[];
  menu?: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
  };
}

interface StrapiLinkResponse {
  data: StrapiLinkItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipo para enlaces externos
export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  target: '_blank' | '_self';
  icon?: string;
  tooltip: string;
  imageUrl?: string;
}

/**
 * Transforma un elemento de Strapi v5 a la estructura ExternalLink esperada
 */
const transformStrapiLinkItem = (item: StrapiLinkItem): ExternalLink => {
  // Extraer la URL de la imagen si existe
  const imageUrl = item.images && item.images.length > 0 
    ? absUrl(item.images[0].url)
    : undefined;

  return {
    id: item.documentId,
    title: item.title,
    url: item.url || '#',
    target: item.target_blank ? '_blank' : '_self',
    icon: item.icon || 'ExternalLink',
    tooltip: item.title, // El título será usado como tooltip
    imageUrl
  };
};

/**
 * Transforma la respuesta de Strapi v5 a la estructura esperada por los componentes
 */
const transformStrapiLinkResponse = (strapiResponse: StrapiLinkResponse): ExternalLink[] => {
  try {
    if (!strapiResponse.data || strapiResponse.data.length === 0) {
      logger.warn('No external link data found in API response');
      return [];
    }

    // Los datos vienen directamente en el array data
    const items = strapiResponse.data;

    // Transformar items a enlaces externos
    const externalLinks: ExternalLink[] = items.map(item => transformStrapiLinkItem(item));

    logger.log('Strapi v5 external links response transformed successfully:', externalLinks);
    
    return externalLinks;
  } catch (error) {
    logger.error('Error transforming Strapi v5 external links response:', error);
    throw error;
  }
};

/**
 * Obtiene los datos de enlaces externos desde el API de Strapi v5
 */
export const fetchExternalLinks = async (): Promise<ExternalLink[]> => {
  try {
    const url = `${API_CONFIG.BASE_URL}?${API_CONFIG.ENDPOINT_PARAMS}`;
    logger.log('Fetching external links data from Strapi v5:', url);

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

    const data: StrapiLinkResponse = await response.json();
    logger.log('Raw Strapi v5 external links response:', data);

    const transformedData = transformStrapiLinkResponse(data);
    
    // Guardar en localStorage para caché
    localStorage.setItem('cgc_external_links_cache', JSON.stringify({
      data: transformedData,
      timestamp: Date.now()
    }));

    return transformedData;
  } catch (error) {
    logger.error('Error fetching external links data from Strapi v5:', error);
    
    // Intentar usar caché si existe
    const cachedData = localStorage.getItem('cgc_external_links_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - parsed.timestamp;
        
        // Si el caché tiene menos de 1 hora, usarlo
        if (cacheAge < 3600000) {
          logger.log('Using cached external links data');
          return parsed.data;
        }
      } catch (cacheError) {
        logger.error('Error parsing cached external links data:', cacheError);
      }
    }
    
    // Si todo falla, devolver array vacío
    logger.warn('⚠️ No se pudieron cargar los enlaces externos desde el API');
    return [];
  }
};

/**
 * Limpia el caché de enlaces externos
 */
export const clearExternalLinksCache = () => {
  localStorage.removeItem('cgc_external_links_cache');
};

/**
 * Verifica si el API de enlaces externos está disponible
 */
export const checkExternalLinksApiHealth = async (): Promise<boolean> => {
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
