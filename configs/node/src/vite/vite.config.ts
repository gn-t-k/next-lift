import { externalPlugin } from '@praha/vite-plugin-external';
import { defineConfig } from 'vite';

export const node = defineConfig({
  esbuild: {
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
    keepNames: true,
  },
  build: {
    target: 'ESNext',
    lib: {
      entry: ['src/index.ts'],
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].mjs',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [
    externalPlugin(),
  ],
});
