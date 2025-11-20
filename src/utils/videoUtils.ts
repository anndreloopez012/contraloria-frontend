
/**
 * Utilidades para manejo de videos
 * Convierte URLs de diferentes plataformas al formato embed correcto
 */

/**
 * Convierte URL de YouTube al formato embed
 * @param url URL de YouTube (watch o embed)
 * @returns URL en formato embed
 */
export const convertToYouTubeEmbed = (url: string): string => {
  // Si ya es embed, retornar tal como está
  if (url.includes('/embed/')) {
    return url;
  }
  
  // Extraer video ID de diferentes formatos de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  // Si no se puede convertir, retornar la URL original
  return url;
};

/**
 * Convierte URL de Vimeo al formato embed
 * @param url URL de Vimeo
 * @returns URL en formato embed
 */
export const convertToVimeoEmbed = (url: string): string => {
  // Si ya es embed, retornar tal como está
  if (url.includes('/video/')) {
    return url;
  }
  
  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match && match[1]) {
    return `https://player.vimeo.com/video/${match[1]}`;
  }
  
  return url;
};

/**
 * Convierte URL de video al formato embed apropiado según la plataforma
 * @param url URL del video
 * @returns URL en formato embed
 */
export const convertToEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return convertToYouTubeEmbed(url);
  }
  
  if (url.includes('vimeo.com')) {
    return convertToVimeoEmbed(url);
  }
  
  // Para otras plataformas, retornar la URL original
  return url;
};
