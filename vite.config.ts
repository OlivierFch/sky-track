import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy Vite pour contourner CORS en dev :
// /celestrak/*  ->  https://celestrak.org/*
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/celestrak': {
        target: 'https://celestrak.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/celestrak/, ''),
      },
    },
  },
})
