/**
 * Servicio API para obtener contenido de enlaces desde Strapi v5
 * Consume el API real de CGC para contenido específico por slug
 * SIN CACHÉ - Los datos se obtienen siempre frescos del servidor
 */

import { getApiHost, getBearerToken, absUrl } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/links`,
  BEARER_TOKEN: getBearerToken(),
};

// Tipos para el contenido del enlace
export interface ContentLinkImage {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats?: {
    large?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    thumbnail?: { url: string; width: number; height: number };
  };
}

export interface ContentLinkData {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  description: string;
  url: string;
  backgroundImage?: ContentLinkImage;
  image?: ContentLinkImage;
}

// Estructura de respuesta de Strapi v5
interface StrapiContentLinkResponse {
  data: Array<{
    id: number;
    documentId: string;
    Slug: string;
    Title: string;
    Description: string;
    Url: string;
    Background?: ContentLinkImage;
    Image?: ContentLinkImage;
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
 * Obtiene el contenido de un enlace específico por slug
 * SIEMPRE obtiene datos frescos del servidor (sin caché)
 */
export const fetchContentLinkBySlug = async (slug: string): Promise<ContentLinkData | null> => {
  try {
    // Construir URL con slug dinámico
    const endpoint = `${API_CONFIG.BASE_URL}?filters[Slug][$eq]=${encodeURIComponent(slug)}&populate=*`;
    
    logger.log(`🚀 Obteniendo contenido FRESCO para slug: "${slug}"`);
    logger.log(`📡 Endpoint: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const apiResponse: StrapiContentLinkResponse = await response.json();
    logger.log('📦 Respuesta FRESCA del API de contenido de enlace:', apiResponse);

    // Transformar datos de Strapi v5
    const transformedData = transformStrapiContentResponse(apiResponse);

    logger.log('✅ Contenido de enlace transformado (SIN CACHÉ):', transformedData);
    return transformedData;

  } catch (error) {
    logger.error('❌ Error al obtener contenido de enlace:', error);
    return null;
  }
};

/**
 * Transforma la respuesta de Strapi v5 a la estructura esperada
 */
const transformStrapiContentResponse = (apiResponse: StrapiContentLinkResponse): ContentLinkData | null => {
  if (!apiResponse.data || apiResponse.data.length === 0) {
    return null;
  }

  const item = apiResponse.data[0]; // Tomar el primer elemento

  // Función helper para procesar imágenes
  const processImage = (imageData: any): ContentLinkImage | undefined => {
    if (!imageData) return undefined;
    
    return {
      id: imageData.id,
      url: absUrl(imageData.url),
      alternativeText: imageData.alternativeText,
      caption: imageData.caption,
      width: imageData.width,
      height: imageData.height,
      formats: imageData.formats ? {
        large: imageData.formats.large ? {
          url: absUrl(imageData.formats.large.url),
          width: imageData.formats.large.width,
          height: imageData.formats.large.height
        } : undefined,
        medium: imageData.formats.medium ? {
          url: absUrl(imageData.formats.medium.url),
          width: imageData.formats.medium.width,
          height: imageData.formats.medium.height
        } : undefined,
        small: imageData.formats.small ? {
          url: absUrl(imageData.formats.small.url),
          width: imageData.formats.small.width,
          height: imageData.formats.small.height
        } : undefined,
        thumbnail: imageData.formats.thumbnail ? {
          url: absUrl(imageData.formats.thumbnail.url),
          width: imageData.formats.thumbnail.width,
          height: imageData.formats.thumbnail.height
        } : undefined,
      } : undefined
    };
  };

  return {
    id: item.id,
    documentId: item.documentId,
    slug: item.Slug,
    title: item.Title,
    description: item.Description,
    url: item.Url,
    backgroundImage: processImage(item.Background),
    image: processImage(item.Image)
  };
};

/**
 * Función legacy mantenida por compatibilidad - ya no hace nada
 */
export const clearContentLinkCache = (slug?: string) => {
  logger.log('🗑️ clearContentLinkCache llamada - sin efecto (caché deshabilitado)');
};
