
/**
 * Servicio para generar sitemap dinámico basado en el contenido de la API
 */

import { fetchAllPages } from './apiServicePages';
import { fetchMenuData } from './apiServiceMenu';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Genera URLs del sitemap basado en el contenido real de la API
 */
export const generateSitemapUrls = async (): Promise<SitemapUrl[]> => {
  const baseUrl = window.location.origin;
  const currentDate = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];

  // URL principal
  urls.push({
    loc: baseUrl,
    lastmod: currentDate,
    changefreq: 'daily',
    priority: 1.0
  });

  try {
    // Páginas de contenido desde API
    const pages = await fetchAllPages();
    pages.forEach(pageSlug => {
      if (pageSlug && pageSlug.trim()) {
        urls.push({
          loc: `${baseUrl}/${pageSlug}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: 0.8
        });
      }
    });

    // Elementos del menú principal
    const menuData = await fetchMenuData();
    menuData.mainNavItems.forEach(item => {
      if (item.route && !item.route.startsWith('http')) {
        urls.push({
          loc: `${baseUrl}${item.route}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: 0.7
        });
      }

      // Subelementos del menú
      if (item.children) {
        item.children.forEach(child => {
          if (child.route && !child.route.startsWith('http')) {
            urls.push({
              loc: `${baseUrl}${child.route}`,
              lastmod: currentDate,
              changefreq: 'weekly',
              priority: 0.6
            });
          }
        });
      }
    });
  } catch (error) {
    console.warn('Error al generar URLs del sitemap desde API:', error);
  }

  // URLs estáticas adicionales
  const staticPages = [
    '/articulos',
    '/estado-cuenta',
    '/links',
    '/manuales-procedimientos'
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page}`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: 0.5
    });
  });

  // Remover duplicados
  const uniqueUrls = urls.filter((url, index, self) => 
    index === self.findIndex(u => u.loc === url.loc)
  );

  return uniqueUrls;
};

/**
 * Genera el XML del sitemap
 */
export const generateSitemapXML = async (): Promise<string> => {
  const urls = await generateSitemapUrls();
  
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
};

/**
 * Función para descargar el sitemap (útil para desarrollo)
 */
export const downloadSitemap = async () => {
  try {
    const xml = await generateSitemapXML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    console.log('✅ Sitemap descargado exitosamente');
  } catch (error) {
    console.error('❌ Error al generar sitemap:', error);
  }
};
