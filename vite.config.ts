import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

const base = process.env.BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
