Below is a **copy-paste edit-script** your AI assistant can execute to build the site end-to-end (Astro + Tailwind + MDX, PL/EN routes, GitHub Pages deploy, promo-first `/project` page with **VST + Download**, **Composition**, **Research**).

After the script I answer your Codex question.

---

# EDIT-SCRIPT (for AI assistant)

## Rules of engagement

* **One phase = one PR/commit** (keeps diffs small).
* Prefer **creating new files** over editing existing ones to minimize conflicts.
* Internal links must be **GitHub Pages base-path safe** (repo pages vs custom domain). Astro’s `base` setting affects this. ([docs.astro.build][1])
* Keep binaries/audio **external** (GitHub Pages size/bandwidth limits). ([GitHub Docs][2])

---

## Phase 0 — Scaffold (Astro + Tailwind + MDX)

### 0.1 Create project

```bash
npm create astro@latest scholarship-portfolio
cd scholarship-portfolio
npm install
npx astro add tailwind
npx astro add mdx
```

### 0.2 Repo hygiene

* Ensure a lockfile is committed (Astro deploy action detects package manager via lockfile). ([docs.astro.build][3])

---

## Phase 1 — GitHub Pages base-path safety (must-do)

### 1.1 Edit `astro.config.mjs`

**Goal:** support both:

* Repo pages: `https://user.github.io/<repo>/` (needs `base: '/<repo>'`) ([docs.astro.build][3])
* User pages / custom domain: no base

**Replace entire file with:**

```js
import { defineConfig } from 'astro/config';

// If you use a custom domain or a repo named "username.github.io", base should be "/"
function computeBase() {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const owner = process.env.GITHUB_REPOSITORY_OWNER;
  if (!repo || !owner) return '/';
  if (repo === `${owner}.github.io`) return '/';
  // typical GitHub Pages repo site
  return `/${repo}`;
}

export default defineConfig({
  site: process.env.SITE_URL || 'https://username.github.io',
  base: process.env.BASE_PATH || computeBase(),
});
```

### 1.2 Create `src/lib/paths.ts`

```ts
export function withBase(path: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // e.g. "/repo" or ""
  if (!path.startsWith('/')) path = `/${path}`;
  return `${base}${path}`;
}
```

---

## Phase 2 — i18n routing & language switch (PL/EN)

### 2.1 Create `src/lib/i18n.ts`

```ts
export type Lang = 'pl' | 'en';
export const LANGS: Lang[] = ['pl', 'en'];
export const DEFAULT_LANG: Lang = 'pl';

function stripBase(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base) return pathname;
  return pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
}

function addBase(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base) return pathname;
  return `${base}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
}

export function getLangFromPath(pathname: string): Lang {
  const p = stripBase(pathname);
  const seg = p.split('/').filter(Boolean)[0];
  return seg === 'en' ? 'en' : 'pl';
}

export function swapLangInPath(pathname: string, to: Lang): string {
  const p = stripBase(pathname);
  const parts = p.split('/').filter(Boolean);

  if (parts.length === 0) return addBase(`/${to}/`);

  if (parts[0] === 'pl' || parts[0] === 'en') parts[0] = to;
  else parts.unshift(to);

  const out = `/${parts.join('/')}${p.endsWith('/') ? '/' : ''}`;
  return addBase(out);
}
```

### 2.2 Create `src/components/LanguageSwitch.astro`

```astro
---
import { getLangFromPath, swapLangInPath, type Lang } from '../lib/i18n';

const { pathname } = Astro.url;
const current = getLangFromPath(pathname);

function linkFor(lang: Lang) {
  return swapLangInPath(pathname, lang);
}
---

<div class="flex items-center gap-1 text-xs">
  <a class={`px-2 py-1 rounded ${current === 'pl' ? 'bg-white/10' : 'hover:bg-white/5'}`} href={linkFor('pl')}>PL</a>
  <a class={`px-2 py-1 rounded ${current === 'en' ? 'bg-white/10' : 'hover:bg-white/5'}`} href={linkFor('en')}>EN</a>
</div>
```

---

## Phase 3 — Layout (art-portfolio look)

### 3.1 Create `src/layouts/PageLayout.astro`

```astro
---
import LanguageSwitch from '../components/LanguageSwitch.astro';
import { withBase } from '../lib/paths';

const { title, description, lang } = Astro.props;

const L = (lang ?? 'pl');
const home = withBase(`/${L}/`);
const project = withBase(`/${L}/project/`);
const downloads = withBase(`/${L}/downloads/`);
const updates = withBase(`/${L}/updates/`);
const bio = withBase(`/${L}/bio/`);
---

