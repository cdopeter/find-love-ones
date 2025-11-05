/**
 * Map utility functions
 */

/**
 * Generate consistent offset based on request ID to prevent markers from stacking
 * @param id - The request ID
 * @returns An object with lat and lng offset values
 */
export function getMarkerOffset(id: string | undefined): {
  lat: number;
  lng: number;
} {
  if (!id) return { lat: 0, lng: 0 };

  // Simple hash to generate consistent but pseudo-random offset
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }

  const normalized = Math.abs(hash) / 2147483647; // Normalize to 0-1

  return {
    lat: (normalized - 0.5) * 0.05,
    lng: (((normalized * 1.5) % 1) - 0.5) * 0.05, // Different multiplier for lng
  };
}
