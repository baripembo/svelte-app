import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/svelte-app/',
  plugins: [svelte()],
  resolve: {
    alias: {
      "$components": path.resolve("./src/components"),
      "pages": path.resolve("./src/pages")
    }
  }
})
