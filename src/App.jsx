// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Header from "./components/Header";
import "./App.css";

// Public pages
import GenericHome from "./pages/notLoggedIn/GenericHome";
import Login from "./pages/notLoggedIn/Login";
import PublicLeaderboard from "./pages/notLoggedIn/PublicLeaderboard";

// Read-only demo pages (previously “loggedIn”)
import Dashboard from "./pages/loggedIn/Dashboard";
import Section from "./pages/loggedIn/Section";
import RoutePage from "./pages/loggedIn/Route";
import Events from "./pages/loggedIn/Events";
import Competition from "./pages/loggedIn/Competition";
import TeamDetails from "./pages/loggedIn/TeamDetails";
import Profile from "./pages/loggedIn/Profile";

// NOTE: All admin imports have been removed

function AppRoutes() {
  const location = useLocation();
  const hideHeader =
    location.pathname === "/" || location.pathname.startsWith("/leaderboard");

  return (
    <>
      <Header />
      <div
        className={`min-h-screen ${hideHeader ? "" : "pb-16 md:pt-16 md:pb-0"}`}
      >
        <Routes>
          {/* Public */}
          <Route path="/" element={<GenericHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard/:eventId" element={<PublicLeaderboard />} />

          {/* Demo: previously protected -> now public */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/section/:sectionId" element={<Section />} />
          <Route path="/route/:routeId" element={<RoutePage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/competition/:eventId" element={<Competition />} />
          <Route
            path="/competition/:eventId/team/:teamId"
            element={<TeamDetails />}
          />

          {/* Catch-all (optional) */}
          <Route path="*" element={<GenericHome />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
