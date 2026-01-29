import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Navigation, Plus } from "lucide-react";

// =====================
// Types
// =====================
type Place = {
  name: string;
  distance_km: number;
  lat: number;
  lng: number;
};

export default function RouteDistancePage(): JSX.Element {
  const [basePlace, setBasePlace] = useState<string>("");
  const [addedPlaces, setAddedPlaces] = useState<Place[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [selectedNearby, setSelectedNearby] = useState<Place[]>([]);
  const [showRoute, setShowRoute] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // =====================
  // Step 1: Add base place (CALL BACKEND API HERE)
  // =====================
  const addBasePlace = async (): Promise<void> => {
    if (!basePlace.trim()) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:8001/api/rout/nearest",
        { placeName: basePlace }
      );

      // Expecting: { places: Place[] }
      setAddedPlaces([
        {
          name: basePlace,
          distance_km: 0,
          lat: response.data.origin.lat,
          lng: response.data.origin.lng,
        },
      ]);

      setNearbyPlaces(response.data.places);
      setSelectedNearby([]);
      setShowRoute(false);
    } catch (error) {
      console.error("Failed to fetch nearby places", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // Step 2: Select nearby places
  // =====================
  const toggleNearbyPlace = (place: Place): void => {
    setSelectedNearby((prev) =>
      prev.find((p) => p.name === place.name)
        ? prev.filter((p) => p.name !== place.name)
        : [...prev, place]
    );
  };

  // =====================
  // Step 3: Finalize route places
  // =====================
  const finalizePlaces = (): void => {
    setAddedPlaces((prev) => [...prev, ...selectedNearby]);
  };

  return (
    <div className="min-h-screen bg-route p-6">
      <Card className="max-w-5xl mx-auto shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Smart Route Planner (Map-first Flow)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter a place → discover nearby attractions → generate route
          </p>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* LEFT: Map */}
          <div className="rounded-2xl border bg-muted h-[350px] overflow-hidden">
            {addedPlaces.length > 0 ? (
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  addedPlaces[0].name
                )}&output=embed`}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                🗺️ Map will appear here
              </div>
            )}
          </div>

          {/* RIGHT: Controls */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <h3 className="font-semibold">1. Enter Starting Place</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter place (e.g., Bengaluru)"
                  value={basePlace}
                  onChange={(e) => setBasePlace(e.target.value)}
                />
                <Button onClick={addBasePlace} disabled={loading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            {nearbyPlaces.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">2. Nearby Good Places (within 20 KM)</h3>
                <div className="space-y-2">
                  {nearbyPlaces.map((place, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={!!selectedNearby.find(
                            (p) => p.name === place.name
                          )}
                          onCheckedChange={() => toggleNearbyPlace(place)}
                        />
                        <span className="text-sm">{place.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {place.distance_km.toFixed(1)} km
                      </span>
                    </div>
                  ))}
                </div>

                <Button variant="secondary" onClick={finalizePlaces}>
                  Add Selected Places
                </Button>
              </div>
            )}

            {/* Step 3 */}
            {addedPlaces.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">3. Final Route Order</h3>

                {addedPlaces.map((place, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <Badge>{index + 1}</Badge>
                    <span className="text-sm">{place.name}</span>
                  </div>
                ))}

                <Button className="w-full mt-3" onClick={() => setShowRoute(true)}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Show Route on Map
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
