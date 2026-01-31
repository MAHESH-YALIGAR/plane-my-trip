import { useState, useMemo } from "react";
import { api } from "@/services/api";
import { useRouteStore } from "@/store/routeStore";
import {
  Search,
  MapPin,
  Plus,
  ExternalLink,
  Star,
  Filter,
  Grid3x3,
  List,
  X,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Enhanced category system - now using backend category values
const PLACE_CATEGORIES = {
  restaurant: {
    name: "Restaurants",
    icon: "🍽️",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    borderColor: "border-orange-200 dark:border-orange-800",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  },
  hotel: {
    name: "Hotels & Stay",
    icon: "🏨",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    borderColor: "border-purple-200 dark:border-purple-800",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  },
  cafe: {
    name: "Cafes",
    icon: "☕",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    borderColor: "border-amber-200 dark:border-amber-800",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  },
  tourism: {
    name: "Tourism & Attractions",
    icon: "🎭",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    borderColor: "border-blue-200 dark:border-blue-800",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  },
  temple: {
    name: "Temples",
    icon: "🕉️",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    badgeColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  },
  waterfall: {
    name: "Waterfalls",
    icon: "💧",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    borderColor: "border-cyan-200 dark:border-cyan-800",
    badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100",
  },
  park: {
    name: "Parks & Nature",
    icon: "🌳",
    bgColor: "bg-green-50 dark:bg-green-950",
    borderColor: "border-green-200 dark:border-green-800",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  },
};

export default function PlaceDiscovery() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState("");

  const addPlace = useRouteStore((s) => s.addPlace);

  // Generate Google Maps URL
  const generateMapUrl = (place: any): string => {
    if (place.map_url) return place.map_url;
    if (place.latitude && place.longitude) {
      return `https://www.google.com/maps/?q=${place.latitude},${place.longitude}`;
    }
    if (place.lat && place.lng) {
      return `https://www.google.com/maps/?q=${place.lat},${place.lng}`;
    }
    const query = encodeURIComponent(`${place.name}, ${place.address || ""}`);
    return `https://www.google.com/maps/search/${query}`;
  };

  // Fetch places
  const fetchPlaces = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a location");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post(`${backendUrl}/api/rout/nearest`, {
        placeName: searchQuery,
      });

      const places = (res.data.results || res.data || []).map((place: any) => ({
        ...place,
        map_url: generateMapUrl(place),
        // Use backend category, fallback to 'tourism' if not provided
        category: place.category?.toLowerCase() || "tourism",
      }));

      setAllResults(places);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to search places");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get available categories from results
  const availableCategories = useMemo(() => {
    const cats = new Set(allResults.map((p) => p.category));
    return Array.from(cats);
  }, [allResults]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let results = allResults;

    // Filter by category
    if (selectedCategories.length > 0) {
      results = results.filter((p) => selectedCategories.includes(p.category));
    }

    // Sort
    results.sort((a, b) => {
      if (sortBy === "distance") {
        return (a.distance_km || 0) - (b.distance_km || 0);
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });

    return results;
  }, [allResults, selectedCategories, sortBy]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredResults.forEach((place) => {
      if (!groups[place.category]) {
        groups[place.category] = [];
      }
      groups[place.category].push(place);
    });
    return groups;
  }, [filteredResults]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchPlaces();
    }
  };

  const getCategoryConfig = (category: string) => {
    return (
      PLACE_CATEGORIES[category as keyof typeof PLACE_CATEGORIES] ||
      PLACE_CATEGORIES.tourism
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Discover Places
            </h1>
            <p className="text-muted-foreground">
              Search for restaurants, hotels, temples, and attractions near you
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search location (e.g., Hampi, Bangalore)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button
              onClick={fetchPlaces}
              disabled={loading}
              size="default"
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <X className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
        </div>

        {/* Category Filters */}
        {availableCategories.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Filter by Category</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => {
                const config = getCategoryConfig(category);
                const isSelected = selectedCategories.includes(category);
                const count = allResults.filter(
                  (p) => p.category === category
                ).length;

                return (
                  <Button
                    key={category}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className="gap-2"
                  >
                    <span>{config.icon}</span>
                    {config.name}
                    <Badge
                      variant="secondary"
                      className="ml-1 text-xs"
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {selectedCategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategories([])}
                className="text-xs"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Controls */}
        {allResults.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm font-medium">
              {filteredResults.length} place{filteredResults.length !== 1 ? "s" : ""} found
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm bg-background"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
              </select>

              <div className="flex border rounded-md divide-x">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Searching for places...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-8">
            {viewMode === "grid" ? (
              // Grid view grouped by category
              Object.entries(groupedResults).map(([category, places]) => {
                const config = getCategoryConfig(category);
                return (
                  <div key={category}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">{config.icon}</span>
                      <h2 className="text-xl font-semibold">{config.name}</h2>
                      <Badge variant="secondary">{places.length}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {places.map((place, i) => (
                        <PlaceCard
                          key={i}
                          place={place}
                          config={config}
                          onAdd={() => addPlace(place)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // List view
              <div className="space-y-3">
                {filteredResults.map((place, i) => (
                  <PlaceListItem
                    key={i}
                    place={place}
                    config={getCategoryConfig(place.category)}
                    onAdd={() => addPlace(place)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : searchQuery && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-1">No places found</h3>
            <p className="text-muted-foreground">
              Try searching for a different location
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-1">Start exploring</h3>
            <p className="text-muted-foreground">
              Enter a location above to discover nearby places
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Place Card Component
function PlaceCard({
  place,
  config,
  onAdd,
}: {
  place: any;
  config: any;
  onAdd: () => void;
}) {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${config.borderColor} border-2`}>
      {/* Header with background color */}
      <div className={`${config.bgColor} p-4 border-b`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              {place.name}
            </h3>
          </div>
          <span className="text-2xl flex-shrink-0">{config.icon}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info */}
        <div className="space-y-2 text-sm">
          {/* Distance */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">
              {place.distance_km ? `${place.distance_km.toFixed(2)} km` : "N/A"}
            </span>
          </div>

          {/* Rating */}
          {place.rating && (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{place.rating}/5</span>
            </div>
          )}

          {/* Address */}
          {place.address && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {place.address}
            </p>
          )}

          {/* Category Badge */}
          <div className="pt-2">
            <Badge className={config.badgeColor} variant="secondary">
              {place.category}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2"
            onClick={() =>
              window.open(place.map_url, "_blank", "noopener,noreferrer")
            }
          >
            <ExternalLink className="w-4 h-4" />
            Map
          </Button>

          <Button
            size="sm"
            className="flex-1 gap-2"
            onClick={onAdd}
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Place List Item Component
function PlaceListItem({
  place,
  config,
  onAdd,
}: {
  place: any;
  config: any;
  onAdd: () => void;
}) {
  return (
    <Card className={`p-4 transition-all hover:shadow-md ${config.borderColor} border-2`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          <div className="text-2xl flex-shrink-0">{config.icon}</div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold leading-tight">{place.name}</h3>
            {place.address && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {place.address}
              </p>
            )}
            <div className="flex gap-4 mt-2 flex-wrap text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {place.distance_km?.toFixed(2)} km
              </span>
              {place.rating && (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {place.rating}/5
                </span>
              )}
              <Badge className={config.badgeColor} variant="secondary">
                {place.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              window.open(place.map_url, "_blank", "noopener,noreferrer")
            }
          >
            Map
          </Button>
          <Button
            size="sm"
            onClick={onAdd}
          >
            Add
          </Button>
        </div>
      </div>
    </Card>
  );
}