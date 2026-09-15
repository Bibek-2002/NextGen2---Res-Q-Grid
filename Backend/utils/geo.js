function haversineDistance(loc1, loc2) {
    if (!loc1 || !loc2 || loc1.lat == null || loc2.lat == null) return Infinity;
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(loc2.lat - loc1.lat);
    const dLng = toRad(loc2.lng - loc1.lng);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(loc1.lat)) * Math.cos(toRad(loc2.lat)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = { haversineDistance };
