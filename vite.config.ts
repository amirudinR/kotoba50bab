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
