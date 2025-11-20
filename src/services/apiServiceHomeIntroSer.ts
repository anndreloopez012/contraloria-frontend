
/**
 * Servicio para consumir el API de Home Introduction y Services desde Strapi v5
 * Obtiene la imagen del header, descripción y botones de servicios
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/home`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'populate=*'
};

// Tipos para la respuesta de Strapi
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
}

interface ServiceButton {
  order: number;
  id: number;
  slug: string;
  col: number;
  Nombre: string;
}

interface StrapiHomeIntroResponse {
  data: {
    id: number;
    documentId: string;
    Description: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Slider: {
      id: number;
    };
    Header: StrapiImage;
    Services_Buttons: ServiceButton[];
    Image: StrapiImage;
    Menu: any;
  };
  meta: {};
}

// Tipos para los datos transformados
export interface HeaderImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  formats: {
    small?: string;
    medium?: string;
    large?: string;
    thumbnail?: string;
  };
}

export interface HomeIntroData {
  description: string;
  headerImage: HeaderImage | null;
  serviceButtons: ServiceButton[];
  mainImage: HeaderImage | null;
}

/**
 * Transforma la respuesta de Strapi v5 a la estructura esperada
 */
function transformStrapiHomeIntroResponse(response: StrapiHomeIntroResponse): HomeIntroData {
  logger.log('🔄 Transformando respuesta de Strapi Home Intro:', response);
  
  const baseUrl = getApiHost();
  
  // Transformar imagen del header
  let headerImage: HeaderImage | null = null;
  if (response.data.Header) {
    const header = response.data.Header;
    headerImage = {
      id: header.documentId || header.id.toString(),
      src: header.url.startsWith('/') ? `${baseUrl}${header.url}` : header.url,
      alt: header.alternativeText || header.name || 'Header Image',
      title: header.caption || header.name || 'Header Image',
      formats: {
        small: header.formats.small ? 
          (header.formats.small.url.startsWith('/') ? `${baseUrl}${header.formats.small.url}` : header.formats.small.url) : undefined,
        medium: header.formats.medium ? 
          (header.formats.medium.url.startsWith('/') ? `${baseUrl}${header.formats.medium.url}` : header.formats.medium.url) : undefined,
        large: header.formats.large ? 
          (header.formats.large.url.startsWith('/') ? `${baseUrl}${header.formats.large.url}` : header.formats.large.url) : undefined,
        thumbnail: header.formats.thumbnail ? 
          (header.formats.thumbnail.url.startsWith('/') ? `${baseUrl}${header.formats.thumbnail.url}` : header.formats.thumbnail.url) : undefined,
      }
    };
  }

  // Transformar imagen principal
  let mainImage: HeaderImage | null = null;
  if (response.data.Image) {
    const image = response.data.Image;
    mainImage = {
      id: image.documentId || image.id.toString(),
      src: image.url.startsWith('/') ? `${baseUrl}${image.url}` : image.url,
      alt: image.alternativeText || image.name || 'Main Image',
      title: image.caption || image.name || 'Main Image',
      formats: {
        small: image.formats.small ? 
          (image.formats.small.url.startsWith('/') ? `${baseUrl}${image.formats.small.url}` : image.formats.small.url) : undefined,
        medium: image.formats.medium ? 
          (image.formats.medium.url.startsWith('/') ? `${baseUrl}${image.formats.medium.url}` : image.formats.medium.url) : undefined,
        large: image.formats.large ? 
          (image.formats.large.url.startsWith('/') ? `${baseUrl}${image.formats.large.url}` : image.formats.large.url) : undefined,
        thumbnail: image.formats.thumbnail ? 
          (image.formats.thumbnail.url.startsWith('/') ? `${baseUrl}${image.formats.thumbnail.url}` : image.formats.thumbnail.url) : undefined,
      }
    };
  }

  const homeIntroData: HomeIntroData = {
    description: response.data.Description || '',
    headerImage,
    serviceButtons: response.data.Services_Buttons || [],
    mainImage
  };

  logger.log('✅ Datos transformados del Home Intro:', {
    description: homeIntroData.description.substring(0, 50) + '...',
    hasHeaderImage: !!homeIntroData.headerImage,
    hasMainImage: !!homeIntroData.mainImage,
    serviceButtonsCount: homeIntroData.serviceButtons.length
  });

  return homeIntroData;
}

/**
 * Obtiene los datos del home introduction desde el API de Strapi v5
 */
export async function fetchHomeIntroData(): Promise<HomeIntroData> {
  const cacheKey = 'cgc_home_intro_cache';
  const cacheExpiry = 60 * 60 * 1000; // 1 hora en millisegundos

  try {
    // Verificar caché primero
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < cacheExpiry) {
        logger.log('📦 Usando datos del home intro desde caché');
        return data;
      }
    }

    logger.log('🚀 Obteniendo datos del home intro desde API...');
    
    const url = `${API_CONFIG.BASE_URL}?${API_CONFIG.ENDPOINT_PARAMS}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data: StrapiHomeIntroResponse = await response.json();
    logger.log('📡 Respuesta del API Home Intro recibida:', data);

    // Transformar datos
    const homeIntroData = transformStrapiHomeIntroResponse(data);

    // Guardar en caché
    localStorage.setItem(cacheKey, JSON.stringify({
      data: homeIntroData,
      timestamp: Date.now()
    }));

    logger.log('💾 Datos del home intro guardados en caché');
    return homeIntroData;

  } catch (error) {
    logger.error('❌ Error al obtener datos del home intro:', error);
    
    // Intentar usar caché aunque esté expirado
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      logger.log('⚠️ Usando caché expirado como fallback');
      const { data } = JSON.parse(cachedData);
      return data;
    }

    // Fallback con datos vacíos
    return {
      description: '',
      headerImage: null,
      serviceButtons: [],
      mainImage: null
    };
  }
}
