
import { useState, useEffect } from 'react';
import { fetchMenuData } from '@/services/apiServiceMenu';
import { fetchExternalLinks, type ExternalLink } from '@/services/apiServiceLinkBlank';
import { fetchHomeData, type HomeData, type SliderImage } from '@/services/apiServiceHome';
import { fetchHomeIntroData, type HomeIntroData } from '@/services/apiServiceHomeIntroSer';
import { fetchOnlineServices, type OnlineServiceItem } from '@/services/apiServiceOnline';
import { fetchSocialMenuItems, type SocialMenuItem } from '@/services/apiServiceBottomSocialMenu';

/**
 * Hook para obtener contenido desde el API real de CGC
 * Consume únicamente el API real sin fallback a datos simulados
 */

// Tipo para los elementos del menú
export interface MenuItem {
  icon: string;
  title: string;
  key: string;
  route?: string;
  description?: string;
  color?: string;
  iconColor?: string;
  videoTitle?: string;
  target_blank?: boolean;
  children?: MenuItem[];
  images?: { url: string; title: string; description?: string }[];
}

// Tipo para redes sociales
export interface SocialMedia {
  name: string;
  icon: string;
  url: string;
  color: string;
}

// Tipo para publicidad
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
}

// Tipo para el contenido de la página principal
export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  ctaButtons: {
    primary: { text: string; icon: string };
    secondary: { text: string; icon: string };
  };
  features: {
    title: string;
    description: string;
    icon: string;
    color: string;
  }[];
}

// Datos por defecto mientras se carga el API
const defaultData = {
  heroContent: {
    title: 'Contraloría General de Cuentas',
    subtitle: 'Transparencia, Control y Fiscalización',
    description: 'Ejercemos control gubernamental para el uso transparente y eficiente de los recursos públicos, promoviendo la rendición de cuentas en beneficio de la sociedad guatemalteca.',
    ctaButtons: {
      primary: { text: 'Consultar Auditorías', icon: 'Search' },
      secondary: { text: 'Documentos Públicos', icon: 'FileText' }
    },
    features: [
      {
        title: 'Control Gubernamental',
        description: 'Fiscalizamos el uso de los recursos públicos para garantizar transparencia y eficiencia.',
        icon: 'Shield',
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Auditorías',
        description: 'Realizamos auditorías integrales para verificar el cumplimiento de la normativa vigente.',
        icon: 'FileText',
        color: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Servicio Ciudadano',
        description: 'Brindamos servicios de calidad para facilitar el acceso a la información pública.',
        icon: 'Users',
        color: 'from-teal-500 to-teal-600'
      }
    ]
  },
  socialMedia: [
    {
      name: 'Facebook',
      icon: 'facebook',
      url: 'https://facebook.com/cgc-guatemala',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Twitter',
      icon: 'twitter',
      url: 'https://twitter.com/cgc-guatemala',
      color: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      name: 'YouTube',
      icon: 'youtube',
      url: 'https://youtube.com/cgc-guatemala',
      color: 'bg-red-600 hover:bg-red-700'
    },
    {
      name: 'Instagram',
      icon: 'instagram',
      url: 'https://instagram.com/cgc-guatemala',
      color: 'bg-pink-600 hover:bg-pink-700'
    }
  ],
  advertisements: [
    {
      id: '1',
      title: 'Consulta de Auditorías en Línea',
      description: 'Accede a los informes de auditoría de manera rápida y segura',
      imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300&h=200&fit=crop',
      link: '/servicios/consulta-auditorias'
    },
    {
      id: '2',
      title: 'Portal de Transparencia',
      description: 'Información pública disponible para todos los ciudadanos',
      imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=200&fit=crop',
      link: '/transparencia'
    }
  ]
};

/**
 * Hook para obtener contenido desde el API real de CGC
 * Incluye datos del home (slider e información) desde el API
 */
