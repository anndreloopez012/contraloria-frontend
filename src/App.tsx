
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MenuPage from "./pages/MenuPage";
import EstadoCuenta from "./pages/EstadoCuenta";
import ManualesProcedimientos from "./pages/ManualesProcedimientos";
import LinksPage from "./pages/LinksPage";
import PDFViewerPage from "./pages/PDFViewerPage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import OrganigramaPage from "./pages/OrganigramaPage";
import PageInfoPublic from "./pages/PageInfoPublic";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";
import GlobalHead from "./components/GlobalHead";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <GlobalHead />
          <div className="min-h-screen bg-background font-inter flex flex-col">
            <Header showSidebarButton={true} />
            
            <main className="flex-1">
              <PageTransition>
                <Routes>
                  {/* Página de inicio */}
                  <Route path="/" element={<Index />} />
                  
                  {/* Rutas específicas para organigrama */}
                  <Route path="/nosotros/autoridades/organigrama" element={<OrganigramaPage />} />
                  
                  {/* Ruta para información pública */}
                  <Route path="/informacion-publica" element={<PageInfoPublic />} />
                  
                  {/* Nueva ruta para visualizador de PDF */}
                  <Route path="/pdf-viewer" element={<PDFViewerPage />} />
                  
                  {/* Rutas para artículos */}
                  <Route path="/articulos" element={<ArticlesPage />} />
                  <Route path="/articulos/:slug" element={<ArticleDetailPage />} />
                  
                  {/* Ruta para enlaces externos */}
                  <Route path="/links/:id" element={<LinksPage />} />
                  
                  {/* Rutas específicas del menú lateral */}
                  <Route path="/estado-cuenta" element={<EstadoCuenta />} />
                  <Route path="/manuales-procedimientos" element={<ManualesProcedimientos />} />
                  
                  {/* Rutas generales - DESPUÉS de las específicas */}
                  <Route path="/:section" element={<MenuPage />} />
                  <Route path="/:section/:subsection" element={<MenuPage />} />
                  <Route path="/:section/:subsection/:item" element={<MenuPage />} />
                  
                  {/* Ruta 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </main>
            
            <Footer variant="white" />
            <ChatBot />
          </div>
        </BrowserRouter>
      </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
