import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder, FolderOpen, FileText, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { InfoPublicaItem } from '@/services/apiServiceInfoPublica';
import { cn } from '@/lib/utils';

interface InfoPublicaNodeProps {
  item: InfoPublicaItem;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  searchTerm?: string;
}

export const InfoPublicaNode: React.FC<InfoPublicaNodeProps> = ({
  item,
  level,
  isExpanded,
  onToggle,
  searchTerm = ''
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    if (item.isFile) {
      // Es un archivo final, navegar o abrir enlace
      if (item.blank && item.href) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else if (item.slug) {
        navigate(item.slug);
      }
    } else {
      // Es una carpeta, toggle
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }
  };

  const highlightText = (text: string) => {
    if (!searchTerm) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <mark key={i} className="bg-primary/30 text-foreground font-semibold">{part}</mark> : 
        part
    );
  };

  const getIcon = () => {
    if (item.isFile) {
      return <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />;
    }
    return isExpanded ? 
      <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" /> : 
      <Folder className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />;
  };

  const getChevron = () => {
    if (item.isFile) return null;
    return isExpanded ? 
      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" /> : 
      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground flex-shrink-0" />;
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "p-2 md:p-3 transition-all duration-200 border-border/50",
        item.isFile ? "cursor-pointer hover:border-primary/50 hover:shadow-md" : "cursor-pointer hover:bg-accent/50",
        isExpanded && !item.isFile && "bg-accent/30"
      )}
      style={{ marginLeft: `${level * 1}rem` }}
    >
      <div className="flex items-center gap-1.5 md:gap-3">
        {getChevron()}
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            <h3 className={cn(
              "font-medium break-words",
              item.isFile ? "text-xs md:text-sm" : "text-sm md:text-base"
            )}>
              {highlightText(item.title)}
            </h3>
            
            {item.blank && (
              <Badge variant="outline" className="text-[10px] md:text-xs flex items-center gap-0.5 md:gap-1 py-0 px-1 md:px-2">
                <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3" />
                <span className="hidden xs:inline">Externo</span>
              </Badge>
            )}
            
            {!item.isFile && item.children.length > 0 && (
              <Badge variant="secondary" className="text-[10px] md:text-xs py-0 px-1 md:px-2">
                {item.children.length}
              </Badge>
            )}
          </div>
          
          {item.description && (
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 line-clamp-2">
              {highlightText(item.description)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
