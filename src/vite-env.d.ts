/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
// shims-global.d.ts

export {};

declare global {
  interface Window {
    deferredPrompt: any;
    ViteConst: {
      AppVersion: string;
      AppName: string;
      ProxyUrl: string;
      rmAgin: string;
    };
  }
}
