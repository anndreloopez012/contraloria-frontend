
/**
 * Servicio para consumir los Services_Buttons desde Strapi v5
 * Endpoint: /api/home?fields[0]=id&populate[Services_Buttons][populate]=*
 * 
 * Reglas:
 * - Tooltip: usar "Nombre"
 * - col: ancho en grid de 12 columnas
 * - slug: para navegación interna
 * - blank: si true y existe url -> abrir en nueva pestaña; si false -> navegación interna con slug
 * - url: enlace externo (opcional)
 * - logo: recoger ruta de imagen (usar formato pequeño si existe)
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

const API_CONFIG = {
  BASE_URL: getApiHost(),
  ENDPOINT: '/api/home',
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'fields[0]=id&populate[Services_Buttons][populate]=*',
};

type StrapiImageFormat = {
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
};

type StrapiImage = {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats?: {
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
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
};

type StrapiOnlineButton = {
  id: number;
  Nombre: string;
  slug: string;
  col: number;
  blank: boolean;
  url: string | null;
  logo?: StrapiImage | null;
};

type StrapiOnlineResponse = {
  data: {
    id: number;
    documentId: string;
    Services_Buttons: StrapiOnlineButton[];
  };
  meta: {};
};

export type OnlineServiceItem = {
  id: string;
  nombre: string;
  slug: string;
  col: number; // 1..12
  blank: boolean;
  url: string | null; // normalizada absoluta si aplica
  logoUrl: string | null; // url de imagen (preferir small/thumbnail)
  logoAlt: string;
};

function absoluteUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.startsWith('/') ? `${API_CONFIG.BASE_URL}${url}` : url;
}

function isGifAsset(logo?: StrapiImage | null): boolean {
  if (!logo) return false;
  return logo.mime === 'image/gif' || logo.ext.toLowerCase() === '.gif';
}

function pickBestLogoUrl(logo?: StrapiImage | null): string | null {
  if (!logo) return null;
  if (isGifAsset(logo)) {
    return absoluteUrl(logo.url);
  }
  const small = logo.formats?.small?.url;
  const thumb = logo.formats?.thumbnail?.url;
  const original = logo.url;
  return absoluteUrl(small || thumb || original);
}

function transformResponse(response: StrapiOnlineResponse): OnlineServiceItem[] {
  logger.log('🔄 Transformando Services_Buttons (Online):', response);
  const items = response.data?.Services_Buttons || [];
  const transformed = items.map((it) => ({
    id: String(it.id),
    nombre: it.Nombre || '',
    slug: it.slug || '',
    col: Math.max(1, Math.min(12, Number(it.col) || 3)),
    blank: Boolean(it.blank),
    url: absoluteUrl(it.url || null),
    logoUrl: pickBestLogoUrl(it.logo),
    logoAlt: it.logo?.alternativeText || it.logo?.name || it.Nombre || 'Logo',
  }));
  logger.log('✅ Services_Buttons transformados:', { count: transformed.length });
  return transformed;
}

export async function fetchOnlineServices(): Promise<OnlineServiceItem[]> {
  const cacheKey = 'cgc_online_services_cache';
  const cacheExpiry = 60 * 60 * 1000; // 1 hora

  // Cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < cacheExpiry) {
        logger.log('📦 Usando caché de servicios en línea');
        return data as OnlineServiceItem[];
      }
    } catch {
      // Ignorar cache inválido
    }
  }

  logger.log('🚀 Obteniendo Services_Buttons desde API (Online)...');
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT}?${API_CONFIG.ENDPOINT_PARAMS}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_CONFIG.BEARER_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Error HTTP: ${res.status} - ${res.statusText}`);
  }

  const data: StrapiOnlineResponse = await res.json();
  logger.log('📡 Respuesta Online recibida:', data);

  const items = transformResponse(data);

  localStorage.setItem(
    cacheKey,
    JSON.stringify({
      data: items,
      timestamp: Date.now(),
    }),
  );

  logger.log('💾 Caché de servicios en línea actualizado');
  return items;
}
