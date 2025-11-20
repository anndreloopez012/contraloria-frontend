/**
 * Servicio para consumir el API de información pública (Strapi v5)
 * Devuelve una estructura jerárquica de carpetas y archivos
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

export interface InfoPublicaItem {
  id: number;
  title: string;
  blank: boolean;
  href: string | null;           // Si blank === true, URL externa
  slug: string | null;           // Si blank === false, usar para navegar dentro del sitio
  description?: string | null;
  icon?: string | null;
  children: InfoPublicaItem[];
  isFile: boolean;               // true si es archivo final (sin hijos), false si es carpeta
}

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/menus`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'filters[slug][$eq]=menu-informacion-publica&populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][children][populate]=children'
};

// Interfaces Strapi v5
interface StrapiInfoPublicaItem {
  id: number;
  documentId: string;
  title: string;
  url?: string | null;
  route?: string | null;
  description?: string | null;
  target_blank: boolean;
  icon?: string | null;
  order?: number | null;
  active?: boolean;
  children: StrapiInfoPublicaItem[];
}

interface StrapiInfoPublicaResponse {
  data: Array<{
    id: number;
    documentId: string;
    title: string;
    slug: string;
    items: StrapiInfoPublicaItem[];
  }>;
  meta: any;
}

/**
 * Transforma un item de Strapi a InfoPublicaItem
 */
const transformItem = (item: StrapiInfoPublicaItem): InfoPublicaItem => {
  const blank = !!item.target_blank;
  const href = blank ? (item.url ?? null) : null;
  const slug = !blank ? (item.route ?? null) : null;
  const children = Array.isArray(item.children) ? item.children.map(transformItem) : [];
  const isFile = children.length === 0;

  return {
    id: item.id,
    title: item.title,
    blank,
    href,
    slug,
    description: item.description ?? null,
    icon: item.icon ?? null,
    children,
    isFile
  };
};

/**
 * Obtiene el menú de información pública y lo transforma
 */
export const fetchInfoPublicaData = async (): Promise<InfoPublicaItem[]> => {
  const cacheKey = 'cgc_info_publica_cache';
  try {
    const url = `${API_CONFIG.BASE_URL}?${API_CONFIG.ENDPOINT_PARAMS}`;
    logger.log('Fetching información pública:', url);

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_CONFIG.BEARER_TOKEN}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
    }

    const json: StrapiInfoPublicaResponse = await res.json();
    const root = json?.data?.[0];
    const items = root?.items ?? [];
    const transformed = items.map(transformItem);

    // Guardar en caché por 1 hora
    localStorage.setItem(cacheKey, JSON.stringify({
      data: transformed,
      timestamp: Date.now(),
    }));

    logger.log('Información pública transformed:', transformed);
    return transformed;
  } catch (error) {
    logger.error('Error fetching información pública:', error);

    // Fallback a caché (1 hora)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 3600000) {
          logger.log('Using cached información pública');
          return parsed.data as InfoPublicaItem[];
        }
      } catch (e) {
        logger.error('Error parsing cached información pública:', e);
      }
    }

    return [];
  }
};

/**
 * Función auxiliar para aplanar la estructura y obtener todos los items
 * Útil para el filtro de búsqueda
 */
export const flattenItems = (items: InfoPublicaItem[]): InfoPublicaItem[] => {
  const result: InfoPublicaItem[] = [];
  
  const flatten = (item: InfoPublicaItem) => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      item.children.forEach(flatten);
    }
  };
  
  items.forEach(flatten);
  return result;
};
