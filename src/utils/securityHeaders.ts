
/**
 * Utilidades para añadir headers de seguridad HTTP
 */

export const SECURITY_HEADERS = {
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Habilitar XSS protection del navegador
  'X-XSS-Protection': '1; mode=block',
  
  // Forzar HTTPS (solo en producción)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Política de referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Controlar qué features puede usar la página
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  
  // Content Security Policy básica
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cgc-adm.server-softplus.plus",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://cgc-adm.server-softplus.plus",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
};

/**
 * Función para validar y limpiar datos de localStorage
 */
export const cleanLocalStorage = () => {
  try {
    const keysToCheck = [];
    
    // Obtener todas las claves
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToCheck.push(key);
    }
    
    // Verificar cada clave
    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          // Verificar si es JSON válido
          JSON.parse(value);
          
          // Verificar tamaño (max 1MB por entrada)
          if (value.length > 1024 * 1024) {
            console.warn(`Removing oversized localStorage item: ${key}`);
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        console.warn(`Removing invalid localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Limpiar entradas de rate limiting expiradas
    keysToCheck.forEach(key => {
      if (key.startsWith('rate_limit_')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const data = JSON.parse(value);
            const now = Date.now();
            // Limpiar entradas de más de 1 hora
            if (now - data.timestamp > 3600000) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
};

/**
 * Inicializar configuraciones de seguridad
 */
export const initSecurity = () => {
  // Limpiar localStorage al inicio
  cleanLocalStorage();
  
  // Configurar limpieza periódica
  setInterval(cleanLocalStorage, 30 * 60 * 1000); // Cada 30 minutos
  
  // Prevenir debug en producción
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U
    document.addEventListener('keydown', (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
      }
    });
  }
};
