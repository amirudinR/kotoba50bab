import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      workbox: {
        // Data per bab sengaja TIDAK di-precache: 50 chunk itu ~430 KB dan
        // hanya dibutuhkan saat bab terkait dibuka. Precache semuanya akan
        // membatalkan tujuan lazy-load. Setelah pernah diambil, chunk disimpan
        // oleh cache runtime Workbox sehingga tetap tersedia offline.
        globIgnores: ["**/bab-*.json", "**/search-*.json"],
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith(".json"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "kotoba-data",
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 90 },
            },
          },
        ],
      },
      manifest: {
        name: "Kotoba - Hafalan Minna no Nihongo",
        short_name: "Kotoba",
        description: "Aplikasi hafalan kosakata Minna no Nihongo bab 1-50",
        theme_color: "#2b4c7e",
        background_color: "#f5efe0",
        display: "standalone",
        orientation: "portrait",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            // Dedicated maskable icon: the mark is scaled into Android's
            // 80%-diameter safe circle so it is not cropped on home screens.
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
