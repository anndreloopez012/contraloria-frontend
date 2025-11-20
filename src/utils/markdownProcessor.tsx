
import { marked } from 'marked';
import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

/**
 * Configuración de marked para un renderizado seguro y completo
 */
const renderer = new marked.Renderer();

// Personalizar el renderizado de encabezados para soportar sintaxis {#id}
renderer.heading = ({ tokens, depth }) => {
  const text = tokens.map(token => {
    if ('text' in token) return token.text;
    if ('raw' in token) return token.raw;
    return '';
  }).join('');
  
  // Buscar la sintaxis {#id} al final del texto
  const match = text.match(/^(.+?)\s*\{#([a-zA-Z0-9\-_]+)\}\s*$/);
  
  if (match) {
    const cleanText = match[1].trim();
    const id = match[2];
    return `<h${depth} id="${id}">${cleanText}</h${depth}>`;
  }
  
  // Si no hay ID personalizado, generar uno automático del texto
  const autoId = text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Consolidar múltiples guiones
    .trim();
  
  return `<h${depth} id="${autoId}">${text}</h${depth}>`;
};

marked.setOptions({
  breaks: true, // Convierte saltos de línea en <br>
  gfm: true, // GitHub Flavored Markdown
  async: false, // Forzar modo síncrono
  renderer: renderer
});

/**
 * Detecta si un texto contiene principalmente HTML o markdown
 */
const detectContentType = (content: string): 'html' | 'markdown' => {
  // Limpia espacios en blanco
  const trimmed = content.trim();
  
  // Si contiene tags HTML válidos, probablemente es HTML
  const htmlTagRegex = /<\s*\w+[^>]*>.*?<\s*\/\s*\w+\s*>|<\s*\w+[^>]*\/\s*>/g;
  const htmlMatches = trimmed.match(htmlTagRegex);
  
  // Si contiene markdown típico, probablemente es markdown
  const markdownRegex = /(\*\*.*?\*\*|__.*?__|#+ |^\s*[\*\-\+]\s+|\d+\.\s+|```|`.*?`|\[.*?\]\(.*?\))/gm;
  const markdownMatches = trimmed.match(markdownRegex);
  
  // Si tiene más elementos HTML que markdown, es HTML
  if (htmlMatches && markdownMatches) {
    return htmlMatches.length > markdownMatches.length ? 'html' : 'markdown';
  }
  
  // Si solo tiene HTML, es HTML
  if (htmlMatches && htmlMatches.length > 0) {
    return 'html';
  }
  
  // Si tiene markdown o por defecto, es markdown
  return 'markdown';
};

/**
 * Configuración de DOMPurify para sanitización robusta compatible con CKEditor 5
 */
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'sub', 'sup',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'pre', 'code',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'div', 'span', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav',
    'hr', 'iframe', 'video', 'audio', 'source'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'class', 'id', 'name',
    'width', 'height', 'style', 'target', 'rel', 'type',
    'colspan', 'rowspan', 'align', 'valign',
    'data-*', 'aria-*', 'role',
    'controls', 'autoplay', 'loop', 'muted', 'poster',
    'frameborder', 'allowfullscreen', 'loading'
  ],
  ALLOW_DATA_ATTR: true,
  ALLOW_ARIA_ATTR: true,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
  ADD_TAGS: [],
  ADD_ATTR: []
};

/**
 * Desescapa iframes que vienen dentro de bloques de código
 */
const unescapeIframes = (html: string): string => {
  // Buscar bloques <pre><code> que contengan iframes escapados
  const preCodeRegex = /<pre><code[^>]*>(.*?)<\/code><\/pre>/gs;
  
  return html.replace(preCodeRegex, (match, codeContent) => {
    // Verificar si contiene un iframe escapado
    if (codeContent.includes('&lt;iframe') || codeContent.includes('iframe')) {
      // Desescapar el contenido HTML
      const unescaped = codeContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&');
      
      // Extraer solo el iframe (eliminar texto adicional)
      const iframeMatch = unescaped.match(/<iframe[^>]*>.*?<\/iframe>/s);
      if (iframeMatch) {
        return iframeMatch[0];
      }
      
      return unescaped;
    }
    
    // Si no es un iframe, dejar el bloque de código como está
    return match;
  });
};

/**
 * Procesa contenido que puede ser HTML o markdown
 * - Si es HTML, lo sanitiza con DOMPurify
 * - Si es markdown, lo convierte a HTML y luego lo sanitiza
 */
export const processContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const contentType = detectContentType(content);
  let processedHtml = '';
  
  if (contentType === 'html') {
    // Es HTML, desescapar iframes primero
    processedHtml = unescapeIframes(content);
  } else {
    // Es markdown, convertir a HTML y luego desescapar iframes
    const markdownHtml = marked.parse(content, { async: false }) as string;
    processedHtml = unescapeIframes(markdownHtml);
  }
  
  // Sanitizar con DOMPurify (permitiendo iframes)
  return DOMPurify.sanitize(processedHtml, DOMPURIFY_CONFIG);
};

