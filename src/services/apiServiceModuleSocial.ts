/**
 * Servicio para obtener elementos del menú social desde el API de CGC
 * Consume el endpoint de menu-items con filtro por slug 'menu-display-social'
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

const API_BASE_URL = getApiHost();
const API_TOKEN = getBearerToken();

export interface SocialMediaItem {
  id: number;
  documentId: string;
  title: string;
  url: string;
  route: string | null;
  description: string | null;
  target_blank: boolean;
  icon: string | null;
  active: boolean;
  text_color: string | null;
  text_color_hover: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  menu: {
    id: number;
    documentId: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  children: any[];
  images: any;
  parent: any;
}

export interface SocialMediaResponse {
  data: SocialMediaItem[];
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
 * Obtiene los elementos del menú social desde el API
 */
export const fetchSocialMediaItems = async (): Promise<SocialMediaItem[]> => {
  const cacheKey = 'cgc_social_media_cache';
  const cacheTimeKey = 'cgc_social_media_cache_time';
  const cacheTimeout = 5 * 60 * 1000; // 5 minutos

  try {
    // Verificar caché
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheTimeKey);
    
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < cacheTimeout) {
      logger.log('📱 Datos de redes sociales obtenidos desde caché');
      return JSON.parse(cached);
    }

    logger.log('🔄 Obteniendo datos de redes sociales desde el API...');
    
    const response = await fetch(
      `${API_BASE_URL}/api/menu-items?filters[menu][slug][$eq]=menu-display-social&populate=*`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data: SocialMediaResponse = await response.json();
    
    // Filtrar solo elementos activos
    const activeItems = data.data.filter(item => item.active);
    
    // Guardar en caché
    localStorage.setItem(cacheKey, JSON.stringify(activeItems));
    localStorage.setItem(cacheTimeKey, Date.now().toString());
    
    logger.log('✅ Datos de redes sociales obtenidos exitosamente:', {
      total: activeItems.length,
      items: activeItems.map(item => ({ title: item.title, url: item.url }))
    });
    
    return activeItems;
    
  } catch (error) {
    logger.error('❌ Error al obtener datos de redes sociales:', error);
    throw error;
  }
};

/**
 * Determina el tipo de red social basado en el título o URL
 */
export const getSocialMediaType = (item: SocialMediaItem): 'facebook' | 'twitter' | 'youtube' | 'other' => {
  const title = item.title.toLowerCase();
  const url = item.url.toLowerCase();
  
  if (title.includes('facebook') || url.includes('facebook.com')) {
    return 'facebook';
  } else if (title.includes('x') || title.includes('twitter') || url.includes('x.com') || url.includes('twitter.com')) {
    return 'twitter';
  } else if (title.includes('youtube') || url.includes('youtube.com')) {
    return 'youtube';
  }
  
  return 'other';
};

/**
 * Obtiene el ID del video de YouTube desde una URL
 */
export const getYouTubeVideoId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};
