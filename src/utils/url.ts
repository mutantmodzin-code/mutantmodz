export const getMediaUrl = (url: string) => {
  if (!url) return '';
  
  // 1. Clean up any accidental localhost strings from the database
  let cleanUrl = url.replace('http://localhost:3001', '');
  
  // 2. If it's already a full URL or a data/blob URI, return it as-is
  if (
    cleanUrl.startsWith('http') || 
    cleanUrl.startsWith('data:') || 
    cleanUrl.startsWith('blob:')
  ) return cleanUrl;
  
  // 3. Get the API URL from environment variables
  const apiUrl = (import.meta as any).env?.VITE_API_URL;
  
  // 4. Resolve the base path (remove /api if present)
  let base = '';
  if (apiUrl) {
    base = apiUrl.replace(/\/api\/?$/, '');
  }
  
  // 5. If running in production (not localhost) and API URL is missing 
  // we try to use relative paths which might work if on the same domain,
  // otherwise fallback to a placeholder or stay relative.
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    if (!base) {
       // In production without VITE_API_URL, we assume relative path /uploads/...
       // Browser will resolve this to current domain
       return cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`;
    }
    // Ensure base uses https if the page is https
    if (window.location.protocol === 'https:' && base.startsWith('http:')) {
      base = base.replace('http:', 'https:');
    }
  } else if (!base) {
    // Local development fallback
    base = 'http://localhost:3001';
  }
  
  // 6. Combine base and path
  const separator = cleanUrl.startsWith('/') ? '' : '/';
  return `${base}${separator}${cleanUrl}`;
};
