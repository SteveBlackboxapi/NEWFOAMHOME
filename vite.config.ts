import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const privateLab = process.env.VITE_PRIVATE_LAB === "true";

export default defineConfig({
  base:
    !privateLab && process.env.GITHUB_PAGES === "true" ? "/NEWFOAMHOME/" : "/",
  publicDir: privateLab ? false : "public",
  build: { outDir: privateLab ? "dist-lab" : "dist" },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT || "5173"),
  },
});
