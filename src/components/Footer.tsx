
import React, { useState, useEffect } from 'react';
import { fetchFooterData, type FooterData, type SocialMediaItem } from '@/services/apiServiceFooter';
import { Facebook, Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { ContentRenderer } from '@/utils/markdownProcessor';

interface FooterProps {
  variant?: 'white' | 'dark';
}

/**
 * Componente Footer
 * Muestra información de contacto y redes sociales obtenidas desde la API de CGC
 */
const Footer: React.FC<FooterProps> = ({ variant = 'dark' }) => {
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mapeo de iconos según el título de la red social
  const getSocialIcon = (title: string) => {
    const normalizedTitle = title.toUpperCase();
    
    switch (normalizedTitle) {
      case 'FACEBOOK':
        return <Facebook className="w-6 h-6" />;
      case 'X':
        return <Twitter className="w-6 h-6" />;
      case 'INSTAGRAM':
        return <Instagram className="w-6 h-6" />;
      case 'YOUTUBE':
        return <Youtube className="w-6 h-6" />;
      case 'TIKTOK':
        return (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
        );
      case 'WHATSAPP':
        return <MessageCircle className="w-6 h-6" />;
      default:
        return <div className="w-6 h-6 rounded-full bg-white/20" />;
    }
  };

  // Cargar datos del footer al montar el componente
  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const data = await fetchFooterData();
        setFooterData(data);
      } catch (error) {
        console.error('Error al cargar datos del footer:', error);
        // En caso de error, mantener null y mostrar loading
      } finally {
        setIsLoading(false);
      }
    };

    loadFooterData();
  }, []);

  if (isLoading) {
    return (
      <footer 
        className={`py-8 ${
          variant === 'white' 
            ? 'bg-white text-gray-900' 
            : 'text-white'
        }`}
        style={variant === 'dark' ? { backgroundColor: '#0E2855' } : undefined}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className={`animate-pulse ${
              variant === 'white' ? 'text-gray-500' : 'text-white/70'
            }`}>
              Cargando información de contacto...
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (!footerData) {
    return (
      <footer 
        className={`py-8 ${
          variant === 'white' 
            ? 'bg-white text-gray-900' 
            : 'text-white'
        }`}
        style={variant === 'dark' ? { backgroundColor: '#0E2855' } : undefined}
      >
        <div className="container mx-auto px-4">
          <div className={`text-center ${
            variant === 'white' ? 'text-gray-500' : 'text-white/70'
          }`}>
            No se pudo cargar la información de contacto
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto bg-primary text-white">
      {/* Cintillo superior */}
      <div className="w-full pt-[10px]">
        <img 
          src="/lovable-uploads/a4c5e06a-65e4-4ca9-9118-1e33748c26fb.png" 
          alt="Cintillo CGC" 
          className="w-full h-auto" 
          style={{ height: '50%', objectFit: 'cover' }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Columna izquierda - Descripción y redes sociales */}
          <div className="space-y-4">
            {/* Descripción */}
            <div>
              <h3 className="text-base font-semibold mb-3">
                {footerData.Description}
              </h3>
            </div>

            {/* Redes sociales */}
            <div className="flex flex-wrap gap-3">
              {footerData.Social.map((social: SocialMediaItem) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-110"
                  title={social.Title}
                >
                  {getSocialIcon(social.Title)}
                </a>
              ))}
            </div>
          </div>

          {/* Columna derecha - Información de contacto */}
          <div className="lg:text-right">
            <div className="text-sm leading-relaxed text-white">
              <ContentRenderer 
                content={footerData.Info} 
                className="text-sm text-white prose-headings:text-white prose-p:text-white prose-strong:text-white prose-a:text-white prose-span:text-white prose:text-white [&>*]:text-white"
              />
            </div>
          </div>
        </div>

        {/* Copyright y créditos */}
        <div className="border-t border-white/20 mt-4 pt-3 text-center text-xs text-white/90 space-y-1">
          <p>
            © 2025 Contraloría General de Cuentas. Todos los derechos reservados.
          </p>
          <p>
            Desarrollado por{' '}
            <a 
              href="https://softplusgt.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 underline transition-colors"
            >
              SoftwarePlus
            </a>
            {' '}| Equipo{' '}
            <a 
              href="https://alcore-gt.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-white/80 underline transition-colors"
            >
              ALCORE-TECH
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
