import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'SerializeAnyObject',
      fileName: 'index',
    },
  },
  plugins: [dts({
    include: './lib/**/*',
  })],
})
