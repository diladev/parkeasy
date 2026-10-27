const EARTH_RADIUS_KM = 6371;
const KM_PER_DEGREE_LATITUDE = 111.32;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Straight-line distance between two points on Earth, in kilometres (haversine formula). */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/**
 * The square around a point that contains the circle of `radiusKm`.
 * The database filters by this square (cheap, can use an index); the exact
 * circle is then checked with distanceKm().
 */
export function boundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / KM_PER_DEGREE_LATITUDE;
  // A degree of longitude gets shorter towards the poles.
  const lngDelta =
    radiusKm /
    (KM_PER_DEGREE_LATITUDE * Math.max(Math.cos(toRadians(lat)), 0.01));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}
