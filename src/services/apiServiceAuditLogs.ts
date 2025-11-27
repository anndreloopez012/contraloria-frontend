import { getApiHost, getBearerToken } from '@/config/apiEnv';

export interface PageData {
  id: number;
  documentId: string;
  title: string;
  slug: {
    route: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface PageNotification {
  id: number;
  documentId: string;
  action: 'CREATE' | 'UPDATE';
  pageTitle: string;
  pageSlug: string;
  timestamp: string;
  isNew?: boolean;
}

/**
 * Fetch todas las páginas para detectar cambios
 */
export const fetchRecentPages = async (limit: number = 20): Promise<PageData[]> => {
  try {
    const params = new URLSearchParams({
      'sort[0]': 'updatedAt:desc',
      'pagination[limit]': limit.toString(),
    });

    const response = await fetch(
      `${getApiHost()}/api/pages?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${getBearerToken()}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    return [];
  }
};
