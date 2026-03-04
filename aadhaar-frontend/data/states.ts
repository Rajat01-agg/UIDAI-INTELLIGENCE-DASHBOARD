/**
 * Canonical Indian States and Union Territories
 *
 * Single source of truth for all state/UT names, abbreviations, types, and IDs.
 * Backend data is mapped to these canonical entities before rendering.
 *
 * References:
 *  - Ministry of Home Affairs, Government of India
 *  - Census of India 2011 (district counts updated per latest delimitation)
 *
 * Total States: 28, Union Territories: 8 → 36 entities
 * Total Districts in India: ~780 (as of 2024 delimitation)
 */

// ============================================
// ENUMS & TYPES
// ============================================

export type EntityType = 'State' | 'UT';

export interface CanonicalStateUT {
  /** Stable numeric ID (ISO 3166-2:IN order) */
  id: number;
  /** Official name */
  name: string;
  /** Standard abbreviation (ISO 3166-2:IN or commonly accepted) */
  abbreviation: string;
  /** Whether it is a State or Union Territory */
  type: EntityType;
  /** Approximate number of districts (latest known) */
  districtCount: number;
}

// ============================================
// CANONICAL LIST (28 States + 8 UTs = 36)
// ============================================

export const CANONICAL_STATES_UTS: readonly CanonicalStateUT[] = Object.freeze([
  // ---------- States (28) ----------
  { id: 1,  name: 'Andhra Pradesh',       abbreviation: 'AP',  type: 'State', districtCount: 26 },
  { id: 2,  name: 'Arunachal Pradesh',    abbreviation: 'AR',  type: 'State', districtCount: 26 },
  { id: 3,  name: 'Assam',                abbreviation: 'AS',  type: 'State', districtCount: 35 },
  { id: 4,  name: 'Bihar',                abbreviation: 'BR',  type: 'State', districtCount: 38 },
  { id: 5,  name: 'Chhattisgarh',         abbreviation: 'CG',  type: 'State', districtCount: 33 },
  { id: 6,  name: 'Goa',                  abbreviation: 'GA',  type: 'State', districtCount: 2  },
  { id: 7,  name: 'Gujarat',              abbreviation: 'GJ',  type: 'State', districtCount: 33 },
  { id: 8,  name: 'Haryana',              abbreviation: 'HR',  type: 'State', districtCount: 22 },
  { id: 9,  name: 'Himachal Pradesh',     abbreviation: 'HP',  type: 'State', districtCount: 12 },
  { id: 10, name: 'Jharkhand',            abbreviation: 'JH',  type: 'State', districtCount: 24 },
  { id: 11, name: 'Karnataka',            abbreviation: 'KA',  type: 'State', districtCount: 31 },
  { id: 12, name: 'Kerala',               abbreviation: 'KL',  type: 'State', districtCount: 14 },
  { id: 13, name: 'Madhya Pradesh',       abbreviation: 'MP',  type: 'State', districtCount: 55 },
  { id: 14, name: 'Maharashtra',          abbreviation: 'MH',  type: 'State', districtCount: 36 },
  { id: 15, name: 'Manipur',              abbreviation: 'MN',  type: 'State', districtCount: 16 },
  { id: 16, name: 'Meghalaya',            abbreviation: 'ML',  type: 'State', districtCount: 12 },
  { id: 17, name: 'Mizoram',              abbreviation: 'MZ',  type: 'State', districtCount: 11 },
  { id: 18, name: 'Nagaland',             abbreviation: 'NL',  type: 'State', districtCount: 16 },
  { id: 19, name: 'Odisha',               abbreviation: 'OD',  type: 'State', districtCount: 30 },
  { id: 20, name: 'Punjab',               abbreviation: 'PB',  type: 'State', districtCount: 23 },
  { id: 21, name: 'Rajasthan',            abbreviation: 'RJ',  type: 'State', districtCount: 50 },
  { id: 22, name: 'Sikkim',               abbreviation: 'SK',  type: 'State', districtCount: 6  },
  { id: 23, name: 'Tamil Nadu',           abbreviation: 'TN',  type: 'State', districtCount: 38 },
  { id: 24, name: 'Telangana',            abbreviation: 'TS',  type: 'State', districtCount: 33 },
  { id: 25, name: 'Tripura',              abbreviation: 'TR',  type: 'State', districtCount: 8  },
  { id: 26, name: 'Uttar Pradesh',        abbreviation: 'UP',  type: 'State', districtCount: 75 },
  { id: 27, name: 'Uttarakhand',          abbreviation: 'UK',  type: 'State', districtCount: 13 },
  { id: 28, name: 'West Bengal',           abbreviation: 'WB',  type: 'State', districtCount: 23 },

  // ---------- Union Territories (8) ----------
  { id: 29, name: 'Andaman and Nicobar Islands',                    abbreviation: 'AN', type: 'UT', districtCount: 3 },
  { id: 30, name: 'Chandigarh',                                     abbreviation: 'CH', type: 'UT', districtCount: 1 },
  { id: 31, name: 'Daman and Diu',                                  abbreviation: 'DD', type: 'UT', districtCount: 3 },
  { id: 32, name: 'Delhi',                                          abbreviation: 'DL', type: 'UT', districtCount: 11 },
  { id: 33, name: 'Jammu and Kashmir',                              abbreviation: 'JK', type: 'UT', districtCount: 20 },
  { id: 34, name: 'Ladakh',                                         abbreviation: 'LA', type: 'UT', districtCount: 2  },
  { id: 35, name: 'Lakshadweep',                                    abbreviation: 'LD', type: 'UT', districtCount: 1  },
  { id: 36, name: 'Puducherry',                                     abbreviation: 'PY', type: 'UT', districtCount: 4  },
]) as CanonicalStateUT[];

