/**
 * Servicio para el API real de páginas de contenido de CGC
 * Endpoint base: https://cgc-adm.server-softplus.plus/api/pages
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API (estandarizada como en apiServiceMenu)
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/pages`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'populate[block][populate]=*&populate[seo][populate]=shareImage'
};

// Origin del servidor para construir URLs de medios (imágenes, archivos, etc.)
const SERVER_ORIGIN = getApiHost();

// Interfaces para la respuesta del API real
interface StrapiImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: {
      url: string;
      width: number;
      height: number;
    };
    small?: {
      url: string;
      width: number;
      height: number;
    };
    medium?: {
      url: string;
      width: number;
      height: number;
    };
    large?: {
      url: string;
      width: number;
      height: number;
    };
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

interface StrapiFile {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width?: number;
  height?: number;
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

// Componentes de contenido según Strapi
interface SharedImageBlock {
  __component: "shared.image";
  id: number;
  title: string;
  description?: string;
  category?: string;
  order: number;
  col: number;
  percentage?: number;
  // En la respuesta real viene como array
  image: StrapiImage[];
}

interface SharedRichTextBlock {
  __component: "shared.rich-text";
  id: number;
  title: string;
  content: string;
  description?: string;
  order: number;
  col: number;
  category?: string;
}

interface SharedPDFBlock {
  __component: "shared.pdf";
  id: number;
  title: string;
  description?: string;
  order: number;
  col: number;
  percentage?: number;
  category?: Array<{
    id: number;
    documentId: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }>;
  // En la respuesta real viene como array y se llama 'pdf'
  pdf: StrapiFile[];
  // Nuevos campos
  dowload?: number | null;
  color_bottom?: string | null;
  image?: StrapiImage | null;
}

interface SharedVideoBlock {
  __component: "shared.video";
  id: number;
  title: string;
  description?: string;
  order: number;
  col: number;
  category?: string;
  // Para videos de archivo
  video?: StrapiFile[];
  // Para videos iframe (YouTube, etc.)
  iframe?: {
    url: string;
    oembed?: {
      html: string;
      type: string;
      title: string;
      width: number;
      height: number;
      thumbnail_url?: string;
      thumbnail_width?: number;
      thumbnail_height?: number;
    };
  };
  enlace?: {
    url: string;
  };
}

interface SharedAudioBlock {
  __component: "shared.audio";
  id: number;
  title: string;
  descrip?: string;
  order: number;
  col: number;
  category?: string;
  // Audio viene como archivo (field name: file)
  file: StrapiFile;
}

interface SharedMediaBlock {
  __component: "shared.media";
  id: number;
  title: string;
  description?: string;
  order: number;
  col: number;
  category?: string;
  // Archivo descargable (puede ser cualquier tipo)
  file: StrapiFile;
  // Imagen de presentación/thumbnail
  img?: StrapiImage;
}

type ContentBlock = SharedImageBlock | SharedRichTextBlock | SharedPDFBlock | SharedVideoBlock | SharedAudioBlock | SharedMediaBlock;

interface StrapiPageResponse {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: {
    route: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  block: ContentBlock[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    shareImage?: StrapiImage;
  };
}

interface ApiResponse {
  data: StrapiPageResponse[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Interfaces para el contenido transformado (compatible con MenuPage)
export interface ContentItem {
  id: string;
  type: 'image' | 'video' | 'pdf' | 'content' | 'audio' | 'media';
  title: string;
  description: string;
  category: string | Array<{ id: number; documentId: string; title: string; slug: string }>;
  lastUpdated: string;
  order: number;
  col: number;
  percentage?: number;
  
  // Para PDFs
  url?: string;
  size?: string;
  thumbnail?: string;
  subtype?: string;
  downloadCount?: number;
  buttonColor?: string;
  pdfImage?: string;
  
  // Para imágenes
  images?: Array<{
    id: string;
    src: string;
    alt: string;
    title: string;
  }>;
  
  // Para videos
  videos?: Array<{
    id: string;
    src: string;
    title: string;
    type: 'iframe' | 'file';
    thumbnail?: string;
  }>;
  
  // Para audio
  audios?: Array<{
    id: string;
    src: string;
    title: string;
    type: 'file';
  }>;
  
  // Para medios (archivos descargables con imagen)
  fileUrl?: string;
  fileSize?: string;
  fileType?: string;
  fileName?: string;
  mediaImage?: string;
  
  // Para contenido enriquecido
  content?: string;
}

export interface PageContent {
  title: string;
  description: string;
  content: ContentItem[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    shareImage?: string;
  };
}

/**
 * Helper para resolver el slug tomando SIEMPRE el último segmento de la URL real.
 * - Si el parámetro 'slug' contiene segmentos, toma el último.
 * - Si window.location.pathname existe, se prioriza el último segmento de la URL real.
 * - Decodifica el segmento por si viene con caracteres escapados.
 */
