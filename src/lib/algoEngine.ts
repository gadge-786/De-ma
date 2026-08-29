import { Note, UserTasteProfile, UserAlgoPreferences } from '../types';

const ALGO_STORAGE_KEY = 'red_user_algo_taste_profile_v1';

export const DEFAULT_ALGO_PREFERENCES: UserAlgoPreferences = {
  freshnessWeight: 0.45,
  discoveryBias: 0.35,
  shoppingBias: 0.3,
  boostedCategories: [],
};

const INITIAL_CATEGORY_WEIGHTS: Record<string, number> = {
  'Shows & Cinema': 18,
  'Trading': 16,
  'Fitness': 20,
  'Career': 17,
  'Food & Cafes': 22,
  'Fashion & OOTD': 25,
  'Skincare & Beauty': 20,
  'Home & Living': 24,
  'Travel & Lifestyle': 19,
  'Tech & Desk': 26,
};

const INITIAL_TAG_WEIGHTS: Record<string, number> = {
  'CinemaAesthetic': 12,
  'FilmPhotography': 15,
  'TradingSetup': 14,
  'Pilates': 16,
  'DeskSetup': 18,
  'TokyoCafe': 14,
  'CareerGrowth': 12,
  'GlassSkin': 15,
};

export function getUserTasteProfile(): UserTasteProfile {
  try {
    const raw = localStorage.getItem(ALGO_STORAGE_KEY);
    if (!raw) {
      const defaultProfile: UserTasteProfile = {
        categoryWeights: { ...INITIAL_CATEGORY_WEIGHTS },
        tagWeights: { ...INITIAL_TAG_WEIGHTS },
        creatorAffinities: {},
        preferences: { ...DEFAULT_ALGO_PREFERENCES },
        totalInteractions: 12,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(ALGO_STORAGE_KEY, JSON.stringify(defaultProfile));
      return defaultProfile;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading taste profile:', err);
    return {
      categoryWeights: { ...INITIAL_CATEGORY_WEIGHTS },
      tagWeights: { ...INITIAL_TAG_WEIGHTS },
      creatorAffinities: {},
      preferences: { ...DEFAULT_ALGO_PREFERENCES },
      totalInteractions: 12,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export function saveUserTasteProfile(profile: UserTasteProfile): void {
  try {
    profile.lastUpdated = new Date().toISOString();
    localStorage.setItem(ALGO_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving taste profile:', err);
  }
}

/**
 * Record user interactions (Implicit & Explicit signals)
 */
export function recordAlgoInteraction(
  type: 'like' | 'unlike' | 'save' | 'unsave' | 'view' | 'comment' | 'search' | 'category_click',
  payload: {
    note?: Note;
    category?: string;
    tag?: string;
    tags?: string[];
    creatorId?: string;
    searchTerm?: string;
  }
): UserTasteProfile {
  const profile = getUserTasteProfile();
  profile.totalInteractions += 1;

  const modifyCategory = (cat: string, points: number) => {
    profile.categoryWeights[cat] = Math.max(0, (profile.categoryWeights[cat] || 0) + points);
  };

  const modifyTag = (tag: string, points: number) => {
    const cleanTag = tag.replace(/^#/, '');
    profile.tagWeights[cleanTag] = Math.max(0, (profile.tagWeights[cleanTag] || 0) + points);
  };

  const modifyCreator = (creatorId: string, points: number) => {
    profile.creatorAffinities[creatorId] = Math.max(0, (profile.creatorAffinities[creatorId] || 0) + points);
  };

  if (payload.note) {
    const { category, tags, userId } = payload.note;

    switch (type) {
      case 'like':
        modifyCategory(category, 6);
        tags.forEach((t) => modifyTag(t, 4));
        if (userId) modifyCreator(userId, 5);
        break;
      case 'unlike':
        modifyCategory(category, -5);
        tags.forEach((t) => modifyTag(t, -3));
        if (userId) modifyCreator(userId, -4);
        break;
      case 'save':
        modifyCategory(category, 10);
        tags.forEach((t) => modifyTag(t, 6));
        if (userId) modifyCreator(userId, 8);
        break;
      case 'unsave':
        modifyCategory(category, -8);
        tags.forEach((t) => modifyTag(t, -5));
        if (userId) modifyCreator(userId, -6);
        break;
      case 'comment':
        modifyCategory(category, 8);
        tags.forEach((t) => modifyTag(t, 5));
        if (userId) modifyCreator(userId, 6);
        break;
      case 'view':
        modifyCategory(category, 1.5);
        tags.forEach((t) => modifyTag(t, 0.8));
        break;
    }
  }

  if (payload.category) {
    modifyCategory(payload.category, 3);
  }

  if (payload.tag) {
    modifyTag(payload.tag, 3);
  }

  if (payload.tags && payload.tags.length > 0) {
    payload.tags.forEach((t) => modifyTag(t, 2));
  }

  if (payload.creatorId) {
    modifyCreator(payload.creatorId, 3);
  }

  saveUserTasteProfile(profile);
  return profile;
}


/**
 * Personalized Instagram / RED algorithm score calculator:
 * Combines engagement velocity, user category affinity, tag synergy, creator loyalty,
 * recency decay, and user-tuned exploration balance.
 */
export function scoreNoteForUser(
  note: Note,
  profile: UserTasteProfile
): {
  algoScore: number;
  matchReason: string;
  matchPercentage: number;
} {
  const catWeight = profile.categoryWeights[note.category] || 0;
  
  // Find highest category weight for normalization
  const maxCatWeight = Math.max(...Object.values(profile.categoryWeights), 1);
  const normalizedCatAffinity = Math.min(1, catWeight / maxCatWeight);

  // Tag synergy
  let matchedTags: string[] = [];
  let tagBonus = 0;
  note.tags.forEach((tag) => {
    const cleanTag = tag.replace(/^#/, '');
    const weight = profile.tagWeights[cleanTag] || 0;
    if (weight > 5) {
      matchedTags.push(tag);
      tagBonus += Math.min(weight, 30);
    }
  });

  // Creator affinity
  const creatorBonus = profile.creatorAffinities[note.userId] || 0;

  // Base virality time-decay score
  const baseScore = note.score || 10;

  // Freshness calculation
  const createdTime = new Date(note.createdAt).getTime();
  const ageHours = Math.max(0.1, (Date.now() - createdTime) / (1000 * 60 * 60));
  const freshnessScore = Math.max(0, 100 / (1 + ageHours * 0.15));

  // Shoppable hotspots bonus if user prefers shopping
  const hotspotBonus = (note.hotspots && note.hotspots.length > 0) ? (profile.preferences.shoppingBias * 25) : 0;

  // Explicit user topic boost
  const isBoosted = profile.preferences.boostedCategories.includes(note.category);
  const boostMultiplier = isBoosted ? 1.45 : 1.0;

  // Discovery / Serendipity factor: random subtle jitter proportional to discoveryBias
  const serendipityJitter = (Math.sin(note.id.charCodeAt(note.id.length - 1) || 1) * 10 + 10) * profile.preferences.discoveryBias;

  // Composite Algorithmic Score
  const personalizedAffinity = (normalizedCatAffinity * 65) + (Math.min(tagBonus, 40)) + (Math.min(creatorBonus, 25));
  
  const weightedFreshness = freshnessScore * profile.preferences.freshnessWeight;
  const weightedBasePopularity = (baseScore * 0.8) * (1 - profile.preferences.freshnessWeight * 0.5);

  const finalAlgoScore = (personalizedAffinity + weightedFreshness + weightedBasePopularity + hotspotBonus + serendipityJitter) * boostMultiplier;

  // Match Percentage (scaled 72% to 99% for realistic human aesthetic feel)
  const rawPercentage = Math.round(72 + Math.min(27, (personalizedAffinity / 110) * 27));
  const matchPercentage = Math.min(99, Math.max(70, rawPercentage));

  // Match reason description
  let matchReason = '';
  if (isBoosted) {
    matchReason = `🔥 Boosted in ${note.category}`;
  } else if (matchedTags.length > 0) {
    matchReason = `✨ ${matchPercentage}% Match · Based on your ${matchedTags[0]} habits`;
  } else if (creatorBonus > 8) {
    matchReason = `💎 Favorite Creator · ${note.user?.displayName || 'Creator'}`;
  } else if (normalizedCatAffinity > 0.6) {
    matchReason = `🎯 ${matchPercentage}% Match · High affinity in ${note.category}`;
  } else if (ageHours < 8) {
    matchReason = `⚡ Fresh in your feed · ${note.category}`;
  } else {
    matchReason = `🌿 Explore recommendation for you`;
  }

  return {
    algoScore: Math.round(finalAlgoScore * 10) / 10,
    matchReason,
    matchPercentage,
  };
}
