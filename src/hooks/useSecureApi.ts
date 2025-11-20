
import { useState, useCallback } from 'react';
import { checkRateLimit, validateInput } from '@/utils/security';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  rateLimitKey?: string;
  maxRequests?: number;
  windowMs?: number;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Hook personalizado para realizar llamadas seguras a la API
 */
export const useSecureApi = <T>() => {
  const [response, setResponse] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false
  });

  const request = useCallback(async (url: string, options: ApiOptions = {}) => {
    const {
      method = 'GET',
      headers = {},
      body,
      rateLimitKey,
      maxRequests = 30,
      windowMs = 60000
    } = options;

    // Rate limiting si se especifica
    if (rateLimitKey && !checkRateLimit(rateLimitKey, maxRequests, windowMs)) {
      setResponse({
        data: null,
        error: 'Demasiadas solicitudes. Por favor, espera un momento.',
        loading: false
      });
      return;
    }

    setResponse(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Validar URL
      if (!url || typeof url !== 'string') {
        throw new Error('URL inválida');
      }

      // Sanitizar headers
      const safeHeaders: Record<string, string> = {};
      Object.entries(headers).forEach(([key, value]) => {
        if (typeof key === 'string' && typeof value === 'string') {
          safeHeaders[validateInput(key, 100)] = validateInput(value, 1000);
        }
      });

      // Configurar headers de seguridad por defecto
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...safeHeaders
      };

      // Preparar body si existe
      let requestBody;
      if (body && method !== 'GET') {
        if (typeof body === 'string') {
          requestBody = validateInput(body, 10000);
        } else {
          requestBody = JSON.stringify(body);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const fetchResponse = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: requestBody,
        signal: controller.signal,
        credentials: 'same-origin'
      });

      clearTimeout(timeoutId);

      if (!fetchResponse.ok) {
        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
      }

      // Validar content-type
      const contentType = fetchResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respuesta inválida del servidor');
      }

      const data = await fetchResponse.json();

      setResponse({
        data,
        error: null,
        loading: false
      });

    } catch (error) {
      console.error('API request error:', error);
      
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'La solicitud tardó demasiado tiempo';
        } else {
          errorMessage = error.message;
        }
      }

      setResponse({
        data: null,
        error: errorMessage,
        loading: false
      });
    }
  }, []);

  return {
    ...response,
    request
  };
};
