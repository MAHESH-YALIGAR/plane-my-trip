import { useRouteStore } from "@/store/routeStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function RoutePlanner() {
  const { places, removePlace } = useRouteStore();

  const positions = places.map((p) => [p.lat, p.lng]) as [number, number][];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

      {/* 🗺️ MAP SECTION */}
      <Card className="lg:col-span-2 h-[500px]">
        <CardContent className="h-full p-0">
          <MapContainer
            center={positions[0] || [20.5937, 78.9629]}
            zoom={6}
            className="h-full w-full rounded-xl"
          >
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {positions.map((pos, i) => (
              <Marker key={i} position={pos} />
            ))}

            {positions.length > 1 && (
              <Polyline positions={positions} />
            )}
          </MapContainer>
        </CardContent>
      </Card>

      {/* 📍 ROUTE LIST */}
      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-xl font-semibold">Your Route</h2>

          {places.length === 0 && (
            <p className="text-muted-foreground">
              No places added yet
            </p>
          )}

          {places.map((place, index) => (
            <div
              key={place.id}
              className="flex items-center justify-between border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {index + 1}. {place.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {place.category}
                </p>
              </div>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => removePlace(place.id)}
              >
                Remove
              </Button>
            </div>
          ))}

          {places.length > 1 && (
            <Button className="w-full">
              🚗 Start Navigation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
