const axios = require("axios");

/* -----------------------------------
1. Geocode place name → lat/lng
----------------------------------- */
const geocodePlace = async (place) => {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { q: place, format: "json", limit: 1 },
      headers: { "User-Agent": "plane-my-trip-app" },
    }
  );

  if (!response.data.length) throw new Error("Place not found");

  return {
    lat: parseFloat(response.data[0].lat),
    lng: parseFloat(response.data[0].lon),
    display_name: response.data[0].display_name,
  };
};

/* -----------------------------------
2. Distance calculation
----------------------------------- */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return Number((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
};

/* -----------------------------------
3. Nearby places (categorized)
----------------------------------- */
const findNearbyPlaces = async (lat, lng) => {
  const query = `
  [out:json];
  (
    node["amenity"="restaurant"](around:20000,${lat},${lng});
    node["tourism"="attraction"](around:20000,${lat},${lng});
    node["leisure"="park"](around:20000,${lat},${lng});
    node["natural"="waterfall"](around:20000,${lat},${lng});
    node["waterway"="waterfall"](around:20000,${lat},${lng});
  );
  out body;
  `;

  const response = await axios.post(
    "https://overpass-api.de/api/interpreter",
    query,
    { headers: { "Content-Type": "text/plain" } }
  );

  return response.data.elements.map((p) => {
    let category = "other";

    if (p.tags?.amenity === "restaurant") category = "restaurant";
    else if (p.tags?.tourism === "attraction") category = "tourism";
    else if (p.tags?.leisure === "park") category = "park";
    else if (
      p.tags?.natural === "waterfall" ||
      p.tags?.waterway === "waterfall"
    )
      category = "waterfall";

    return {
      name: p.tags?.name || "Unnamed place",
      lat: p.lat,
      lng: p.lon,
      category,
    };
  });
};

/* -----------------------------------
4. API Controller
----------------------------------- */
module.exports.nearest = async (req, res) => {
  try {
    const { placeName } = req.body;
    if (!placeName)
      return res.status(400).json({ error: "Place name required" });

    const origin = await geocodePlace(placeName);
    const nearby = await findNearbyPlaces(origin.lat, origin.lng);

    const results = nearby
      .map((place) => ({
        ...place,
        distance_km: calculateDistance(
          origin.lat,
          origin.lng,
          place.lat,
          place.lng
        ),
        map_link: `https://www.google.com/maps?q=${place.lat},${place.lng}`,
        route_link: `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${place.lat},${place.lng}`,
      }))
      .sort((a, b) => a.distance_km - b.distance_km);

    res.json({
      origin,
      categories: ["restaurant", "tourism", "park", "waterfall"],
      results,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
