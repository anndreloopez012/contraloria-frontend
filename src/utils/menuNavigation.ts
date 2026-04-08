import type { NavigateFunction } from 'react-router-dom';

export const normalizeMenuUrl = (value?: string | null): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed;
  if (trimmed.startsWith('www.')) return `https://${trimmed}`;

  return `https://${trimmed}`;
};

export const navigateWithMenuUrl = (
  rawUrl: string | null | undefined,
  blank: boolean,
  navigate: NavigateFunction
): boolean => {
  const normalizedUrl = normalizeMenuUrl(rawUrl);
  if (!normalizedUrl) return false;

  if (normalizedUrl.startsWith('/')) {
    if (blank) {
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(normalizedUrl);
    }
    return true;
  }

  if (blank) {
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
  } else {
    window.location.assign(normalizedUrl);
  }

  return true;
};
