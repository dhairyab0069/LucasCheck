import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // `server-only` throws outside Next's server build; tests run on the server side.
      "server-only": fileURLToPath(new URL("./tests/server-only-stub.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    // DATABASE_URL must be unset so the tests get the in-memory PGlite database.
    env: { DATABASE_URL: "" },
    testTimeout: 30_000,
  },
});
