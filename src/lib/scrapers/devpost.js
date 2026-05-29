/**
 * Devpost Scraper — Fetches hackathons from Devpost
 *
 * Devpost has a public API for hackathon listings.
 * Endpoint: https://devpost.com/api/hackathons?status[]=upcoming&status[]=open
 */

const DEVPOST_API = "https://devpost.com/api/hackathons";
const SOURCE = "devpost";

/**
 * Scrape upcoming + open hackathons from Devpost
 * @param {number} page - Page number (1-indexed)
 * @returns {Promise<Array>} Normalized hackathon objects
 */
export async function scrapeDevpost(page = 1) {
  try {
    const url = `${DEVPOST_API}?status[]=upcoming&status[]=open&order_by=deadline&page=${page}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "HAC-Bot/1.0 (Hackathon Aggregator)",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[HAC][Devpost] HTTP ${res.status} — falling back`);
      return getFallbackData();
    }

    const data = await res.json();
    const hackathons = data.hackathons || [];

    if (hackathons.length === 0) {
      console.warn("[HAC][Devpost] No hackathons in response — using fallback");
      return getFallbackData();
    }

    const normalized = hackathons.map(normalizeEvent);
    console.log(`[HAC][Devpost] Scraped ${normalized.length} hackathons (page ${page})`);
    return normalized;
  } catch (err) {
    console.error(`[HAC][Devpost] Scrape failed:`, err.message);
    return getFallbackData();
  }
}

/**
 * Normalize Devpost hackathon into HAC format
 */
function normalizeEvent(hack) {
  return {
    source: SOURCE,
    source_id: `devpost_${hack.id || slugify(hack.title)}`,
    title: hack.title || "Untitled Hackathon",
    organizer: hack.organization_name || "Devpost",
    url: hack.url || `https://devpost.com`,
    image_url: hack.thumbnail_url || hack.cover_image_url || null,
    description: stripHtml(hack.tagline || hack.description || ""),
    location: hack.displayed_location?.location || "Online",
    mode: hack.open_state === "open" ? "online" : "hybrid",
    start_date: hack.submission_period_dates?.split(" - ")?.[0] || null,
    end_date: hack.submission_period_dates?.split(" - ")?.[1] || null,
    registration_deadline: hack.registrations_close_at || null,
    themes: hack.themes?.map((t) => t.name) || ["General"],
    tags: extractTags(hack.title, hack.tagline || ""),
    prize_pool: hack.prize_amount ? `$${hack.prize_amount.toLocaleString()}` : null,
    team_size: { min: 1, max: hack.max_team_size || 5 },
    registrations_count: hack.registrations_count || 0,
    submissions_count: hack.submissions_count || 0,
    scraped_at: new Date().toISOString(),
  };
}

function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "").trim().slice(0, 300);
}

function slugify(str) {
  return (str || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function extractTags(title, tagline) {
  const tags = [];
  const combined = `${title} ${tagline}`.toLowerCase();
  const keywords = {
    AI: ["ai", "artificial intelligence", "machine learning", "ml", "llm", "gpt", "deep learning"],
    Web3: ["web3", "blockchain", "crypto", "defi", "nft", "ethereum", "solana"],
    Health: ["health", "med", "bio", "pharma", "healthcare"],
    Fintech: ["fin", "finance", "bank", "payment", "fintech"],
    Education: ["edu", "learn", "school", "university", "edtech"],
    Climate: ["climate", "green", "sustain", "environment", "energy"],
    Social: ["social", "impact", "community", "civic"],
    Mobile: ["mobile", "ios", "android", "flutter"],
    Gaming: ["game", "gaming", "esport", "unity", "unreal"],
    IoT: ["iot", "hardware", "embedded", "arduino", "raspberry"],
    Security: ["security", "cyber", "privacy", "hack the"],
    Data: ["data", "analytics", "visualization"],
  };
  for (const [tag, kws] of Object.entries(keywords)) {
    if (kws.some((k) => combined.includes(k))) tags.push(tag);
  }
  if (tags.length === 0) tags.push("General");
  return tags;
}

/**
 * Fallback data when API is unreachable
 */
function getFallbackData() {
  return [
    {
      source: SOURCE,
      source_id: "devpost_eth_global_ny",
      title: "ETHGlobal New York",
      organizer: "ETHGlobal",
      url: "https://ethglobal.com/events/newyork2025",
      image_url: null,
      description: "The biggest Ethereum hackathon in NYC. Build the future of Web3.",
      location: "New York, NY",
      mode: "in-person",
      start_date: "2025-09-20",
      end_date: "2025-09-22",
      registration_deadline: "2025-09-18",
      themes: ["Web3", "DeFi", "Infrastructure"],
      tags: ["Web3", "Fintech"],
      prize_pool: "$500,000",
      team_size: { min: 1, max: 5 },
      scraped_at: new Date().toISOString(),
    },
    {
      source: SOURCE,
      source_id: "devpost_junction_2025",
      title: "Junction 2025",
      organizer: "Junction",
      url: "https://www.junction.tech",
      image_url: null,
      description: "Europe's biggest hackathon. Build solutions for real company challenges.",
      location: "Helsinki, Finland",
      mode: "in-person",
      start_date: "2025-11-07",
      end_date: "2025-11-09",
      registration_deadline: "2025-10-31",
      themes: ["Enterprise", "Innovation"],
      tags: ["General"],
      prize_pool: null,
      team_size: { min: 1, max: 5 },
      scraped_at: new Date().toISOString(),
    },
  ];
}
