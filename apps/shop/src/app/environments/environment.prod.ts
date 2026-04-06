export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'https://tkpy-v1-angular.vercel.app/api',
  shopUrl: process.env['SHOP_URL'] || 'https://tkpy-v1-angular.vercel.app',
  logLevel: process.env['LOG_LEVEL'] || 'info',
  cacheTtl: parseInt(process.env['CACHE_TTL'] || '3600'),
  staticMaxAge: parseInt(process.env['STATIC_MAX_AGE'] || '31536000')
};