import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, MapPin, Users, Wallet } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plane My Trip ✈️</h1>
          <p className="text-muted-foreground">Smart trip planning dashboard</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white">Plan New Trip</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 text-blue-600">
            <Plane className="h-5 w-5" />
            <CardTitle>Total Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 text-emerald-600">
            <MapPin className="h-5 w-5" />
            <CardTitle>Places Visited</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">48</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 text-violet-600">
            <Users className="h-5 w-5" />
            <CardTitle>Friends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">9</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 text-orange-600">
            <Wallet className="h-5 w-5" />
            <CardTitle>Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">₹32,500</p>
          </CardContent>
        </Card>
      </div>

      {/* About Project */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-800">About Plane My Trip</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            Plane My Trip helps you plan trips smartly by suggesting nearby
            places, calculating distances, optimizing visit order, and managing
            shared expenses among friends.
          </p>
          <p className="text-muted-foreground">
            Built using MERN stack with modern UI components and secure
            authentication.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-5 space-y-1">
              <li>Smart nearby place suggestions</li>
              <li>Optimized travel sequence</li>
              <li>Friend-wise expense splitting</li>
              <li>Trip summary after completion</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Create a new trip</li>
              <li>Add destination and friends</li>
              <li>Track expenses during trip</li>
              <li>View final split summary</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
