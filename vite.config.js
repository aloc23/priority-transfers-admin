import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/priority-transfers-admin/',
  build: {
    // ...existing code...
    "scripts": {
      "build": "vite build",
      "deploy": "gh-pages -d dist"
    }
    // ...existing code...    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    
    export default defineConfig({
      plugins: [react()],
      base: '/priority-transfers-admin/',
      build: {
        outDir: 'dist'
      }
    })    // ...existing code...
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "deploy": "gh-pages -d dist"
    }
    // ...existing code...    outDir: 'dist'
  }
})