/**
 * Total number of districts across India (~780).
 * Used to validate that high-risk district counts never exceed this ceiling.
 */
export const TOTAL_DISTRICTS_INDIA: number = CANONICAL_STATES_UTS.reduce(
  (sum, s) => sum + s.districtCount,
  0
);

// ============================================
// LOOKUP HELPERS
// ============================================

/** Map: lowercase name / common variants → canonical entry */
const _nameLookup: Map<string, CanonicalStateUT> = new Map();
/** Map: abbreviation (uppercase) → canonical entry */
const _abbrLookup: Map<string, CanonicalStateUT> = new Map();
/** Map: id → canonical entry */
const _idLookup: Map<number, CanonicalStateUT> = new Map();

// Common aliases / legacy / misspelled names that should resolve
const NAME_ALIASES: Record<string, string> = {
  // Legacy / renamed states
  'orissa': 'Odisha',
  'pondicherry': 'Puducherry',
  'uttaranchal': 'Uttarakhand',

  // Common misspellings
  'chattisgarh': 'Chhattisgarh',
  'chhatisgarh': 'Chhattisgarh',
  'chhattishgarh': 'Chhattisgarh',
  'jharkand': 'Jharkhand',
  'jharkhand': 'Jharkhand',
  'karnatak': 'Karnataka',
  'tamilnadu': 'Tamil Nadu',
  'tamil-nadu': 'Tamil Nadu',
  'andhrapradesh': 'Andhra Pradesh',
  'andhra': 'Andhra Pradesh',
  'arunachalpradesh': 'Arunachal Pradesh',
  'himachalpradesh': 'Himachal Pradesh',
  'himachal': 'Himachal Pradesh',
  'madhyapradesh': 'Madhya Pradesh',
  'uttarpradesh': 'Uttar Pradesh',
  'westbengal': 'West Bengal',
  'west-bengal': 'West Bengal',

  // Andaman & Nicobar variants
  'andaman & nicobar islands': 'Andaman and Nicobar Islands',
  'andaman and nicobar': 'Andaman and Nicobar Islands',
  'andaman & nicobar': 'Andaman and Nicobar Islands',
  'a&n islands': 'Andaman and Nicobar Islands',
  'a & n islands': 'Andaman and Nicobar Islands',
  'andaman': 'Andaman and Nicobar Islands',
  'andaman islands': 'Andaman and Nicobar Islands',

  // Dadra & Nagar Haveli and Daman & Diu variants
  'dadra & nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra & nagar haveli and daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra and nagar haveli and daman & diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'dadra & nagar haveli and daman and diu': 'Dadra and Nagar Haveli and Daman and Diu',
  'd&n haveli': 'Dadra and Nagar Haveli and Daman and Diu',
  'd & d': 'Dadra and Nagar Haveli and Daman and Diu',
  'dnhdd': 'Dadra and Nagar Haveli and Daman and Diu',

  // Jammu & Kashmir variants
  'jammu & kashmir': 'Jammu and Kashmir',
  'j&k': 'Jammu and Kashmir',
  'j & k': 'Jammu and Kashmir',
  'jammu': 'Jammu and Kashmir',
  'kashmir': 'Jammu and Kashmir',

  // Delhi variants
  'nct of delhi': 'Delhi',
  'nct delhi': 'Delhi',
  'delhi nct': 'Delhi',
  'new delhi': 'Delhi',
};

// Incorrect abbreviation mappings seen in legacy / pipeline data.
// Covers:
//   1. Known legacy codes
//   2. "First-2-letters-of-name" codes that the substring(0,2) fallback would produce
const ABBR_ALIASES: Record<string, string> = {
  // Legacy / renamed codes
  'OR': 'OD',   // Orissa → Odisha
  'UT': 'UK',   // Uttarakhand (often misassigned)
  'UTK': 'UK',  // Uttarakhand alt
  'CT': 'CG',   // Chhattisgarh
  'UA': 'UK',   // Uttaranchal

  // First-2-letters-of-name codes (the broken fallback path)
  'RA': 'RJ',   // Rajasthan
  'JA': 'JK',   // Jammu and Kashmir
  'DA': 'DD',   // Dadra / Daman
  'BI': 'BR',   // Bihar
  'SI': 'SK',   // Sikkim
  'GO': 'GA',   // Goa
  'GU': 'GJ',   // Gujarat
  'HA': 'HR',   // Haryana
  'HI': 'HP',   // Himachal Pradesh
  'KE': 'KL',   // Kerala
  'NA': 'NL',   // Nagaland
  'TA': 'TN',   // Tamil Nadu
  'TE': 'TS',   // Telangana
  'DE': 'DL',   // Delhi
  'PU': 'PY',   // Puducherry (PB/Punjab also starts PU but PB is canonical already)
  'ME': 'ML',   // Meghalaya

  // Other common errors
  'MA': 'MH',   // Maharashtra (often confused with Manipur MN)
  'WEB': 'WB',  // West Bengal typo
  'WE': 'WB',   // West Bengal 2-char
  'JM': 'JK',   // J&K typo
  'CHH': 'CG',  // Chhattisgarh
  'CH2': 'CG',  // legacy numbering
};

