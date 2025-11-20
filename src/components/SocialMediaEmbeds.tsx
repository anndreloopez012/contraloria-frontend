import React, { useState, useEffect } from 'react';
import { fetchSocialMediaItems, type SocialMediaItem, getSocialMediaType } from '@/services/apiServiceModuleSocial';

/**
 * Componente que muestra las redes sociales embebidas
 * Usa embeds oficiales de Facebook y Twitter/X
 */
const SocialMediaEmbeds = () => {
  const [socialItems, setSocialItems] = useState<SocialMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSocialItems = async () => {
      try {
        setLoading(true);
        const items = await fetchSocialMediaItems();
        setSocialItems(items);
        setError(null);
      } catch (err) {
        console.error('Error al cargar redes sociales:', err);
        setError('Error al cargar las redes sociales');
      } finally {
        setLoading(false);
      }
    };

    loadSocialItems();
  }, []);

  // Cargar scripts de redes sociales
  useEffect(() => {
    // Cargar Facebook SDK
    if (window.FB) {
      window.FB.XFBML.parse();
    } else {
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v18.0';
      document.head.appendChild(script);
    }

    // Cargar Twitter/X widgets
    if (!(window as any).twttr) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://platform.twitter.com/widgets.js';
      script.charset = 'utf-8';
      document.head.appendChild(script);
    } else {
      (window as any).twttr.widgets.load();
    }
  }, [socialItems]);

  if (loading) {
    return (
      <section className="bg-gray-50">
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-600">Cargando redes sociales...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || socialItems.length === 0) {
    return (
      <section className="bg-gray-50">
        <div className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-600">{error || 'No hay redes sociales disponibles'}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Agrupar elementos por tipo
  const facebookItems = socialItems.filter(item => getSocialMediaType(item) === 'facebook');
  const twitterItems = socialItems.filter(item => getSocialMediaType(item) === 'twitter');
  const youtubeItems = socialItems.filter(item => getSocialMediaType(item) === 'youtube');

  // Helpers para YouTube
  const extractYouTubeVideoId = (url: string): string | null => {
    try {
      const u = url.trim();
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([A-Za-z0-9_-]{6,})/,
        /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
        /youtube\.com\/live\/([A-Za-z0-9_-]{6,})/
      ];
      for (const p of patterns) {
        const m = u.match(p);
        if (m && m[1]) return m[1];
      }
      const parsed = new URL(u);
      const v = parsed.searchParams.get('v');
      if (v) return v;
    } catch {}
    return null;
  };

  const isYouTubeChannelOrProfile = (url: string): boolean => {
    const u = url.toLowerCase();
    if (!u.includes('youtube.com')) return false;
    return /youtube\.com\/(?:@|channel\/|user\/|c\/)/i.test(u);
  };

  // Renderizar embed de Facebook oficial
  const renderFacebookEmbed = (item: SocialMediaItem) => (
    <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div 
        className="fb-page" 
        data-href="https://www.facebook.com/contraloriagt/?locale=es_LA"
        data-tabs="timeline" 
        data-width="319" 
        data-height="697"
        data-small-header="false" 
        data-adapt-container-width="true" 
        data-hide-cover="false" 
        data-show-facepile="true"
      >
        <blockquote cite="https://www.facebook.com/contraloriagt/?locale=es_LA" className="fb-xfbml-parse-ignore">
          <a href="https://www.facebook.com/contraloriagt/?locale=es_LA">
            Contraloría General de Cuentas
          </a>
        </blockquote>
      </div>
    </div>
  );

  // Renderizar embed de Twitter/X oficial con contenido específico
  const renderTwitterEmbed = (item: SocialMediaItem) => (
    <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 p-3">
      <blockquote className="twitter-tweet">
        <p lang="es" dir="ltr">
          👤🔐 Para tener acceso al sistema de consulta de <a href="https://twitter.com/hashtag/Declaraci%C3%B3nJuradaPatrimonial?src=hash&amp;ref_src=twsrc%5Etfw">#DeclaraciónJuradaPatrimonial</a> necesitas tener usuario en el Portal Web de la <a href="https://twitter.com/hashtag/CGC?src=hash&amp;ref_src=twsrc%5Etfw">#CGC</a><br/><br/>Consulta de <a href="https://twitter.com/hashtag/DJP?src=hash&amp;ref_src=twsrc%5Etfw">#DJP</a> en línea ➡️ <a href="https://t.co/GttvgMqOyS">https://t.co/GttvgMqOyS</a><a href="https://twitter.com/hashtag/ConsultaDJP?src=hash&amp;ref_src=twsrc%5Etfw">#ConsultaDJP</a> <a href="https://twitter.com/hashtag/DJPyAnexos?src=hash&amp;ref_src=twsrc%5Etfw">#DJPyAnexos</a> <a href="https://twitter.com/hashtag/PortalWeb?src=hash&amp;ref_src=twsrc%5Etfw">#PortalWeb</a> <a href="https://twitter.com/hashtag/Consultaenl%C3%ADnea?src=hash&amp;ref_src=twsrc%5Etfw">#Consultaenlínea</a> <a href="https://twitter.com/hashtag/Prevenci%C3%B3n?src=hash&amp;ref_src=twsrc%5Etfw">#Prevención</a> <a href="https://twitter.com/hashtag/Confianza?src=hash&amp;ref_src=twsrc%5Etfw">#Confianza</a> <a href="https://twitter.com/hashtag/BuenaGobernanza?src=hash&amp;ref_src=twsrc%5Etfw">#BuenaGobernanza</a> <a href="https://t.co/a4JKQry00x">pic.twitter.com/a4JKQry00x</a>
        </p>
        &mdash; Contraloría General de Cuentas (@Contraloria_gt) <a href="https://twitter.com/Contraloria_gt/status/1813564909206003922?ref_src=twsrc%5Etfw">July 17, 2024</a>
      </blockquote>
    </div>
  );

  // Renderizar YouTube como botones/enlaces
  const renderYouTubeEmbed = (item: SocialMediaItem) => {
    const url = item.url?.trim() || '';
    const channelLike = isYouTubeChannelOrProfile(url);
    const videoId = channelLike ? null : extractYouTubeVideoId(url);

    if (channelLike || !videoId) {
      // Botón a perfil/canal
      return (
        <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="bg-red-600 text-white p-3 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span className="text-base font-semibold">YouTube</span>
            </div>
            <h4 className="font-medium mb-2 text-sm">{item.title}</h4>
            <button
              onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
              className="bg-white text-red-600 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center mx-auto text-sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Ver Canal
            </button>
          </div>
        </div>
      );
    }

    // Video embebido - sin tracking de YouTube
    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=0&rel=0&modestbranding=1&origin=${window.location.origin}`;
    return (
      <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
        <iframe
          width="100%"
          height="250"
          src={embedUrl}
          title={`YouTube video - ${item.title}`}
          frameBorder="0"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          className="w-full"
        />
      </div>
    );
  };

  return (
    <section className="bg-gray-50">
      <div className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header más compacto */}
          <div className="mb-8 text-center">
            <div className="inline-block">
              <h2 className="text-3xl font-bold text-blue-900 mb-3">REDES SOCIALES</h2>
              <div className="w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            </div>
          </div>

          {/* Layout de tres columnas responsive más compacto */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna Twitter */}
            {twitterItems.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center bg-sky-500 text-white px-3 py-1.5 rounded-full mb-3">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="font-semibold text-sm">Twitter / X</span>
                  </div>
                </div>
                {twitterItems.slice(0, 1).map(renderTwitterEmbed)}
              </div>
            )}

            {/* Columna Facebook */}
            {facebookItems.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-full mb-3">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="font-semibold text-sm">Facebook</span>
                  </div>
                </div>
                {facebookItems.slice(0, 1).map(renderFacebookEmbed)}
              </div>
            )}

            {/* Columna Contraloría TV (YouTube) */}
            {youtubeItems.length > 0 && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-flex items-center bg-red-600 text-white px-3 py-1.5 rounded-full mb-3">
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="font-semibold text-sm">Contraloría TV</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {youtubeItems.slice(0, 3).map(renderYouTubeEmbed)}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaEmbeds;
