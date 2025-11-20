/**
 * Servicio: Información Global (Header, Favicon, SEO)
 * Endpoint: https://cgc-adm.server-softplus.plus/api/global?populate=*
 * Nota: Tokens están hardcodeados por limitaciones del entorno (sin .env)
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

export interface GlobalInfo {
  siteName: string;
  siteDescription: string;
  favicon: {
    url: string;            // URL absoluta
    width?: number;
    height?: number;
    formats?: {
      large?: string;
      medium?: string;
      small?: string;
      thumbnail?: string;
    };
  } | null;
  defaultSeo: {
    metaTitle: string;
    metaDescription: string;
  };
  organigramaPdf: {
    url: string;
    name?: string;
  } | null;
}

type StrapiImageFormat = {
  ext: string;
  url: string;
  width: number;
  height: number;
  size?: number;
  mime?: string;
  name?: string;
  hash?: string;
  path?: string | null;
  sizeInBytes?: number;
};

type StrapiImage = {
  id: number;
  documentId: string;
  name: string;
  width: number;
  height: number;
  url: string; // relativo en Strapi
  formats?: {
    large?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    small?: StrapiImageFormat;
    thumbnail?: StrapiImageFormat;
  };
};

interface StrapiGlobalResponse {
  data: {
    id: number;
    documentId: string;
    siteName: string;
    siteDescription: string;
    favicon?: StrapiImage | null;
    defaultSeo?: {
      id: number;
      metaTitle: string;
      metaDescription: string;
    } | null;
    organigrama?: StrapiImage | null;
  } | null;
  meta?: Record<string, unknown>;
}

const API_CONFIG = {
  BASE_URL: getApiHost(),
  ENDPOINT: '/api/global?populate=*',
  BEARER_TOKEN: getBearerToken(),
  CACHE_KEY: 'cgc_global_info_cache',
  CACHE_TTL_MS: 60 * 60 * 1000, // 1 hora
};

const abs = (path?: string | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_CONFIG.BASE_URL}${path}`;
};

const transformResponse = (res: StrapiGlobalResponse): GlobalInfo => {
  const data = res.data;
  const favicon = data?.favicon ?? null;
  const organigrama = data?.organigrama ?? null;

  return {
    siteName: data?.siteName?.trim() || 'Sitio',
    siteDescription: data?.siteDescription || '',
    favicon: favicon
      ? {
          url: abs(favicon.url),
          width: favicon.width,
          height: favicon.height,
          formats: {
            large: abs(favicon.formats?.large?.url),
            medium: abs(favicon.formats?.medium?.url),
            small: abs(favicon.formats?.small?.url),
            thumbnail: abs(favicon.formats?.thumbnail?.url),
          },
        }
      : null,
    defaultSeo: {
      metaTitle: data?.defaultSeo?.metaTitle || data?.siteName || 'Sitio',
      metaDescription:
        data?.defaultSeo?.metaDescription || data?.siteDescription || '',
    },
    organigramaPdf: organigrama
      ? {
          url: abs(organigrama.url),
          name: organigrama.name,
        }
      : null,
  };
};

export const fetchInfoGeneral = async (): Promise<GlobalInfo> => {
  // Intento leer caché
  const cachedRaw = localStorage.getItem(API_CONFIG.CACHE_KEY);
  if (cachedRaw) {
    const cached = JSON.parse(cachedRaw) as { ts: number; data: GlobalInfo };
    const fresh = Date.now() - cached.ts < API_CONFIG.CACHE_TTL_MS;
    if (fresh) {
      logger.log('ℹ️ Usando caché (global info)');
      return cached.data;
    }
  }

  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINT}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_CONFIG.BEARER_TOKEN}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    logger.error('❌ Error API Global Info:', response.status, text);
    throw new Error(`GlobalInfo API error: ${response.status}`);
  }

  const json = (await response.json()) as StrapiGlobalResponse;
  const transformed = transformResponse(json);

  // Guardar caché
  localStorage.setItem(
    API_CONFIG.CACHE_KEY,
    JSON.stringify({ ts: Date.now(), data: transformed })
  );

  return transformed;
};
