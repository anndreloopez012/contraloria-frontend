import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Grid, List, Calendar, User, Tag, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchArticlesList, Article } from '@/services/apiServiceArticles';
import ArticlesSearchModal from '@/components/ArticlesSearchModal';

interface ViewMode {
  mode: 'grid' | 'list' | 'cards';
  label: string;
  icon: React.ComponentType<any>;
}

const ArticlesPage = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cards'>('cards');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(12);

  // Opciones de vista
  const viewModes: ViewMode[] = [
    { mode: 'cards', label: 'Tarjetas', icon: Grid },
    { mode: 'list', label: 'Lista', icon: List },
    { mode: 'grid', label: 'Cuadrícula', icon: Grid }
  ];

  useEffect(() => {
    const loadArticles = async () => {
      console.log('[ArticlesPage] Iniciando carga de artículos');
      setIsLoading(true);
      setError(null);
      
      try {
        const articlesData = await fetchArticlesList();
        
        if (articlesData && articlesData.length > 0) {
          console.log('[ArticlesPage] Artículos cargados exitosamente:', articlesData.length);
          // Ordenar artículos por fecha de publicación de manera descendente (más reciente primero)
          const sortedArticles = articlesData.sort((a, b) => {
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          });
          setArticles(sortedArticles);
        } else {
          console.log('[ArticlesPage] No se encontraron artículos');
          setError('No se encontraron artículos disponibles');
        }
      } catch (err) {
        console.error('[ArticlesPage] Error al cargar artículos:', err);
        setError('Error al cargar los artículos desde el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Obtener todas las categorías únicas
  const getAllCategories = (): string[] => {
    const allCategories = new Set<string>();
    
    articles.forEach(article => {
      if (article.category && article.category.name) {
        allCategories.add(article.category.name);
      }
    });
    
    return Array.from(allCategories);
  };

  const categories = ['Todos', ...getAllCategories()];

  // Filtrar artículos
  const filteredArticles = articles.filter(article => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const normalizedTitle = String(article.title || '').toLowerCase();
    const normalizedDescription = String(article.description || '').toLowerCase();

    // Filtro por categoría
    const matchesCategory = selectedCategory === 'Todos' || 
      (article.category && article.category.name === selectedCategory);
    
    // Filtro por búsqueda
    const matchesSearch = normalizedTitle.includes(normalizedSearchTerm) ||
                         normalizedDescription.includes(normalizedSearchTerm);
    
    return matchesCategory && matchesSearch;
  });

  // Paginación
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const handleArticleClick = (article: Article) => {
    console.log('[ArticlesPage] Navegando a artículo:', article.title);
    navigate(`/articulos/${article.slug}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getImageUrl = (article: Article): string => {
    if (article.image) {
      return article.image.formats?.medium?.url || 
             article.image.formats?.small?.url || 
             article.image.url;
    }
    return '/lovable-uploads/be6267fe-c26a-4dd8-bdc3-95323c6a0fd7.png'; // fallback
  };

  const renderArticleCard = (article: Article) => (
    <div 
      key={article.id}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in overflow-hidden transform hover:scale-[1.02]"
      onClick={() => handleArticleClick(article)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImageUrl(article)}
          alt={article.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        
        {/* Categorías */}
        {article.category && (
          <div className="absolute top-4 left-4">
            <span className="px-4 py-2 bg-white/95 backdrop-blur-sm text-primary text-xs font-semibold rounded-full shadow-md">
              {article.category.name}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {article.title}
        </h3>
        <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full mb-4"></div>
        
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
          {article.description || ''}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(article.publishedAt)}
            </div>
            {article.author && article.author.length > 0 && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                {article.author[0].name}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Eye className="w-4 h-4 mr-1" />
            Leer más
          </Button>
        </div>
      </div>
    </div>
  );

  const renderArticleList = (article: Article) => (
    <div 
      key={article.id}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group animate-fade-in p-6 overflow-hidden transform hover:scale-[1.01]"
      onClick={() => handleArticleClick(article)}
    >
      <div className="flex gap-6">
        <div className="flex-shrink-0 w-32 h-24 overflow-hidden rounded-lg">
          <img
            src={getImageUrl(article)}
            alt={article.title}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {article.title}
            </h3>
            {article.category && (
              <span className="px-4 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-full ml-4 flex-shrink-0">
                {article.category.name}
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {article.description || ''}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(article.publishedAt)}
              </div>
              {article.author && article.author.length > 0 && (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {article.author[0].name}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              Leer más
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground text-lg font-medium">Cargando artículos...</p>
          <p className="text-muted-foreground text-sm mt-2">Obteniendo la información más reciente</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center animate-fade-in max-w-md mx-auto p-8">
          <div className="bg-amber-100 border-2 border-amber-300 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileText className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Contenido en construcción</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Sala de Redacción</h1>
          <p className="text-muted-foreground max-w-4xl">
            Descubre nuestros artículos más recientes sobre transparencia, buena gobernanza y temas de interés público.
          </p>
        </div>

        {/* Controles modernos */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Botón de búsqueda */}
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 sm:max-w-md justify-start text-muted-foreground rounded-xl border-2 border-dashed hover:border-solid hover:border-primary/20"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar en artículos...
              {searchTerm && (
                <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                  "{searchTerm}"
                </span>
              )}
            </Button>

            {/* Filtro de categoría */}
            <Button
              variant="outline"
              onClick={() => setIsSearchOpen(true)}
              className="justify-between rounded-xl min-w-[140px]"
            >
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-xs">{selectedCategory}</span>
              </div>
            </Button>

            {/* Modos de vista */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {viewModes.map((view) => {
                const IconComponent = view.icon;
                return (
                  <Button
                    key={view.mode}
                    variant={viewMode === view.mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(view.mode)}
                    className={`transition-all duration-200 rounded-lg px-3 py-1.5 ${viewMode === view.mode ? 'shadow-sm' : ''}`}
                  >
                    <IconComponent className="w-3 h-3 sm:mr-1.5" />
                    <span className="hidden sm:inline text-xs">{view.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Contador de resultados */}
          {(searchTerm || selectedCategory !== 'Todos') && (
            <div className="mt-3 p-2 bg-primary/5 rounded-lg">
              <p className="text-xs text-primary">
                {filteredArticles.length} artículo{filteredArticles.length !== 1 ? 's' : ''}
                {searchTerm && ` para "${searchTerm}"`}
                {selectedCategory !== 'Todos' && ` en "${selectedCategory}"`}
              </p>
            </div>
          )}
        </div>

        {/* Contenido de artículos */}
        {currentArticles.length > 0 ? (
          <>
            <div className={`animate-fade-in ${
              viewMode === 'cards' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
            }`}>
              {currentArticles.map((article) => 
                viewMode === 'list' ? renderArticleList(article) : renderArticleCard(article)
              )}
            </div>

            {/* Paginación mejorada */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-12">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="transition-all duration-200 rounded-xl bg-white/80 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-12 h-12 p-0 rounded-xl transition-all duration-200 ${
                          currentPage === pageNumber 
                            ? 'bg-primary text-primary-foreground shadow-lg' 
                            : 'bg-white/80 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="transition-all duration-200 rounded-xl bg-white/80 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-slate-100/50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-sm">
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              No se encontraron artículos
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
              {searchTerm || selectedCategory !== 'Todos' 
                ? 'No hay artículos que coincidan con los filtros aplicados. Intenta con otros términos o explora otras categorías.'
                : 'No hay artículos disponibles en este momento. Regresa pronto para ver nuevo contenido.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'Todos') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todos');
                  setCurrentPage(1);
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Modal de búsqueda */}
        <ArticlesSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setCurrentPage(1);
          }}
          resultsCount={filteredArticles.length}
        />
      </div>
    </div>
  );
};

export default ArticlesPage;
