import { fileURLToPath } from "url";
import { defineConfig, configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Inject describe, it and expect into global testing scope
    environment: "jsdom",
    alias: {
      //"@": "/src",
      "@/": fileURLToPath(new URL("./src/", import.meta.url)),
    },
    setupFiles: ["dotenv/config"],
  },
});
