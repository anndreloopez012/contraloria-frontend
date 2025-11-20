
import React from 'react';
import { useGlobalInfo } from '@/hooks/useGlobalInfo';
import { useLocation } from 'react-router-dom';

/**
 * Componente que inyecta structured data avanzado para mejor SEO
 */
const StructuredData: React.FC = () => {
  const { globalInfo } = useGlobalInfo();
  const location = useLocation();

  // Schema para organización gubernamental
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    "name": globalInfo?.siteName || "Contraloría General de Cuentas",
    "alternateName": ["CGC", "CGC Guatemala", "Contraloría Guatemala"],
    "description": globalInfo?.siteDescription || "Órgano superior de control y fiscalización de los fondos públicos del Estado de Guatemala",
    "url": window.location.origin,
    "logo": {
      "@type": "ImageObject", 
      "url": globalInfo?.favicon?.url ? `${window.location.origin}${globalInfo.favicon.url}` : `${window.location.origin}/pwa-512x512.png`,
      "width": 512,
      "height": 512
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "8a. Avenida 10-67, Zona 1",
      "addressLocality": "Ciudad de Guatemala",
      "addressRegion": "Guatemala",
      "postalCode": "01001", 
      "addressCountry": "GT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.6349",
      "longitude": "-90.5069"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+502-2232-7878",
        "contactType": "customer service",
        "availableLanguage": "Spanish",
        "areaServed": "GT"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/CGCGuatemala",
      "https://twitter.com/CGC_Guatemala",
      "https://www.youtube.com/CGCGuatemala",
      "https://www.instagram.com/cgc_guatemala"
    ],
    "founder": {
      "@type": "GovernmentOrganization",
      "name": "República de Guatemala"
    },
    "foundingDate": "1956",
    "areaServed": {
      "@type": "Country",
      "name": "Guatemala"
    },
    "knowsAbout": [
      "Auditoría Gubernamental",
      "Fiscalización",
      "Control Interno",
      "Transparencia",
      "Rendición de Cuentas",
      "Auditoría Social"
    ],
    "department": [
      {
        "@type": "Organization",
        "name": "Dirección de Auditoría al Sector Gobierno Central",
        "description": "Auditoría a ministerios y secretarías"
      },
      {
        "@type": "Organization", 
        "name": "Dirección de Auditoría al Sector Municipalidades",
        "description": "Fiscalización de gobiernos locales"
      }
    ]
  };

  // Schema para el sitio web
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": globalInfo?.siteName || "Contraloría General de Cuentas",
    "alternateName": "CGC Guatemala",
    "url": window.location.origin,
    "description": globalInfo?.siteDescription,
    "inLanguage": "es-GT",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "copyrightHolder": {
      "@type": "GovernmentOrganization",
      "name": "Contraloría General de Cuentas"
    },
    "publisher": {
      "@type": "GovernmentOrganization",
      "name": "Contraloría General de Cuentas"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
    </>
  );
};

export default StructuredData;
