import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "module";

// The version shown in the footer comes from package.json, which the release
// automation bumps. Reading it here means there is no second copy to forget.
const { version } = createRequire(import.meta.url)("./package.json") as { version: string };

export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    headers: {
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },
  plugins: [react()],
  build: {
    // Default esbuild minification; previously disabled, which shipped a
    // multi-megabyte unminified bundle.
    minify: "esbuild",
    sourcemap: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
