/**
 * Matching Engine — Score hackathons against user profiles
 *
 * Calculates a 0–100 match score based on:
 * - Skill overlap with hackathon tags/themes (40%)
 * - Interest alignment (30%)
 * - Experience level fit (15%)
 * - Mode preference (10%)
 * - Recency bonus (5%)
 */

/**
 * Score a hackathon against a user profile
 * @param {Object} hackathon - Normalized hackathon object
 * @param {Object} profile - User profile
 * @returns {Object} { score, breakdown, hackathon }
 */
export function scoreMatch(hackathon, profile) {
  const breakdown = {
    skills: 0,
    interests: 0,
    experience: 0,
    mode: 0,
    recency: 0,
  };

  // 1. Skill Match (40%) — check if user's skills match hackathon tags/themes
  const userSkills = (profile.skills || []).map((s) => s.toLowerCase());
  const hackTags = [
    ...(hackathon.tags || []),
    ...(hackathon.themes || []),
  ].map((t) => t.toLowerCase());

  if (userSkills.length > 0 && hackTags.length > 0) {
    const skillMatches = userSkills.filter((skill) =>
      hackTags.some((tag) => tag.includes(skill) || skill.includes(tag))
    );
    breakdown.skills = Math.min(
      40,
      (skillMatches.length / Math.max(userSkills.length, 1)) * 50
    );
  }

  // Also check hackathon description for skill mentions
  const desc = (hackathon.description || "").toLowerCase();
  const descSkillHits = userSkills.filter((s) => desc.includes(s)).length;
  breakdown.skills = Math.min(40, breakdown.skills + descSkillHits * 5);

  // 2. Interest Match (30%) — check user interests vs themes
  const userInterests = (profile.interests || []).map((i) => i.toLowerCase());
  if (userInterests.length > 0) {
    const interestMatches = userInterests.filter((interest) =>
      hackTags.some((tag) => tag.includes(interest) || interest.includes(tag))
    );
    breakdown.interests = Math.min(
      30,
      (interestMatches.length / Math.max(userInterests.length, 1)) * 40
    );
  }

  // 3. Experience Level Fit (15%)
  const level = profile.experience_level || "beginner";
  const teamMax = hackathon.team_size?.max || 5;
  const hasPrize = !!hackathon.prize_pool;

  if (level === "beginner") {
    // Beginners prefer smaller, less competitive hackathons
    breakdown.experience = teamMax <= 4 && !hasPrize ? 15 : 8;
  } else if (level === "intermediate") {
    // Intermediates are flexible
    breakdown.experience = 12;
  } else if (level === "veteran") {
    // Veterans prefer competitive hackathons with prizes
    breakdown.experience = hasPrize ? 15 : 10;
  }

  // 4. Mode Preference (10%)
  const mode = hackathon.mode || "online";
  const preferredMode = profile.preferred_mode || "any";
  if (preferredMode === "any" || mode === preferredMode) {
    breakdown.mode = 10;
  } else if (mode === "hybrid") {
    breakdown.mode = 7;
  } else {
    breakdown.mode = 3;
  }

  // 5. Recency Bonus (5%) — upcoming events score higher
  if (hackathon.start_date) {
    const daysUntilStart = Math.ceil(
      (new Date(hackathon.start_date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilStart > 0 && daysUntilStart <= 30) {
      breakdown.recency = 5;
    } else if (daysUntilStart > 30 && daysUntilStart <= 90) {
      breakdown.recency = 3;
    } else if (daysUntilStart > 90) {
      breakdown.recency = 1;
    } else {
      breakdown.recency = 0; // past event
    }
  }

  const score = Math.round(
    breakdown.skills +
    breakdown.interests +
    breakdown.experience +
    breakdown.mode +
    breakdown.recency
  );

  return {
    score: Math.min(100, score),
    breakdown,
    hackathon,
  };
}

/**
 * Score and rank all hackathons against a user profile
 * @param {Array} hackathons - Array of normalized hackathon objects
 * @param {Object} profile - User profile
 * @returns {Array} Ranked results with scores, best matches first
 */
export function rankHackathons(hackathons, profile) {
  if (!profile || !hackathons || hackathons.length === 0) {
    return hackathons.map((h) => ({ score: 50, breakdown: {}, hackathon: h }));
  }

  const scored = hackathons.map((h) => scoreMatch(h, profile));
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

/**
 * Get match tier label from score
 */
export function getMatchTier(score) {
  if (score >= 80) return { tier: "perfect", label: "Perfect Match", color: "green" };
  if (score >= 60) return { tier: "great", label: "Great Match", color: "green" };
  if (score >= 40) return { tier: "good", label: "Good Match", color: "gold" };
  if (score >= 20) return { tier: "fair", label: "Fair Match", color: "gray" };
  return { tier: "low", label: "Low Match", color: "gray" };
}

/**
 * Find new hackathons that weren't in the previous scrape
 * Used for notification dispatch
 * @param {Array} current - Current scrape results
 * @param {Array} previous - Previous scrape results (source_ids)
 * @returns {Array} New hackathons not in previous set
 */
export function findNewHackathons(current, previousIds = []) {
  const prevSet = new Set(previousIds);
  return current.filter((h) => !prevSet.has(h.source_id));
}
