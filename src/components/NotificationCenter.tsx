import React from 'react';
import { Bell, CheckCheck, Clock, FileText, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { usePageNotifications } from '@/hooks/usePageNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Centro de notificaciones para cambios en páginas
 * Muestra los últimos 10 cambios en un popover
 */
const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unseenCount,
    isLoading,
    markAsSeen,
    markAllAsSeen,
    goToPage,
  } = usePageNotifications();

  const [isOpen, setIsOpen] = React.useState(false);

  const handleNotificationClick = (notification: any) => {
    markAsSeen(notification.id);
    goToPage(notification);
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    markAllAsSeen();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-gray-100 p-2 rounded-full transition-all duration-200 hover:scale-105"
          style={{ color: '#0E2855' }}
          title="Notificaciones de cambios"
        >
          <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
          {unseenCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unseenCount > 9 ? '9+' : unseenCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: '#0E2855' }} />
            <h3 className="font-semibold text-foreground">Notificaciones</h3>
            {unseenCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {unseenCount} nuevas
              </Badge>
            )}
          </div>
          {unseenCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">
                Cargando notificaciones...
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                    notification.isNew ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor:
                          notification.action === 'CREATE'
                            ? '#B09B57'
                            : '#0E2855',
                      }}
                    >
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            notification.action === 'CREATE'
                              ? 'default'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {notification.action === 'CREATE'
                            ? 'Nueva'
                            : 'Actualizada'}
                        </Badge>
                        {notification.isNew && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                        {notification.pageTitle}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="border-t px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              Mostrando los últimos 10 cambios
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
