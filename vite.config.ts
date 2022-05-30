import { defineConfig } from 'vite';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import { PwaConfig, Proxy, Port, ProxyUrl } from './viteOpt.mjs';

import AppPackage from './package.json';

// https://vitejs.dev/config/

export default defineConfig({
  define: {
    ViteConst: JSON.stringify({
      AppVersion: AppPackage.version,
      AppName: AppPackage.name,
      ProxyUrl,
    }),
  },

  root: './',
  plugins: [react(), VitePWA(PwaConfig)],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  build: {
    outDir: './dist',
    sourcemap: true,
  },

  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // 在此处设置，也可以设置直角、边框色、字体大小等
          'primary-color': '#f0b90b',
        },
        javascriptEnabled: true,
      },
    },
  },
  server: {
    host: true,
    port: Port,
    strictPort: true, // 端口已被占用则会直接退出
    proxy: Proxy,
  },
});
