import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  server: {
    port: 7777,
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      // Intercepts api calls and forward them to XAMPP.
      '/api': {
        target: 'http://localhost:80/Aquarius/backend',
        changeOrigin: true,
      },
      // Uploaded material files are written to /uploads and served by XAMPP,
      // not by Vite, so the links in the materials table need forwarding too.
      '/uploads': {
        target: 'http://localhost:80/Aquarius',
        changeOrigin: true,
      }
    }
  }
})
