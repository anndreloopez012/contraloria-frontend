
/**
 * Configuración de API con soporte de variables "similares a .env" y fallback a valores actuales.
 *
 * ¿Dónde definir valores?
 * 1) Variables Vite (recomendado para despliegues):
 *    - VITE_CGC_API_HOST: Host base de la API (p. ej. https://adm-cms.cgc.gob.gt)
 *    - VITE_CGC_API_TOKEN: Token Bearer para autenticación contra Strapi v5
 *
 * 2) Variables globales en window (útil para pruebas rápidas en el navegador):
 *    - window.__CGC_API_HOST: Sobrescribe el host base de la API en tiempo de ejecución
 *    - window.__CGC_API_TOKEN: Sobrescribe el token Bearer en tiempo de ejecución
 *    Ejemplo en consola:
 *      window.__CGC_API_HOST = 'https://mi-host.com';
 *      window.__CGC_API_TOKEN = 'mi-token';
 *
 * 3) localStorage (persistente en el navegador del usuario):
 *    - localStorage["CGC_API_HOST"]: Host base de la API
 *    - localStorage["CGC_API_TOKEN"]: Token Bearer
 *    Ejemplo en consola:
 *      localStorage.setItem('CGC_API_HOST', 'https://mi-host.com');
 *      localStorage.setItem('CGC_API_TOKEN', 'mi-token');
 *
 * Orden de lectura (prioridad):
 * 1) import.meta.env.VITE_CGC_API_HOST / VITE_CGC_API_TOKEN
 * 2) window.__CGC_API_HOST / window.__CGC_API_TOKEN
 * 3) localStorage["CGC_API_HOST"] / localStorage["CGC_API_TOKEN"]
 * 4) Valores por defecto (los que ya usa la app actualmente)
 *
 * Nota: Lovable no usa archivos .env reales en tiempo de ejecución. Usamos variables de Vite,
 * globals en window o localStorage como alternativas seguras para la configuración.
 */

// Safe access to Vite environment variables (only variables prefixed with VITE_ are exposed)
const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;

