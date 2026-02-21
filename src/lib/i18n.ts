export type Lang = 'pl' | 'en';

const LANG_SEGMENTS: Lang[] = ['pl', 'en'];

function stripBase(pathname: string): string {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base) return pathname;
  if (!pathname.startsWith(base)) return pathname;
  return pathname.slice(base.length) || '/';
}

function addBase(pathname: string): string {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
  if (!base) return pathname;
  return `${base}${pathname}`;
}

export function getLangFromPath(pathname: string): Lang {
  const clean = stripBase(pathname);
  const segment = clean.split('/').filter(Boolean)[0];
  return segment === 'en' ? 'en' : 'pl';
}

export function swapLangInPath(pathname: string, to: Lang): string {
  const clean = stripBase(pathname);
  const parts = clean.split('/').filter(Boolean);

  if (parts.length === 0) return addBase(`/${to}/`);
  if (LANG_SEGMENTS.includes(parts[0] as Lang)) {
    parts[0] = to;
  } else {
    parts.unshift(to);
  }

  const trailingSlash = clean.endsWith('/') ? '/' : '';
  return addBase(`/${parts.join('/')}${trailingSlash}`);
}

