import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/authentication";
import PlanTrip from "./pages/PlanTrip";
import ProtectedRoute from "./context/Protected";
import ProtectedLayout from "./context/ProtectedLayout";
import Dashboard from "./pages/Dashboard"
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
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
