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


module.exports.getalltrip = async (req, res) => {
  const userId = req.user.userId
  try {

    const trips = await Trip.find({ createdBy: userId })
      .sort({ createdAt: -1 })

    res.status(200).json(trips)
  } catch (error) {
    console.error("Get trips error:", error)
    res.status(500).json({
      message: "Failed to fetch trips",
    })
  }
}





module.exports.saveRoutePlaces = async (req, res) => {
  console.log("you are in  the tripsave backend");
  try {

    const { Id, routePlaces,totalDistance } = req.body;
  console.log("you are in  the tripsave backend",Id,"and",routePlaces);

    if (!routePlaces || routePlaces.length === 0|| !totalDistance) {
      return res.status(400).json({ message: "No route places provided" });
    }

    const trip = await Trip.findOne({
      _id: Id,
      createdBy: req.user.userId,
    });

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 🔑 SAVE ALL NEARBY PLACES HERE
    trip.routePlaces = routePlaces.sort((a, b) => a.order - b.order);

    await trip.save();

    res.json({
      message: "Nearby places saved successfully ✅",
      trip,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save route places" });
  }
};


module.exports.getRoutePlaces = async (req, res) => {
  console.log("📍 getRoutePlaces API called")

  try {
    const { id } = req.params
    console.log("Trip ID:", id)

    const trip = id
      ? await Trip.findById(id)
      : await Trip.findOne().sort({ createdAt: -1 })

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      })
    }

    // 🔍 DEBUG (keep this for now)
    console.log("START:", trip.startPlace)
    console.log("ROUTES:", trip.routePlaces)
    console.log("DEST:", trip.mainDestination)

    const path = []

    /* ---------- START PLACE ---------- */
    if (trip.startPlace?.lat && trip.startPlace?.lng) {
      path.push({
        name: trip.startPlace.name || "Start Place",
        lat: trip.startPlace.lat,
        lng: trip.startPlace.lng,
        type: "start",
        order: 0,
      })
    }

    /* ---------- ROUTE PLACES ---------- */
    if (Array.isArray(trip.routePlaces)) {
      trip.routePlaces.forEach((place, index) => {
        if (place.lat && place.lng) {
          path.push({
            name: place.name || `Stop ${index + 1}`,
            lat: place.lat,
            lng: place.lng,
            category: place.category || "route",
            type: "route",
            order: index + 1,
          })
        }
      })
    }

    /* ---------- MAIN DESTINATION ---------- */
    if (
      trip.mainDestination?.lat &&
      trip.mainDestination?.lng
    ) {
      path.push({
        name:
          trip.mainDestination.name || "Destination",
        lat: trip.mainDestination.lat,
        lng: trip.mainDestination.lng,
        category:
          trip.mainDestination.category || "destination",
        type: "destination",
        order: path.length + 1,
      })
    }

    if (path.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid places found for this trip",
      })
    }

    // 🔑 Sort for map polyline
    path.sort((a, b) => a.order - b.order)

    return res.status(200).json({
      success: true,
      tripId: trip._id,
      totalPlaces: path.length,
      path,
    })
  } catch (error) {
    console.error("❌ getRoutePlaces error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
