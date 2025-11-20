/**
 * Descarga segura de archivos PDF sin exponer la URL original
 * y sin abrir en nueva pestaña
 */

interface DownloadOptions {
  url: string;
  filename: string;
  onError?: (error: Error) => void;
}

/**
 * Descarga un archivo de forma segura usando fetch y blob
 * Esto evita exponer la URL original del archivo
 */
export const secureDownloadPDF = async ({ url, filename, onError }: DownloadOptions): Promise<void> => {
  try {
    // Asegurar que el filename tenga extensión .pdf
    const finalFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    
    // Fetch con headers para evitar CORS y mantener privacidad
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
      },
      credentials: 'omit', // No enviar cookies para mayor privacidad
    });

    if (!response.ok) {
      throw new Error(`Error al descargar: ${response.status} ${response.statusText}`);
    }

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
