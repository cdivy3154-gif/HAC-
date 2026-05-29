/**
 * Unstop Scraper — Fetches hackathons from Unstop (formerly D2C)
 *
 * Unstop has a public API for competitions/hackathons.
 */

const UNSTOP_API = "https://unstop.com/api/public/opportunity/search-new";
const SOURCE = "unstop";

/**
 * Scrape hackathons from Unstop
 * @returns {Promise<Array>} Normalized hackathon objects
 */
export async function scrapeUnstop() {
  try {
    const payload = {
      opportunity: ["hackathons"],
      oppstatus: "open",
      sort: "nearest_deadline",
      page: 1,
      per_page: 20,
    };

    const res = await fetch(UNSTOP_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "HAC-Bot/1.0 (Hackathon Aggregator)",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.warn(`[HAC][Unstop] HTTP ${res.status} — falling back`);
      return getFallbackData();
    }

    const data = await res.json();
    const opportunities = data?.data?.data || [];

    if (opportunities.length === 0) {
      console.warn("[HAC][Unstop] No opportunities — using fallback");
      return getFallbackData();
    }

    const normalized = opportunities.map(normalizeEvent);
    console.log(`[HAC][Unstop] Scraped ${normalized.length} hackathons`);
    return normalized;
  } catch (err) {
    console.error(`[HAC][Unstop] Scrape failed:`, err.message);
    return getFallbackData();
  }
}

/**
 * Normalize Unstop opportunity into HAC format
 */
function normalizeEvent(opp) {
  return {
    source: SOURCE,
    source_id: `unstop_${opp.id || slugify(opp.title)}`,
    title: opp.title || "Untitled Hackathon",
    organizer: opp.organisation?.name || "Unstop",
    url: opp.public_url
      ? `https://unstop.com${opp.public_url}`
      : `https://unstop.com/hackathons/${opp.id}`,
    image_url: opp.banner_mobile || opp.banner || null,
    description: stripHtml(opp.seo_details?.description || opp.details?.content || ""),
    location: opp.festival?.city || "Online",
    mode: opp.type === "online" ? "online" : opp.type === "offline" ? "in-person" : "hybrid",
    start_date: opp.start_date || null,
    end_date: opp.end_date || null,
    registration_deadline: opp.regnRequirements?.end_regn_dt || null,
    themes: opp.filters?.map((f) => f.name) || ["General"],
    tags: extractTags(opp.title || ""),
    prize_pool: opp.isPaid ? `₹${(opp.prizes || 0).toLocaleString()}` : null,
    team_size: {
      min: opp.regnRequirements?.min_team_size || 1,
      max: opp.regnRequirements?.max_team_size || 4,
    },
    registrations_count: opp.registerCount || 0,
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

function extractTags(title) {
  const tags = [];
  const lower = title.toLowerCase();
  const keywords = {
    AI: ["ai", "artificial intelligence", "machine learning", "ml", "deep learning"],
    Web3: ["web3", "blockchain", "crypto"],
    Health: ["health", "med", "bio"],
    Fintech: ["fin", "finance", "fintech"],
    Education: ["edu", "learn", "edtech"],
    "Smart India": ["sih", "smart india"],
    IoT: ["iot", "hardware", "embedded"],
    Social: ["social", "impact"],
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
      source_id: "unstop_sih_2025",
      title: "Smart India Hackathon 2025",
      organizer: "Government of India",
      url: "https://unstop.com/hackathons/smart-india-hackathon-2025",
      image_url: null,
      description: "India's biggest open innovation hackathon with problem statements from government ministries.",
      location: "Multiple Cities, India",
      mode: "in-person",
      start_date: "2025-12-11",
      end_date: "2025-12-12",
      registration_deadline: "2025-10-15",
      themes: ["Government", "Innovation", "Social Impact"],
      tags: ["Smart India", "Social"],
      prize_pool: "₹10,00,000",
      team_size: { min: 6, max: 6 },
      scraped_at: new Date().toISOString(),
    },
    {
      source: SOURCE,
      source_id: "unstop_flipkart_grid",
      title: "Flipkart GRiD 6.0",
      organizer: "Flipkart",
      url: "https://unstop.com/hackathons/flipkart-grid-6",
      image_url: null,
      description: "E-commerce focused engineering challenge by Flipkart.",
      location: "Online",
      mode: "online",
      start_date: "2025-08-01",
      end_date: "2025-09-15",
      registration_deadline: "2025-07-25",
      themes: ["E-commerce", "Engineering"],
      tags: ["General"],
      prize_pool: "₹5,00,000",
      team_size: { min: 1, max: 3 },
      scraped_at: new Date().toISOString(),
    },
  ];
}
