/**
 * Quality scoring and daily rotation for content ranking.
 *
 * Scoring philosophy:
 * - featured items (admin-curated) always appear first
 * - quality score = weighted signal of content richness + community engagement
 * - daily rotation: a date-seeded shuffle so the home page feels fresh each day
 *   while remaining stable within a single day
 */

// ---------- deterministic daily seed ----------

function daysSinceEpoch(date = new Date()) {
  return Math.floor(date.getTime() / 86400000);
}

/** Simple seeded PRNG (mulberry32) */
function seededRandom(seed) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Deterministic shuffle using the day as seed — same order all day, new order tomorrow */
function dailyShuffle(items, salt = '') {
  const day = daysSinceEpoch();
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const seed = day * 1000 + i + (salt ? hashStr(salt) : 0);
    const j = Math.floor(seededRandom(seed) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

// ---------- quality scoring ----------

/** Diminishing returns: first few count a lot, then tails off */
function diminish(n, weight) {
  return Math.log2((n || 0) + 1) * weight;
}

/**
 * Score a garden (profile).
 *
 * Signals:
 *  - follower_count       (social proof, diminishing)
 *  - category_count       (content richness)
 *  - work_count           (content richness)
 *  - has bio              (profile completeness)
 *  - has display_name     (profile completeness)
 */
function scoreGarden(g) {
  let s = 0;
  s += diminish(g.follower_count, 4);
  s += (g.category_count || 0) * 2;
  s += (g.work_count || 0) * 1;
  if (g.bio) s += 2;
  if (g.display_name) s += 1;
  return s;
}

// ---------- like count helper ----------

/**
 * Build a map of item_id → like count from an array of like rows.
 * @param {Array} likesData - rows from the likes table, each with an item_id field
 * @returns {Object} map of item_id → count
 */
function buildLikeMap(likesData) {
  const map = {};
  for (const l of (likesData || [])) {
    map[l.item_id] = (map[l.item_id] || 0) + 1;
  }
  return map;
}

/**
 * Score a category.
 *
 * Signals:
 *  - works_count           (content richness — a category with 10 works > 1 work)
 *  - has introduction       (curation effort)
 *  - owner follower_count   (social proof of curator)
 */
function scoreCategory(c) {
  let s = 0;
  s += (c.works_count || 0) * 2;
  if (c.introduction) s += 3;
  s += diminish(c.owner_followers, 2);
  s += diminish(c.like_count, 3);
  return s;
}

/**
 * Score a work.
 *
 * Signals:
 *  - has commentary          (curation effort — the whole point of AWG)
 *  - commentary length tier  (more thoughtful = higher)
 *  - owner follower_count    (social proof)
 */
function scoreWork(w) {
  let s = 0;
  if (w.commentary) {
    s += 3;
    if (w.commentary.length > 100) s += 2;
    if (w.commentary.length > 300) s += 2;
  }
  s += diminish(w.owner_followers, 2);
  s += diminish(w.like_count, 3);
  return s;
}

/**
 * Score a quote.
 *
 * Signals:
 *  - has attribution         (completeness)
 *  - has source              (completeness)
 *  - owner follower_count    (social proof)
 */
function scoreQuote(q) {
  let s = 0;
  if (q.attribution) s += 2;
  if (q.source) s += 2;
  s += diminish(q.owner_followers, 2);
  s += diminish(q.like_count, 3);
  return s;
}

// ---------- ranking pipeline ----------

/**
 * Rank a list of items:
 *  1. Featured items first (admin-curated)
 *  2. Within each group (featured / non-featured), sort by quality score desc
 *  3. Items with the same score get daily-rotated so the page feels fresh
 *
 * @param {Array} items - items to rank, each should have a `_score` and optionally `featured`
 * @param {string} salt - namespace for the daily shuffle (e.g. 'gardens', 'works')
 * @returns {Array} ranked items
 */
function rank(items, salt = '') {
  // Split featured vs regular
  const featured = items.filter((i) => i.featured);
  const regular = items.filter((i) => !i.featured);

  // Within each group, bucket by score then daily-shuffle within each bucket
  const sortBuckets = (list) => {
    // Group by score
    const buckets = {};
    for (const item of list) {
      const s = item._score || 0;
      if (!buckets[s]) buckets[s] = [];
      buckets[s].push(item);
    }
    // Sort bucket keys descending, shuffle within each bucket
    const scores = Object.keys(buckets).map(Number).sort((a, b) => b - a);
    const result = [];
    for (const s of scores) {
      result.push(...dailyShuffle(buckets[s], salt + s));
    }
    return result;
  };

  return [...sortBuckets(featured), ...sortBuckets(regular)];
}

// ---------- public API ----------

module.exports = {
  scoreGarden,
  scoreCategory,
  scoreWork,
  scoreQuote,
  rank,
  dailyShuffle,
  buildLikeMap,
};
