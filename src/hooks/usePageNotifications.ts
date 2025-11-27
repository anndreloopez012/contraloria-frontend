import { useEffect, useState } from 'react';
import { fetchRecentPages, PageData, PageNotification } from '@/services/apiServiceAuditLogs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'seen_page_notifications';
const PAGES_STATE_KEY = 'pages_state';
const POLL_INTERVAL = 60000; // 1 minuto

/**
 * Hook para manejar notificaciones de cambios en páginas
 */
export const usePageNotifications = () => {
  const [notifications, setNotifications] = useState<PageNotification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Obtener IDs de notificaciones vistas desde localStorage
  const getSeenNotifications = (): Set<number> => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      return seen ? new Set(JSON.parse(seen)) : new Set();
    } catch {
      return new Set();
    }
  };

  // Guardar ID de notificación vista
  const markAsSeen = (notificationId: number) => {
    try {
      const seen = getSeenNotifications();
      seen.add(notificationId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
      
      // Actualizar contador de no vistas
      setUnseenCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  // Marcar todas como vistas
  const markAllAsSeen = () => {
    try {
      const allIds = notifications.map(n => n.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
      setUnseenCount(0);
    } catch (error) {
      console.error('Error marking all as seen:', error);
    }
  };

  // Navegar a una página desde notificación
  const goToPage = (notification: PageNotification) => {
    markAsSeen(notification.id);
    navigate(`/menu/${notification.pageSlug}`);
  };

  // Mostrar toast de notificación
  const showNotificationToast = (notification: PageNotification) => {
    const actionText = notification.action === 'CREATE' ? 'Nueva página' : 'Página actualizada';
    
    toast(actionText, {
      description: notification.pageTitle,
      action: {
        label: 'Ver página',
        onClick: () => goToPage(notification),
      },
      duration: 10000,
    });
  };

  // Obtener estado previo de páginas
  const getPreviousPages = (): Map<string, PageData> => {
    try {
      const stored = localStorage.getItem(PAGES_STATE_KEY);
      if (!stored) return new Map();
      const pages = JSON.parse(stored) as PageData[];
      return new Map(pages.map(p => [p.documentId, p]));
    } catch {
      return new Map();
    }
  };

  // Guardar estado actual de páginas
  const savePagesState = (pages: PageData[]) => {
    try {
      localStorage.setItem(PAGES_STATE_KEY, JSON.stringify(pages));
    } catch (error) {
      console.error('Error saving pages state:', error);
    }
  };

  // Detectar cambios comparando páginas
  const detectChanges = (currentPages: PageData[], previousPages: Map<string, PageData>): PageNotification[] => {
    const changes: PageNotification[] = [];
    const seenIds = getSeenNotifications();

    currentPages.forEach((page, index) => {
      const previous = previousPages.get(page.documentId);
      
      // Página nueva
      if (!previous) {
        const notificationId = `new-${page.id}`;
        changes.push({
          id: parseInt(notificationId.replace('new-', '')),
          documentId: page.documentId,
          action: 'CREATE',
          pageTitle: page.title,
          pageSlug: page.slug?.route || page.documentId,
          timestamp: page.createdAt,
          isNew: !seenIds.has(parseInt(notificationId.replace('new-', '')))
        });
      }
      // Página actualizada
      else if (new Date(page.updatedAt) > new Date(previous.updatedAt)) {
        const notificationId = `update-${page.id}`;
        changes.push({
          id: parseInt(notificationId.replace('update-', '')),
          documentId: page.documentId,
          action: 'UPDATE',
          pageTitle: page.title,
          pageSlug: page.slug?.route || page.documentId,
          timestamp: page.updatedAt,
          isNew: !seenIds.has(parseInt(notificationId.replace('update-', '')))
        });
      }
    });

    return changes.slice(0, 10); // Solo las últimas 10
  };

  // Fetch inicial y periódico
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchNotifications = async () => {
      try {
        const currentPages = await fetchRecentPages(20);
        const previousPages = getPreviousPages();
        
        // Detectar cambios
        const changes = detectChanges(currentPages, previousPages);
        
        // Si es la primera carga
        if (isLoading) {
          setNotifications(changes);
          setUnseenCount(changes.filter(n => n.isNew).length);
          setIsLoading(false);
          savePagesState(currentPages);
          return;
        }

        // Detectar nuevas notificaciones desde el último fetch
        const existingIds = new Set(notifications.map(n => `${n.action}-${n.id}`));
        const newNotifications = changes.filter(
          n => !existingIds.has(`${n.action}-${n.id}`) && n.isNew
        );

        // Mostrar toast solo para notificaciones realmente nuevas
        newNotifications.forEach(notification => {
          showNotificationToast(notification);
        });

        setNotifications(changes);
        setUnseenCount(changes.filter(n => n.isNew).length);
        savePagesState(currentPages);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    };

    // Fetch inicial
    fetchNotifications();

    // Configurar polling
    intervalId = setInterval(fetchNotifications, POLL_INTERVAL);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [notifications.length]); // Solo re-ejecutar cuando cambie el número de notificaciones

  return {
    notifications,
    unseenCount,
    isLoading,
    markAsSeen,
    markAllAsSeen,
    goToPage,
  };
};
