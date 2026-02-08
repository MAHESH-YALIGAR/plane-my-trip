import { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";

type Place = {
  name: string;
  lat: number;
  lng: number;
  category?: string;
  distance_km?: number;
};

export default function FullRouteView() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [roadPath, setRoadPath] = useState<[number, number][]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [tripName, setTripName] = useState("");
  const [tripType, setTripType] = useState("");
  const [loading, setLoading] = useState(true);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;

    const fetchRoute = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `http://localhost:8001/api/plane/${id}/fullroute`,
          { id },
          { withCredentials: true }
        );

        const data = res.data;
console.log("you data",data)
        // ✅ Extract trip info from database response
        setTripName(data.tripName || "");
        setTripType(data.tripType || "");

        // ✅ Fix: Ensure all places have proper structure
        const orderedPlaces: Place[] = [
          // ✅ startPlace already has name, lat, lng
          data.startPlace,
          // ✅ routePlaces array items
          ...(data.routePlaces || []),
          // ✅ mainDestination already has name, lat, lng, category
          data.mainDestination,
        ].filter(Boolean); // Remove any undefined places

        setPlaces(orderedPlaces);
      } catch (err) {
        console.error("Failed to load route", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [id]);

  useEffect(() => {
    if (places.length < 2) return;

    const fetchRoadPath = async () => {
      try {
        const coords = places
          .map((p) => `${p.lng},${p.lat}`)
          .join(";");

        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
        );

        const data = await res.json();
        const path = data.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        );

        setRoadPath(path);
        setTotalDistance(data.routes[0].distance / 1000);
      } catch (err) {
        console.error("OSRM error", err);
      }
    };

    fetchRoadPath();
  }, [places]);

  if (loading) {
    return <div className="p-6 text-center">Loading trip...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* 🗺️ MAP */}
      <Card className="lg:col-span-2 h-[550px]">
        <CardContent className="h-full p-0">
          <MapContainer
            center={
              places[0] ? [places[0].lat, places[0].lng] : [20.5937, 78.9629]
            }
            zoom={8}
            className="h-full w-full rounded-xl"
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            {/* ✅ Fixed: Correct Marker position - [lat, lng] */}
            {places.map((place, index) => (
              <Marker
                key={`${place.name}-${index}`}
                position={[place.lat, place.lng]} // ✅ Fixed: was [place] 
              >
                <Popup>
                  <b>
                    {index === 0
                      ? "🏠 Start"
                      : index === places.length - 1
                        ? "🎯 Main Destination"
                        : `🛑 Stop ${index}`}
                  </b>
                  <br />
                  {place.name} {/* ✅ Fixed: Show place name */}
                  {place.category && (
                    <>
                      <br />
                      <small className="opacity-75">Category: {place.category}</small>
                    </>
                  )}
                </Popup>
              </Marker>
            ))}

            {roadPath.length > 0 && (
              <Polyline
                positions={roadPath}
                pathOptions={{
                  color: "#2563eb",
                  weight: 6,
                  opacity: 0.9,
                }}
              />
            )}
          </MapContainer>
        </CardContent>
      </Card>

      {/* 📋 DETAILS */}
      <Card>
        <CardContent className="space-y-4 p-6">
          {/* ✅ Show trip info from database */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {tripName} {/* ✅ "goa" */}
            </h2>
            <div className="text-sm bg-blue-50 px-3 py-1 rounded-full w-fit text-blue-800 font-medium">
              {tripType} {/* ✅ "friends" */}
            </div>
          </div>

          {/* ✅ Route stops list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {places.map((p, i) => (
              <div key={`${p.name}-${i}`} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="font-bold text-lg mb-1">
                  {i === 0
                    ? "🏠 Start"
                    : i === places.length - 1
                      ? "🎯 Goa (Main)"
                      : `🛑 Stop ${i}`}
                </div>
                <div className="text-blue-600 font-semibold">{p.name}</div>
                {p.category && (
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 w-fit">
                    {p.category}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ✅ Distance */}
          <div className="border-t pt-4 pb-2">
            <p className="text-2xl font-bold text-gray-900">
              Total Distance
              <span className="text-blue-600 ml-3 text-3xl block">
                {totalDistance.toFixed(1)} km
              </span>
            </p>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
            🚗 Start Navigation to {tripName}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
