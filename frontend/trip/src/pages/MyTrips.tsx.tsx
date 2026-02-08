import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CalendarDays,
  MapPin,
  Route,
  Users,
  Loader2,
} from "lucide-react"

/* ---------------- TYPES ---------------- */

type Trip = {
  _id: string
  tripName: string
  tripType: "solo" | "group"
  startDate: string
  endDate: string
  totalDays: number
  members: unknown[]
  routePlaces: unknown[]
}

/* ---------------- HELPERS ---------------- */

type TripStatus = "Upcoming" | "Ongoing" | "Completed"

const getTripStatus = (
  startDate: string,
  endDate: string
): TripStatus => {
  const today = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (today < start) return "Upcoming"
  if (today > end) return "Completed"
  return "Ongoing"
}

const statusBadgeVariant = (status: TripStatus) => {
  switch (status) {
    case "Upcoming":
      return "secondary"
    case "Ongoing":
      return "default"
    case "Completed":
      return "outline"
  }
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

/* ---------------- PAGE ---------------- */
const API_BASE_URL = "http://localhost:8001";

export default function MyTrips() {
  const navigate = useNavigate()

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* -------- FETCH TRIPS -------- */

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch(
      `${API_BASE_URL}/api/plane/getalltrip`,
          {
            credentials: "include", // if using cookies/JWT
          }
        )

        if (!res.ok) {
          throw new Error("Failed to fetch trips")
        }

        const data = await res.json()
        setTrips(data)
      } catch (err) {
        setError("Unable to load trips")
      } finally {
        setLoading(false)
      }
    }

    fetchTrips()
  }, [])

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-4xl font-bold text-indigo-700">
            ✈️ My Trips
          </h1>
          <p className="text-muted-foreground mt-2">
            All your journeys in one place
          </p>
        </div>

        {/* EMPTY STATE */}
        {trips.length === 0 && (
          <div className="text-center text-muted-foreground">
            No trips found. Create your first trip 🚀
          </div>
        )}

        {/* TRIPS GRID */}
        <div className="grid gap-6 md:grid-cols-2">
          {trips.map((trip) => {
            const status = getTripStatus(
              trip.startDate,
              trip.endDate
            )

            return (
              <Card
                key={trip._id}
                className="rounded-2xl shadow-md hover:shadow-xl transition"
              >
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-indigo-600">
                      {trip.tripName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {trip.tripType} trip
                    </p>
                  </div>

                  <Badge variant={statusBadgeVariant(status)}>
                    {status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Dates */}
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-indigo-500" />
                    <span>
                      {formatDate(trip.startDate)} →{" "}
                      {formatDate(trip.endDate)}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-pink-500" />
                      <span>{trip.members.length} Members</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-green-500" />
                      <span>
                        {trip.routePlaces.length} Routes
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span>{trip.totalDays} Days</span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/trip/${trip._id}`)
                      }
                    >
                      View Trip
                    </Button>

                    {status === "Ongoing" && (
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() =>
                          navigate(
                            `/trip/${trip._id}`
                          )
                        }
                      >
                        Find Nearby Places
                      </Button>

                      
                    )}
                      {status === "Ongoing" && (<Button
                        className="bg-indigo-600 hover:bg-indigo-700"
                        onClick={() =>
                          navigate(
                            `/${trip._id}/FullRouteView`
                          )
                        }
                      >
                        Find Nearby Places
                      </Button>)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
