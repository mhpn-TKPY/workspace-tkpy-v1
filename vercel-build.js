const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Building with Nx for Vercel...');

try {
  // Build backend API
  console.log('🏗️ Building API backend...');
  execSync('npx nx build api --configuration=production --skip-nx-cache', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Build frontend Angular
  console.log('🏗️ Building Angular frontend...');
  execSync('npx nx build shop --configuration=production --skip-nx-cache', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Vérifier les builds
  const browserPath = 'dist/apps/shop/browser';
  const apiPath = 'dist/apps/api';
  
  if (!fs.existsSync(browserPath)) {
    console.error(`❌ Frontend build failed: ${browserPath} not found`);
    process.exit(1);
  }
  
  if (!fs.existsSync(apiPath)) {
    console.error(`❌ API build failed: ${apiPath} not found`);
    process.exit(1);
  }

  console.log('✅ Build completed successfully');
  console.log(`📁 Frontend: ${browserPath}`);
  console.log(`📁 API: ${apiPath}`);

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}