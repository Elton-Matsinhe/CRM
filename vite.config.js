import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // permite acesso externo
    allowedHosts: ["92ba-102-222-88-49.ngrok-free.app"],
  },
});
