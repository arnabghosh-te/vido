import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(),tailwindcss()],

  server: {
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5000",
        ws: true,
        changeOrigin: true,
      },
      "/rtc": {
        target: "http://localhost:7880",
        ws: true,
        changeOrigin: true,
      },
      "/twirp": {
        target: "http://localhost:7880",
        changeOrigin: true,
      }
    },
  },
});