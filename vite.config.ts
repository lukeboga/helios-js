import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      // Entry point for the library
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NaturalLanguageRRule',
      // Output formats for the library
      formats: ['es', 'cjs'],
      fileName: (format) => `nl-rrule.${format}.js`
    },
    rollupOptions: {
      // Externalize dependencies to avoid bundling them
      external: ['rrule'],
      output: {
        // Globals for UMD build
        globals: {
          rrule: 'RRule'
        }
      }
    },
    // Output to the out directory as per your structure
    outDir: 'out',
    // Generate source maps
    sourcemap: true
  }
});
