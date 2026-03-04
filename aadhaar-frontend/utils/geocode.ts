/**
 * Mapbox Geocoding Utility
 *
 * Uses the Mapbox SDK `forwardGeocode` to resolve district + state names
 * into accurate [lat, lng] coordinates. Results are cached in
 * localStorage so the API is called at most once per district.
 */

// @ts-ignore — mapbox-sdk ships CJS, not full TS declarations
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const MAPBOX_TOKEN: string =
  (import.meta as any).env?.VITE_MAPBOX_ACCESS_TOKEN || '';

// Instantiate geocoding service once
const geocodingClient = MAPBOX_TOKEN ? mbxGeocoding({ accessToken: MAPBOX_TOKEN }) : null;

// ── In-memory cache ───────────────────────────────────────────────
const memoryCache = new Map<string, [number, number]>();

// ── localStorage persistence ──────────────────────────────────────
const LS_KEY = 'district_geocode_cache';

function loadPersistedCache(): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed: Record<string, [number, number]> = JSON.parse(raw);
      for (const [k, v] of Object.entries(parsed)) {
        memoryCache.set(k, v);
      }
    }
  } catch { /* ignore corrupt data */ }
}

function persistCache(): void {
  try {
    const obj: Record<string, [number, number]> = {};
    memoryCache.forEach((v, k) => { obj[k] = v; });
    localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch { /* storage full — ignore */ }
}

// Load once on module init
loadPersistedCache();

/** Build a stable cache key */
function cacheKey(district: string, state: string): string {
  return `${district.trim().toLowerCase()}|${state.trim().toLowerCase()}`;
}

// ── India bounding box [minLng, minLat, maxLng, maxLat] ───────────
const INDIA_BBOX: [number, number, number, number] = [68.0, 6.5, 97.5, 37.5];

/**
 * Geocode a single district using Mapbox SDK `forwardGeocode`.
 * Returns [lat, lng] or null if not found.
 */
async function geocodeDistrict(
  district: string,
  state: string,
): Promise<[number, number] | null> {
  if (!geocodingClient) return null;

  try {
    const response = await geocodingClient
      .forwardGeocode({
        query: `${district}, ${state}, India`,
        countries: ['IN'],
        types: ['place', 'locality', 'district'],
        bbox: INDIA_BBOX,
        limit: 1,
      })
      .send();

    const feature = response.body?.features?.[0];
    if (!feature) return null;

    // Mapbox returns [lng, lat] — we store [lat, lng]
    const [lng, lat] = feature.center;
    return [lat, lng];
  } catch {
    return null;
  }
}

/**
 * Get coordinates for a district. Returns cached value immediately
 * if available, otherwise calls forwardGeocode and caches the result.
 */
export async function getDistrictCoordsAsync(
  district: string,
  state: string,
): Promise<[number, number]> {
  const key = cacheKey(district, state);

  // 1. Check cache
  const cached = memoryCache.get(key);
  if (cached) return cached;

  // 2. forwardGeocode via Mapbox SDK
  const coords = await geocodeDistrict(district, state);
  if (coords) {
    memoryCache.set(key, coords);
    persistCache();
    return coords;
  }

  // 3. Fallback: India center
  return [22.0, 78.0];
}

/**
 * Batch-geocode an array of { district, state } pairs.
 * Runs up to `concurrency` requests in parallel to stay
 * within Mapbox rate-limits while being fast.
 */
export async function batchGeocode(
  items: Array<{ district: string; state: string }>,
  concurrency = 5,
): Promise<Map<string, [number, number]>> {
  const results = new Map<string, [number, number]>();

  // Separate already-cached from uncached
  const toFetch: Array<{ district: string; state: string; key: string }> = [];
  for (const item of items) {
    const key = cacheKey(item.district, item.state);
    const cached = memoryCache.get(key);
    if (cached) {
      results.set(key, cached);
    } else {
      toFetch.push({ ...item, key });
    }
  }

  // Fetch in batches of `concurrency`
  for (let i = 0; i < toFetch.length; i += concurrency) {
    const batch = toFetch.slice(i, i + concurrency);
    const promises = batch.map(async ({ district, state, key }) => {
      const coords = await geocodeDistrict(district, state);
      const resolved: [number, number] = coords || [22.0, 78.0];
      memoryCache.set(key, resolved);
      results.set(key, resolved);
    });
    await Promise.all(promises);
  }

  persistCache();
  return results;
}

/**
 * Synchronous lookup — returns cached value or null.
 * Use after batchGeocode() has populated the cache.
 */
export function getDistrictCoordsSync(
  district: string,
  state: string,
): [number, number] | null {
  return memoryCache.get(cacheKey(district, state)) || null;
}

/** Return current cache size (for diagnostics) */
export function geocodeCacheSize(): number {
  return memoryCache.size;
}
