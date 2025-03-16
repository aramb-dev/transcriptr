import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Removed the tailwindcss import since it's handled via PostCSS
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
