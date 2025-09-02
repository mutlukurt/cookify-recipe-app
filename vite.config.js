import { defineConfig } from 'vite'

export default defineConfig({
  base: '/cookify-recipe-app/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
