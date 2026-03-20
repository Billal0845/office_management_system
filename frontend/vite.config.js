import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // This sends the React build to the Laravel public folder
    outDir: "../backend/public",
    emptyOutDir: false, // Keep Laravel's index.php and .htaccess
  },
});
