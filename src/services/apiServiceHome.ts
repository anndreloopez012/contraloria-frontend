/**
 * Servicio para consumir el API de Home desde Strapi v5
 * Obtiene las imágenes del slider y descripción del home
 */

import { getApiHost, getBearerToken, absUrl } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/home`,
  BEARER_TOKEN: getBearerToken(),
  ENDPOINT_PARAMS: 'populate[Slider][populate]=*'
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

interface StrapiSliderItem {
  id: number;
  url?: string | null;
  image?: StrapiImage | null;
}

interface StrapiHomeResponse {
  data: {
    id: number;
    documentId: string;
    Description: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Slider: {
      id: number;
      slides?: StrapiSliderItem[];
    } | null;
  };
  meta: {};
}

// Tipo para las imágenes transformadas del slider
export interface SliderImage {
  id: string;
  src: string;
  alt: string;
  title: string;
  description?: string;
  url?: string | null;
}

// Tipo para los datos del home
export interface HomeData {
  description: string;
  sliderImages: SliderImage[];
}

/**
 * Compara si las imágenes del slider han cambiado
 */
function hasSliderImagesChanged(cachedImages: SliderImage[], newImages: SliderImage[]): boolean {
  if (cachedImages.length !== newImages.length) {
    logger.log('🔄 Cantidad de imágenes cambió:', cachedImages.length, '->', newImages.length);
    return true;
  }

  for (let i = 0; i < cachedImages.length; i++) {
    const cached = cachedImages[i];
    const newImg = newImages[i];
    
    if (cached.id !== newImg.id || cached.src !== newImg.src || cached.url !== newImg.url) {
      logger.log('🔄 Imagen cambió:', { 
        cached: { id: cached.id, src: cached.src, url: cached.url },
        new: { id: newImg.id, src: newImg.src, url: newImg.url }
      });
      return true;
    }
  }

  return false;
}

/**
 * Transforma la respuesta de Strapi v5 a la estructura esperada
 */
function transformStrapiHomeResponse(response: StrapiHomeResponse): HomeData {
  logger.log('🔄 Transformando respuesta de Strapi Home:', response);

  const slider = response.data.Slider;
  const sliderSlides = Array.isArray(slider?.slides) ? slider.slides : [];

  const sliderImages: SliderImage[] = sliderSlides
    .filter((slide): slide is StrapiSliderItem & { image: StrapiImage } => Boolean(slide?.image))
    .map((slide, index) => {
      const imageUrl = absUrl(slide.image.url);

      return {
        id: slide.id.toString(),
        src: imageUrl,
        alt: slide.image.alternativeText || slide.image.name || `Imagen ${index + 1}`,
        title: slide.image.caption || slide.image.name || `Imagen ${index + 1}`,
        description: slide.image.alternativeText || undefined,
        url: slide.url || null,
      };
    });

  const homeData: HomeData = {
    description: response.data.Description || '',
    sliderImages
  };

  logger.log('✅ Datos transformados del Home:', {
    description: homeData.description.substring(0, 50) + '...',
    imagesCount: homeData.sliderImages.length
  });

  return homeData;
}

/**
 * Obtiene los datos del home desde el API de Strapi v5
 */
export async function fetchHomeData(): Promise<HomeData> {
  const cacheKey = 'cgc_home_cache';
  const cacheExpiry = 60 * 60 * 1000; // 1 hora en millisegundos

  try {
    logger.log('🚀 Obteniendo datos del home desde API para verificar cambios...');
    
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

    const data: StrapiHomeResponse = await response.json();
    logger.log('📡 Respuesta del API Home recibida:', data);

    // Transformar datos nuevos
    const newHomeData = transformStrapiHomeResponse(data);

    // Verificar caché y comparar cambios
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const { data: cachedHomeData, timestamp } = JSON.parse(cachedData);
        const isCacheValid = Date.now() - timestamp < cacheExpiry;
        
        // Si la caché es válida, verificar si hay cambios en las imágenes
        if (isCacheValid) {
          const imagesChanged = hasSliderImagesChanged(cachedHomeData.sliderImages, newHomeData.sliderImages);
          
          if (!imagesChanged) {
            logger.log('📦 Usando datos del home desde caché (sin cambios detectados)');
            return cachedHomeData;
          } else {
            logger.log('🔄 Cambios detectados en imágenes del slider, actualizando caché...');
          }
        } else {
          logger.log('⏰ Caché expirado, actualizando...');
        }
      } catch (error) {
        logger.warn('⚠️ Error al procesar caché:', error);
      }
    }

    // Guardar en caché (datos nuevos o actualizados)
    localStorage.setItem(cacheKey, JSON.stringify({
      data: newHomeData,
      timestamp: Date.now()
    }));

    logger.log('💾 Datos del home guardados en caché');
    return newHomeData;

  } catch (error) {
    logger.error('❌ Error al obtener datos del home:', error);
    
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
      sliderImages: []
    };
  }
}