<!doctype html>
<html lang={L}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
  </head>

  <body class="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-white/20">
    <header class="sticky top-0 z-50 backdrop-blur bg-zinc-950/60 border-b border-white/10">
      <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <a class="font-semibold tracking-tight hover:opacity-80" href={home}>GS</a>

        <nav class="flex items-center gap-4 text-sm">
          <a class="hover:opacity-80" href={project}>Project</a>
          <a class="hover:opacity-80" href={downloads}>Downloads</a>
          <a class="hover:opacity-80" href={updates}>Updates</a>
          <a class="hover:opacity-80" href={bio}>Bio</a>
          <LanguageSwitch />
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-10">
      <slot />
    </main>

    <footer class="border-t border-white/10">
      <div class="mx-auto max-w-6xl px-4 py-8 text-sm text-zinc-400">
        <div class="flex flex-col gap-2">
          <div>© {new Date().getFullYear()} • Scholarship project portfolio</div>
          <div class="opacity-80">Astro • GitHub Pages</div>
        </div>
      </div>
    </footer>
  </body>
</html>
```

---

## Phase 4 — Core UI components (MVP)

Create these files exactly (no extra dependencies):

### 4.1 `src/components/HeroCta.astro`

```astro
---
const { title, subtitle, imageSrc, primaryCta, secondaryCtas = [] } = Astro.props;
---

