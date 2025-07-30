const calculateDistance = (userLat, userLon, officeLat, officeLon) => {
    const toRadians = degrees => (degrees * Math.PI)/180;
    const EARTH_RADIUS_METERS = 6371000;

    const deltaLat = toRadians(officeLat - userLat);
    const deltaLon = toRadians(officeLon - userLon);

    const userLatRad = toRadians(userLat);
    const officeLatRad = toRadians(officeLat);

    const halfChordLengthSquared = 
        Math.sin(deltaLat/2) ** 2 +
        Math.cos(userLatRad) * Math.cos(officeLatRad) * Math.sin(deltaLon/2) ** 2;

    const centralAngle = 2 * Math.atan2(Math.sqrt(halfChordLengthSquared), Math.sqrt(1-halfChordLengthSquared));

    return EARTH_RADIUS_METERS * centralAngle;
};

module.exports = calculateDistance;