import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true,

    allowedHosts: [
      "app.portal-imp.com",
      "api.portal-imp.com",
      "portal-imp.com",
      "localhost",
      "127.0.0.1",
      "7c29-102-222-88-49.ngrok-free.app",
    ],
  },
});