// Helper: small inline sanitize for host (avoid moving sanitizeHost declaration)
const sanitizeViteHost = (host?: string | null) => {
  if (!host || typeof host !== 'string') return '';
  const trimmed = host.trim();
  if (!trimmed) return '';
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

/**
 * DEFAULT_HOST
 * - Intenta cargar desde Vite (.env -> import.meta.env.VITE_CGC_API_HOST). Si no existe, usa el valor hardcoded anterior.
 */
const DEFAULT_HOST = sanitizeViteHost(viteEnv?.VITE_CGC_API_HOST) || 'https://adm-cms.cgc.gob.gt';

/**
 * DEFAULT_TOKEN
 * - Intenta cargar desde Vite (.env -> import.meta.env.VITE_CGC_API_TOKEN). Si no existe, usa el token hardcoded (dev fallback).
 * - Nota: Evita subir tokens de producción a repositorios. Para producción ponga DEFAULT_TOKEN vacío y configure VITE_CGC_API_TOKEN en el entorno de despliegue.
 */
const DEFAULT_TOKEN =
  (viteEnv?.VITE_CGC_API_TOKEN && typeof viteEnv.VITE_CGC_API_TOKEN === 'string' && viteEnv.VITE_CGC_API_TOKEN.trim()) ||
  '384b86383093b245fdd2564e3be1e094ba9ef051fc55b19c2570ab9b70c2ce555d5af508fd68b9bd36c7156ba690210790c16aafbab749579136182796499e1a41be9a4d0ad300f34404a87052cd92b37582fa4d0f5d2e1689cb5eb4fc99fedfac7e99fdfba3e19cab0c4b22cc73b71e272f4e33442edc88e0722852996897';

/**
 * DEFAULT_DISABLE_RIGHT_CLICK
 * - Intenta cargar desde Vite (.env -> import.meta.env.VITE_CGC_DISABLE_RIGHT_CLICK).
 * - Si la variable existe, se considera 'true' solo cuando su string es 'true'. Si no existe, se usa el valor por defecto actual (true).
 */
const rawViteDisable = viteEnv?.VITE_CGC_DISABLE_RIGHT_CLICK as string | undefined;
const DEFAULT_DISABLE_RIGHT_CLICK = rawViteDisable !== undefined ? rawViteDisable === 'true' : true;

/**
 * sanitizeHost
 * - Normaliza el host removiendo espacios y el trailing slash final, si existe.
 * - Devuelve una cadena vacía si el valor no es válido.
 */
const sanitizeHost = (host?: string | null) => {
  if (!host || typeof host !== 'string') return '';
  const trimmed = host.trim();
  if (!trimmed) return '';
  // quitar trailing slash
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

/**
 * getApiHost
 * - Devuelve el host base de la API siguiendo este orden de prioridad:
 *   1) VITE_CGC_API_HOST (Vite env)
 *   2) window.__CGC_API_HOST (global de runtime)
 *   3) localStorage["CGC_API_HOST"]
 *   4) DEFAULT_HOST (fallback)
 */
export const getApiHost = (): string => {
  // 1) Vite env (safe access)
  const viteHost =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CGC_API_HOST) as
      | string
      | undefined;
  const fromVite = sanitizeHost(viteHost);

  if (fromVite) return fromVite;

  // 2) window global
  const fromWindow = sanitizeHost(
    (typeof window !== 'undefined' && (window as any).__CGC_API_HOST) || ''
  );
  if (fromWindow) return fromWindow;

  // 3) localStorage
  const fromLs = sanitizeHost(
    typeof window !== 'undefined' ? window.localStorage.getItem('CGC_API_HOST') : ''
  );
  if (fromLs) return fromLs;

  // 4) default
  return DEFAULT_HOST;
};

/**
 * getBearerToken
 * - Devuelve el token Bearer con estrategia híbrida desarrollo/producción:
 *   1) DEFAULT_TOKEN si tiene valor (desarrollo)
 *   2) VITE_CGC_API_TOKEN (Vite env) si DEFAULT_TOKEN está vacío (producción)
 *   3) window.__CGC_API_TOKEN (global de runtime)
 *   4) localStorage["CGC_API_TOKEN"]
 * 
 * Estrategia:
 * - Desarrollo: DEFAULT_TOKEN con valor hardcoded
 * - Producción: DEFAULT_TOKEN = '' y usa VITE_CGC_API_TOKEN
 */
export const getBearerToken = (): string => {
  // 1) DEFAULT_TOKEN primero (desarrollo)
  if (DEFAULT_TOKEN && DEFAULT_TOKEN.trim()) {
    return DEFAULT_TOKEN.trim();
  }

  // 2) VITE_CGC_API_TOKEN (producción cuando DEFAULT_TOKEN está vacío)
  const viteToken =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CGC_API_TOKEN) as
      | string
      | undefined;
  if (viteToken && typeof viteToken === 'string' && viteToken.trim()) {
    return viteToken.trim();
  }

  // 3) window global (override temporal)
  const winToken = typeof window !== 'undefined' && (window as any).__CGC_API_TOKEN;
  if (winToken && typeof winToken === 'string' && winToken.trim()) {
    return winToken.trim();
  }

  // 4) localStorage (override persistente)
  const lsToken = typeof window !== 'undefined' ? window.localStorage.getItem('CGC_API_TOKEN') : null;
  if (lsToken && lsToken.trim()) {
    return lsToken.trim();
  }

  // 5) Fallback vacío (no debería llegar aquí)
  console.warn('⚠️ No se encontró ningún token Bearer configurado');
  return '';
};

/**
 * absUrl
 * - Convierte una ruta relativa (p. ej. /api/home) en una URL absoluta usando getApiHost().
 * - Si el valor ya es absoluto (empieza con http), se devuelve tal cual.
 */
export const absUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getApiHost()}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * getDisableRightClick
 * - Devuelve si se debe deshabilitar el clic derecho siguiendo este orden de prioridad:
 *   1) VITE_CGC_DISABLE_RIGHT_CLICK (Vite env)
 *   2) window.__CGC_DISABLE_RIGHT_CLICK (global de runtime)
 *   3) localStorage["CGC_DISABLE_RIGHT_CLICK"]
 *   4) DEFAULT_DISABLE_RIGHT_CLICK (fallback)
 */
export const getDisableRightClick = (): boolean => {
  // 1) Vite env (safe access)
  const viteDisable =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_CGC_DISABLE_RIGHT_CLICK) as
      | string
      | undefined;
  if (viteDisable !== undefined) return viteDisable === 'true';

  // 2) window global
  const winDisable = typeof window !== 'undefined' && (window as any).__CGC_DISABLE_RIGHT_CLICK;
  if (winDisable !== undefined) return Boolean(winDisable);

  // 3) localStorage
  const lsDisable = typeof window !== 'undefined' ? window.localStorage.getItem('CGC_DISABLE_RIGHT_CLICK') : null;
  if (lsDisable !== null) return lsDisable === 'true';

  // 4) default
  return DEFAULT_DISABLE_RIGHT_CLICK;
};

