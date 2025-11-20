/**
 * Servicio API para obtener datos del footer desde CGC
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

const API_BASE_URL = `${getApiHost()}/api`;
const API_TOKEN = getBearerToken();

export interface SocialMediaItem {
  id: number;
  Title: string;
  url: string;
}

export interface FooterData {
  id: number;
  documentId: string;
  Description: string;
  Info: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  Social: SocialMediaItem[];
}

export interface FooterResponse {
  data: FooterData;
  meta: {};
}

/**
 * Obtiene los datos del footer desde la API de CGC
 */
export const fetchFooterData = async (): Promise<FooterData> => {
  const cacheKey = 'cgc_footer_cache';
  const cacheTimeKey = 'cgc_footer_cache_time';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos en millisegundos

  try {
    // Verificar caché
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    
    if (cachedData && cachedTime) {
      const isExpired = Date.now() - parseInt(cachedTime) > CACHE_DURATION;
      if (!isExpired) {
        logger.log('📦 Usando datos del footer desde caché');
        return JSON.parse(cachedData);
      }
    }

    logger.log('🌐 Obteniendo datos del footer desde API...');
    
    const response = await fetch(`${API_BASE_URL}/footer?populate=*`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const result: FooterResponse = await response.json();
    
    if (!result.data) {
      throw new Error('Estructura de respuesta inválida: falta data');
    }

    logger.log('✅ Datos del footer obtenidos exitosamente:', result.data);

    // Guardar en caché
    localStorage.setItem(cacheKey, JSON.stringify(result.data));
    localStorage.setItem(cacheTimeKey, Date.now().toString());

    return result.data;
    
  } catch (error) {
    logger.error('❌ Error al obtener datos del footer:', error);
    throw error;
  }
};
