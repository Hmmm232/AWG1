// Slug helpers for pretty URLs (categories & works).
// Slugs are generated from a title once, on creation, and then frozen —
// renaming an item does not change its slug, so shared links never break.

const MAX_SLUG_LENGTH = 60;

// Turn a title into a URL-safe base slug: lowercase, hyphen-separated,
// alphanumerics only. Falls back to 'untitled' when nothing survives.
export function slugify(text) {
  const base = (text || '')
    .toString()
    .normalize('NFKD')                  // split accents from their letters
    .replace(/[̀-ͯ]/g, '')    // strip the accent marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')        // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, '')            // trim leading/trailing hyphens
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');               // re-trim if the slice left a hyphen

  return base || 'untitled';
}

// Given a desired title and the set of slugs already taken in the same
// scope (a user's categories, or a category's works), return a unique slug:
// `rome`, then `rome-2`, `rome-3`, …
export function uniqueSlug(text, takenSlugs = []) {
  const taken = new Set(takenSlugs);
  const base = slugify(text);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
