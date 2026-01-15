import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // It tells Vite the name of your repository for the final URL.
  base: '/genie-weather/',
})