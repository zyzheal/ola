// vite.config.ts
import { defineConfig } from "file:///Users/heal/devops/ai-platform-design/implementation/tools/packages/webui/node_modules/vite/dist/node/index.js";
import react from "file:///Users/heal/devops/ai-platform-design/implementation/tools/node_modules/@vitejs/plugin-react/dist/index.js";
import dts from "file:///Users/heal/devops/ai-platform-design/implementation/tools/packages/webui/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/Users/heal/devops/ai-platform-design/implementation/tools/packages/webui";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      outDir: "dist",
      rollupTypes: true,
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "QwenCodeWebUI",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return "index.js";
        if (format === "cjs") return "index.cjs";
        if (format === "umd") return "index.umd.js";
        return "index.js";
      }
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime"
        },
        assetFileNames: "styles.[ext]"
      }
    },
    sourcemap: true,
    minify: false,
    cssCodeSplit: false
  }
});
export {
  vite_config_default as default
};
/**
* @license
* Copyright 2025 Qwen Team
* SPDX-License-Identifier: Apache-2.0
*/
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaGVhbC9kZXZvcHMvYWktcGxhdGZvcm0tZGVzaWduL2ltcGxlbWVudGF0aW9uL3Rvb2xzL3BhY2thZ2VzL3dlYnVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvaGVhbC9kZXZvcHMvYWktcGxhdGZvcm0tZGVzaWduL2ltcGxlbWVudGF0aW9uL3Rvb2xzL3BhY2thZ2VzL3dlYnVpL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9oZWFsL2Rldm9wcy9haS1wbGF0Zm9ybS1kZXNpZ24vaW1wbGVtZW50YXRpb24vdG9vbHMvcGFja2FnZXMvd2VidWkvdml0ZS5jb25maWcudHNcIjsvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAyNSBRd2VuIFRlYW1cbiAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gKi9cblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIFZpdGUgY29uZmlndXJhdGlvbiBmb3IgQGFpLXBsYXRmb3JtL3dlYnVpIGxpYnJhcnlcbiAqXG4gKiBCdWlsZCBvdXRwdXRzOlxuICogLSBFU006IGRpc3QvaW5kZXguanMgKHByaW1hcnkgZm9ybWF0KVxuICogLSBDSlM6IGRpc3QvaW5kZXguY2pzIChjb21wYXRpYmlsaXR5KVxuICogLSBVTUQ6IGRpc3QvaW5kZXgudW1kLmpzIChmb3IgQ0ROIHVzYWdlKVxuICogLSBUeXBlU2NyaXB0IGRlY2xhcmF0aW9uczogZGlzdC9pbmRleC5kLnRzXG4gKiAtIENTUzogZGlzdC9zdHlsZXMuY3NzIChvcHRpb25hbCBzdHlsZXMpXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGR0cyh7XG4gICAgICBpbmNsdWRlOiBbJ3NyYyddLFxuICAgICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgICByb2xsdXBUeXBlczogdHJ1ZSxcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgIG5hbWU6ICdRd2VuQ29kZVdlYlVJJyxcbiAgICAgIGZvcm1hdHM6IFsnZXMnLCAnY2pzJywgJ3VtZCddLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IHtcbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ2VzJykgcmV0dXJuICdpbmRleC5qcyc7XG4gICAgICAgIGlmIChmb3JtYXQgPT09ICdjanMnKSByZXR1cm4gJ2luZGV4LmNqcyc7XG4gICAgICAgIGlmIChmb3JtYXQgPT09ICd1bWQnKSByZXR1cm4gJ2luZGV4LnVtZC5qcyc7XG4gICAgICAgIHJldHVybiAnaW5kZXguanMnO1xuICAgICAgfSxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC9qc3gtcnVudGltZSddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJyxcbiAgICAgICAgICAncmVhY3QvanN4LXJ1bnRpbWUnOiAnUmVhY3RKU1hSdW50aW1lJyxcbiAgICAgICAgfSxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdzdHlsZXMuW2V4dF0nLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBtaW5pZnk6IGZhbHNlLFxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFNQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFDbEIsT0FBTyxTQUFTO0FBQ2hCLFNBQVMsZUFBZTtBQVR4QixJQUFNLG1DQUFtQztBQXFCekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0YsU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUNmLFFBQVE7QUFBQSxNQUNSLGFBQWE7QUFBQSxNQUNiLGtCQUFrQjtBQUFBLElBQ3BCLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQ3hDLE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxNQUFNLE9BQU8sS0FBSztBQUFBLE1BQzVCLFVBQVUsQ0FBQyxXQUFXO0FBQ3BCLFlBQUksV0FBVyxLQUFNLFFBQU87QUFDNUIsWUFBSSxXQUFXLE1BQU8sUUFBTztBQUM3QixZQUFJLFdBQVcsTUFBTyxRQUFPO0FBQzdCLGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLFNBQVMsYUFBYSxtQkFBbUI7QUFBQSxNQUNwRCxRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsVUFDYixxQkFBcUI7QUFBQSxRQUN2QjtBQUFBLFFBQ0EsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsSUFDQSxXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsRUFDaEI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
