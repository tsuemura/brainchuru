export function normalize(source: string): string {
  return source.normalize("NFKC").replace(/[~〜ー]/g, "ー").toUpperCase();
}
