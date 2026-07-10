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
    proxy: {
      // Intercepts api calls and forward them to XAMPP.
      '/api': {
        target: 'http://localhost:80/backend',
        changeOrigin: true,
      }
    }
  }
})
