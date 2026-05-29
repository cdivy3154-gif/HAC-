/**
 * Scraper Orchestrator — Runs all scrapers, deduplicates, categorizes
 *
 * Coordinates the scraping pipeline:
 * 1. Run all scrapers in parallel
 * 2. Deduplicate by title similarity
 * 3. Extract & normalize tags
 * 4. Return unified hackathon list
 */

import { scrapeMLH } from "./mlh";
import { scrapeDevpost } from "./devpost";
import { scrapeUnstop } from "./unstop";
import { scrapeHackerEarth } from "./hackerearth";

/**
 * Run all scrapers and return deduplicated results
 * @returns {Promise<{hackathons: Array, stats: Object}>}
 */
export async function runAllScrapers() {
  const startTime = Date.now();
  const stats = {
    sources: {},
    total_raw: 0,
    total_deduped: 0,
    duration_ms: 0,
    errors: [],
  };

  // Run all scrapers in parallel with individual error handling
  const results = await Promise.allSettled([
    scrapeMLH(),
    scrapeDevpost(),
    scrapeUnstop(),
    scrapeHackerEarth(),
  ]);

  const sourceNames = ["mlh", "devpost", "unstop", "hackerearth"];
  let allHackathons = [];

  results.forEach((result, i) => {
    const name = sourceNames[i];
    if (result.status === "fulfilled") {
      const items = result.value || [];
      stats.sources[name] = { count: items.length, status: "ok" };
      allHackathons = allHackathons.concat(items);
    } else {
      stats.sources[name] = { count: 0, status: "error", error: result.reason?.message };
      stats.errors.push(`${name}: ${result.reason?.message}`);
    }
  });

  stats.total_raw = allHackathons.length;

  // Deduplicate
  const deduplicated = deduplicateHackathons(allHackathons);
  stats.total_deduped = deduplicated.length;

  // Sort by start date (nearest first)
  deduplicated.sort((a, b) => {
    if (!a.start_date) return 1;
    if (!b.start_date) return -1;
    return new Date(a.start_date) - new Date(b.start_date);
  });

  stats.duration_ms = Date.now() - startTime;

  console.log(
    `[HAC][Orchestrator] Scraped ${stats.total_raw} → ${stats.total_deduped} hackathons in ${stats.duration_ms}ms`
  );

  return { hackathons: deduplicated, stats };
}

/**
 * Deduplicate hackathons by title similarity
 * Uses normalized title comparison with Jaccard similarity
 */
function deduplicateHackathons(hackathons) {
  const seen = new Map(); // normalized_key -> hackathon

  for (const hack of hackathons) {
    const key = normalizeKey(hack.title);

    if (seen.has(key)) {
      // Merge: keep the one with more data
      const existing = seen.get(key);
      seen.set(key, mergeHackathons(existing, hack));
    } else {
      // Check for fuzzy duplicates
      let isDupe = false;
      for (const [existingKey] of seen) {
        if (jaccardSimilarity(key, existingKey) > 0.7) {
          const existing = seen.get(existingKey);
          seen.set(existingKey, mergeHackathons(existing, hack));
          isDupe = true;
          break;
        }
      }
      if (!isDupe) {
        seen.set(key, hack);
      }
    }
  }

  return Array.from(seen.values());
}

/**
 * Create a normalized key from a title for deduplication
 */
function normalizeKey(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate Jaccard similarity between two strings (word-level)
 */
function jaccardSimilarity(a, b) {
  const setA = new Set(a.split(" ").filter(Boolean));
  const setB = new Set(b.split(" ").filter(Boolean));
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Merge two hackathon entries — prefer more complete data
 */
function mergeHackathons(a, b) {
  return {
    ...a,
    description: (a.description?.length || 0) >= (b.description?.length || 0) ? a.description : b.description,
    image_url: a.image_url || b.image_url,
    prize_pool: a.prize_pool || b.prize_pool,
    start_date: a.start_date || b.start_date,
    end_date: a.end_date || b.end_date,
    registration_deadline: a.registration_deadline || b.registration_deadline,
    themes: [...new Set([...(a.themes || []), ...(b.themes || [])])],
    tags: [...new Set([...(a.tags || []), ...(b.tags || [])])],
    sources: [...new Set([a.source, b.source])],
  };
}

/**
 * Run a single scraper by name
 */
export async function runScraper(name) {
  switch (name) {
    case "mlh":
      return scrapeMLH();
    case "devpost":
      return scrapeDevpost();
    case "unstop":
      return scrapeUnstop();
    case "hackerearth":
      return scrapeHackerEarth();
    default:
      throw new Error(`Unknown scraper: ${name}`);
  }
}
