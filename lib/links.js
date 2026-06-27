// Builders for pretty item URLs, with a graceful fallback to the legacy
// query-string deep links when slug data isn't available. The legacy links
// still resolve (the profile page upgrades them to the pretty URL on load),
// so callers can always fall back safely.

export function categoryPath(handle, slug, id) {
  if (handle && slug) return `/${handle}/${slug}`;
  if (handle && id) return `/${handle}?tab=garden&item=${id}`;
  return '#';
}

export function workPath(handle, categorySlug, workSlug, id) {
  if (handle && categorySlug && workSlug) return `/${handle}/${categorySlug}/${workSlug}`;
  if (handle && id) return `/${handle}?tab=garden&item=${id}`;
  return '#';
}
