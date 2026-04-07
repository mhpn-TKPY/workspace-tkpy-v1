import { HttpInterceptorFn } from '@angular/common/http';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne pas modifier les URLs absolues
  if (req.url.startsWith('http')) {
    return next(req);
  }
  
  // Pendant le build SSR, ne pas faire d'appels API
  if (process.env['SKIP_API_CALLS'] === 'true') {
    return next(req);
  }
  
  // Déterminer l'URL de base de l'API
  let apiBaseUrl = '';
  
  if (typeof window !== 'undefined') {
    // Côté client : utiliser l'URL du navigateur
    apiBaseUrl = window.location.origin;
  } else {
    // Côté serveur (SSR) : utiliser l'URL Vercel ou localhost
    apiBaseUrl = process.env['VERCEL_URL'] 
      ? `https://${process.env['VERCEL_URL']}`
      : process.env['API_URL'] || 'http://localhost:3333';
  }
  
  const apiReq = req.clone({
    url: `${apiBaseUrl}${req.url}`
  });
  
  return next(apiReq);
};