// Build indexes
for (const entry of CANONICAL_STATES_UTS) {
  _nameLookup.set(entry.name.toLowerCase(), entry);
  // Also index normalised form (e.g., "dadra and nagar haveli and daman and diu" without punctuation)
  const norm = entry.name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
  if (norm !== entry.name.toLowerCase()) _nameLookup.set(norm, entry);
  _abbrLookup.set(entry.abbreviation, entry);
  _idLookup.set(entry.id, entry);
}
for (const [alias, canonical] of Object.entries(NAME_ALIASES)) {
  const entry = _nameLookup.get(canonical.toLowerCase());
  if (entry) {
    _nameLookup.set(alias.toLowerCase(), entry);
    // Also index normalised form of alias
    const norm = alias.toLowerCase().replace(/&/g, 'and').replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
    if (norm !== alias.toLowerCase()) _nameLookup.set(norm, entry);
  }
}
for (const [alias, canonical] of Object.entries(ABBR_ALIASES)) {
  const entry = _abbrLookup.get(canonical);
  if (entry) _abbrLookup.set(alias, entry);
}

/**
 * Normalise a raw string for fuzzy lookup: strip &, -, extra spaces, lowercase.
 */
function _normalizeForLookup(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z\s]/g, '')   // strip non-alpha (except space)
    .replace(/\s+/g, ' ')       // collapse multiple spaces
    .trim();
}

/**
 * Resolve a raw state name (from API / database) to its canonical entry.
 *
 * Tries multiple strategies in order:
 *  1. Exact lowercase match on `_nameLookup`
 *  2. Normalised match (& → and, strip punctuation, collapse spaces)
 *  3. Treat the raw value as an abbreviation (handles DB rows like "WB", "JK")
 *  4. Best-prefix match: find the canonical name that starts with the input
 *
 * Returns `undefined` only when ALL strategies fail.
 */
export function resolveStateByName(rawName: string): CanonicalStateUT | undefined {
  if (!rawName) return undefined;
  const trimmed = rawName.trim();
  if (!trimmed) return undefined;

  // Strategy 1 — exact lowercase lookup (fast-path)
  const key = trimmed.toLowerCase();
  const exact = _nameLookup.get(key);
  if (exact) return exact;

  // Strategy 2 — normalised lookup (& → and, strip punctuation)
  const normalised = _normalizeForLookup(trimmed);
  if (normalised !== key) {
    const norMatch = _nameLookup.get(normalised);
    if (norMatch) return norMatch;
  }

  // Strategy 3 — try as abbreviation (backend sometimes stores "JK", "WB" etc.)
  const abbrMatch = _abbrLookup.get(trimmed.toUpperCase());
  if (abbrMatch) return abbrMatch;

  // Strategy 4 — best-prefix match (e.g., "Jammu" → "Jammu and Kashmir")
  for (const [canonical, entry] of _nameLookup) {
    if (canonical.startsWith(normalised) && normalised.length >= 3) {
      return entry;
    }
  }

  return undefined;
}

/**
 * Resolve a state abbreviation to its canonical entry.
 * Returns `undefined` if no match is found.
 */
export function resolveStateByAbbr(abbr: string): CanonicalStateUT | undefined {
  if (!abbr) return undefined;
  return _abbrLookup.get(abbr.trim().toUpperCase());
}

/**
 * Resolve by ID.
 */
export function resolveStateById(id: number): CanonicalStateUT | undefined {
  return _idLookup.get(id);
}

/**
 * Check if a raw state name is a known bogus / test entry that should be filtered out.
 * Examples: "1000", numeric-only strings, empty strings, single characters.
 */
export function isBogusState(rawName: string): boolean {
  if (!rawName || !rawName.trim()) return true;
  const t = rawName.trim();
  // Pure numeric (e.g., "1000")
  if (/^\d+$/.test(t)) return true;
  // Alphanumeric junk (e.g., "1000 10", "abc123")
  if (/^\d[\d\s]+$/.test(t)) return true;
  // Too short to be a real state name (< 2 alphabetic chars)
  if (t.replace(/[^a-zA-Z]/g, '').length < 2) return true;
  // Known test entries
  const lower = t.toLowerCase();
  if (['test', 'unknown', 'n/a', 'na', 'null', 'none', 'undefined', 'sample', 'demo', 'dummy'].includes(lower)) return true;
  return false;
}
