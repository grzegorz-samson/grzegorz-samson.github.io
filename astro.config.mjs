// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

function computeBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  if (!repo || !owner) return '/';
  if (repo === `${owner}.github.io`) return '/';
  return `/${repo}`;
}

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL || 'https://username.github.io',
  base: process.env.BASE_PATH || computeBase(),
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx()]
});
