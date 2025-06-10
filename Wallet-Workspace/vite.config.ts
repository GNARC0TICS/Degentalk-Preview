import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
// Removed: import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal"; // Assuming not needed for local workspace

// Get the directory name from the URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // This is /Users/gnarcotic/Degentalk™/Wallet-Workspace
const projectRoot = path.resolve(__dirname); // This will be /Users/gnarcotic/Degentalk™/Wallet-Workspace

export default defineConfig({
  plugins: [
    react(),
    // runtimeErrorOverlay(), // Assuming not needed for local workspace
  ],
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "client", "src"),
      // "@shared": path.resolve(projectRoot, "shared"), // No top-level shared in workspace yet
      // "@assets": path.resolve(projectRoot, "attached_assets"), // No attached_assets in workspace yet
      // Aliases for db and schema if needed by any client-side imports (unlikely but possible)
      "@db": path.resolve(projectRoot, "server", "src", "core", "db.ts"), // Align with tsconfig.json
      "@schema": path.resolve(projectRoot, "db", "schema", "index.ts"),
      "@schema/*": path.resolve(projectRoot, "db", "schema/*"),
    },
  },
  root: path.resolve(projectRoot, "client"), // Vite root is client directory within workspace
  server: {
    port: 5174, // Use a different port than main project to avoid conflict
    proxy: {
      '/api': {
        target: 'http://localhost:5002', // Point to the standalone server's port
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: path.resolve(projectRoot, "dist/client"), // Output to dist/client within workspace
    emptyOutDir: true,
  },
  // css: {
  //   postcss: path.resolve(projectRoot, 'config/postcss.config.js') // TODO: Copy or create postcss.config.js if needed
  // }
});