/**
 * DEPRECATED: Esta función ya no se usa. DOMPurify reemplaza la sanitización basada en regex.
 * Mantenida por compatibilidad pero no debe usarse en código nuevo.
 * 
 * @deprecated Use DOMPurify.sanitize() instead
 */
const sanitizeBasicHtml = (html: string): string => {
  // Esta función ha sido reemplazada por DOMPurify en processContent()
  // Se mantiene solo por referencia histórica
  console.warn('sanitizeBasicHtml is deprecated. Use DOMPurify.sanitize() instead.');
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
};

/**
 * Componente React para renderizar contenido procesado
 */
interface ContentRendererProps {
  content: string;
  className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content, 
  className = "" 
}) => {
  const processedContent = processContent(content);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add smooth scroll behavior to anchor links
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
            // Update URL without triggering navigation
            window.history.pushState(null, '', href);
          }
        }
      }
    };

    container.addEventListener('click', handleAnchorClick);

    // Process tables
    const tables = container.querySelectorAll('table');
    tables.forEach((table) => {
      const el = table as HTMLElement;

      const styleAttr = el.getAttribute('style') || '';
      const hasAlignmentDirective =
        el.hasAttribute('align') ||
        /margin|text-align|float|display|justify|left|right|center|width/i.test(styleAttr);

      // Si CKEditor envolvió la tabla en <figure class="table">, la centramos a nivel de figure
      const parent = el.parentElement as HTMLElement | null;
      const isFigureWrapper = parent && parent.tagName.toLowerCase() === 'figure';
      const figureHasTableClass = isFigureWrapper && parent!.classList.contains('table');

      if (figureHasTableClass) {
        // Asegurar que la tabla no ocupe todo el ancho y se pueda centrar visualmente
        if (!hasAlignmentDirective) {
          el.style.width = 'max-content';
          el.style.maxWidth = '100%';
          el.style.marginLeft = 'auto';
          el.style.marginRight = 'auto';
        }
        // Centrar el figure en su contenedor
        parent!.style.display = 'flex';
        parent!.style.justifyContent = 'center';
        parent!.classList.add('table-center-figure');
        return;
      }

      // Si no tiene directivas de alineación, envolver en un contenedor centrado
      const alreadyWrapped = parent?.classList.contains('table-center-wrapper');
      if (!alreadyWrapped && !hasAlignmentDirective) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-center-wrapper w-full flex justify-center';
        parent?.insertBefore(wrapper, el);
        wrapper.appendChild(el);
        // Reducir ancho de la tabla para que el centrado sea visible
        el.style.width = 'max-content';
        el.style.maxWidth = '100%';
        el.style.marginLeft = 'auto';
        el.style.marginRight = 'auto';
      }
    });

    // Process iframes to make them responsive
    const iframes = container.querySelectorAll('iframe');
    iframes.forEach((iframe) => {
      const el = iframe as HTMLElement;
      const parent = el.parentElement as HTMLElement | null;
      
      // Skip if already wrapped
      if (parent?.classList.contains('iframe-responsive-wrapper')) {
        return;
      }

      // Detect platform and aspect ratio
      const src = el.getAttribute('src') || '';
      let aspectRatio = '56.25%'; // Default 16:9 for videos
      let wrapperClass = 'iframe-responsive-wrapper relative w-full overflow-hidden rounded-lg my-4';

      // YouTube
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        aspectRatio = '56.25%'; // 16:9
      }
      // Vimeo
      else if (src.includes('vimeo.com')) {
        aspectRatio = '56.25%'; // 16:9
      }
      // Google Maps
      else if (src.includes('google.com/maps')) {
        aspectRatio = '75%'; // 4:3 for maps
      }
      // Facebook
      else if (src.includes('facebook.com')) {
        aspectRatio = '56.25%'; // 16:9
      }
      // Instagram
      else if (src.includes('instagram.com')) {
        aspectRatio = '125%'; // Vertical format
      }
      // Twitter/X
      else if (src.includes('twitter.com') || src.includes('x.com')) {
        aspectRatio = '100%'; // Square-ish
      }

      // Create responsive wrapper
      const wrapper = document.createElement('div');
      wrapper.className = wrapperClass;
      wrapper.style.paddingBottom = aspectRatio;

      // Insert wrapper before iframe
      parent?.insertBefore(wrapper, el);
      
      // Move iframe into wrapper and make it fill the container
      wrapper.appendChild(el);
      el.classList.add('absolute', 'top-0', 'left-0', 'w-full', 'h-full', 'border-0');
    });

    // Cleanup
    return () => {
      container.removeEventListener('click', handleAnchorClick);
    };
  }, [processedContent]);

  return (
    <div 
      ref={containerRef}
      className={`ck-content prose prose-lg max-w-none text-foreground 
                 prose-headings:text-foreground prose-headings:font-semibold
                 prose-p:text-foreground prose-p:leading-relaxed
                 prose-strong:text-foreground prose-strong:font-bold
                 prose-em:text-foreground 
                 prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
                 prose-ul:text-foreground prose-ol:text-foreground
                 prose-li:text-foreground prose-li:leading-relaxed
                 prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary
                 prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
                 prose-pre:bg-muted prose-pre:text-foreground
                 prose-table:mx-auto prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground
                 prose-hr:border-border ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};
