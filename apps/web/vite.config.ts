import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: ['VITE_', 'GOOGLE_MAP_API_KEY'],
  plugins: [
    vue({
      script: {
        defineModel: true,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
      {
        find: '@repo/model-meta/models',
        replacement: fileURLToPath(new URL('../../packages/model-meta/src/models', import.meta.url)),
      },
      {
        find: /^@repo\/model-meta$/,
        replacement: fileURLToPath(new URL('../../packages/model-meta/src/index.ts', import.meta.url)),
      },
      {
        find: /^@repo\/sdk$/,
        replacement: fileURLToPath(new URL('../../packages/sdk/src/index.ts', import.meta.url)),
      },
    ],
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
