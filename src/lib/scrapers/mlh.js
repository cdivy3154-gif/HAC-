/**
 * MLH Scraper — Fetches hackathons from Major League Hacking
 *
 * MLH publishes their event schedule at mlh.io/seasons.
 * We scrape the public JSON-LD or HTML to extract events.
 */

const MLH_EVENTS_URL = "https://mlh.io/seasons/2025/events";
const SOURCE = "mlh";

/**
 * Extract hackathon data from MLH
 * @returns {Promise<Array>} Normalized hackathon objects
 */
export async function scrapeMLH() {
  try {
    const res = await fetch(MLH_EVENTS_URL, {
      headers: {
        "User-Agent": "HAC-Bot/1.0 (Hackathon Aggregator)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[HAC][MLH] HTTP ${res.status} — falling back to cache`);
      return getFallbackData();
    }

    const html = await res.text();
    return parseMLHEvents(html);
  } catch (err) {
    console.error(`[HAC][MLH] Scrape failed:`, err.message);
    return getFallbackData();
  }
}

/**
 * Parse MLH event data from HTML
 */
function parseMLHEvents(html) {
  const events = [];

  // Match event blocks — MLH uses structured divs with event data
  const eventRegex = /<div[^>]*class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
  const nameRegex = /<h3[^>]*>(.*?)<\/h3>/i;
  const dateRegex = /<p[^>]*class="[^"]*event-date[^"]*"[^>]*>(.*?)<\/p>/i;
  const locationRegex = /<span[^>]*class="[^"]*event-location[^"]*"[^>]*>(.*?)<\/span>/i;
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/i;
  const imageRegex = /<img[^>]*src="([^"]*)"[^>]*>/i;

  let match;
  while ((match = eventRegex.exec(html)) !== null) {
    const block = match[1];
    const name = nameRegex.exec(block)?.[1]?.replace(/<[^>]*>/g, "").trim();
    const dateStr = dateRegex.exec(block)?.[1]?.replace(/<[^>]*>/g, "").trim();
    const location = locationRegex.exec(block)?.[1]?.replace(/<[^>]*>/g, "").trim();
    const link = linkRegex.exec(block)?.[1];
    const image = imageRegex.exec(block)?.[1];

    if (name) {
      events.push(
        normalizeEvent({
          title: name,
          date_str: dateStr,
          location: location || "TBD",
          url: link,
          image_url: image,
        })
      );
    }
  }

  if (events.length === 0) {
    console.warn("[HAC][MLH] No events parsed from HTML — using fallback");
    return getFallbackData();
  }

  console.log(`[HAC][MLH] Scraped ${events.length} events`);
  return events;
}

/**
 * Normalize raw event into HAC format
 */
function normalizeEvent(raw) {
  const { startDate, endDate } = parseDateRange(raw.date_str);

  return {
    source: SOURCE,
    source_id: `mlh_${slugify(raw.title)}`,
    title: raw.title,
    organizer: "Major League Hacking",
    url: raw.url || `https://mlh.io`,
    image_url: raw.image_url || null,
    description: `MLH hackathon: ${raw.title}`,
    location: raw.location,
    mode: raw.location?.toLowerCase().includes("digital") ? "online" : "hybrid",
    start_date: startDate,
    end_date: endDate,
    registration_deadline: startDate,
    themes: ["General", "MLH"],
    tags: extractTags(raw.title),
    prize_pool: null,
    team_size: { min: 1, max: 4 },
    scraped_at: new Date().toISOString(),
  };
}

/**
 * Parse a date range string like "January 10th - 12th, 2025"
 */
function parseDateRange(str) {
  if (!str) return { startDate: null, endDate: null };
  try {
    // Try to extract dates from common formats
    const cleaned = str.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
    const parts = cleaned.split(/\s*[-–]\s*/);
    const startDate = new Date(parts[0]).toISOString();
    const endDate = parts[1]
      ? new Date(parts[1] + (parts[1].includes(",") ? "" : ", " + new Date().getFullYear())).toISOString()
      : startDate;
    return { startDate, endDate };
  } catch {
    return { startDate: null, endDate: null };
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function extractTags(title) {
  const tags = [];
  const keywords = {
    AI: ["ai", "artificial intelligence", "machine learning", "ml", "deep learning"],
    Web3: ["web3", "blockchain", "crypto", "defi", "nft", "ethereum"],
    Health: ["health", "med", "bio", "pharma"],
    Fintech: ["fin", "finance", "bank", "payment"],
    Education: ["edu", "learn", "school", "university"],
    Climate: ["climate", "green", "sustain", "environment"],
    Gaming: ["game", "gaming", "esport"],
  };
  const lower = title.toLowerCase();
  for (const [tag, kws] of Object.entries(keywords)) {
    if (kws.some((k) => lower.includes(k))) tags.push(tag);
  }
  if (tags.length === 0) tags.push("General");
  return tags;
}

/**
 * Fallback data when scraping fails
 */
function getFallbackData() {
  return [
    normalizeEvent({
      title: "HackMIT 2025",
      date_str: "September 14-15, 2025",
      location: "MIT, Cambridge, MA",
      url: "https://hackmit.org",
    }),
    normalizeEvent({
      title: "HackGT 11",
      date_str: "October 18-20, 2025",
      location: "Georgia Tech, Atlanta",
      url: "https://hack.gt",
    }),
    normalizeEvent({
      title: "TreeHacks 2026",
      date_str: "February 14-16, 2026",
      location: "Stanford University",
      url: "https://treehacks.com",
    }),
  ];
}
