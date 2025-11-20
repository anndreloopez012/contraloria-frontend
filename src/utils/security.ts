
/**
 * Utilidades de seguridad para prevenir vulnerabilidades comunes
 */

/**
 * Sanitiza texto para prevenir ataques XSS
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Valida si una URL es segura
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // Solo permitir protocolos seguros
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitiza URLs para prevenir inyección de JavaScript
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '#';
  
  // Remover protocolos peligrosos
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase().trim();
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '#';
    }
  }
  
  if (!isValidUrl(url)) {
    return '#';
  }
  
  return url;
};

/**
 * Valida datos de entrada básicos
 */
export const validateInput = (input: unknown, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Limitar longitud para prevenir ataques de buffer overflow
  const truncated = input.slice(0, maxLength);
  
  // Sanitizar el contenido
  return sanitizeText(truncated);
};

/**
 * Genera un nonce para CSP
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Valida si un archivo tiene una extensión permitida
 */
export const isValidFileType = (filename: string, allowedTypes: string[] = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp']): boolean => {
  if (!filename || typeof filename !== 'string') return false;
  
  const extension = filename.toLowerCase().split('.').pop();
  return extension ? allowedTypes.includes(extension) : false;
};

/**
 * Rate limiting simple usando localStorage
 */
export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  try {
    const now = Date.now();
    const stored = localStorage.getItem(`rate_limit_${key}`);
    
    if (!stored) {
      localStorage.setItem(`rate_limit_${key}`, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }
    
    const data = JSON.parse(stored);
    
    // Reset si ha pasado la ventana de tiempo
    if (now - data.timestamp > windowMs) {
      localStorage.setItem(`rate_limit_${key}`, JSON.stringify({ count: 1, timestamp: now }));
      return true;
    }
    
    // Verificar límite
    if (data.count >= maxRequests) {
      return false;
    }
    
    // Incrementar contador
    localStorage.setItem(`rate_limit_${key}`, JSON.stringify({ count: data.count + 1, timestamp: data.timestamp }));
    return true;
  } catch {
    return false;
  }
};
