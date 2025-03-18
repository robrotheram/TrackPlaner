import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { VitePWA } from 'vite-plugin-pwa';
 
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the service worker
      manifest: {
        name: 'TrackPlanner',
        short_name: 'TrackPlanner',
        description: 'TrackPlanner',
        theme_color: '#000',
        icons: [
          {
            src: '/logo.svg',
            sizes: 'any',
            type: 'image/svg',
          },
        ],
      },
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base:"/TrackPlaner/"
})