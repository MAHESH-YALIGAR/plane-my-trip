const axios = require("axios");

/* -----------------------------------
1. Convert place name → lat/lng
(OpenStreetMap Nominatim)
----------------------------------- */
const geocodePlace = async (place) => {
  const url = "https://nominatim.openstreetmap.org/search";

  const response = await axios.get(url, {
    params: {
      q: place,
      format: "json",
      limit: 1,
    },
    headers: {
      "User-Agent": "plane-my-trip-app", // REQUIRED by OSM
    },
  });

  if (!response.data.length) {
    throw new Error("Place not found");
  }

  return {
    lat: parseFloat(response.data[0].lat),
    lng: parseFloat(response.data[0].lon),
  };
};

/* -----------------------------------
2. Distance calculation (Haversine)
----------------------------------- */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/* -----------------------------------
3. Find nearby places (20 KM)
(OpenStreetMap Overpass)
----------------------------------- */
const findNearbyPlaces = async (lat, lng) => {
  const query = `
    [out:json];
    (
      node["tourism"](around:20000,${lat},${lng});
      node["amenity"="restaurant"](around:20000,${lat},${lng});
      node["amenity"="cafe"](around:20000,${lat},${lng});
    );
    out body;
  `;

  const response = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query,
    { headers: { "Content-Type": "text/plain" } }
  );

  return response.data.elements.map((place) => ({
    name: place.tags?.name || "Unnamed place",
    lat: place.lat,
    lng: place.lon,
    type: place.tags?.tourism || place.tags?.amenity || "place",
  }));
};

/* -----------------------------------
4. API: User enters only place name
----------------------------------- */
module.exports.nearest = async (req, res) => {
  console.log("you are in the route console")
  try {
    const { placeName } = req.body;

    if (!placeName) {
      return res.status(400).json({ error: "Place name required" });
    }

    // Step 1: Get user location
    const userLocation = await geocodePlace(placeName);
    console.log("present location",userLocation)
    // Step 2: Find nearby places
    const nearbyPlaces = await findNearbyPlaces(
      userLocation.lat,
      userLocation.lng
    );
    console.log("user near",nearbyPlaces)

    // Step 3: Add distance
    const placesWithDistance = nearbyPlaces.map((place) => ({
      ...place,
      distance_km: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.lat,
        place.lng
      ),
    }));

    // Step 4: Sort by nearest
    placesWithDistance.sort((a, b) => a.distance_km - b.distance_km);

   const results= res.json({
      origin: userLocation,
      results: placesWithDistance,
    });
    console.log("the final result",results.data)
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};
