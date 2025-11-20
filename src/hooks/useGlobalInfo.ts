
import { useEffect, useRef, useState } from 'react';
import { fetchInfoGeneral, type GlobalInfo } from '@/services/apiServiceInfoGeneral';

/**
 * Hook que obtiene la información global y aplica:
 * - SEO (title, meta description)
 * - Favicon y apple-touch-icon
 * - Manifest PWA dinámico con el favicon del API
 */
export const useGlobalInfo = () => {
  const [globalInfo, setGlobalInfo] = useState<GlobalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const manifestBlobUrlRef = useRef<string | null>(null);

  // Helpers para head
  const upsertMeta = (name: string, content: string) => {
    if (typeof document === 'undefined') return;
    let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const upsertLink = (rel: string, attrs: Record<string, string>) => {
    if (typeof document === 'undefined') return;
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
  };

  const updateManifestDynamic = (info: GlobalInfo) => {
    if (typeof document === 'undefined') return;

    // Revocar blob previo si existe
    if (manifestBlobUrlRef.current) {
      URL.revokeObjectURL(manifestBlobUrlRef.current);
      manifestBlobUrlRef.current = null;
    }

    // Elegir mejores URLs disponibles
    const iconDefault =
      info.favicon?.formats?.medium ||
      info.favicon?.formats?.small ||
      info.favicon?.url ||
      '';

    const iconLarge =
      info.favicon?.formats?.large ||
      info.favicon?.formats?.medium ||
      info.favicon?.url ||
      '';

    const manifest = {
      name: info.defaultSeo.metaTitle || info.siteName,
      short_name: (info.siteName || 'CGC').slice(0, 30),
      description: info.siteDescription || info.defaultSeo.metaDescription || '',
      theme_color: '#2563eb',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: iconDefault,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: iconLarge,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
      ],
      categories: ['government', 'productivity'],
      lang: 'es-GT',
      dir: 'ltr',
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    manifestBlobUrlRef.current = blobUrl;

    // Actualizar/crear link rel="manifest" para que use este manifest dinámico
    upsertLink('manifest', { href: blobUrl, crossOrigin: 'use-credentials' });
  };

  const applyHead = (info: GlobalInfo) => {
    if (typeof document === 'undefined') return;

    // Title SEO
    document.title = info.defaultSeo.metaTitle || info.siteName || document.title;

    // Meta description
    const description =
      info.defaultSeo.metaDescription ||
      info.siteDescription ||
      'Sitio oficial';
    upsertMeta('description', description);

    // Open Graph / Twitter básicos (opcional, ayuda SEO social)
    upsertMeta('og:title', info.defaultSeo.metaTitle || info.siteName);
    upsertMeta('og:description', description);
    upsertMeta('twitter:title', info.defaultSeo.metaTitle || info.siteName);
    upsertMeta('twitter:description', description);

    // Favicons
    const iconSmall = info.favicon?.formats?.thumbnail || info.favicon?.formats?.small || info.favicon?.url;
    const icon32 = info.favicon?.formats?.small || info.favicon?.formats?.medium || info.favicon?.url;
    const iconAny = info.favicon?.url;

    if (iconAny) {
      // Favicon genérico
      upsertLink('icon', { href: iconAny, type: 'image/png' });
      // 32x32 y 16x16 (tamaños típicos, el navegador reescala)
      upsertLink('icon', { href: icon32!, sizes: '32x32', type: 'image/png' });
      upsertLink('icon', { href: iconSmall!, sizes: '16x16', type: 'image/png' });
      // Apple touch icon
      upsertLink('apple-touch-icon', { href: icon32!, sizes: '180x180' });
    }

    // Manifest dinámico con estos íconos
    updateManifestDynamic(info);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchInfoGeneral();
        if (!mounted) return;
        setGlobalInfo(data);
        applyHead(data);
        console.log('✅ Global info cargada e inyectada en <head>');
      } catch (err) {
        console.error('❌ Error al cargar global info:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      if (manifestBlobUrlRef.current) {
        URL.revokeObjectURL(manifestBlobUrlRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { globalInfo, isLoading };
};
