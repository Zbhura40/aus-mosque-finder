/**
 * Feature Flags Configuration
 *
 * Controls gradual rollout of new features like the backend cache system.
 * This allows us to test features with a small percentage of users before full rollout.
 */

export interface FeatureFlags {
  useCacheSystem: boolean;
  cacheRolloutPercentage: number; // 0-100
  [key: string]: boolean | number; // Allow dynamic access
}

/**
 * Feature flag configuration
 *
 * How to use:
 * - Set useCacheSystem to true to enable the cache system
 * - Set cacheRolloutPercentage to control what % of users get the cache (0-100)
 *
 * Recommended rollout plan:
 * - Day 4: 0% (testing only) ✅
 * - Day 5: 10% (initial rollout) 👈 WE ARE HERE
 * - Day 6: 50% (if no issues)
 * - Day 7: 100% (full rollout)
 */
const featureFlags: FeatureFlags = {
  // Enable/disable cache system entirely
  useCacheSystem: true, // ✅ ENABLED for Day 5 rollout

  // Percentage of users who get the cache (0-100)
  // We use a deterministic approach based on timestamp to ensure consistent experience per session
  cacheRolloutPercentage: 10, // 10% rollout - 1 in 10 users gets cache
};

/**
 * Check if a feature is enabled
 * For percentage-based rollout, uses a simple deterministic approach
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const value = featureFlags[feature];

  if (typeof value === 'boolean') {
    return value;
  }

  return false;
}

/**
 * Check if cache system should be used for this user session
 * Uses a deterministic approach: generates a session number and checks if it falls within rollout %
 */
export function shouldUseCacheSystem(): boolean {
  // First check if cache system is enabled at all
  if (!featureFlags.useCacheSystem) {
    return false;
  }

  // If 100% rollout, always use cache
  if (featureFlags.cacheRolloutPercentage === 100) {
    return true;
  }

  // If 0% rollout, never use cache (useful for testing)
  if (featureFlags.cacheRolloutPercentage === 0) {
    return false;
  }

  // For partial rollout: use a deterministic approach based on session storage
  // This ensures the same user gets consistent experience during their session
  let sessionId = sessionStorage.getItem('fmm_session_id');

  if (!sessionId) {
    // Generate a random session ID (0-99)
    sessionId = Math.floor(Math.random() * 100).toString();
    sessionStorage.setItem('fmm_session_id', sessionId);
  }

  const sessionNumber = parseInt(sessionId, 10);
  return sessionNumber < featureFlags.cacheRolloutPercentage;
}

/**
 * Get current feature flag values (for debugging)
 */
export function getFeatureFlags(): FeatureFlags {
  return { ...featureFlags };
}

/**
 * Update feature flags at runtime (for testing/debugging)
 * In production, you'd typically update these via environment variables
 */
export function updateFeatureFlag(flag: keyof FeatureFlags, value: boolean | number): void {
  featureFlags[flag] = value;
  console.log(`[Feature Flags] Updated ${flag} to:`, value);
}

export default featureFlags;
