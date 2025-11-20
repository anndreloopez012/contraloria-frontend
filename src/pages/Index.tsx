
import React, { useEffect } from 'react';
import HomeContent from '@/components/HomeContent';
import { useSEOOptimization } from '@/hooks/useSEOOptimization';
import { useGlobalInfo } from '@/hooks/useGlobalInfo';

/**
 * Página principal de inicio
 * Optimizada para SEO con metadatos dinámicos y structured data
 */
const Index = () => {
  const { globalInfo } = useGlobalInfo();

  // Configuración SEO específica para la página de inicio
  const seoData = {
    title: 'Inicio',
    description: 'Portal oficial de la Contraloría General de Cuentas de Guatemala. Transparencia, control y fiscalización del Estado. Accede a información pública, reportes de auditoría y servicios ciudadanos.',
    keywords: 'contraloría general cuentas guatemala, portal oficial, transparencia guatemala, fiscalización estado, auditoría gubernamental, rendición cuentas públicas, anticorrupción guatemala',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Inicio - Contraloría General de Cuentas",
      "description": "Portal oficial de la Contraloría General de Cuentas de Guatemala",
      "url": window.location.href,
      "mainEntity": {
        "@type": "GovernmentOrganization",
        "name": "Contraloría General de Cuentas",
        "description": "Órgano de control y fiscalización del Estado de Guatemala"
      }
    }
  };

  // Aplicar optimización SEO
  useSEOOptimization(seoData);

  // Precargar recursos críticos
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Precargar imágenes críticas del slider
    const criticalImages = [
      '/lovable-uploads/be6267fe-c26a-4dd8-bdc3-95323c6a0fd7.png',
      '/lovable-uploads/7101cad0-e8e9-44fc-bafc-0a86f30c38f4.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Agregar hints de rendimiento
    const dnsPreconnect = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
    dnsPreconnect.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

  }, []);

  return <HomeContent />;
};

export default Index;
