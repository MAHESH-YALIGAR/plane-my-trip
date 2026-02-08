import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/authentication";
import PlanTrip from "./pages/PlanTrip";
import ProtectedRoute from "./context/Protected";
import ProtectedLayout from "./context/ProtectedLayout";
import Dashboard from "./pages/Dashboard";
import RouteDistancePage from "./pages/RouteDistancePage";
import NearbyPlaces   from "./pages/NearbyPlaces";
import RoutePlanner from "./pages/RoutePlanner";
import MyTrips from "./pages/MyTrips.tsx";
import FullRouteView from "./pages/FullRouteView.tsx"
function App() {
  return (
    <Router>
      <Routes>
        {/* 🔓 Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 🔓 Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🔐 Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/PlanTrip" element={<PlanTrip />} />
            <Route path="/Dashboard" element={<Dashboard/>}/>
            <Route path="/RouteDistancePage" element={<RouteDistancePage/>}/>
            <Route path="/trip/:id" element={<NearbyPlaces/>}/>
            <Route path="/:id/RoutePlanner" element={<RoutePlanner/>}/>
            <Route path="/MyTrips" element={<MyTrips/>}/>
            <Route path="/:id/FullRouteView" element={<FullRouteView/>}/>

          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
