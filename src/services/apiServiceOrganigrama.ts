
/**
 * Servicio para el API de organigrama de CGC
 * Nuevo endpoint jerárquico:
 * https://cgc-adm.server-softplus.plus/api/menus?filters[slug][$eq]=organigrama&populate[items][filters][parent][id][$null]=true&populate[items][populate][children][populate][children][populate]=children
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/menus`,
  BEARER_TOKEN: getBearerToken()
};

// Interfaces para compatibilidad previa (no usadas con el nuevo endpoint, se conservan por si se requieren)
interface StrapiMenu {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface StrapiMenuItem {
  id: number;
  documentId: string;
  title: string;
  url: string | null;
  route: string;
  description: string;
  target_blank: boolean;
  icon: string | null;
  active: boolean;
  text_color: string | null;
  text_color_hover: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  menu: StrapiMenu;
  children: any[];
  images: any;
  parent: any;
}

// Interfaces para el nuevo endpoint jerárquico
interface StrapiNestedItem {
  id: number;
  documentId: string;
  title: string;
  url: string | null;
  route: string | null;
  description: string;
  target_blank: boolean;
  icon: string | null;
  active: boolean;
  text_color: string | null;
  text_color_hover: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  children?: StrapiNestedItem[];
}

interface StrapiMenuWithItems {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  items?: StrapiNestedItem[];
}

interface MenuApiResponse {
  data: StrapiMenuWithItems[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Interface para el item transformado del organigrama
export interface OrganigramaItem {
  id: string;
  documentId: string;
  title: string;
  description: string;
  url: string | null;
  route: string | null;
  target_blank: boolean;
  active: boolean;
  text_color: string | null;
  text_color_hover: string | null;
  children: OrganigramaItem[];
}

/**
 * Función para transformar recursivamente los items del API a la estructura del organigrama
 * Límite de profundidad por seguridad: 10 niveles
 */
const transformOrganigramaItem = (
  item: StrapiNestedItem,
  depth = 0,
  maxDepth = 10
): OrganigramaItem => {
  const transformed: OrganigramaItem = {
    id: item.id.toString(),
    documentId: item.documentId,
    title: item.title,
    description: item.description,
    url: item.url,
    route: item.route ?? null,
    target_blank: item.target_blank,
    active: item.active,
    text_color: item.text_color,
    text_color_hover: item.text_color_hover,
    children: []
  };

  if (Array.isArray(item.children) && item.children.length > 0 && depth < maxDepth) {
    transformed.children = item.children.map(child =>
      transformOrganigramaItem(child, depth + 1, maxDepth)
    );
  }

  return transformed;
};

/**
 * Cache simple para evitar múltiples llamadas
 */
let cache: { data: OrganigramaItem[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene los datos del organigrama desde el API (menús con items anidados)
 * Usa el slug "organigrama" fijo y populate profundo para hijos
 */
export const fetchOrganigramaData = async (): Promise<OrganigramaItem[]> => {
  const targetSlug = 'organigrama';
  logger.log('[APIServiceOrganigrama] Consultando organigrama (nuevo endpoint) para slug:', targetSlug);

  // Verificar cache
  if (cache && (Date.now() - cache.timestamp) < CACHE_DURATION) {
    logger.log('[APIServiceOrganigrama] Datos obtenidos desde cache');
    return cache.data;
  }

  try {
    const query =
      `?filters[slug][$eq]=${encodeURIComponent(targetSlug)}` +
      `&populate[items][filters][parent][id][$null]=true` +
      `&populate[items][populate][children][populate][children][populate]=children`;

    const url = `${API_CONFIG.BASE_URL}${query}`;
    logger.log('[APIServiceOrganigrama] URL de consulta:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data: MenuApiResponse = await response.json();
    logger.log('[APIServiceOrganigrama] Respuesta del API (menús):', data);

    if (!data.data || data.data.length === 0) {
      logger.warn('[APIServiceOrganigrama] No se encontraron menús para el slug:', targetSlug);
      return [];
    }

    // Elegir el menú por slug (o el primero como fallback)
    const menu = data.data.find(m => m.slug === targetSlug) ?? data.data[0];
    const items = Array.isArray(menu.items) ? menu.items : [];

    // Transformar recursivamente hasta 10 niveles
    const transformedItems = items.map(i => transformOrganigramaItem(i, 0, 10));

    // Actualizar cache
    cache = {
      data: transformedItems,
      timestamp: Date.now()
    };

    logger.log('[APIServiceOrganigrama] Datos transformados (hasta 10 niveles):', transformedItems);
    return transformedItems;

  } catch (error) {
    logger.error('[APIServiceOrganigrama] Error al obtener datos del organigrama:', error);
    throw error;
  }
};

/**
 * Limpiar cache manualmente
 */
export const clearOrganigramaCache = (): void => {
  cache = null;
  logger.log('[APIServiceOrganigrama] Cache limpiado');
};
