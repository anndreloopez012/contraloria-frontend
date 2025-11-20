
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalInfo } from './useGlobalInfo';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: any;
}

/**
 * Hook para optimización avanzada de SEO
 * Maneja metadatos dinámicos, structured data y optimizaciones para Google
 */
export const useSEOOptimization = (pageData?: SEOData) => {
  const location = useLocation();
  const { globalInfo } = useGlobalInfo();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // URL canónica
    const canonicalUrl = pageData?.canonical || `${window.location.origin}${location.pathname}`;
    
    // Título optimizado
    const pageTitle = pageData?.title 
      ? `${pageData.title} | ${globalInfo?.siteName || 'CGC Guatemala'}`
      : globalInfo?.defaultSeo?.metaTitle || 'Contraloría General de Cuentas - Guatemala';

    // Descripción optimizada
    const pageDescription = pageData?.description || 
      globalInfo?.defaultSeo?.metaDescription || 
      'Portal oficial de la Contraloría General de Cuentas de Guatemala - Transparencia, Control y Fiscalización del Estado';

    // Keywords por defecto
    const defaultKeywords = 'contraloría general cuentas guatemala, transparencia, fiscalización, auditoría, control gubernamental, anticorrupción, rendición cuentas';
    const pageKeywords = pageData?.keywords ? `${pageData.keywords}, ${defaultKeywords}` : defaultKeywords;

    // Actualizar título
    document.title = pageTitle;

    // Meta tags básicos
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', pageKeywords);
    updateMetaTag('author', 'Contraloría General de Cuentas - Guatemala');
    updateMetaTag('robots', 'index, follow, max-image-preview:large');

    // Open Graph
    updateMetaTag('og:title', pageTitle, 'property');
    updateMetaTag('og:description', pageDescription, 'property');
    updateMetaTag('og:url', canonicalUrl, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:locale', 'es_GT', 'property');
    updateMetaTag('og:site_name', globalInfo?.siteName || 'CGC Guatemala', 'property');
    
    // Imagen OG
    const ogImage = pageData?.ogImage || globalInfo?.favicon?.url || '/pwa-512x512.png';
    if (ogImage) {
      const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`;
      updateMetaTag('og:image', absoluteOgImage, 'property');
      updateMetaTag('og:image:width', '1200', 'property');
      updateMetaTag('og:image:height', '630', 'property');
      updateMetaTag('og:image:alt', pageTitle, 'property');
    }

    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`);
    }

    // Canonical URL
    updateLinkTag('canonical', { href: canonicalUrl });

    // Structured Data para organización gubernamental
    if (globalInfo) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "GovernmentOrganization",
        "name": globalInfo.siteName || "Contraloría General de Cuentas",
        "alternateName": "CGC Guatemala",
        "description": globalInfo.siteDescription || pageDescription,
        "url": window.location.origin,
        "logo": globalInfo.favicon?.url ? `${window.location.origin}${globalInfo.favicon.url}` : `${window.location.origin}/pwa-512x512.png`,
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "GT",
          "addressLocality": "Guatemala",
          "addressRegion": "Guatemala"
        },
        "areaServed": {
          "@type": "Country",
          "name": "Guatemala"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        },
        "sameAs": [
          "https://www.facebook.com/CGCGuatemala",
          "https://twitter.com/CGC_Guatemala", 
          "https://www.youtube.com/CGCGuatemala"
        ]
      };

      updateStructuredData('organization-data', structuredData);
    }

    // Structured Data específico de la página
    if (pageData?.structuredData) {
      updateStructuredData('page-data', pageData.structuredData);
    }

    // Breadcrumb structured data
    if (location.pathname !== '/') {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const breadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Inicio",
            "item": window.location.origin
          },
          ...pathSegments.map((segment, index) => ({
            "@type": "ListItem",
            "position": index + 2,
            "name": segment.charAt(0).toUpperCase() + segment.slice(1),
            "item": `${window.location.origin}/${pathSegments.slice(0, index + 1).join('/')}`
          }))
        ]
      };
      updateStructuredData('breadcrumb-data', breadcrumbList);
    }

  }, [location.pathname, globalInfo, pageData]);

  // Helper functions
  const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
    let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  const updateLinkTag = (rel: string, attributes: Record<string, string>) => {
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  };

  const updateStructuredData = (id: string, data: any) => {
    let script = document.getElementById(id) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  };
};
