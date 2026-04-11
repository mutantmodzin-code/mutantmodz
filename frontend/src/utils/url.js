export const getMediaUrl = (url) => {
  if (!url) return '';
  
  // 1. Clean up any accidental localhost strings from the database
  let cleanUrl = url.replace('http://localhost:3001', '');
  
  // 2. If it's already an absolute external URL or a Base64 data URI, return it
  if (cleanUrl.startsWith('http') || cleanUrl.startsWith('data:')) return cleanUrl;
  
  // 3. Get the API URL from environment variables
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // 4. Resolve the base path (remove /api if present)
  let base = '';
  if (apiUrl) {
    base = apiUrl.replace(/\/api\/?$/, '');
  }
  
  // 5. If running in production (not localhost) and API URL is missing 
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    if (!base) {
       // Browser will try to resolve relative to current domain, which fails for Admin on Vercel
       // We really need VITE_API_URL here, but as a fallback we stay relative
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
  const finalUrl = `${base}${separator}${cleanUrl}`;
  console.log('DEBUG: Resolved Media URL:', { input: url, resolved: finalUrl, base, cleanUrl });
  return finalUrl;
};
