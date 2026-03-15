/**
 * Fuzzy search utilities for approximate string matching
 */

export interface FuzzyMatch {
  item: any;
  score: number;
  matches: {
    field: string;
    indices: number[];
  }[];
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a?.[i - 1] === b?.[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is perfect match)
 */
export function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const distance = levenshteinDistance(a.toLowerCase(), b.toLowerCase());
  const maxLength = Math.max(a.length, b.length);

  return 1 - distance / maxLength;
}

/**
 * Check if query is a substring of target (case-insensitive)
 */
export function containsSubstring(query: string, target: string): boolean {
  return target.toLowerCase().includes(query.toLowerCase());
}

/**
 * Check if query matches target using fuzzy matching
 */
export function fuzzyMatch(query: string, target: string, threshold: number = 0.6): boolean {
  if (containsSubstring(query, target)) return true;
  return stringSimilarity(query, target) >= threshold;
}

/**
 * Find all occurrences of query characters in target string
 */
export function findCharacterMatches(query: string, target: string): number[] {
  const queryChars = query.toLowerCase().split('');
  const targetChars = target.toLowerCase().split('');
  const matches: number[] = [];

  let queryIndex = 0;
  for (let i = 0; i < targetChars.length && queryIndex < queryChars.length; i++) {
    if (targetChars?.[i] === queryChars?.[queryIndex]) {
      matches.push(i);
      queryIndex++;
    }
  }

  return matches;
}

/**
 * Calculate fuzzy match score for a location
 */
export function calculateLocationScore(
  query: string,
  location: {
    name: string;
    country: string;
    admin1?: string;
  }
): number {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return 0;

  const name = location.name.toLowerCase();
  const country = location.country.toLowerCase();
  const admin1 = location.admin1?.toLowerCase() || '';

  let score = 0;
  let matchCount = 0;

  // Exact matches get highest score
  if (name === normalizedQuery) return 100;
  if (country === normalizedQuery) return 90;
  if (admin1 === normalizedQuery) return 85;

  // Starts with query gets high score
  if (name.startsWith(normalizedQuery)) {
    score += 80;
    matchCount++;
  }
  if (country.startsWith(normalizedQuery)) {
    score += 70;
    matchCount++;
  }
  if (admin1.startsWith(normalizedQuery)) {
    score += 65;
    matchCount++;
  }

  // Contains query gets medium score
  if (containsSubstring(normalizedQuery, name)) {
    score += 60;
    matchCount++;
  }
  if (containsSubstring(normalizedQuery, country)) {
    score += 50;
    matchCount++;
  }
  if (containsSubstring(normalizedQuery, admin1)) {
    score += 45;
    matchCount++;
  }

  // Fuzzy matching for typos
  const nameSimilarity = stringSimilarity(normalizedQuery, name);
  const countrySimilarity = stringSimilarity(normalizedQuery, country);
  const admin1Similarity = stringSimilarity(normalizedQuery, admin1);

  if (nameSimilarity >= 0.8) {
    score += nameSimilarity * 40;
    matchCount++;
  }
  if (countrySimilarity >= 0.8) {
    score += countrySimilarity * 30;
    matchCount++;
  }
  if (admin1Similarity >= 0.8) {
    score += admin1Similarity * 25;
    matchCount++;
  }

  // Word-based matching (e.g., "New York" matches "New")
  const queryWords = normalizedQuery.split(/\s+/);
  const nameWords = name.split(/\s+/);
  const countryWords = country.split(/\s+/);
  const admin1Words = admin1.split(/\s+/);

  queryWords.forEach(queryWord => {
    nameWords.forEach(nameWord => {
      if (nameWord.startsWith(queryWord) || stringSimilarity(queryWord, nameWord) >= 0.8) {
        score += 20;
        matchCount++;
      }
    });
    countryWords.forEach(countryWord => {
      if (countryWord.startsWith(queryWord) || stringSimilarity(queryWord, countryWord) >= 0.8) {
        score += 15;
        matchCount++;
      }
    });
    admin1Words.forEach(admin1Word => {
      if (admin1Word.startsWith(queryWord) || stringSimilarity(queryWord, admin1Word) >= 0.8) {
        score += 12;
        matchCount++;
      }
    });
  });

  // Boost score based on match count and query length
  if (matchCount > 0) {
    score += Math.min(matchCount * 5, 25);
    score += Math.min(normalizedQuery.length * 2, 20);
  }

  return Math.min(score, 100);
}

/**
 * Fuzzy search locations with ranking
 */
export function fuzzySearchLocations(
  query: string,
  locations: Array<{
    id: number;
    name: string;
    country: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }>,
  options: {
    maxResults?: number;
    minScore?: number;
    sortByRelevance?: boolean;
  } = {}
): FuzzyMatch[] {
  const { maxResults = 10, minScore = 20, sortByRelevance = true } = options;

  if (!query.trim()) return [];

  const matches: FuzzyMatch[] = [];

  locations.forEach(location => {
    const score = calculateLocationScore(query, location);

    if (score >= minScore) {
      matches.push({
        item: location,
        score,
        matches: [
          {
            field: 'name',
            indices: findCharacterMatches(query, location.name),
          },
          {
            field: 'country',
            indices: findCharacterMatches(query, location.country),
          },
          ...(location.admin1
            ? [
                {
                  field: 'admin1' as const,
                  indices: findCharacterMatches(query, location.admin1),
                },
              ]
            : []),
        ],
      });
    }
  });

  if (sortByRelevance) {
    matches.sort((a, b) => b.score - a.score);
  }

  return matches.slice(0, maxResults);
}

/**
 * Get popular cities for fallback suggestions
 */
export function getPopularCities(): Array<{
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}> {
  return [
    { id: 1, name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
    {
      id: 2,
      name: 'New York',
      country: 'United States',
      admin1: 'New York',
      latitude: 40.7128,
      longitude: -74.006,
    },
    { id: 3, name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
    { id: 4, name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
    { id: 5, name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
    { id: 6, name: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
    { id: 7, name: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173 },
    {
      id: 8,
      name: 'Dubai',
      country: 'United Arab Emirates',
      latitude: 25.2048,
      longitude: 55.2708,
    },
    { id: 9, name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
    {
      id: 10,
      name: 'Toronto',
      country: 'Canada',
      admin1: 'Ontario',
      latitude: 43.6532,
      longitude: -79.3832,
    },
    {
      id: 11,
      name: 'Mumbai',
      country: 'India',
      admin1: 'Maharashtra',
      latitude: 19.076,
      longitude: 72.8777,
    },
    {
      id: 12,
      name: 'São Paulo',
      country: 'Brazil',
      admin1: 'São Paulo',
      latitude: -23.5505,
      longitude: -46.6333,
    },
    { id: 13, name: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332 },
    { id: 14, name: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
    { id: 15, name: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018 },
  ];
}
