import { defineConfig } from 'vite';
// Builds into ../new so GitHub Pages serves it at /ecc-desk/new/ next to the old app.html.
export default defineConfig({
  base: './',
  build: { outDir: '../new', emptyOutDir: true },
});
