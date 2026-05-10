import { createWebHatcheryViteConfig } from '../../tools/shared/frontend/viteConfig';

export default createWebHatcheryViteConfig({
  slug: 'monsterworks',
  extraConfig: {
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  },
});