export const useContentAPI = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mainNavItems, setMainNavItems] = useState<MenuItem[]>([]);
  const [menuStructure, setMenuStructure] = useState<Record<string, MenuItem[]>>({});
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [homeDescription, setHomeDescription] = useState<string>('');
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [homeIntroData, setHomeIntroData] = useState<HomeIntroData | null>(null);
  const [onlineServices, setOnlineServices] = useState<OnlineServiceItem[]>([]);
  const [socialMenuItems, setSocialMenuItems] = useState<SocialMenuItem[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      
      try {
        // Obtener datos del API real de CGC
        console.log('🚀 Cargando datos desde el API real de CGC...');
        const [apiData, externalLinksData, homeData, homeIntroData, onlineServicesData, socialMenuData] = await Promise.all([
          fetchMenuData(),
          fetchExternalLinks(),
          fetchHomeData(),
          fetchHomeIntroData(),
          fetchOnlineServices(),
          fetchSocialMenuItems(),
        ]);
        
        // Usar datos del API real para menús
        setMainNavItems(apiData.mainNavItems);
        setMenuStructure(apiData.menuStructure);
        setExternalLinks(externalLinksData);
        setSocialMenuItems(socialMenuData);

        // Usar datos del API real para home
        setSliderImages(homeData.sliderImages);
        setHomeDescription(homeData.description);
        
        // Usar datos del API real para home intro
        setHomeIntroData(homeIntroData);
        setOnlineServices(onlineServicesData);
        
        console.log('✅ Datos del API cargados exitosamente (incluye menú social):', {
          mainNavItems: apiData.mainNavItems.length,
          menuStructure: Object.keys(apiData.menuStructure).length,
          externalLinks: externalLinksData.length,
          sliderImages: homeData.sliderImages.length,
          homeDescription: homeData.description.length > 0,
          homeIntroData: !!homeIntroData,
          onlineServices: onlineServicesData.length,
          socialMenuItems: socialMenuData.length,
        });
        
        // Usar datos por defecto para contenido estático
        setHeroContent(defaultData.heroContent);
        setSocialMedia(defaultData.socialMedia);
        setAdvertisements(defaultData.advertisements);
        
      } catch (error) {
        console.error('❌ Error al cargar datos del API real:', error);
        
        // En caso de error, usar datos vacíos o mostrar error
        setMainNavItems([]);
        setMenuStructure({});
        setExternalLinks([]);
        setSliderImages([]);
        setHomeDescription('');
        setHomeIntroData(null);
        setOnlineServices([]);
        setSocialMenuItems([]);

        // Mantener contenido estático por defecto
        console.warn('⚠️ No se pudieron cargar los datos desde el API');
      }
      
      setIsLoading(false);
    };

    fetchContent();
  }, []);

  return {
    isLoading,
    mainNavItems,
    menuStructure,
    heroContent,
    socialMedia,
    sliderImages,
    homeDescription,
    advertisements,
    externalLinks,
    homeIntroData,
    onlineServices,
    socialMenuItems,
    // Función para refrescar datos desde el API
    refreshData: async () => {
      setIsLoading(true);
      try {
        const [apiData, externalLinksData, homeData, homeIntroData, onlineServicesData, socialMenuData] = await Promise.all([
          fetchMenuData(),
          fetchExternalLinks(),
          fetchHomeData(),
          fetchHomeIntroData(),
          fetchOnlineServices(),
          fetchSocialMenuItems(),
        ]);
        setMainNavItems(apiData.mainNavItems);
        setMenuStructure(apiData.menuStructure);
        setExternalLinks(externalLinksData);
        setSliderImages(homeData.sliderImages);
        setHomeDescription(homeData.description);
        setHomeIntroData(homeIntroData);
        setOnlineServices(onlineServicesData);
        setSocialMenuItems(socialMenuData);
        console.log('🔄 Datos actualizados desde el API (incluye menú social)');
      } catch (error) {
        console.error('❌ Error al actualizar datos:', error);
      }
      setIsLoading(false);
    },
    
    // Función para limpiar caché
    clearCache: () => {
      localStorage.removeItem('cgc_menu_cache');
      localStorage.removeItem('cgc_external_links_cache');
      localStorage.removeItem('cgc_home_cache');
      localStorage.removeItem('cgc_home_intro_cache');
      localStorage.removeItem('cgc_online_services_cache');
      localStorage.removeItem('cgc_social_menu_cache');
      console.log('🗑️ Caché eliminado');
    }
  };
};
