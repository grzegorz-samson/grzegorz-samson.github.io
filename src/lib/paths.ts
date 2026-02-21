export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${safePath}`;
}

