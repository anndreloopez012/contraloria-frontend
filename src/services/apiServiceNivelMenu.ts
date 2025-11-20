/**
 * Servicio para consumir el API de menú de nivel (menu-home) de CGC (Strapi v5)
 * Devuelve un árbol de 2 niveles con colores de texto y comportamiento de enlace.
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

export interface LevelMenuItem {
  id: number;
  title: string;
  blank: boolean;
  url: string | null;            // URL del API para redirigir (externa o interna)
  href: string | null;           // Si blank === true, URL externa
  slug: string | null;           // Si blank === false, usar para navegar dentro del sitio
  textColor?: string | null;
  textColorHover?: string | null;
  imageUrl?: string | null;      // URL de la imagen para el modal
  imageAlt?: string | null;      // Alt text de la imagen
  children: LevelMenuItem[];
}

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/menus`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'filters[slug][$eq]=menu-home&populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][images][populate]=*&populate[items][populate][children][populate][children][populate]=children'
};

// Interfaces Strapi v5
interface StrapiMenuItem {
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
  text_color?: string | null;
  text_color_hover?: string | null;
  images?: Array<{
    id: number;
    url: string;
    alternativeText?: string | null;
    formats?: {
      large?: { url: string };
      medium?: { url: string };
      small?: { url: string };
      thumbnail?: { url: string };
    };
  }>;
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
  meta: any;
}

/**
 * Transforma un item de Strapi a LevelMenuItem
 */
const transformItem = (item: StrapiMenuItem): LevelMenuItem => {
  const blank = !!item.target_blank;
  const url = item.url ?? null;  // Preservar el campo url del API
  const href = blank ? url : null;
  const slug = !blank ? (item.route ?? null) : null;
  
  // Extraer la primera imagen si existe y construir URL completa
  const firstImage = item.images?.[0];
  let imageUrl: string | null = null;
  
  if (firstImage) {
    const relativeUrl = firstImage.formats?.large?.url || firstImage.formats?.medium?.url || firstImage.url;
    // Si la URL es relativa, agregar el host del API
    imageUrl = relativeUrl.startsWith('http') ? relativeUrl : `${getApiHost()}${relativeUrl}`;
  }
  
  const imageAlt = firstImage?.alternativeText || item.title;

  return {
    id: item.id,
    title: item.title,
    blank,
    url,
    href,
    slug,
    textColor: item.text_color ?? null,
    textColorHover: item.text_color_hover ?? null,
    imageUrl,
    imageAlt,
    children: Array.isArray(item.children) ? item.children.map(transformItem) : []
  };
};

/**
 * Obtiene el menú "menu-home" y lo transforma
 */
export const fetchNivelMenuData = async (): Promise<LevelMenuItem[]> => {
  const cacheKey = 'cgc_level_menu_cache';
  try {
    const url = `${API_CONFIG.BASE_URL}?${API_CONFIG.ENDPOINT_PARAMS}`;
    logger.log('Fetching nivel menu (menu-home):', url);

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

    const json: StrapiMenuResponse = await res.json();
    const root = json?.data?.[0];
    const items = root?.items ?? [];
    const transformed = items.map(transformItem);

    // Guardar en caché por 1 hora
    localStorage.setItem(cacheKey, JSON.stringify({
      data: transformed,
      timestamp: Date.now(),
    }));

    logger.log('Nivel menu transformed:', transformed);
    return transformed;
  } catch (error) {
    logger.error('Error fetching nivel menu:', error);

    // Fallback a caché (1 hora)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 3600000) {
          logger.log('Using cached nivel menu');
          return parsed.data as LevelMenuItem[];
        }
      } catch (e) {
        logger.error('Error parsing cached nivel menu:', e);
      }
    }

    return [];
  }
};
