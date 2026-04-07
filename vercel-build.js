const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting Vercel build process...');

try {
  // Vérification de l'environnement
  console.log('📋 Environment check...');
  console.log(`Node version: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`Platform: ${process.platform}`);
  
  // Vérification des fichiers critiques
  const requiredFiles = ['package.json', 'nx.json'];
  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Required file ${file} not found in ${process.cwd()}`);
    }
    console.log(`✅ Found ${file}`);
  }
  
  // Installation des dépendances si nécessaire
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    try {
      execSync('npm install --legacy-peer-deps', { 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('✅ Dependencies installed');
    } catch (installError) {
      throw new Error(`Failed to install dependencies: ${installError.message}`);
    }
  } else {
    console.log('✅ node_modules already exists');
  }
  
  // Vérification de Nx
  const nxPath = path.join(process.cwd(), 'node_modules', '.bin', 'nx');
  if (!fs.existsSync(nxPath)) {
    console.log('⚠️ Nx not found locally, attempting to install...');
    try {
      execSync('npm install nx@22.6.2 --save-dev --legacy-peer-deps', { 
        stdio: 'inherit' 
      });
      console.log('✅ Nx installed');
    } catch (nxInstallError) {
      throw new Error(`Failed to install Nx: ${nxInstallError.message}`);
    }
  }
  
  if (!fs.existsSync(nxPath)) {
    throw new Error('Nx binary not found after installation attempts');
  }
  console.log(`✅ Nx found at: ${nxPath}`);
  
  // Build API backend
  console.log('\n🏗️ Building API backend...');
  try {
    execSync(`${nxPath} build api --configuration=production`, {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        FORCE_COLOR: '1'
      }
    });
    console.log('✅ API build completed');
  } catch (apiBuildError) {
    throw new Error(`API build failed: ${apiBuildError.message}`);
  }
  
  // Build Angular frontend
  console.log('\n🏗️ Building Angular frontend...');
  try {
    execSync(`${nxPath} build shop --configuration=production`, {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        SKIP_API_CALLS: 'true',
        VERCEL: '1',
        FORCE_COLOR: '1'
      }
    });
    console.log('✅ Frontend build completed');
  } catch (frontendBuildError) {
    throw new Error(`Frontend build failed: ${frontendBuildError.message}`);
  }
  
  // Build server
  console.log('\n🏗️ Building server...');
  try {
    execSync(`${nxPath} build shop-server --configuration=production`, {
      stdio: 'inherit',
      env: { 
        ...process.env, 
        NODE_ENV: 'production',
        FORCE_COLOR: '1'
      }
    });
    console.log('✅ Server build completed');
  } catch (serverBuildError) {
    console.warn('⚠️ Server build failed (optional):', serverBuildError.message);
    // Continue even if server build fails as it might be optional
  }
  
  // Vérification des artefacts de build
  console.log('\n📁 Verifying build artifacts...');
  
  const buildPaths = {
    browser: 'dist/apps/shop/browser',
    server: 'dist/apps/shop/server',
    api: 'dist/apps/api'
  };
  
  const missingPaths = [];
  
  for (const [name, buildPath] of Object.entries(buildPaths)) {
    if (fs.existsSync(buildPath)) {
      const files = fs.readdirSync(buildPath);
      console.log(`✅ ${name} build found at ${buildPath} (${files.length} files)`);
      
      // Vérification de l'index.html pour le browser
      if (name === 'browser') {
        const indexPath = path.join(buildPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
          console.warn(`⚠️ index.html not found in ${buildPath}`);
        } else {
          console.log(`✅ index.html found in ${buildPath}`);
        }
      }
      
      // Vérification du server.mjs pour le server
      if (name === 'server') {
        const serverPath = path.join(buildPath, 'server.mjs');
        if (!fs.existsSync(serverPath)) {
          console.warn(`⚠️ server.mjs not found in ${buildPath}`);
        } else {
          console.log(`✅ server.mjs found in ${buildPath}`);
        }
      }
      
      // Vérification du main.js pour l'API
      if (name === 'api') {
        const mainPath = path.join(buildPath, 'main.js');
        if (!fs.existsSync(mainPath)) {
          console.warn(`⚠️ main.js not found in ${buildPath}`);
        } else {
          console.log(`✅ main.js found in ${buildPath}`);
        }
      }
    } else {
      console.error(`❌ ${name} build not found at ${buildPath}`);
      missingPaths.push(name);
    }
  }
  
  if (missingPaths.length > 0) {
    throw new Error(`Missing build artifacts: ${missingPaths.join(', ')}`);
  }
  
  // Création d'un fichier de statut pour Vercel
  const statusFile = path.join(process.cwd(), '.vercel-build-status');
  try {
    fs.writeFileSync(statusFile, JSON.stringify({
      buildTime: new Date().toISOString(),
      status: 'success',
      artifacts: buildPaths
    }, null, 2));
    console.log(`✅ Build status written to ${statusFile}`);
  } catch (statusError) {
    console.warn(`⚠️ Could not write status file: ${statusError.message}`);
  }
  
  console.log('\n🎉 Build completed successfully!');
  console.log('📊 Build summary:');
  console.log(`   - Browser files: ${buildPaths.browser}`);
  console.log(`   - Server files: ${buildPaths.server}`);
  console.log(`   - API files: ${buildPaths.api}`);
  
} catch (error) {
  console.error('\n❌ Build failed catastrophically:');
  console.error(`   Error: ${error.message}`);
  console.error(`   Stack: ${error.stack}`);
  
  // Tentative de diagnostique
  console.log('\n🔍 Diagnostic information:');
  try {
    console.log(`   Current directory contents:`);
    const files = fs.readdirSync(process.cwd());
    files.slice(0, 20).forEach(file => {
      const stats = fs.statSync(file);
      console.log(`   - ${file} (${stats.isDirectory() ? 'dir' : 'file'})`);
    });
  } catch (diagError) {
    console.log(`   Could not list directory: ${diagError.message}`);
  }
  
  // Écrire le statut d'échec
  try {
    const statusFile = path.join(process.cwd(), '.vercel-build-status');
    fs.writeFileSync(statusFile, JSON.stringify({
      buildTime: new Date().toISOString(),
      status: 'failed',
      error: error.message
    }, null, 2));
  } catch (statusError) {
    // Ignore status write error
  }
  
  process.exit(1);
}