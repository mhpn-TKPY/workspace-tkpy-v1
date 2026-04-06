const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building with Nx for Vercel...');
console.log('Current directory:', process.cwd());

// Vérifier que nous sommes dans un workspace Nx
if (!fs.existsSync('nx.json')) {
  console.error('❌ nx.json not found. Are you in the right directory?');
  process.exit(1);
}

try {
  // Installer nx si nécessaire (bien que déjà dans devDependencies)
  console.log('📦 Checking Nx installation...');
  execSync('npx nx --version', { stdio: 'inherit' });

  // Build Angular application avec Nx
  console.log('🏗️ Building Angular application...');
  execSync('npx nx build shop --configuration=production --skip-nx-cache', {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });

  // Vérifier si le build a réussi
  const browserPath = 'dist/apps/shop/browser';
  if (!fs.existsSync(browserPath)) {
    console.error(`❌ Build failed: ${browserPath} not found`);
    process.exit(1);
  }

  console.log('✅ Build completed successfully');
  console.log(`📁 Output directory: ${browserPath}`);

  // Afficher les fichiers générés pour debug
  const files = fs.readdirSync(browserPath);
  console.log('Generated files:', files.slice(0, 5).join(', '));

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}