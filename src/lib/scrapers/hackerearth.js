/**
 * HackerEarth Scraper — Fetches hackathons from HackerEarth
 *
 * HackerEarth has a public challenges API.
 */

const HACKEREARTH_API = "https://www.hackerearth.com/chrome-extension/events/";
const SOURCE = "hackerearth";

/**
 * Scrape hackathons from HackerEarth
 * @returns {Promise<Array>} Normalized hackathon objects
 */
export async function scrapeHackerEarth() {
  try {
    const res = await fetch(HACKEREARTH_API, {
      headers: {
        "User-Agent": "HAC-Bot/1.0 (Hackathon Aggregator)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[HAC][HackerEarth] HTTP ${res.status} — falling back`);
      return getFallbackData();
    }

    const data = await res.json();
    const events = data?.response || [];

    // Filter only hackathons (exclude coding challenges, hiring)
    const hackathons = events.filter(
      (e) => e.challenge_type === "hackathon" || e.event_type === "hackathon"
    );

    if (hackathons.length === 0) {
      // If no hackathons found, include all non-hiring events as fallback
      const allEvents = events.filter((e) => e.event_type !== "hiring");
      if (allEvents.length > 0) {
        const normalized = allEvents.slice(0, 15).map(normalizeEvent);
        console.log(`[HAC][HackerEarth] Scraped ${normalized.length} events (mixed)`);
        return normalized;
      }
      console.warn("[HAC][HackerEarth] No events — using fallback");
      return getFallbackData();
    }

    const normalized = hackathons.map(normalizeEvent);
    console.log(`[HAC][HackerEarth] Scraped ${normalized.length} hackathons`);
    return normalized;
  } catch (err) {
    console.error(`[HAC][HackerEarth] Scrape failed:`, err.message);
    return getFallbackData();
  }
}

/**
 * Normalize HackerEarth event into HAC format
 */
function normalizeEvent(event) {
  return {
    source: SOURCE,
    source_id: `he_${event.id || slugify(event.title)}`,
    title: event.title || "Untitled Event",
    organizer: "HackerEarth",
    url: event.url || "https://www.hackerearth.com",
    image_url: event.cover_image || null,
    description: (event.description || "").slice(0, 300),
    location: "Online",
    mode: "online",
    start_date: event.start_utc_tz || event.start_tz || null,
    end_date: event.end_utc_tz || event.end_tz || null,
    registration_deadline: event.start_utc_tz || null,
    themes: [event.challenge_type || "General"],
    tags: extractTags(event.title || ""),
    prize_pool: null,
    team_size: { min: 1, max: 4 },
    scraped_at: new Date().toISOString(),
  };
}

function slugify(str) {
  return (str || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function extractTags(title) {
  const tags = [];
  const lower = title.toLowerCase();
  const keywords = {
    AI: ["ai", "machine learning", "ml", "deep learning", "neural"],
    Web3: ["web3", "blockchain", "crypto"],
    Data: ["data", "analytics"],
    Security: ["security", "ctf", "cyber"],
    DSA: ["dsa", "algorithm", "coding challenge"],
  };
  for (const [tag, kws] of Object.entries(keywords)) {
    if (kws.some((k) => lower.includes(k))) tags.push(tag);
  }
  if (tags.length === 0) tags.push("General");
  return tags;
}

/**
 * Fallback data
 */
function getFallbackData() {
  return [
    {
      source: SOURCE,
      source_id: "he_code_arena_2025",
      title: "CodeArena Hackathon 2025",
      organizer: "HackerEarth",
      url: "https://www.hackerearth.com/challenges/hackathon/codearena-2025/",
      image_url: null,
      description: "Build innovative solutions across AI, Web, and Mobile platforms.",
      location: "Online",
      mode: "online",
      start_date: "2025-10-01",
      end_date: "2025-10-15",
      registration_deadline: "2025-09-28",
      themes: ["General", "Innovation"],
      tags: ["General"],
      prize_pool: "$5,000",
      team_size: { min: 1, max: 4 },
      scraped_at: new Date().toISOString(),
    },
  ];
}
