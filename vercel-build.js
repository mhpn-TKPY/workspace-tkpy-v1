const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Building with Nx for Vercel...');

try {
  // Build backend API
  console.log('🏗️ Building API backend...');
  execSync('npx nx build api --configuration=production', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Build frontend Angular avec variable d'environnement pour éviter les appels API
  console.log('🏗️ Building Angular frontend...');
  execSync('npx nx build shop --configuration=production', {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'production',
      SKIP_API_CALLS: 'true',
      VERCEL: '1'
    }
  });

  // Vérifier les builds
  const browserPath = 'dist/apps/shop/browser';
  const serverPath = 'dist/apps/shop/server';
  const apiPath = 'dist/apps/api';
  
  if (!fs.existsSync(browserPath)) {
    console.error(`❌ Frontend browser build failed: ${browserPath} not found`);
    process.exit(1);
  }
  
  if (!fs.existsSync(serverPath)) {
    console.error(`❌ Frontend server build failed: ${serverPath} not found`);
    process.exit(1);
  }
  
  if (!fs.existsSync(apiPath)) {
    console.error(`❌ API build failed: ${apiPath} not found`);
    process.exit(1);
  }

  console.log('✅ Build completed successfully');
  console.log(`📁 Frontend Browser: ${browserPath}`);
  console.log(`📁 Frontend Server: ${serverPath}`);
  console.log(`📁 API: ${apiPath}`);

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}