<section class="grid gap-8 md:grid-cols-2 items-center">
  <div class="space-y-5">
    <h1 class="text-4xl md:text-5xl font-semibold tracking-tight">{title}</h1>
    {subtitle && <p class="text-zinc-300 text-lg leading-relaxed">{subtitle}</p>}

    <div class="flex flex-wrap gap-3 pt-2">
      <a class="px-4 py-2 rounded-lg bg-white text-zinc-950 font-medium hover:opacity-90"
         href={primaryCta?.href} target={primaryCta?.href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {primaryCta?.label}
      </a>

      {secondaryCtas.map((c) => (
        <a class="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5"
           href={c.href} target={c.href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          {c.label}
        </a>
      ))}
    </div>
  </div>

  <div class="rounded-2xl border border-white/10 bg-white/5 p-3">
    <img src={imageSrc} alt="" class="w-full h-auto rounded-xl" loading="eager" />
  </div>
</section>
```

### 4.2 `src/components/FeatureGrid.astro`

```astro
---
const { items = [] } = Astro.props;
---

<div class="grid gap-4 md:grid-cols-3">
  {items.map((it) => (
    <a href={it.href} class="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
      <div class="text-lg font-semibold">{it.title}</div>
      <div class="text-sm text-zinc-300 mt-2 leading-relaxed">{it.text}</div>
    </a>
  ))}
</div>
```

### 4.3 `src/components/ReleaseCard.astro`

```astro
---
const { name, version, date, downloadUrl, notes = [], checksum } = Astro.props;
---

<div class="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
  <div class="flex flex-wrap items-baseline justify-between gap-2">
    <div class="text-lg font-semibold">{name}</div>
    <div class="text-sm text-zinc-300">{version} • {date}</div>
  </div>

  <a class="inline-flex px-4 py-2 rounded-lg bg-white text-zinc-950 font-medium hover:opacity-90"
     href={downloadUrl} target="_blank" rel="noreferrer">
    Download (external)
  </a>

  {notes.length > 0 && (
    <ul class="text-sm text-zinc-300 list-disc pl-5 space-y-1">
      {notes.map((n) => <li>{n}</li>)}
    </ul>
  )}

  {checksum && (
    <div class="text-xs text-zinc-400">
      {checksum.algo}: <span class="font-mono break-all">{checksum.value}</span>
    </div>
  )}
</div>
```

### 4.4 `src/components/MediaEmbedYouTube.astro`

```astro
---
const { url } = Astro.props;
---

<div class="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
  <div class="aspect-video">
    <iframe
      class="w-full h-full"
      src={url}
      title="YouTube"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </div>
</div>
```

### 4.5 `src/components/MediaEmbedSoundCloud.astro`

```astro
---
const { url } = Astro.props;
---

<div class="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
  <iframe
    width="100%"
    height="166"
    scrolling="no"
    frameborder="no"
    allow="autoplay"
    src={url}
    loading="lazy"
  ></iframe>
</div>
```

### 4.6 `src/components/Timeline.astro`

```astro
---
const { items = [] } = Astro.props;
const pill = (s) =>
  s === 'done' ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25' :
  s === 'in-progress' ? 'bg-amber-500/15 text-amber-200 border-amber-500/25' :
  'bg-white/10 text-zinc-200 border-white/15';
---

<div class="rounded-2xl border border-white/10 bg-white/5 p-5">
  <div class="space-y-3">
    {items.map((it) => (
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="font-medium">{it.label}</div>
        <div class="flex items-center gap-3">
          <div class="text-sm text-zinc-300">{it.date}</div>
          <div class={`text-xs px-2 py-1 rounded-full border ${pill(it.status)}`}>{it.status}</div>
        </div>
      </div>
    ))}
  </div>
</div>
```

### 4.7 `src/components/CTAContact.astro`

```astro
---
const { title, text, primary, secondary = [] } = Astro.props;
---

<section class="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
  <div class="text-2xl font-semibold">{title}</div>
  <p class="text-zinc-300 leading-relaxed">{text}</p>

  <div class="flex flex-wrap gap-3">
    <a class="px-4 py-2 rounded-lg bg-white text-zinc-950 font-medium hover:opacity-90"
       href={primary.href} target={primary.href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
      {primary.label}
    </a>
    {secondary.map((s) => (
      <a class="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5"
         href={s.href} target="_blank" rel="noreferrer">
        {s.label}
      </a>
    ))}
  </div>
</section>
```

---

## Phase 5 — Pages (PL/EN) + MDX project landing

### 5.1 Create page shells (Astro)

Create the following files:

#### `src/pages/pl/index.astro`

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import { withBase } from '../../lib/paths';
---

<PageLayout lang="pl" title="Portfolio" description="Audio dev + audio art">
  <div class="space-y-6">
    <h1 class="text-4xl font-semibold">Portfolio</h1>
    <p class="text-zinc-300">Audio development • audio art • research</p>

    <a class="inline-flex px-4 py-2 rounded-lg bg-white text-zinc-950 font-medium hover:opacity-90"
       href={withBase('/pl/project/')}>
      Przejdź do projektu
    </a>
  </div>
</PageLayout>
```

#### `src/pages/en/index.astro` (same idea)

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import { withBase } from '../../lib/paths';
---

<PageLayout lang="en" title="Portfolio" description="Audio dev + audio art">
  <div class="space-y-6">
    <h1 class="text-4xl font-semibold">Portfolio</h1>
    <p class="text-zinc-300">Audio development • audio art • research</p>

    <a class="inline-flex px-4 py-2 rounded-lg bg-white text-zinc-950 font-medium hover:opacity-90"
       href={withBase('/en/project/')}>
      View project
    </a>
  </div>
</PageLayout>
```

### 5.2 Create `/project` MDX (PL/EN)

Create:

* `src/pages/pl/project.mdx`
* `src/pages/en/project.mdx`

Use the MDX drafts you already approved, but **update internal links** to use `/pl/...` and `/en/...` (they’ll still work because we rely on Astro base + `withBase` for nav; for MDX internal links keep them as root `/pl/...` style—Astro will prefix assets correctly via `base`, and you can later swap to `withBase` if needed).

Also add `public/images/plugin-hero.png` placeholder now.

### 5.3 Create Downloads, Updates, Bio pages

Create empty but styled pages:

#### `src/pages/pl/downloads.astro` and `/en/downloads.astro`

* show latest ReleaseCard (hardcoded first; collections later)
* include anchor `#docs`

#### `src/pages/pl/updates/index.astro` + `/en/updates/index.astro`

* simple “Updates soon” placeholder

#### `src/pages/pl/bio.astro` + `/en/bio.astro`

* short bio + links

---

## Phase 6 — Deployment to GitHub Pages (official Astro action)

Astro recommends their official GitHub Action for Pages. ([docs.astro.build][3])

### 6.1 Add `.github/workflows/deploy.yml`

Create exactly:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v5

      - name: Install, build, and upload your site
        uses: withastro/action@v5
        env:
          SITE_URL: https://${{ github.repository_owner }}.github.io
          # BASE_PATH is auto computed in astro.config.mjs unless you override it here:
          # BASE_PATH: /${{ github.event.repository.name }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 6.2 GitHub repo settings

* Settings → Pages → **Source: GitHub Actions**

---

## Phase 7 — Optional: Custom domain

If/when you move to `twojadomena.pl`, Astro docs recommend adding a `public/CNAME` and setting `site` to your domain (and removing `base`). ([docs.astro.build][3])

For now, your `astro.config.mjs` already supports overriding:

* `SITE_URL=https://twojadomena.pl`
* `BASE_PATH=/` (or leave empty)

---

## Phase 8 — QA checklist

* `npm run build` produces `dist/`
* Links work in repo pages URL (`/repo/pl/...`) and in dev
* Download buttons go to external hosting
* SoundCloud/YouTube embeds render

