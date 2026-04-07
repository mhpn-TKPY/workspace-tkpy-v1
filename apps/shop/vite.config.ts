import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    angular({
      tsconfig: resolve(__dirname, './tsconfig.app.json'),
      workspaceRoot: resolve(__dirname, '../../'),
    }),
  ],
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  server: {
    port: 4200,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@org/models': resolve(__dirname, '../../libs/shared/models/src/index.ts'),
      '@org/shop/data': resolve(__dirname, '../../libs/shop/data/src/index.ts'),
      '@org/shop/feature-products': resolve(__dirname, '../../libs/shop/feature-products/src/index.ts'),
      '@org/shop/feature-product-detail': resolve(__dirname, '../../libs/shop/feature-product-detail/src/index.ts'),
      '@org/shop/shared-ui': resolve(__dirname, '../../libs/shop/shared-ui/src/index.ts'),
    },
  },
  build: {
    outDir: resolve(__dirname, '../../dist/apps/shop/browser'),
    emptyOutDir: true,
  },
});
