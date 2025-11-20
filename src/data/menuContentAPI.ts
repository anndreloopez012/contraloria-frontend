
/**
 * Interfaz para elementos de contenido (imágenes, videos, PDFs, etc.)
 */
export interface ContentItem {
  id: string;
  type: 'image' | 'video' | 'pdf' | 'content';
  title: string;
  description: string;
  category: string;
  order: number;
  col: number;
  lastUpdated: string;
  url?: string;
  thumbnail?: string;
  size?: string;
  subtype?: string;
  downloadCount?: number;
  images?: { id: string; src: string; alt: string; title: string }[];
  videos?: { id: string; src: string; type: 'video' | 'iframe'; title: string; thumbnail?: string }[];
  content?: string;
}

/**
 * Interfaz para la estructura de cada página de contenido
 */
export interface PageContent {
  id: string;
  title: string;
  description: string;
  content: ContentItem[];
}

/**
 * Datos simulados para diferentes secciones del sitio
 */
const contentDatabase: { [key: string]: PageContent } = {
  'actualizacion-datos': {
    id: 'actualizacion-datos',
    title: 'Actualización de Datos',
    description: 'Mantén tu información personal y profesional actualizada',
    content: [
      {
        id: 'intro-content',
        type: 'content',
        title: 'Proceso de Actualización',
        description: 'El proceso es simple y seguro. Sigue las instrucciones detalladas en esta página.',
        category: 'Guías',
        order: 1,
        col: 12,
        lastUpdated: '2024-12-25',
        content: `
          <p>El proceso de actualización de datos es fundamental para mantener la información correcta en nuestros sistemas.</p>
          <ul>
            <li>Completa todos los campos requeridos</li>
            <li>Verifica la información antes de enviar</li>
            <li>Guarda una copia de tu solicitud</li>
          </ul>
        `
      },
      {
        id: 'oficina-central',
        type: 'image',
        title: 'Oficina Central - Ciudad de Guatemala',
        description: 'Instalaciones principales donde puedes realizar tus trámites presencialmente',
        category: 'Ubicaciones',
        order: 2,
        col: 6,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'oficina-1',
            src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000',
            alt: 'Oficina Central - Recepción',
            title: 'Oficina Central - Ciudad de Guatemala'
          }
        ]
      },
      {
        id: 'proceso-completo',
        type: 'video',
        description: 'Video tutorial completo sobre el proceso de actualización de datos',
        title: 'Proceso Completo de Actualización',
        category: 'Tutoriales',
        order: 3,
        col: 6,
        lastUpdated: '2024-12-25',
        videos: [
          {
            id: 'tutorial-1',
            src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            type: 'iframe',
            title: 'Proceso Completo de Actualización',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2000'
          }
        ]
      },
      {
        id: 'galeria-instalaciones',
        type: 'image',
        title: 'Galería de Instalaciones',
        description: 'Conoce nuestras instalaciones y áreas de servicio',
        category: 'Ubicaciones',
        order: 4,
        col: 8,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'instalacion-1',
            src: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2000',
            alt: 'Instalaciones CGC',
            title: 'Instalaciones Principales'
          },
          {
            id: 'instalacion-2',
            src: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?q=80&w=2000',
            alt: 'Tecnología y Control',
            title: 'Sistemas de Control'
          },
          {
            id: 'instalacion-3',
            src: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?q=80&w=2000',
            alt: 'Innovación',
            title: 'Innovación y Transparencia'
          }
        ]
      },
      {
        id: 'videos-tutoriales',
        type: 'video',
        title: 'Videos Tutoriales',
        description: 'Serie completa de videos explicativos sobre nuestros servicios',
        category: 'Tutoriales',
        order: 5,
        col: 4,
        lastUpdated: '2024-12-25',
        videos: [
          {
            id: 'tutorial-registro',
            src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            type: 'iframe',
            title: 'Tutorial de Registro',
            thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2000'
          },
          {
            id: 'tutorial-actualizacion',
            src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            type: 'iframe',
            title: 'Tutorial de Actualización',
            thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000'
          }
        ]
      },
      {
        id: 'nueva-imagen-sola',
        type: 'image',
        title: 'Área de Atención al Cliente',
        description: 'Espacio cómodo y moderno para la atención personalizada',
        category: 'Ubicaciones',
        order: 6,
        col: 4,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'atencion-cliente',
            src: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2000',
            alt: 'Área de Atención al Cliente',
            title: 'Área de Atención al Cliente'
          }
        ]
      },
      {
        id: 'nuevo-video-solo',
        type: 'video',
        title: 'Presentación Institucional',
        description: 'Conoce nuestra institución y nuestros valores',
        category: 'Institucional',
        order: 7,
        col: 4,
        lastUpdated: '2024-12-25',
        videos: [
          {
            id: 'presentacion-institucional',
            src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            type: 'iframe',
            title: 'Presentación Institucional',
            thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000'
          }
        ]
      },
      {
        id: 'sala-reuniones',
        type: 'image',
        title: 'Sala de Reuniones Ejecutiva',
        description: 'Espacio profesional para reuniones importantes',
        category: 'Ubicaciones',
        order: 8,
        col: 4,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'sala-reuniones',
            src: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2000',
            alt: 'Sala de Reuniones Ejecutiva',
            title: 'Sala de Reuniones Ejecutiva'
          }
        ]
      },
      {
        id: 'imagen-individual-1',
        type: 'image',
        title: 'Centro de Datos Principal',
        description: 'Nuestro centro de datos de alta tecnología con sistemas de seguridad avanzados',
        category: 'Tecnología',
        order: 9,
        col: 6,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'centro-datos',
            src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000',
            alt: 'Centro de Datos Principal',
            title: 'Centro de Datos Principal'
          }
        ]
      },
      {
        id: 'video-individual-1',
        type: 'video',
        title: 'Tour Virtual de Instalaciones',
        description: 'Recorrido completo por nuestras modernas instalaciones',
        category: 'Tours',
        order: 10,
        col: 6,
        lastUpdated: '2024-12-25',
        videos: [
          {
            id: 'tour-virtual',
            src: 'https://www.youtube.com/embed/ScMzIvxBSi4',
            type: 'iframe',
            title: 'Tour Virtual de Instalaciones',
            thumbnail: 'https://images.unsplash.com/photo-1497366212602-affa22d38842?q=80&w=2000'
          }
        ]
      },
      {
        id: 'imagen-individual-2',
        type: 'image',
        title: 'Laboratorio de Innovación',
        description: 'Espacio dedicado al desarrollo e investigación tecnológica',
        category: 'Innovación',
        order: 11,
        col: 4,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'laboratorio',
            src: 'https://images.unsplash.com/photo-1567789884554-0b844b597180?q=80&w=2000',
            alt: 'Laboratorio de Innovación',
            title: 'Laboratorio de Innovación'
          }
        ]
      },
      {
        id: 'video-individual-2',
        type: 'video',
        title: 'Proceso de Modernización Digital',
        description: 'Conoce cómo estamos transformando digitalmente nuestros servicios',
        category: 'Modernización',
        order: 12,
        col: 4,
        lastUpdated: '2024-12-25',
        videos: [
          {
            id: 'modernizacion-digital',
            src: 'https://www.youtube.com/embed/y8Yv4pnO7qc',
            type: 'iframe',
            title: 'Proceso de Modernización Digital',
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000'
          }
        ]
      },
      {
        id: 'imagen-individual-3',
        type: 'image',
        title: 'Área de Desarrollo Sostenible',
        description: 'Compromiso con el medio ambiente y desarrollo sostenible',
        category: 'Sostenibilidad',
        order: 13,
        col: 4,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'desarrollo-sostenible',
            src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2000',
            alt: 'Área de Desarrollo Sostenible',
            title: 'Área de Desarrollo Sostenible'
          }
        ]
      },
      {
        id: 'form-personal',
        type: 'pdf',
        title: 'Formulario de Actualización Personal',
        description: 'Descarga el formulario oficial para actualizar tus datos personales en el sistema institucional',
        category: 'Formularios',
        order: 14,
        col: 3,
        lastUpdated: '2024-12-25',
        url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4gZW5kb2JqCjIgMCBvYmogPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PiBlbmRvYmoKMyAwIG9iaiA8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KL0NvbnRlbnRzIDQgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDUgMCBSCj4+Cj4+Cj4+IGVuZG9iago0IDAgb2JqIDw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3NTAgVGQKKEZvcm11bGFyaW8gZGUgQWN0dWFsaXphY2nDs24gUGVyc29uYWwpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iaiA8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKPj4gZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzM5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDA4CiUlRU9G',
        thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2000',
        size: '2.1 MB',
        subtype: 'Formulario Oficial',
        downloadCount: 1234
      },
      {
        id: 'manual-usuario',
        type: 'pdf',
        title: 'Manual de Usuario del Sistema',
        description: 'Guía completa para navegar y utilizar todas las funcionalidades del sistema de actualización',
        category: 'Documentación',
        order: 15,
        col: 3,
        lastUpdated: '2024-12-20',
        url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4gZW5kb2JqCjIgMCBvYmogPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PiBlbmRvYmoKMyAwIG9iaiA8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KL0NvbnRlbnRzIDQgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDUgMCBSCj4+Cj4+Cj4+IGVuZG9iago0IDAgb2JqIDw8Ci9MZW5ndGggMzgKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3NTAgVGQKKE1hbnVhbCBkZSBVc3VhcmlvIGRlbCBTaXN0ZW1hKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmogPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+IGVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDMzMyAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwMgolJUVPRg==',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000',
        size: '1.8 MB',
        subtype: 'Manual',
        downloadCount: 987
      },
      {
        id: 'requisitos',
        type: 'pdf',
        title: 'Requisitos y Documentación',
        description: 'Lista detallada de requisitos y documentos necesarios para completar tu proceso de actualización',
        category: 'Documentación',
        order: 16,
        col: 3,
        lastUpdated: '2024-12-18',
        url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4gZW5kb2JqCjIgMCBvYmogPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PiBlbmRvYmoKMyAwIG9iaiA8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KL0NvbnRlbnRzIDQgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDUgMCBSCj4+Cj4+Cj4+IGVuZG9iago0IDAgb2JqIDw8Ci9MZW5ndGggNDEKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3NTAgVGQKKFJlcXVpc2l0b3MgeSBEb2N1bWVudGFjacOzbikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqIDw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PiBlbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMzYgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MDUKJSVFT0Y=',
        thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2000',
        size: '950 KB',
        subtype: 'Requisitos',
        downloadCount: 756
      },
      {
        id: 'politicas',
        type: 'pdf',
        title: 'Políticas de Privacidad y Datos',
        description: 'Información importante sobre el manejo y protección de tus datos personales según normativas vigentes',
        category: 'Políticas',
        order: 17,
        col: 3,
        lastUpdated: '2024-12-15',
        url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4gZW5kb2JqCjIgMCBvYmogPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PiBlbmRvYmoKMyAwIG9iaiA8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KL0NvbnRlbnRzIDQgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDUgMCBSCj4+Cj4+Cj4+IGVuZG9iago0IDAgb2JqIDw8Ci9MZW5ndGggNDUKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3NTAgVGQKKFBvbMOtdGljYXMgZGUgUHJpdmFjaWRhZCB5IERhdG9zKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmogPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+IGVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDM0MCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQwOQolJUVPRg==',
        thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000',
        size: '1.2 MB',
        subtype: 'Políticas',
        downloadCount: 543
      }
    ]
  },
  'declaracion-patrimonial': {
    id: 'declaracion-patrimonial',
    title: 'Declaración Patrimonial',
    description: 'Información y recursos para la declaración patrimonial',
    content: [
      {
        id: 'intro-patrimonial',
        type: 'content',
        title: 'Información General',
        description: 'Todo lo que necesitas saber sobre la declaración patrimonial',
        category: 'Información',
        order: 1,
        col: 12,
        lastUpdated: '2024-12-25',
        content: `
          <h2>Declaración Patrimonial</h2>
          <p>La declaración patrimonial es un documento fundamental para la transparencia gubernamental.</p>
          <h3>Aspectos importantes:</h3>
          <ul>
            <li>Debe presentarse anualmente</li>
            <li>Incluye todos los bienes y patrimonio</li>
            <li>Es de carácter obligatorio para funcionarios públicos</li>
          </ul>
        `
      },
      {
        id: 'imagen-patrimonial-1',
        type: 'image',
        title: 'Oficina de Transparencia',
        description: 'Oficina especializada en el manejo de declaraciones patrimoniales',
        category: 'Instalaciones',
        order: 2,
        col: 6,
        lastUpdated: '2024-12-25',
        images: [
          {
            id: 'oficina-transparencia',
            src: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?q=80&w=2000',
            alt: 'Oficina de Transparencia',
            title: 'Oficina de Transparencia'
          }
        ]
      },
      {
        id: 'video-patrimonial-1',
        type: 'video',
        title: 'Guía de Declaración Patrimonial',
        description: 'Tutorial paso a paso para completar tu declaración patrimonial',
        category: 'Tutoriales',
        order: 3,
        col: 6,
        lastUpdated: '2024-12-25',
        videos: [
          {
            id: 'guia-declaracion',
            src: 'https://www.youtube.com/embed/UG_E0EX6IEA',
            type: 'iframe',
            title: 'Guía de Declaración Patrimonial',
            thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000'
          }
        ]
      },
      {
        id: 'formulario-patrimonial',
        type: 'pdf',
        title: 'Formulario de Declaración Patrimonial',
        description: 'Formulario oficial para realizar tu declaración patrimonial anual',
        category: 'Formularios',
        order: 4,
        col: 4,
        lastUpdated: '2024-12-25',
        url: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iaiA8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4gZW5kb2JqCjIgMCBvYmogPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFsgMyAwIFIgXQovQ291bnQgMQo+PiBlbmRvYmoKMyAwIG9iaiA8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0KL0NvbnRlbnRzIDQgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDUgMCBSCj4+Cj4+Cj4+IGVuZG9iago0IDAgb2JqIDw8Ci9MZW5ndGggNDYKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3NTAgVGQKKEZvcm11bGFyaW8gZGUgRGVjbGFyYWNpw7NuIFBhdHJpbW9uaWFsKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmogPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+IGVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNDUgMDAwMDAgbiAKMDAwMDAwMDM0MSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQxMAolJUVPRg==',
        thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000',
        size: '1.5 MB',
        subtype: 'Formulario',
        downloadCount: 892
      }
    ]
  }
};

/**
 * Función para simular la obtención de contenido de una página desde una API
 * @param pageId - El ID de la página a obtener
 * @returns Una promesa que resuelve con el contenido de la página
 */
export const fetchPageContent = async (pageId: string): Promise<PageContent | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(contentDatabase[pageId] || null);
    }, 500);
  });
};
