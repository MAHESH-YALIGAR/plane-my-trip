import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, MapPin, Users, Plane, DollarSign, Calendar, Star, Trash2, Edit2 } from "lucide-react";

interface Place {
  id: number;
  name: string;
  category: string;
  rating: number;
  description: string;
  estimatedDays: number;
}

export default function PlanTrip() {
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("group");
  const [startingFrom, setStartingFrom] = useState("");
  const [mainDestination, setMainDestination] = useState("");
  const [travelMode, setTravelMode] = useState("");
  const [budget, setBudget] = useState("");
  const [groupSize, setGroupSize] = useState("");

  const [placeName, setPlaceName] = useState("");
  const [placeCategory, setPlaceCategory] = useState("Tourist Spot");
  const [placeRating, setPlaceRating] = useState("5");
  const [placeDescription, setPlaceDescription] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("1");
  const [places, setPlaces] = useState<Place[]>([]);
  
  const [members, setMembers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmitTrip = async () => {
    // Validation
    if (!tripName || !startDate || !endDate || !startingFrom || !mainDestination) {
      setMessage("❌ Please fill all required trip details");
      return;
    }

    if (places.length === 0) {
      setMessage("❌ Please add at least one place to your trip");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const tripData = {
        tripName,
        startDate,
        endDate,
        tripType,
        startingFrom,
        mainDestination,
        travelMode,
        budget: budget ? parseFloat(budget) : null,
        groupSize: groupSize ? parseInt(groupSize) : null,
        places: places.map((p) => ({
          name: p.name,
          category: p.category,
          rating: p.rating,
          description: p.description,
          estimatedDays: p.estimatedDays,
        })),
        members: members.map((m) => ({
          name: m.name,
          email: m.email,
        })),
        totalDays,
        avgRating: parseFloat(avgRating),
      };

      console.log("📤 Sending trip data:", tripData);

      const response = await axios.post(
        "http://localhost:8001/api/plane/create",
        tripData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Response:", response.data);
      setMessage("✅ Trip created successfully!");

      // Reset form after successful submission
      setTimeout(() => {
        setTripName("");
        setStartDate("");
        setEndDate("");
        setTripType("group");
        setStartingFrom("");
        setMainDestination("");
        setTravelMode("");
        setBudget("");
        setGroupSize("");
        setPlaces([]);
        setMembers([]);
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error:", error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to create trip";
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addPlace = () => {
    if (!placeName.trim()) return;
    setPlaces((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: placeName,
        category: placeCategory,
        rating: parseInt(placeRating),
        description: placeDescription,
        estimatedDays: parseInt(estimatedDays),
      },
    ]);
    setPlaceName("");
    setPlaceDescription("");
    setPlaceRating("5");
    setEstimatedDays("1");
  };

  const removePlace = (id: number) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  const addMember = () => {
    if (!memberName.trim() || !memberEmail.trim()) return;
    setMembers((prev) => [
      ...prev,
      { id: Date.now(), name: memberName, email: memberEmail },
    ]);
    setMemberName("");
    setMemberEmail("");
  };

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const categoryEmojis = {
    "Tourist Spot": "🏰",
    "Temple": "⛩️",
    "Food": "🍽️",
    "Hotel": "🏨",
  };

  const categoryColors = {
    "Tourist Spot": "bg-orange-100 text-orange-700 border-orange-300",
    "Temple": "bg-purple-100 text-purple-700 border-purple-300",
    "Food": "bg-green-100 text-green-700 border-green-300",
    "Hotel": "bg-blue-100 text-blue-700 border-blue-300",
  };

  const totalDays = places.reduce((sum, place) => sum + place.estimatedDays, 0);
  const avgRating = places.length ? (places.reduce((sum, p) => sum + p.rating, 0) / places.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-200 shadow-lg">
        <h1 className="text-white text-2xl">Plane Now!</h1>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Trip Basics */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-indigo-600" />
              <div>
                <CardTitle className="text-2xl text-indigo-900">Trip Basics</CardTitle>
                <CardDescription className="text-base">Define your trip essentials</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Name</label>
                <Input
                  placeholder="e.g., Golden Triangle Adventure"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="h-11 text-base border-2 border-gray-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Type</label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger className="h-11 text-base border-2 border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">👤 Solo Trip</SelectItem>
                    <SelectItem value="couple">👫 Couple</SelectItem>
                    <SelectItem value="friends">👯 Friends</SelectItem>
                    <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                    <SelectItem value="group">👥 Large Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Starting From</label>
                <Input
                  placeholder="e.g., Delhi"
                  value={startingFrom}
                  onChange={(e) => setStartingFrom(e.target.value)}
                  className="h-11 text-base border-2 border-gray-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main Destination</label>
                <Input
                  placeholder="e.g., Agra"
                  value={mainDestination}
                  onChange={(e) => setMainDestination(e.target.value)}
                  className="h-11 text-base border-2 border-gray-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11 text-base border-2 border-gray-200 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11 text-base border-2 border-gray-200 focus:border-indigo-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Travel Preferences */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-7 h-7 text-emerald-600" />
              <div>
                <CardTitle className="text-2xl text-emerald-900">Preferences</CardTitle>
                <CardDescription className="text-base">Your travel style & budget</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Mode</label>
                <Select value={travelMode} onValueChange={setTravelMode}>
                  <SelectTrigger className="h-11 text-base border-2 border-gray-200">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flight">✈️ Flight</SelectItem>
                    <SelectItem value="train">🚂 Train</SelectItem>
                    <SelectItem value="bus">🚌 Bus</SelectItem>
                    <SelectItem value="car">🚗 Car</SelectItem>
                    <SelectItem value="bike">🏍️ Bike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Budget (₹)</label>
                <Input
                  type="number"
                  placeholder="50,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="h-11 text-base border-2 border-gray-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Size</label>
                <Input
                  type="number"
                  placeholder="Number of people"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className="h-11 text-base border-2 border-gray-200 focus:border-emerald-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attractions */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
            <div className="flex items-center gap-3">
              <MapPin className="w-7 h-7 text-orange-600" />
              <div>
                <CardTitle className="text-2xl text-orange-900">Attractions & Places</CardTitle>
                <CardDescription className="text-base">Add your must-visit destinations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            {/* Add Place Form */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200">
              <h3 className="text-lg font-bold text-orange-900 mb-5">Add New Attraction</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Attraction Name</label>
                    <Input
                      placeholder="e.g., Taj Mahal"
                      value={placeName}
                      onChange={(e) => setPlaceName(e.target.value)}
                      className="h-11 text-base border-2 border-orange-300 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <Select value={placeCategory} onValueChange={setPlaceCategory}>
                      <SelectTrigger className="h-11 text-base border-2 border-orange-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tourist Spot">🏰 Tourist Spot</SelectItem>
                        <SelectItem value="Temple">⛩️ Temple</SelectItem>
                        <SelectItem value="Food">🍽️ Food</SelectItem>
                        <SelectItem value="Hotel">🏨 Hotel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <Input
                    placeholder="Brief description of the place..."
                    value={placeDescription}
                    onChange={(e) => setPlaceDescription(e.target.value)}
                    className="h-11 text-base border-2 border-orange-300 focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rating (1-5)</label>
                    <Select value={placeRating} onValueChange={setPlaceRating}>
                      <SelectTrigger className="h-11 text-base border-2 border-orange-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                        <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                        <SelectItem value="1">⭐ 1 Star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Days</label>
                    <Input
                      type="number"
                      min="1"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      className="h-11 text-base border-2 border-orange-300 focus:border-orange-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={addPlace}
                      className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-base"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Attraction
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Places List */}
            {places.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-orange-600" />
                    Your Itinerary
                  </h3>
                  <div className="flex gap-2">
                    <Badge className="bg-orange-100 text-orange-700 text-base px-3 py-1.5">
                      {places.length} places
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700 text-base px-3 py-1.5">
                      {totalDays} days
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-700 text-base px-3 py-1.5">
                      ⭐ {avgRating}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {places.map((place) => (
                    <div
                      key={place.id}
                      className={`p-6 rounded-xl border-2 border-l-4 transition-all hover:shadow-lg ${categoryColors[place.category]}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-3xl">{categoryEmojis[place.category] || "📍"}</span>
                            <div>
                              <h4 className="text-xl font-bold">{place.name}</h4>
                              <p className="text-sm font-medium opacity-75">{place.category}</p>
                            </div>
                          </div>
                          <p className="text-sm mt-2 opacity-90">{place.description}</p>
                          <div className="flex gap-4 mt-4 flex-wrap">
                            <span className="text-sm font-semibold">⭐ {place.rating}/5 Stars</span>
                            <span className="text-sm font-semibold">📅 {place.estimatedDays} days</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => removePlace(place.id)}
                          variant="ghost"
                          className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trip Members */}
        {(tripType === "group" || tripType === "friends" || tripType === "family") && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
              <div className="flex items-center gap-3">
                <Users className="w-7 h-7 text-emerald-600" />
                <div>
                  <CardTitle className="text-2xl text-emerald-900">Trip Members</CardTitle>
                  <CardDescription className="text-base">Who's joining the adventure?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200">
                <h3 className="text-lg font-bold text-emerald-900 mb-5">Add Team Member</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <Input
                      placeholder="Member name"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      className="h-11 text-base border-2 border-emerald-300 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      placeholder="member@email.com"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="h-11 text-base border-2 border-emerald-300 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={addMember}
                      className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-base"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Member
                    </Button>
                  </div>
                </div>
              </div>

              {members.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Members ({members.length})</h3>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200 hover:shadow-md transition-all"
                      >
                        <div>
                          <p className="font-semibold text-emerald-900">{member.name}</p>
                          <p className="text-sm text-emerald-700">{member.email}</p>
                        </div>
                        <Button
                          onClick={() => removeMember(member.id)}
                          variant="ghost"
                          className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 py-8">
          {message && (
            <div className={`p-4 rounded-lg text-center font-semibold ${
              message.includes("✅")
                ? "bg-green-100 text-green-700 border-2 border-green-300"
                : "bg-red-100 text-red-700 border-2 border-red-300"
            }`}>
              {message}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              variant="outline"
              className="h-13 px-8 text-lg font-semibold border-2 border-gray-300 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTrip}
              disabled={isLoading}
              className="h-13 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                "🚀 Save & Start Planning"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}