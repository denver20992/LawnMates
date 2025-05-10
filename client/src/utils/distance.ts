/**
 * Calculate distance between two coordinates using the Haversine formula
 * 
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1?: number | null, 
  lon1?: number | null, 
  lat2?: number | null, 
  lon2?: number | null
): number | null {
  // Return null if any coordinates are missing
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  // Convert degrees to radians
  const toRad = (deg: number) => deg * Math.PI / 180;
  
  // Earth radius in kilometers
  const R = 6371;
  
  // Calculate differences
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  // Haversine formula
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * Format distance for display
 * 
 * @param distance Distance in kilometers
 * @returns Formatted distance string (e.g., "3.2 km" or "500 m")
 */
export function formatDistance(distance: number | null): string {
  if (distance === null) {
    return "Unknown distance";
  }
  
  if (distance < 1) {
    // Convert to meters for distances less than 1 km
    return `${Math.round(distance * 1000)} m`;
  }
  
  return `${distance.toFixed(1)} km`;
}