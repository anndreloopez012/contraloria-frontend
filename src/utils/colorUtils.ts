/**
 * Utilidades para detectar y manejar colores para mejorar la legibilidad del texto
 */

/**
 * Extrae el color dominante promedio de una imagen
 * @param imageUrl URL de la imagen
 * @returns Promise que resuelve con el color RGB dominante
 */
export const getImageDominantColor = (imageUrl: string): Promise<{ r: number; g: number; b: number }> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('No se pudo obtener el contexto del canvas'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0, count = 0;
        
        // Tomar muestras cada 10 píxeles para mejor rendimiento
        for (let i = 0; i < data.length; i += 40) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        resolve({
          r: Math.round(r / count),
          g: Math.round(g / count),
          b: Math.round(b / count)
        });
      } catch (error) {
        // Fallback si hay problemas con CORS
        resolve({ r: 128, g: 128, b: 128 }); // Gris medio
      }
    };
    
    img.onerror = () => {
      resolve({ r: 255, g: 255, b: 255 }); // Blanco por defecto
    };
    
    img.src = imageUrl;
  });
};

/**
 * Calcula la luminancia relativa de un color RGB
 * @param r Componente rojo (0-255)
 * @param g Componente verde (0-255)  
 * @param b Componente azul (0-255)
 * @returns Luminancia relativa (0-1)
 */
export const getLuminance = (r: number, g: number, b: number): number => {
  // Convertir a valores 0-1
  const [rs, gs, bs] = [r, g, b].map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  // Calcular luminancia según estándar W3C
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determina si un color es claro u oscuro
 * @param r Componente rojo (0-255)
 * @param g Componente verde (0-255)
 * @param b Componente azul (0-255)
 * @returns true si el color es claro, false si es oscuro
 */
export const isColorLight = (r: number, g: number, b: number): boolean => {
  const luminance = getLuminance(r, g, b);
  return luminance > 0.5; // Umbral de luminancia
};

/**
 * Calcula el contraste entre dos colores
 * @param color1 Primer color RGB
 * @param color2 Segundo color RGB
 * @returns Ratio de contraste (1-21)
 */
export const getContrastRatio = (
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number => {
  const lum1 = getLuminance(color1.r, color1.g, color1.b);
  const lum2 = getLuminance(color2.r, color2.g, color2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Obtiene el mejor color de texto para un fondo dado
 * @param backgroundColor Color de fondo RGB
 * @returns Color de texto recomendado (negro o blanco)
 */
export const getBestTextColor = (backgroundColor: { r: number; g: number; b: number }): string => {
  const whiteContrast = getContrastRatio(backgroundColor, { r: 255, g: 255, b: 255 });
  const blackContrast = getContrastRatio(backgroundColor, { r: 0, g: 0, b: 0 });
  
  // Usar el color que tenga mayor contraste
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
};

/**
 * Genera clases de Tailwind CSS para texto basado en el color de fondo
 * @param backgroundColor Color de fondo RGB
 * @returns Objeto con clases CSS para diferentes elementos de texto
 */
export const getTextClasses = (backgroundColor: { r: number; g: number; b: number }) => {
  const isLight = isColorLight(backgroundColor.r, backgroundColor.g, backgroundColor.b);
  
  if (isLight) {
    // Fondo claro - usar textos oscuros
    return {
      heading: 'text-gray-900',
      body: 'text-gray-700',
      muted: 'text-gray-500',
      button: 'bg-gray-900 text-white hover:bg-gray-800',
      border: 'border-gray-200',
      overlay: 'bg-white/90'
    };
  } else {
    // Fondo oscuro - usar textos claros
    return {
      heading: 'text-white',
      body: 'text-white/90',
      muted: 'text-white/60',
      button: 'bg-white text-gray-900 hover:bg-white/90',
      border: 'border-white/20',
      overlay: 'bg-black/20'
    };
  }
};