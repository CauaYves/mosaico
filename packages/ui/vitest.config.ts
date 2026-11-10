import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // As entradas do registry (imports internos do kit, ver scripts/registry/config.ts) vêm antes
    // de "@multiclubes/ui", por serem mais específicas.
    alias: [
      {
        find: "@/registry/mosaico/components/mosaico",
        replacement: fileURLToPath(new URL("./src/components", import.meta.url)),
      },
      {
        find: "@/registry/mosaico/hooks/mosaico",
        replacement: fileURLToPath(new URL("./src/hooks", import.meta.url)),
      },
      {
        find: "@/registry/mosaico/lib/mosaico",
        replacement: fileURLToPath(new URL("./src/lib", import.meta.url)),
      },
      { find: "@multiclubes/ui", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
