import { HttpInterceptorFn } from '@angular/common/http';

export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne pas modifier les URLs absolues
  if (req.url.startsWith('http')) {
    return next(req);
  }
  
  // Pendant le build SSR, ne pas faire d'appels API
  if (typeof process !== 'undefined' && process.env?.['SKIP_API_CALLS'] === 'true') {
    return next(req);
  }
  
  // Pour les URLs relatives (comme /api/...), on les garde telles quelles
  // Le navigateur/serveur les résoudra automatiquement
  // Pour le SSR, on doit ajouter l'URL de base
  if (typeof window === 'undefined') {
    // Côté serveur (SSR) : utiliser l'URL Vercel ou localhost
    const apiBaseUrl = typeof process !== 'undefined' && process.env?.['VERCEL_URL'] 
      ? `https://${process.env['VERCEL_URL']}`
      : 'http://localhost:4200';
    
    const apiReq = req.clone({
      url: `${apiBaseUrl}${req.url}`
    });
    
    return next(apiReq);
  }
  
  // Côté client : les URLs relatives fonctionnent automatiquement
  return next(req);
};
