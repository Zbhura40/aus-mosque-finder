/**
 * Mosque Service Layer
 *
 * This is the "traffic controller" that decides whether to use cached data
 * or call Google's API directly.
 *
 * Think of it like a smart assistant:
 * - First checks: "Do we have this info saved?" (cache)
 * - If yes: Returns it instantly (fast & cheap!)
 * - If no: Asks Google for it (slower & costs money)
 */

import { supabase } from "@/integrations/supabase/client";
import { shouldUseCacheSystem } from "@/config/featureFlags";

export interface MosqueSearchParams {
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export interface Mosque {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating?: number;
  isOpen?: boolean;
  phone?: string;
  website?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface MosqueSearchResult {
  mosques: Mosque[];
  source: 'cache' | 'google'; // Where the data came from
  searchTime: number; // How long the search took (ms)
}

/**
 * Search for mosques near a location
 *
 * This function automatically decides whether to use cache or Google API
 * based on the feature flag settings.
 */
export async function searchMosques(
  params: MosqueSearchParams
): Promise<MosqueSearchResult> {
  const startTime = Date.now();

  // Check if we should use the cache system
  const useCache = shouldUseCacheSystem();

  console.log(`[Mosque Service] Using ${useCache ? 'CACHE' : 'LEGACY'} system`);

  try {
    if (useCache) {
      // Use new cache-first system (get-mosque-details function)
      const result = await searchWithCache(params);
      const searchTime = Date.now() - startTime;

      console.log(`[Mosque Service] Cache search completed in ${searchTime}ms`);
      console.log(`[Mosque Service] Source: ${result.source}, Mosques: ${result.mosques.length}`);

      return {
        ...result,
        searchTime,
      };
    } else {
      // Use legacy system (search-mosques function)
      const result = await searchWithLegacySystem(params);
      const searchTime = Date.now() - startTime;

      console.log(`[Mosque Service] Legacy search completed in ${searchTime}ms`);
      console.log(`[Mosque Service] Mosques: ${result.mosques.length}`);

      return {
        ...result,
        searchTime,
      };
    }
  } catch (error) {
    console.error('[Mosque Service] Search error:', error);
    throw error;
  }
}

/**
 * Search using the new cache-first system
 * Calls the get-mosque-details Edge Function which checks cache first
 */
async function searchWithCache(
  params: MosqueSearchParams
): Promise<Omit<MosqueSearchResult, 'searchTime'>> {
  try {
    const { data, error } = await supabase.functions.invoke('get-mosque-details', {
      body: {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius,
      },
    });

    if (error) {
      console.error('[Mosque Service] Cache system error:', error);
      throw new Error(`Cache search failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from cache system');
    }

    // The Edge Function returns: { mosques: [...], meta: { cacheHit: boolean } }
    const source = data.meta?.cacheHit ? 'cache' : 'google';

    return {
      mosques: data.mosques || [],
      source,
    };
  } catch (error) {
    console.error('[Mosque Service] Error in cache search:', error);

    // If cache system fails, fall back to legacy system
    console.log('[Mosque Service] Falling back to legacy system...');
    return searchWithLegacySystem(params);
  }
}

/**
 * Search using the legacy system (direct Google API call)
 * This is the old search-mosques function that's currently in production
 */
async function searchWithLegacySystem(
  params: MosqueSearchParams
): Promise<Omit<MosqueSearchResult, 'searchTime'>> {
  try {
    const { data, error } = await supabase.functions.invoke('search-mosques', {
      body: {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius,
      },
    });

    if (error) {
      console.error('[Mosque Service] Legacy system error:', error);
      throw new Error(`Search failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from search');
    }

    return {
      mosques: data.mosques || [],
      source: 'google', // Legacy system always uses Google
    };
  } catch (error) {
    console.error('[Mosque Service] Error in legacy search:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific mosque
 * This is useful when you have a mosque ID and want fresh details
 */
export async function getMosqueDetails(placeId: string): Promise<Mosque | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-mosque-details', {
      body: {
        placeId,
      },
    });

    if (error) {
      console.error('[Mosque Service] Error fetching mosque details:', error);
      return null;
    }

    return data?.mosque || null;
  } catch (error) {
    console.error('[Mosque Service] Error in getMosqueDetails:', error);
    return null;
  }
}

/**
 * Debug helper: Check which system is active
 */
export function getActiveSystem(): 'cache' | 'legacy' {
  return shouldUseCacheSystem() ? 'cache' : 'legacy';
}
