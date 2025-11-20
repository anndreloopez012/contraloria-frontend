
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, FileText, Users, Shield } from 'lucide-react';
import { useContentAPI } from '@/hooks/useContentAPI';

/**
 * Componente HeroSection
 * Sección principal de la página que muestra el contenido hero
 * Obtiene su contenido desde la API simulada
 */
const HeroSection = () => {
  // Obtener contenido desde la API
  const { heroContent, isLoading } = useContentAPI();

  // Mapeo de iconos
  const iconMap: Record<string, React.ComponentType<any>> = {
    Search, FileText, Users, Shield
  };

  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden flex items-center justify-center">
        <div className="animate-pulse text-xl text-gray-500">Cargando contenido...</div>
      </section>
    );
  }

  if (!heroContent) return null;

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          {/* Título principal */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                {heroContent.title}
              </span>
            </h1>
            <div className="mt-6 text-xl sm:text-2xl text-gray-600 font-medium">
              {heroContent.subtitle}
            </div>
          </div>

          {/* Descripción */}
          <p className="mt-8 text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {heroContent.description}
          </p>

          {/* Botones de llamada a la acción */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              {iconMap[heroContent.ctaButtons.primary.icon] && 
                React.createElement(iconMap[heroContent.ctaButtons.primary.icon], { className: "w-5 h-5 mr-3" })
              }
              {heroContent.ctaButtons.primary.text}
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 hover:bg-blue-50"
            >
              {iconMap[heroContent.ctaButtons.secondary.icon] && 
                React.createElement(iconMap[heroContent.ctaButtons.secondary.icon], { className: "w-5 h-5 mr-3" })
              }
              {heroContent.ctaButtons.secondary.text}
            </Button>
          </div>

          {/* Tarjetas de características */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {heroContent.features.map((feature, index) => {
              const IconComponent = iconMap[feature.icon];
              return (
                <div 
                  key={index}
                  className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
