const axios = require("axios");
const Trip = require("../models/tripplane.model");

/* Convert name → lat/lng */
const geocodePlace = async (name) => {
  const res = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: { q: name, format: "json", limit: 1 },
      headers: { "User-Agent": "Plan-My-Trip" },
    }
  );

  if (!res.data.length) return null;

  return {
    name,
    lat: +res.data[0].lat,
    lng: +res.data[0].lon,
  };
};

module.exports.tripplane = async (req, res) => {
  try {
    const {
      tripName,
      tripType,
      startingFrom,
      mainDestination,
      places, // nearby places
      startDate,
      endDate,
      members,
    } = req.body;

    /* Start place */
    const startPlace = await geocodePlace(startingFrom);
    if (!startPlace)
      return res.status(400).json({ message: "Invalid start place" });

    /* Destination */
    const destination = await geocodePlace(mainDestination);
    if (!destination)
      return res.status(400).json({ message: "Invalid destination" });

    /* Nearby / route places */
    const routePlaces = [];
    const invalidPlaces = [];

    let order = 1;
    for (const p of places || []) {
      const geo = await geocodePlace(p.name);
      if (!geo) {
        invalidPlaces.push(p.name);
        continue;
      }

      routePlaces.push({
        ...geo,
        category: p.category || "other",
        order: order++,
      });
    }

    const totalDays =
      Math.ceil(
        (new Date(endDate) - new Date(startDate)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    const trip = await Trip.create({
      tripName,
      tripType,
      startPlace,
      mainDestination: destination,
      routePlaces,
      startDate,
      endDate,
      totalDays,
      members,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Trip saved successfully",
      trip,
      invalidPlaces,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
