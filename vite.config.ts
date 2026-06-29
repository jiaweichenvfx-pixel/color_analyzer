import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: { port: 5174 },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  worker: {
    format: "es",
  },
});
