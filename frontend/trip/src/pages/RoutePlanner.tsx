import { useRouteStore } from "@/store/routeStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import axios from "axios";
import { useState } from "react";
import {
  Trash2,
  MapPin,
  Navigation,
  Save,
  MoreVertical,
  Eye,
  EyeOff,
} from "lucide-react";

// Custom icon for markers
const createCustomIcon = (index: number, isActive: boolean = false) => {
  return L.divIcon({
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full font-bold text-white shadow-lg transition-all ${
        isActive ? "bg-blue-600 scale-125" : "bg-blue-500"
      }">
        ${index}
      </div>
    `,
    iconSize: [40, 40],
    className: "custom-marker",
  });
};

// Haversine formula to calculate distance between two points
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate total distance of route
const calculateTotalDistance = (
  places: Array<{ lat: number; lng: number }>
): number => {
  if (places.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < places.length - 1; i++) {
    total += calculateDistance(
      places[i].lat,
      places[i].lng,
      places[i + 1].lat,
      places[i + 1].lng
    );
  }
  return total;
};

export default function AdvancedRoutePlanner() {
    let params = useParams();
    const Id=params.id;

  const { places,tripId, removePlace, clearRoute, reorderPlaces } = useRouteStore();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const positions = places.map((p) => [p.lat, p.lng] as [number, number]);
  const mapCenter: [number, number] =
    positions.length > 0 ? positions[0] : [20.5937, 78.9629];

  const totalDistance = calculateTotalDistance(places);

  // Handle drag and drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newPlaces = [...places];
    const [draggedPlace] = newPlaces.splice(draggedIndex, 1);
    newPlaces.splice(dropIndex, 0, draggedPlace);

    // Update store with reordered places
    if (reorderPlaces) {
      reorderPlaces(newPlaces);
    }

    setDraggedIndex(null);
  };

  const handleSaveTrip = async () => {
    if (places.length === 0) return;

    try {
      await axios.post("http://localhost:8001/api/plane/${Id}/addnearplace", {
        Id:Id,
        routePlaces: places,
        totalDistance: totalDistance,
      }, { withCredentials: true });

      alert("✅ Trip saved successfully!");
      clearRoute();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to save trip");
    }
  };
  console.log("the dosatance ",totalDistance)
// const handleSaveTrip = async () => {
//   if (!Id) {
//     alert("Trip ID missing");
//     return;
//   }

//   const routePlacesPayload = places.map((p, index) => ({
//     name: p.name,
//     lat: p.lat,
//     lng: p.lng,
//     category: p.category,
//     order: index + 1,
//   }));
//   console.log("your data is the",routePlacesPayload,"and id is the",Id);

//   await axios.put(
//     `http://localhost:8001/api/plane/${Id}addnearplace`,
//     {
//       // Id:Id,
//       routePlaces: routePlacesPayload,
//       // totalDistance: totalDistance,
//     },
//     { withCredentials: true }
//   );

//   alert("✅ Trip saved successfully");
// };


  const handleStartNavigation = () => {
    if (places.length < 2) {
      alert("Please add at least 2 places to start navigation");
      return;
    }
    // Implement navigation logic
    alert("🚗 Navigation started!");
  };

  const handleExportRoute = () => {
    const routeData = {
      places,
      totalDistance: totalDistance.toFixed(2),
      createdAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(routeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `route-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* 🗺️ MAP SECTION */}
      <Card className="lg:col-span-2 h-[600px] shadow-xl overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Route Map
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className="gap-2"
            >
              {showLabels ? (
                <>
                  <Eye className="w-4 h-4" /> Hide Labels
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" /> Show Labels
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="h-[calc(100%-80px)] p-0">
          {positions.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-slate-100">
              <p className="text-slate-500 text-center">
                Add places to see them on the map
              </p>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={6}
              className="h-full w-full"
            >
              <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Markers with popups and tooltips */}
              {positions.map((pos, i) => (
                <Marker
                  key={i}
                  position={pos}
                  icon={createCustomIcon(i + 1, activeMarker === i)}
                  eventHandlers={{
                    click: () => setActiveMarker(activeMarker === i ? null : i),
                  }}
                >
                  <Popup>
                    <div className="font-semibold text-sm">
                      <p className="font-bold text-blue-600">
                        {i + 1}. {places[i].name}
                      </p>
                      <p className="text-xs text-slate-600">
                        {places[i].category}
                      </p>
                      {i < places.length - 1 && (
                        <p className="text-xs mt-1 font-semibold text-orange-600">
                          Distance to next: ~
                          {calculateDistance(
                            places[i].lat,
                            places[i].lng,
                            places[i + 1].lat,
                            places[i + 1].lng
                          ).toFixed(1)}{" "}
                          km
                        </p>
                      )}
                    </div>
                  </Popup>

                  {showLabels && (
                    <Tooltip permanent interactive>
                      <div className="text-xs font-semibold bg-white px-2 py-1 rounded shadow">
                        <p>{places[i].name}</p>
                        <p className="text-blue-600">
                          {i + 1}/{places.length}
                        </p>
                      </div>
                    </Tooltip>
                  )}
                </Marker>
              ))}

              {/* Polyline connecting all points */}
              {positions.length > 1 && (
                <Polyline
                  positions={positions}
                  color="#3b82f6"
                  weight={3}
                  opacity={0.8}
                  dashArray="5, 5"
                />
              )}
            </MapContainer>
          )}
        </CardContent>
      </Card>

      {/* 📍 ROUTE DETAILS PANEL */}
      <div className="flex flex-col gap-6">
        {/* Route Summary Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Route Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 font-semibold">STOPS</p>
                <p className="text-2xl font-bold text-blue-600">
                  {places.length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 font-semibold">
                  TOTAL DISTANCE
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {totalDistance.toFixed(1)} km
                </p>
              </div>
            </div>

            {places.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 font-semibold mb-2">
                  ESTIMATED TIME
                </p>
                <p className="text-lg font-bold text-slate-700">
                  ~{Math.ceil(totalDistance / 60)} hrs
                </p>
                <p className="text-xs text-slate-500">
                  (Based on average 60 km/h)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Places List */}
        <Card className="shadow-lg flex-1 overflow-hidden flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Route</CardTitle>
            {places.length > 0 && (
              <p className="text-xs text-slate-500">
                Drag to reorder stops
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-2 overflow-y-auto flex-1 pr-2">
            {places.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No places added yet. Go back and add nearby places.
              </p>
            ) : (
              places.map((place, index) => (
                <div
                  key={place.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                    draggedIndex === index
                      ? "opacity-50 border-blue-400 bg-blue-50"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                  onMouseEnter={() => setActiveMarker(index)}
                  onMouseLeave={() => setActiveMarker(null)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center p-0 text-xs">
                          {index + 1}
                        </Badge>
                        <p className="font-semibold text-slate-700">
                          {place.name}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 ml-8 mt-1">
                        {place.category}
                      </p>

                      {/* Distance to next stop */}
                      {index < places.length - 1 && (
                        <p className="text-xs text-orange-600 ml-8 mt-1 font-semibold">
                          →{" "}
                          {calculateDistance(
                            places[index].lat,
                            places[index].lng,
                            places[index + 1].lat,
                            places[index + 1].lng
                          ).toFixed(1)}{" "}
                          km to next
                        </p>
                      )}
                    </div>

                    {/* Action Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => removePlace(place.id)}
                          className="text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </CardContent>

          {/* Action Buttons */}
          {places.length > 0 && (
            <CardContent className="pt-3 border-t space-y-2">
              <Button
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={handleSaveTrip}
              >
                <Save className="w-4 h-4" />
                Save Trip
              </Button>

              <Button
                className="w-full gap-2"
                variant="secondary"
                onClick={handleStartNavigation}
                disabled={places.length < 2}
              >
                <Navigation className="w-4 h-4" />
                Start Navigation
              </Button>

              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={handleExportRoute}
              >
                📥 Export Route
              </Button>

              <Button
                className="w-full"
                variant="ghost"
                onClick={clearRoute}
              >
                Clear All
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}