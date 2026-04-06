const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Building with Nx for Vercel...');

try {
  // Build uniquement l'application Angular (pas le server)
  console.log('🏗️ Building Angular application...');
  execSync('npx nx build shop --configuration=production --skip-nx-cache', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Vérifier le build
  const browserPath = 'dist/apps/shop/browser';
  if (!fs.existsSync(browserPath)) {
    console.error(`❌ Build failed: ${browserPath} not found`);
    process.exit(1);
  }

  console.log('✅ Build completed successfully');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}