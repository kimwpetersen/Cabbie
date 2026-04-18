// vite.config.js
import { defineConfig } from 'vite';

const portal = process.env.VITE_PORTAL || 'dev';
const repoName = process.env.VITE_REPO_NAME; // for GitHub Pages deploy

export default defineConfig({
  base: portal === 'dev' && repoName ? `/${repoName}/` : './',
  define: {
    __PORTAL__: JSON.stringify(portal),
  },
  build: {
    outDir: `dist/${portal}`,
    assetsDir: 'assets',
    emptyOutDir: true,
  },
});
