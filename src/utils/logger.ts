/**
 * Logger seguro que solo muestra información en modo desarrollo
 * En producción, los logs son silenciados para prevenir exposición de información sensible
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logger para desarrollo que se silencia en producción
 */
export const logger = {
  /**
   * Log de información general - solo visible en desarrollo
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log de información - solo visible en desarrollo
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log de advertencias - solo visible en desarrollo
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log de errores - en producción solo muestra un mensaje genérico
   * Los detalles completos solo se muestran en desarrollo
   */
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // En producción, solo mostrar un error genérico sin detalles
      console.error('An error occurred. Please contact support if the problem persists.');
    }
  },

  /**
   * Log de debug - solo visible en desarrollo
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log de tabla - solo visible en desarrollo
   */
  table: (data: any): void => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  /**
   * Grupo de logs - solo visible en desarrollo
   */
  group: (label: string): void => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  /**
   * Fin de grupo de logs
   */
  groupEnd: (): void => {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
};

/**
 * Logger que SIEMPRE muestra errores críticos
 * Usar solo para errores que requieren atención inmediata
 */
export const criticalLogger = {
  error: (...args: unknown[]): void => {
    console.error('[CRITICAL]', ...args);
  }
};

export default logger;
