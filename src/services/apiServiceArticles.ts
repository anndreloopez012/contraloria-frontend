
/**
 * Servicio API para obtener artículos desde Strapi v5
 * Consume el API real de CGC para artículos (redactions)
 * SIN CACHÉ - Los datos se obtienen siempre frescos del servidor
 */

import { getApiHost, getBearerToken, absUrl } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/redactions`,
  BEARER_TOKEN: getBearerToken(),
  ARTICLES_PAGE_SIZE: 100,
};

// Tipos para los artículos
export interface ArticleImage {
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

export interface ArticleCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ArticleAuthor {
  id: number;
  documentId: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: ArticleImage;
}

export interface ArticleSEO {
  id: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
}

export interface ArticleBlock {
  __component: string;
  id: number;
  title: string;
  description?: string;
  col: number;
  percentage?: number;
  // Campos específicos por componente
  content?: string; // rich-text
  pdf?: any[]; // pdf
  image?: ArticleImage[] | ArticleImage; // image
  video?: any; // video
  iframe?: any; // video iframe
  file?: any; // audio y media (archivo descargable)
  mediaImage?: string; // media (imagen de presentación)
  color_bottom?: string; // pdf
  category?: ArticleCategory[]; // pdf categories
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  // Campos adicionales para artículos
  author?: ArticleAuthor[];
  category?: ArticleCategory;
  image?: ArticleImage;
  seo?: ArticleSEO;
  block?: ArticleBlock[];
}

// Estructura de respuesta de Strapi v5
interface StrapiArticlesListResponse {
  data: Array<{
    id: number;
    documentId: string;
    title: string;
    description: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    author?: any[];
    category?: any;
    image?: any;
    seo?: any;
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

interface StrapiArticleDetailResponse {
  data: Array<{
    id: number;
    documentId: string;
    title: string;
    description: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    author?: any[];
    category?: any;
    image?: any;
    seo?: any;
    block?: any[];
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
 * Obtiene la lista de todos los artículos
 * SIEMPRE obtiene datos frescos del servidor (sin caché)
 */
export const fetchArticlesList = async (): Promise<Article[]> => {
  try {
    logger.log('🚀 Obteniendo lista FRESCA de artículos');
    
    const headers = {
      'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    const allArticles: StrapiArticlesListResponse['data'] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const endpoint =
        `${API_CONFIG.BASE_URL}` +
        `?populate[author][populate]=avatar` +
        `&populate[category]=*` +
        `&populate[image]=*` +
        `&populate[seo]=*` +
        `&sort[0]=publishedAt:desc` +
        `&sort[1]=id:desc` +
        `&pagination[page]=${currentPage}` +
        `&pagination[pageSize]=${API_CONFIG.ARTICLES_PAGE_SIZE}`;

      logger.log(`📡 Endpoint página ${currentPage}: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const apiResponse: StrapiArticlesListResponse = await response.json();
      logger.log(`📦 Página ${currentPage} recibida:`, apiResponse.meta?.pagination);

      allArticles.push(...(apiResponse.data || []));
      totalPages = apiResponse.meta?.pagination?.pageCount || 1;
      currentPage += 1;
    } while (currentPage <= totalPages);

    logger.log(`📦 Total de artículos acumulados: ${allArticles.length}`);

    const transformedData = transformStrapiArticlesListResponse({
      data: allArticles,
      meta: {
        pagination: {
          page: 1,
          pageSize: allArticles.length,
          pageCount: totalPages,
          total: allArticles.length,
        },
      },
    });

    logger.log('✅ Lista de artículos transformada (SIN CACHÉ):', transformedData);
    return transformedData;

  } catch (error) {
    logger.error('❌ Error al obtener lista de artículos:', error);
    return [];
  }
};

/**
 * Obtiene el detalle de un artículo específico por slug
 * SIEMPRE obtiene datos frescos del servidor (sin caché)
 */
export const fetchArticleBySlug = async (slug: string): Promise<Article | null> => {
  try {
    const endpoint = `${API_CONFIG.BASE_URL}?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[block][populate]=*`;
    
    logger.log(`🚀 Obteniendo detalle FRESCO de artículo para slug: "${slug}"`);
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

    const apiResponse: StrapiArticleDetailResponse = await response.json();
    logger.log('📦 Respuesta FRESCA del API de detalle de artículo:', apiResponse);

    // Transformar datos de Strapi v5
    const transformedData = transformStrapiArticleDetailResponse(apiResponse);

    logger.log('✅ Detalle de artículo transformado (SIN CACHÉ):', transformedData);
    return transformedData;

  } catch (error) {
    logger.error('❌ Error al obtener detalle de artículo:', error);
    return null;
  }
};

/**
 * Transforma la respuesta de lista de artículos de Strapi v5 a la estructura esperada
 */
const transformStrapiArticlesListResponse = (apiResponse: StrapiArticlesListResponse): Article[] => {
  if (!apiResponse.data || apiResponse.data.length === 0) {
    return [];
  }

  return apiResponse.data.map(item => ({
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    description: item.description,
    slug: item.slug,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
    author: item.author || [],
    category: item.category || undefined,
    image: processImage(item.image),
    seo: item.seo
  }));
};

/**
 * Transforma la respuesta de detalle de artículo de Strapi v5 a la estructura esperada
 */
const transformStrapiArticleDetailResponse = (apiResponse: StrapiArticleDetailResponse): Article | null => {
  if (!apiResponse.data || apiResponse.data.length === 0) {
    return null;
  }

  const item = apiResponse.data[0];

  return {
    id: item.id,
    documentId: item.documentId,
    title: item.title,
    description: item.description,
    slug: item.slug,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
    author: item.author || [],
    category: item.category || undefined,
    image: processImage(item.image),
    seo: item.seo,
    block: item.block?.map(block => processBlock(block)) || []
  };
};

/**
 * Función helper para procesar imágenes
 */
const processImage = (imageData: any): ArticleImage | undefined => {
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

/**
 * Función helper para procesar bloques de contenido
 */
const processBlock = (blockData: any): ArticleBlock => {
  const processedBlock: ArticleBlock = {
    __component: blockData.__component,
    id: blockData.id,
    title: blockData.title,
    description: blockData.description,
    col: blockData.col || 12,
    percentage: blockData.percentage || 100
  };

  // Procesar campos específicos según el componente
  if (blockData.content) {
    processedBlock.content = blockData.content;
  }

  if (blockData.pdf) {
    processedBlock.pdf = blockData.pdf.map((pdf: any) => ({
      ...pdf,
      url: absUrl(pdf.url)
    }));
  }

  if (blockData.image) {
    if (Array.isArray(blockData.image)) {
      processedBlock.image = blockData.image.map((img: any) => processImage(img)).filter(Boolean);
    } else {
      processedBlock.image = processImage(blockData.image);
    }
  }

  if (blockData.video) {
    processedBlock.video = blockData.video;
  }

  if (blockData.iframe) {
    processedBlock.iframe = blockData.iframe;
  }

  if (blockData.file) {
    processedBlock.file = {
      ...blockData.file,
      url: absUrl(blockData.file.url)
    };
  }

  if (blockData.color_bottom) {
    processedBlock.color_bottom = blockData.color_bottom;
  }

  if (blockData.category) {
    processedBlock.category = blockData.category;
  }

  if (blockData.img) {
    processedBlock.mediaImage = absUrl(blockData.img.url);
  }

  return processedBlock;
};

/**
 * Función legacy mantenida por compatibilidad - ya no hace nada
 */
export const clearArticlesCache = () => {
  logger.log('🗑️ clearArticlesCache llamada - sin efecto (caché deshabilitado)');
};
