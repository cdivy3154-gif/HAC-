import { NextResponse } from "next/server";
import { runAllScrapers, runScraper } from "@/lib/scrapers";
import { rankHackathons, findNewHackathons } from "@/lib/matching";

/**
 * POST /api/scrape — Trigger hackathon scraping
 *
 * Protected by SCRAPE_SECRET env var.
 * Can be called by:
 * - Vercel Cron (via vercel.json)
 * - External cron service (cron-job.org)
 * - Manual trigger from admin UI
 *
 * Query params:
 * - source: Run a single scraper (mlh, devpost, unstop, hackerearth)
 * - match: Include match scoring against a sample profile (true/false)
 */
export async function POST(request) {
  try {
    // Auth check
    const authHeader = request.headers.get("authorization");
    const secret = process.env.SCRAPE_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Unauthorized. Provide valid SCRAPE_SECRET." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const singleSource = searchParams.get("source");
    const includeMatch = searchParams.get("match") === "true";

    let hackathons;
    let stats;

    if (singleSource) {
      // Run a single scraper
      hackathons = await runScraper(singleSource);
      stats = {
        sources: { [singleSource]: { count: hackathons.length, status: "ok" } },
        total_raw: hackathons.length,
        total_deduped: hackathons.length,
      };
    } else {
      // Run all scrapers
      const result = await runAllScrapers();
      hackathons = result.hackathons;
      stats = result.stats;
    }

    // Optional: Match scoring against a sample profile
    let ranked = null;
    if (includeMatch) {
      const sampleProfile = {
        skills: ["React", "Node.js", "Python", "TypeScript"],
        interests: ["AI/ML", "Web3", "Open Source"],
        experience_level: "intermediate",
        preferred_mode: "any",
      };
      ranked = rankHackathons(hackathons, sampleProfile);
    }

    // TODO: In production, save to Supabase here
    // - Upsert hackathons into `scraped_hackathons` table
    // - Detect new entries for notification dispatch
    // - Cache previous source_ids for `findNewHackathons()`

    return NextResponse.json({
      success: true,
      hackathons: ranked || hackathons,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[HAC][Scrape API] Error:", error);
    return NextResponse.json(
      { error: "Scrape failed", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scrape — Health check & status
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const runNow = searchParams.get("run") === "true";

  if (runNow) {
    // Auth check for GET-triggered runs
    const secret = process.env.SCRAPE_SECRET;
    const authHeader = request.headers.get("authorization");
    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { hackathons, stats } = await runAllScrapers();
    return NextResponse.json({
      success: true,
      hackathons,
      stats,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    status: "ok",
    service: "HAC Scraping Engine",
    sources: ["mlh", "devpost", "unstop", "hackerearth"],
    endpoints: {
      "POST /api/scrape": "Run all scrapers (requires SCRAPE_SECRET)",
      "POST /api/scrape?source=mlh": "Run single scraper",
      "POST /api/scrape?match=true": "Run with match scoring",
      "GET /api/scrape?run=true": "Run via GET (requires SCRAPE_SECRET)",
    },
    cron: "Configured for every 6 hours via external cron service",
  });
}
