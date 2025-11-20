/**
 * Servicio API para obtener preguntas y respuestas desde Strapi v5
 * Consume el API real de CGC para el sistema de chat/FAQ
 * SIN CACHÉ - Los datos se obtienen siempre frescos del servidor
 */

import { getApiHost, getBearerToken } from '@/config/apiEnv';
import logger from '@/utils/logger';

// Configuración del API
const API_CONFIG = {
  BASE_URL: `${getApiHost()}/api/n8-ns`,
  BEARER_TOKEN: getBearerToken(),
  BASE_MEDIA_URL: getApiHost()
};

// Tipos para las respuestas del API de Strapi v5
export interface StrapiImageFormat {
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

export interface StrapiImageFormats {
  large?: StrapiImageFormat;
  medium?: StrapiImageFormat;
  small?: StrapiImageFormat;
  thumbnail?: StrapiImageFormat;
}

export interface StrapiFile {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: StrapiImageFormats;
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

export interface StrapiQuestion {
  id: number;
  documentId: string;
  question: string;
  response: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  files: StrapiFile[] | null;
}

export interface StrapiQuestionsResponse {
  data: StrapiQuestion[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// Tipos transformados para uso en la aplicación
export interface QuestionFile {
  id: number;
  name: string;
  url: string;
  alternativeText?: string;
  formats: {
    large?: string;
    medium?: string;
    small?: string;
    thumbnail?: string;
  };
  mime: string;
  size: number;
}

export interface QuestionData {
  id: number;
  question: string;
  response: string;
  files: QuestionFile[];
  createdAt: string;
}

/**
 * Obtiene todas las preguntas y respuestas
 * SIEMPRE obtiene datos frescos del servidor (sin caché)
 */
export const fetchQuestions = async (): Promise<QuestionData[]> => {
  try {
    const endpoint = `${API_CONFIG.BASE_URL}?populate=*`;
    
    logger.log(`🚀 Obteniendo preguntas FRESCAS del servidor`);
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: StrapiQuestionsResponse = await response.json();
    logger.log('📦 Respuesta FRESCA del API de preguntas:', apiResponse);

    // Transformar datos de Strapi v5
    const transformedData = transformStrapiQuestionsResponse(apiResponse);

    logger.log('✅ Preguntas transformadas (SIN CACHÉ):', transformedData);
    return transformedData;

  } catch (error) {
    logger.error('❌ Error al obtener preguntas:', error);
    return [];
  }
};

/**
 * Transforma la respuesta del API de Strapi v5 al formato esperado por la aplicación
 */
const transformStrapiQuestionsResponse = (apiResponse: StrapiQuestionsResponse): QuestionData[] => {
  if (!apiResponse?.data || !Array.isArray(apiResponse.data)) {
    logger.warn('⚠️ No hay datos de preguntas en la respuesta del API');
    return [];
  }

  return apiResponse.data.map(item => transformQuestionItem(item));
};

/**
 * Transforma un elemento individual de pregunta
 */
const transformQuestionItem = (item: StrapiQuestion): QuestionData => {
  return {
    id: item.id,
    question: item.question || '',
    response: item.response || '',
    files: item.files ? item.files.map(transformFileItem) : [],
    createdAt: item.createdAt
  };
};

/**
 * Transforma un archivo individual
 */
const transformFileItem = (file: StrapiFile): QuestionFile => {
  const baseUrl = file.url.startsWith('http') ? file.url : `${API_CONFIG.BASE_MEDIA_URL}${file.url}`;
  
  return {
    id: file.id,
    name: file.name,
    url: baseUrl,
    alternativeText: file.alternativeText || undefined,
    formats: {
      large: file.formats.large ? `${API_CONFIG.BASE_MEDIA_URL}${file.formats.large.url}` : undefined,
      medium: file.formats.medium ? `${API_CONFIG.BASE_MEDIA_URL}${file.formats.medium.url}` : undefined,
      small: file.formats.small ? `${API_CONFIG.BASE_MEDIA_URL}${file.formats.small.url}` : undefined,
      thumbnail: file.formats.thumbnail ? `${API_CONFIG.BASE_MEDIA_URL}${file.formats.thumbnail.url}` : undefined,
    },
    mime: file.mime,
    size: file.size
  };
};

/**
 * Busca preguntas similares basándose en el texto de entrada
 */
export const searchSimilarQuestions = (questions: QuestionData[], searchText: string): QuestionData[] => {
  if (!searchText.trim()) {
    return questions.slice(0, 10); // Devolver las primeras 10 si no hay texto
  }

  const searchLower = searchText.toLowerCase().trim();
  
  // Calcular similitud para cada pregunta
  const questionsWithScore = questions.map(q => ({
    ...q,
    score: calculateSimilarityScore(q.question.toLowerCase(), searchLower)
  }));

  // Ordenar por score descendente y filtrar las que tienen score > 0
  return questionsWithScore
    .filter(q => q.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

/**
 * Calcula un score de similitud simple entre dos textos
 */
const calculateSimilarityScore = (text1: string, text2: string): number => {
  // Coincidencia exacta
  if (text1.includes(text2)) {
    return 100;
  }

  // Coincidencia de palabras individuales
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  
  let matchingWords = 0;
  words2.forEach(word => {
    if (word.length > 2 && words1.some(w => w.includes(word))) {
      matchingWords++;
    }
  });

  return (matchingWords / words2.length) * 80;
};

/**
 * Encuentra la mejor respuesta para una pregunta específica
 */
export const findBestAnswer = (questions: QuestionData[], questionText: string): QuestionData | null => {
  const results = searchSimilarQuestions(questions, questionText);
  return results.length > 0 ? results[0] : null;
};

/**
 * Función legacy mantenida por compatibilidad - ya no hace nada
 */
export const clearQuestionsCache = () => {
  logger.log('🗑️ clearQuestionsCache llamada - sin efecto (caché deshabilitado)');
};
