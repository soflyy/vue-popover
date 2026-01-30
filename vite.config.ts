import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(new URL("src/index.ts", import.meta.url).pathname),
      name: "VuePopover",
      fileName: "vue-popover",
    },
    rollupOptions: {
      external: ["vue", "@floating-ui/dom"],
      output: {
        globals: {
          vue: "Vue",
          "@floating-ui/dom": "FloatingUIDOM",
        },
      },
    },
  },
});
