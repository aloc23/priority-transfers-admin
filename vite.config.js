import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/priority-transfers-admin/',
  build: {
<<<<<<< HEAD
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
=======
    outDir: 'docs'
>>>>>>> 32d62698d7a281151fe3963836fe718f2539da53
  }
})