const resolveSlug = (inputSlug?: string): string => {
  let resolvedSlug = '';

  // Priorizar window.location.pathname si existe
  if (typeof window !== 'undefined' && window.location && typeof window.location.pathname === 'string') {
    const path = window.location.pathname || '';
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      resolvedSlug = segments[segments.length - 1];
    }
  }

  // Si no se obtuvo de window, usar el parámetro de entrada
  if (!resolvedSlug && inputSlug) {
    const segments = inputSlug.split('/').filter(Boolean);
    if (segments.length > 0) {
      resolvedSlug = segments[segments.length - 1];
    }
  }

  // Fallback
  if (!resolvedSlug) {
    resolvedSlug = 'historia';
  }

  const decoded = decodeURIComponent(resolvedSlug);
  logger.log('[APIServicePages] Slug resuelto:', decoded);
  return decoded;
};

/**
 * Función para transformar bloques de Strapi a ContentItem
 */
const transformContentBlock = (block: ContentBlock, index: number): ContentItem => {
  // NOTA: No incluimos 'category' en el baseItem para evitar tipos union (string | array)
  const baseItem = {
    id: `${block.__component}-${block.id}`,
    lastUpdated: new Date().toLocaleDateString('es-GT'),
    order: block.order || (index + 1),
    col: block.col || 6,
  };

  switch (block.__component) {
    case 'shared.image': {
      const imageBlock = block as SharedImageBlock;
      const images = imageBlock.image || [];

      return {
        ...baseItem,
        type: 'image' as const,
        title: imageBlock.title,
        description: imageBlock.description || '',
        category: imageBlock.category || 'General',
        percentage: imageBlock.percentage || 100,
        images: images.map(image => ({
          id: image.documentId,
          src: `${SERVER_ORIGIN}${image.url}`,
          alt: image.alternativeText || imageBlock.title,
          title: imageBlock.title
        }))
      };
    }

    case 'shared.rich-text': {
      const richTextBlock = block as SharedRichTextBlock;
      return {
        ...baseItem,
        type: 'content' as const,
        title: richTextBlock.title,
        description: richTextBlock.description || 'Contenido enriquecido',
        category: richTextBlock.category || 'General',
        content: richTextBlock.content,
        col: richTextBlock.col || 12
      };
    }

    case 'shared.pdf': {
      const pdfBlock = block as SharedPDFBlock;
      const files = pdfBlock.pdf || [];
      const file = files[0]; // Tomar el primer archivo

      if (!file) {
        logger.warn('[APIServicePages] Bloque PDF sin archivo.', { blockId: block.id });
      }

      const url = file?.url ? `${SERVER_ORIGIN}${file.url}` : undefined;
      const sizeStr = typeof file?.size === 'number' ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : undefined;

      // Mantener las categorías como array para que los filtros funcionen
      const categories = pdfBlock.category || [];

      // Nota: Se quita el dato de 'dowload' del objeto final (no se expone downloadCount)
      return {
        ...baseItem,
        type: 'pdf' as const,
        title: pdfBlock.title,
        description: pdfBlock.description || '',
        category: categories.length > 0 ? categories : 'General',
        url,
        size: sizeStr,
        subtype: 'PDF',
        buttonColor: pdfBlock.color_bottom || '#072B5A',
        pdfImage: pdfBlock.image ? `${SERVER_ORIGIN}${pdfBlock.image.url}` : undefined,
        percentage: pdfBlock.percentage || 100,
        col: pdfBlock.col || 4
      };
    }

    case 'shared.video': {
      const videoBlock = block as SharedVideoBlock;
      let videoSrc = '';
      let videoType: 'iframe' | 'file' = 'file';
      let thumbnail = '';

      // Priorizar iframe si existe
      if (videoBlock.iframe?.url) {
        videoSrc = videoBlock.iframe.url;
        videoType = 'iframe';
        thumbnail = videoBlock.iframe.oembed?.thumbnail_url || '';
      } else if (videoBlock.video && videoBlock.video.length > 0) {
        const videoFile = videoBlock.video[0];
        videoSrc = `${SERVER_ORIGIN}${videoFile.url}`;
        videoType = 'file';
      } else if (videoBlock.enlace?.url) {
        videoSrc = videoBlock.enlace.url;
        videoType = 'iframe';
      }

      if (!videoSrc) {
        logger.warn('[APIServicePages] Bloque video sin fuente.', { blockId: block.id });
      }

      return {
        ...baseItem,
        type: 'video' as const,
        title: videoBlock.title,
        description: videoBlock.description || '',
        category: videoBlock.category || 'General',
        videos: videoSrc ? [{
          id: String(videoBlock.id),
          src: videoSrc,
          title: videoBlock.title,
          type: videoType,
          thumbnail: thumbnail || undefined
        }] : []
      };
    }

    case 'shared.audio': {
      const audioBlock = block as SharedAudioBlock;
      const audio = audioBlock.file;

      if (!audio) {
        logger.warn('[APIServicePages] Bloque audio sin archivo.', { blockId: block.id });
      }

      return {
        ...baseItem,
        type: 'audio' as const,
        title: audioBlock.title,
        description: audioBlock.descrip || '',
        category: audioBlock.category || 'General',
        audios: audio ? [{
          id: audio.documentId,
          src: `${SERVER_ORIGIN}${audio.url}`,
          title: audioBlock.title,
          type: 'file' as const
        }] : []
      };
    }

    case 'shared.media': {
      const mediaBlock = block as SharedMediaBlock;
      const file = mediaBlock.file;

      if (!file) {
        logger.warn('[APIServicePages] Bloque media sin archivo.', { blockId: block.id });
      }

      const fileUrl = file?.url ? `${SERVER_ORIGIN}${file.url}` : undefined;
      const fileSizeStr = typeof file?.size === 'number' ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : undefined;
      const mediaImage = mediaBlock.img ? `${SERVER_ORIGIN}${mediaBlock.img.url}` : undefined;

      return {
        ...baseItem,
        type: 'media' as const,
        title: mediaBlock.title,
        description: mediaBlock.description || '',
        category: mediaBlock.category || 'General',
        fileUrl,
        fileSize: fileSizeStr,
        fileType: file?.ext || '',
        fileName: file?.name || '',
        mediaImage,
        col: Number(mediaBlock.col) || 6
      };
    }

    default:
      return {
        ...baseItem,
        type: 'content' as const,
        title: 'Contenido',
        description: 'Tipo de contenido no reconocido',
        category: 'General',
        content: '<p>Contenido no disponible</p>'
      };
  }
};

