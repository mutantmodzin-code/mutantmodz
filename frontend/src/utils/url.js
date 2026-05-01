export const getMediaUrl = (url) => {
  if (!url) return '';
  
  // 1. Handle JSON-stringified arrays that might leak through
  let cleanUrl = url;
  if (typeof url === 'string' && url.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cleanUrl = parsed[0];
      }
    } catch (e) {
      // Not a valid JSON array, proceed with original string
    }
  }

  // 2. Clean up any accidental localhost strings from the database (any port)
  cleanUrl = cleanUrl.replace(/http:\/\/localhost:\d+/g, '');
  
  // 3. If it's already a full URL or a data/blob URI, return it as-is
  if (
    cleanUrl.startsWith('http') || 
    cleanUrl.startsWith('data:') || 
    cleanUrl.startsWith('blob:')
  ) return cleanUrl;
  
  // 4. Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // 5. Resolve the base path (remove /api if present)
  let base = '';
  if (apiUrl) {
    base = apiUrl.replace(/\/api\/?$/, '');
  }
  
  // 6. If running in production (not localhost) and API URL is missing 
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    if (!base) {
       // Browser will try to resolve relative to current domain
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
  
  // 7. Combine base and path
  if (!cleanUrl) return null;
  const separator = cleanUrl.startsWith('/') ? '' : '/';
  return `${base}${separator}${cleanUrl}`;
};
