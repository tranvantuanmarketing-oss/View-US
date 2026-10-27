import { Avatar, Gender } from "./types";

export interface MatchOptions {
  cardGender?: Gender | null;
  cardAge?: number | null;
  pageAvatars: Avatar[];
  lastUsedAvatarId?: string | null;
  usageCounts?: Record<string, number>; // avatarId -> count of usage
}

/**
 * Auto-match avatar for a story card based on narrator hint
 * Rules:
 * 1. Gender match (nu or nam)
 * 2. Age bracket contains hint (age_min <= cardAge <= age_max)
 * 3. Least recently used / lowest usage count
 * 4. Fallback to nearest age if no bracket match
 * 5. Avoid two consecutive videos having the exact same face
 */
export function matchAvatarForCard(options: MatchOptions): Avatar | null {
  const { cardGender, cardAge, pageAvatars, lastUsedAvatarId, usageCounts = {} } = options;

  if (!pageAvatars || pageAvatars.length === 0) return null;
  if (pageAvatars.length === 1) return pageAvatars[0];

  // Candidates avoiding immediate consecutive face
  let pool = pageAvatars.filter((a) => a.id !== lastUsedAvatarId);
  if (pool.length === 0) {
    pool = [...pageAvatars];
  }

  // Filter by gender if specified
  let genderPool = pool;
  if (cardGender) {
    const matchedGender = pool.filter((a) => a.gender === cardGender);
    if (matchedGender.length > 0) {
      genderPool = matchedGender;
    }
  }

  // Age matching
  const targetAge = cardAge || 35; // Default reference age if unspecified

  // 1. Strict bracket matches: age_min <= targetAge <= age_max
  const bracketMatches = genderPool.filter(
    (a) => a.age_min <= targetAge && targetAge <= a.age_max
  );

  let finalCandidates = bracketMatches.length > 0 ? bracketMatches : genderPool;

  // 2. Sort candidates by:
  //    a) Distance to age midpoint |targetAge - (min+max)/2|
  //    b) Least used (usageCounts)
  finalCandidates.sort((a, b) => {
    const usageA = usageCounts[a.id] || 0;
    const usageB = usageCounts[b.id] || 0;
    if (usageA !== usageB) {
      return usageA - usageB;
    }
    const midA = (a.age_min + a.age_max) / 2;
    const midB = (b.age_min + b.age_max) / 2;
    return Math.abs(targetAge - midA) - Math.abs(targetAge - midB);
  });

  return finalCandidates[0] || pageAvatars[0];
}