/**
 * Obtiene el contenido de una página específica desde el API real
 * Acepta slugs anidados, usando solo el último segmento (ej. "nosotros/historia" -> "historia")
 */
export const fetchPageContent = async (slug: string): Promise<PageContent | null> => {
  logger.log('[APIServicePages] Cargando contenido para slug (raw):', slug);

  // Resolver slug usando el último segmento, priorizando la URL real del navegador
  const normalizedSlug = resolveSlug(slug);
  logger.log('[APIServicePages] Slug normalizado (último segmento):', normalizedSlug);

  try {
    const url = `${API_CONFIG.BASE_URL}?filters[slug][route][$eq]=${encodeURIComponent(normalizedSlug)}&${API_CONFIG.ENDPOINT_PARAMS}`;
    logger.log('[APIServicePages] URL de consulta:', url);

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

    const data: ApiResponse = await response.json();
    logger.log('[APIServicePages] Respuesta del API:', data);

    if (!data.data || data.data.length === 0) {
      logger.warn('[APIServicePages] No se encontró contenido para el slug:', normalizedSlug);
      return null;
    }

    const page = data.data[0];
    logger.log('[APIServicePages] Página encontrada:', page.title);
    logger.log('[APIServicePages] Bloques de contenido:', page.block?.length || 0);

    const transformedContent = page.block ? page.block.map(transformContentBlock) : [];

    const pageContent: PageContent = {
      title: page.title,
      description: page.description,
      content: transformedContent,
      seo: page.seo ? {
        metaTitle: page.seo.metaTitle,
        metaDescription: page.seo.metaDescription,
        shareImage: page.seo.shareImage ? `${SERVER_ORIGIN}${page.seo.shareImage.url}` : undefined
      } : undefined
    };

    logger.log('[APIServicePages] Contenido transformado:', {
      title: pageContent.title,
      contentItems: pageContent.content.length,
      types: pageContent.content.map(item => ({ type: item.type, col: item.col }))
    });

    return pageContent;

  } catch (error) {
    logger.error('[APIServicePages] Error al obtener contenido de la página:', error);
    throw error;
  }
};

/**
 * Función para obtener todas las páginas disponibles (opcional)
 */
export const fetchAllPages = async (): Promise<string[]> => {
  try {
    const url = `${API_CONFIG.BASE_URL}?fields[0]=slug`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.BEARER_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data.data.map(page => page.slug.route).filter(Boolean);
  } catch (error) {
    console.error('[APIServicePages] Error al obtener lista de páginas:', error);
    return [];
  }
};
