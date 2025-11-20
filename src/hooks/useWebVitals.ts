
import { useEffect } from 'react';

/**
 * Hook para monitorear Core Web Vitals y métricas de performance
 * Reporta a Google Analytics si está configurado
 */
export const useWebVitals = () => {
  useEffect(() => {
    // Solo en navegadores que soporten la API
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Función para reportar métricas
    const reportMetric = (name: string, value: number, id?: string) => {
      console.log(`📊 Web Vital - ${name}:`, value);
      
      // Reportar a Google Analytics si está disponible
      if ('gtag' in window) {
        (window as any).gtag('event', name, {
          value: Math.round(value),
          metric_id: id,
          custom_parameter: 'cgc_guatemala'
        });
      }

      // Reportar a Google Tag Manager si está disponible  
      if ('dataLayer' in window) {
        (window as any).dataLayer.push({
          event: 'web_vital',
          metric_name: name,
          metric_value: value,
          metric_id: id
        });
      }
    };

    // Largest Contentful Paint (LCP)
    const observeLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        reportMetric('LCP', lastEntry.startTime, lastEntry.element?.tagName);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    };

    // First Input Delay (FID)
    const observeFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          reportMetric('FID', entry.processingStart - entry.startTime, entry.name);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    };

    // Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            reportMetric('CLS', clsValue);
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    };

    // First Contentful Paint (FCP)
    const observeFCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          reportMetric('FCP', entry.startTime, entry.name);
        });
      });
      observer.observe({ entryTypes: ['paint'] });
    };

    // Time to First Byte (TTFB)
    const observeTTFB = () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        reportMetric('TTFB', ttfb);
      }
    };

    try {
      observeLCP();
      observeFID();
      observeCLS();
      observeFCP();
      observeTTFB();
    } catch (error) {
      console.warn('Error al configurar Web Vitals:', error);
    }

  }, []);
};
