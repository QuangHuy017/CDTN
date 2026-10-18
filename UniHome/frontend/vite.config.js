import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = { "/api": { target: env.BACKEND_URL || "http://127.0.0.1:3000", changeOrigin: true } };
  return {
    plugins: [react(), tailwindcss()],
    server: { host: "127.0.0.1", port: Number(env.FRONTEND_PORT || 5173), strictPort: true, proxy },
    preview: { host: "127.0.0.1", proxy },
  };
});
