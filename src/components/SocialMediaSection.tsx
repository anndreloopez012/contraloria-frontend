
import React, { useState, useEffect } from 'react';

const SocialMediaSection = () => {
  const [socialData, setSocialData] = useState(null);

  useEffect(() => {
    // Cargar datos de la API simulada
    fetch('/src/data/socialMediaAPI.json')
      .then(response => response.json())
      .then(data => setSocialData(data.socialMedia))
      .catch(error => console.error('Error loading social media data:', error));
  }, []);

  if (!socialData) {
    return (
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">Cargando redes sociales...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with blue gradient bar */}
        <div className="mb-12">
          <div className="flex items-center mb-4">
            <h2 className="text-3xl font-bold text-blue-900 mr-4">REDES SOCIALES</h2>
            <div className="flex-1 h-2 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 rounded-full"></div>
          </div>
        </div>

        {/* Three column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Twitter Column */}
          <div className="space-y-4">
            <div className="border-b-2 border-blue-600 pb-2">
              <h3 className="text-xl font-semibold text-blue-900">Twitter</h3>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`data:text/html;charset=utf-8,
                  <html>
                    <head>
                      <style>
                        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f7f9fa; }
                        .tweet { background: white; border-radius: 12px; padding: 16px; margin-bottom: 12px; border: 1px solid #e1e8ed; }
                        .user { display: flex; align-items: center; margin-bottom: 12px; }
                        .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; background: #1da1f2; }
                        .username { font-weight: bold; color: #14171a; }
                        .handle { color: #536471; margin-left: 4px; }
                        .content { color: #14171a; line-height: 1.3125; margin-bottom: 12px; }
                        .hashtag { color: #1da1f2; }
                        .engagement { display: flex; gap: 16px; color: #536471; font-size: 13px; }
                        .tweet-image { width: 100%; border-radius: 12px; margin: 12px 0; }
                        .follow-btn { background: #1da1f2; color: white; border: none; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin-top: 12px; }
                      </style>
                    </head>
                    <body>
                      <div class="tweet">
                        <div class="user">
                          <div class="avatar"></div>
                          <div>
                            <span class="username">Contraloría Ge...</span>
                            <span class="handle">@C...</span>
                          </div>
                        </div>
                        <div class="content">
                          Contraloría General de Cuentas denuncia construcción de Parque Bicentenario Zona 8, Cobán, Alta Verapaz
                        </div>
                        <div class="engagement">
                          <span>❤️ 4</span>
                          <span>🔄 2</span>
                          <span>💬 1</span>
                        </div>
                      </div>
                      
                      <div class="tweet">
                        <div class="user">
                          <div class="avatar"></div>
                          <div>
                            <span class="username">Contraloría Ge...</span>
                            <span class="handle">@C...</span>
                          </div>
                        </div>
                        <div class="content">
                          Como parte de la estrategia de <span class="hashtag">#Prevención</span> y <span class="hashtag">#Fiscalización</span>, el Programa <span class="hashtag">#MunicipioFiscalizado</span>, de la <span class="hashtag">#CGC</span>
                          <br><br>
                          <span class="hashtag">@Guatevision_tv</span><br>
                          <span class="hashtag">@PrensaComunitar</span><br>
                          <span class="hashtag">@prensa_libre</span> <span class="hashtag">@lahoragt</span><br>
                          <span class="hashtag">@libertopolis</span><br>
                          <span class="hashtag">@PlazaPublicaGT</span><br>
                          <span class="hashtag">@QuorumGT</span><br>
                          <span class="hashtag">@EmisorasUnidas</span><br>
                          <span class="hashtag">@sonora969</span>
                        </div>
                        <div class="engagement">
                          <span>❤️ 12</span>
                          <span>🔄 8</span>
                          <span>💬 3</span>
                        </div>
                      </div>
                      
                      <button class="follow-btn">Follow @contraloria_gt</button>
                    </body>
                  </html>
                `}
                width="100%"
                height="600"
                frameBorder="0"
                scrolling="yes"
                title="Twitter Feed"
                className="w-full"
              />
            </div>
          </div>

          {/* Facebook Column */}
          <div className="space-y-4">
            <div className="border-b-2 border-blue-600 pb-2">
              <h3 className="text-xl font-semibold text-blue-900">Facebook</h3>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={`data:text/html;charset=utf-8,
                  <html>
                    <head>
                      <style>
                        body { margin: 0; padding: 20px; font-family: Helvetica, Arial, sans-serif; background: #f0f2f5; }
                        .post { background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                        .user { display: flex; align-items: center; margin-bottom: 12px; }
                        .avatar { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; background: #4267B2; }
                        .username { font-weight: 600; color: #1c1e21; font-size: 15px; }
                        .time { color: #65676b; font-size: 13px; }
                        .content { color: #1c1e21; line-height: 1.33; margin-bottom: 12px; font-size: 15px; }
                        .engagement { display: flex; justify-content: space-between; color: #65676b; font-size: 13px; padding-top: 8px; border-top: 1px solid #e4e6ea; }
                        .like-btn { background: #4267B2; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-top: 12px; }
                      </style>
                    </head>
                    <body>
                      <div class="post">
                        <div class="user">
                          <div class="avatar"></div>
                          <div>
                            <div class="username">Contraloría General de Cuentas</div>
                            <div class="time">25 jun. 2021</div>
                          </div>
                        </div>
                        <div class="content">
                          La Contraloría General de Cuentas presentó una Denuncia Penal contra la Dra. María Amelia Flores González, Ministra de @MinSaludGuate por los delitos de Incumplimiento de Deberes y Abuso de Autoridad en el manejo de recursos destinados para combatir la pandemia del COVID-19.
                        </div>
                        <div class="engagement">
                          <span>❤️ Me gusta 234</span>
                          <span>💬 67 comentarios</span>
                          <span>↗️ 45 compartidas</span>
                        </div>
                      </div>
                      
                      <button class="like-btn">👍 Me gusta</button>
                    </body>
                  </html>
                `}
                width="100%"
                height="400"
                frameBorder="0"
                scrolling="yes"
                title="Facebook Feed"
                className="w-full"
              />
            </div>
          </div>

          {/* Contraloría TV Column */}
          <div className="space-y-4">
            <div className="border-b-2 border-blue-600 pb-2">
              <h3 className="text-xl font-semibold text-blue-900 underline">Contraloría TV</h3>
            </div>
            <div className="space-y-4">
              {/* Video 1 */}
              <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={`data:text/html;charset=utf-8,
                    <html>
                      <head>
                        <style>
                          body { margin: 0; padding: 0; font-family: Roboto, Arial, sans-serif; background: #0f0f0f; }
                          .video-container { background: #0f0f0f; color: white; }
                          .video-thumbnail { position: relative; background: #1a1a1a; height: 120px; display: flex; align-items: center; justify-content: center; }
                          .play-button { width: 60px; height: 60px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                          .play-triangle { width: 0; height: 0; border-left: 15px solid white; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 3px; }
                          .video-info { padding: 12px; }
                          .video-title { font-size: 14px; font-weight: 400; margin-bottom: 4px; line-height: 1.4; }
                          .video-meta { font-size: 12px; color: #aaa; }
                          .channel-info { display: flex; align-items: center; margin-top: 8px; }
                          .channel-avatar { width: 24px; height: 24px; border-radius: 50%; background: #ff0000; margin-right: 8px; }
                          .subscribe-btn { background: #ff0000; color: white; border: none; padding: 8px 16px; border-radius: 2px; font-size: 12px; font-weight: 500; margin-left: auto; }
                        </style>
                      </head>
                      <body>
                        <div class="video-container">
                          <div class="video-thumbnail">
                            <div class="play-button">
                              <div class="play-triangle"></div>
                            </div>
                          </div>
                          <div class="video-info">
                            <div class="video-title">Requisitos para presentar denuncias ciudadanas</div>
                            <div class="video-meta">1,234 visualizaciones • hace 1 día</div>
                            <div class="channel-info">
                              <div class="channel-avatar"></div>
                              <span style="font-size: 12px;">Contraloría General de Cuentas</span>
                            </div>
                          </div>
                        </div>
                      </body>
                    </html>
                  `}
                  width="100%"
                  height="200"
                  frameBorder="0"
                  title="Video Tutorial 1"
                  className="w-full"
                />
              </div>

              {/* Video 2 */}
              <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={`data:text/html;charset=utf-8,
                    <html>
                      <head>
                        <style>
                          body { margin: 0; padding: 0; font-family: Roboto, Arial, sans-serif; background: #0f0f0f; }
                          .video-container { background: #0f0f0f; color: white; }
                          .video-thumbnail { position: relative; background: #1a1a1a; height: 120px; display: flex; align-items: center; justify-content: center; }
                          .play-button { width: 60px; height: 60px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                          .play-triangle { width: 0; height: 0; border-left: 15px solid white; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 3px; }
                          .video-info { padding: 12px; }
                          .video-title { font-size: 14px; font-weight: 400; margin-bottom: 4px; line-height: 1.4; }
                          .video-meta { font-size: 12px; color: #aaa; }
                          .channel-info { display: flex; align-items: center; margin-top: 8px; }
                          .channel-avatar { width: 24px; height: 24px; border-radius: 50%; background: #ff0000; margin-right: 8px; }
                        </style>
                      </head>
                      <body>
                        <div class="video-container">
                          <div class="video-thumbnail">
                            <div class="play-button">
                              <div class="play-triangle"></div>
                            </div>
                          </div>
                          <div class="video-info">
                            <div class="video-title">Video Tutorial: Cómo acceder al portal web</div>
                            <div class="video-meta">2,567 visualizaciones • hace 3 días</div>
                            <div class="channel-info">
                              <div class="channel-avatar"></div>
                              <span style="font-size: 12px;">Contraloría General de Cuentas</span>
                            </div>
                          </div>
                        </div>
                      </body>
                    </html>
                  `}
                  width="100%"
                  height="200"
                  frameBorder="0"
                  title="Video Tutorial 2"
                  className="w-full"
                />
              </div>

              {/* Video 3 */}
              <div className="bg-gray-50 rounded-lg overflow-hidden shadow-lg">
                <iframe
                  src={`data:text/html;charset=utf-8,
                    <html>
                      <head>
                        <style>
                          body { margin: 0; padding: 0; font-family: Roboto, Arial, sans-serif; background: #0f0f0f; }
                          .video-container { background: #0f0f0f; color: white; }
                          .video-thumbnail { position: relative; background: #1a1a1a; height: 120px; display: flex; align-items: center; justify-content: center; }
                          .play-button { width: 60px; height: 60px; background: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                          .play-triangle { width: 0; height: 0; border-left: 15px solid white; border-top: 10px solid transparent; border-bottom: 10px solid transparent; margin-left: 3px; }
                          .video-info { padding: 12px; }
                          .video-title { font-size: 14px; font-weight: 400; margin-bottom: 4px; line-height: 1.4; }
                          .video-meta { font-size: 12px; color: #aaa; }
                          .channel-info { display: flex; align-items: center; margin-top: 8px; }
                          .channel-avatar { width: 24px; height: 24px; border-radius: 50%; background: #ff0000; margin-right: 8px; }
                          .subscribe-btn { background: #ff0000; color: white; border: none; padding: 6px 12px; border-radius: 2px; font-size: 11px; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 8px; }
                        </style>
                      </head>
                      <body>
                        <div class="video-container">
                          <div class="video-thumbnail">
                            <div class="play-button">
                              <div class="play-triangle"></div>
                            </div>
                          </div>
                          <div class="video-info">
                            <div class="video-title">A partir del 04 de enero: Nuevos procedimientos</div>
                            <div class="video-meta">5,123 visualizaciones • hace 1 semana</div>
                            <div class="channel-info">
                              <div class="channel-avatar"></div>
                              <span style="font-size: 12px;">Contraloría General de Cuentas</span>
                            </div>
                            <button class="subscribe-btn">
                              🔔 SUSCRIBIRSE 3 K
                            </button>
                          </div>
                        </div>
                      </body>
                    </html>
                  `}
                  width="100%"
                  height="220"
                  frameBorder="0"
                  title="Video Tutorial 3"
                  className="w-full"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SocialMediaSection;
