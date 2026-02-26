/**
 * Descarga segura de archivos PDF sin exponer la URL original
 * y sin abrir en nueva pestaña
 */

interface DownloadOptions {
  url: string;
  filename: string;
  onError?: (error: Error) => void;
}

const CONTENT_TYPE_EXTENSION_MAP: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/zip': '.zip',
  'application/json': '.json',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'audio/mpeg': '.mp3',
  'video/mp4': '.mp4'
};

const hasFileExtension = (value: string): boolean => /\.[a-zA-Z0-9]{1,10}$/.test(value);

const getExtensionFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]{1,10})$/);
    return match ? `.${match[1].toLowerCase()}` : '';
  } catch {
    return '';
  }
};

const getExtensionFromContentType = (contentType: string | null): string => {
  if (!contentType) return '';
  const normalizedType = contentType.split(';')[0].trim().toLowerCase();
  return CONTENT_TYPE_EXTENSION_MAP[normalizedType] || '';
};

/**
 * Descarga un archivo de forma segura usando fetch y blob
 * Esto evita exponer la URL original del archivo
 */
export const secureDownloadPDF = async ({ url, filename, onError }: DownloadOptions): Promise<void> => {
  try {
    // Fetch con headers para evitar CORS y mantener privacidad
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
      },
      credentials: 'omit', // No enviar cookies para mayor privacidad
    });

    if (!response.ok) {
      throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
    }

    const extensionFromFilename = hasFileExtension(filename) ? '' : getExtensionFromUrl(url) || getExtensionFromContentType(response.headers.get('content-type'));
    const finalFilename = `${filename}${extensionFromFilename}`;

    // Convertir a blob
    const blob = await response.blob();
    
    // Crear URL temporal del blob (no expone la URL original)
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Crear link temporal para descarga
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = finalFilename;
    link.style.display = 'none';
    
    // Agregar al DOM, hacer click y remover
    document.body.appendChild(link);
    link.click();
    
    // Limpiar después de un pequeño delay
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error : new Error('Error desconocido al descargar');
    
    if (onError) {
      onError(errorMessage);
    } else {
      console.error('[SecureDownload] Error:', errorMessage);
      throw errorMessage;
    }
  }
};

/**
 * Sanitiza un nombre de archivo para que sea seguro
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s\-_\.]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
    .substring(0, 200); // Limitar longitud
};
