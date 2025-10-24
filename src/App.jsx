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

import GenericHome from "./pages/notLoggedIn/GenericHome";
import Login from "./pages/notLoggedIn/Login";
import PublicLeaderboard from "./pages/notLoggedIn/PublicLeaderboard";
import Dashboard from "./pages/loggedIn/Dashboard";
import Section from "./pages/loggedIn/Section";
import RoutePage from "./pages/loggedIn/Route";
import Profile from "./pages/loggedIn/Profile";
import SetDetail from "./pages/admin/SetDetail";
import Events from "./pages/loggedIn/Events";
import Competition from "./pages/loggedIn/Competition";
import SectionManager from "./pages/admin/SectionManager";
import SetManager from "./pages/admin/SetManager";
import TeamManager from "./pages/admin/AdminTeams";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTeams from "./pages/admin/AdminTeams";
import AdminSyncUsers from "./pages/admin/AdminSyncUsers";
import CompetitionEditor from "./pages/admin/CompetitionEditor";
import CompetitionTeamEditor from "./pages/admin/CompetitionTeamEditor";
import CompetitionRouteEditor from "./pages/admin/CompetitionRouteEditor";
import TeamMembersEditor from "./pages/admin/TeamMembersEditor";
import TeamBuilder from "./pages/admin/TeamBuilder";
import EventManager from "./pages/admin/EventManager";
import TeamDetails from "./pages/loggedIn/TeamDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CompressRouteImages from "./pages/admin/compressLargeImages";
import CompetitionAscentEditor from "./pages/admin/CompetitionAscentEditor";

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
          {/* Public Routes */}
          <Route path="/" element={<GenericHome />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/leaderboard/:eventId" element={<PublicLeaderboard />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sections"
            element={
              <AdminRoute>
                <SectionManager />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sets"
            element={
              <AdminRoute>
                <SetManager />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sets/:setId"
            element={
              <AdminRoute>
                <SetDetail />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <AdminRoute>
                <TeamManager />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <AdminRoute>
                <EventManager />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/competitions/:competitionId/teams"
            element={
              <AdminRoute>
                <CompetitionTeamEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/competitions/:competitionId/"
            element={
              <AdminRoute>
                <CompetitionEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/competitions/:competitionId/routes/"
            element={
              <AdminRoute>
                <CompetitionRouteEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/competitions/:eventId/teams/:teamId"
            element={
              <AdminRoute>
                <TeamMembersEditor />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/competitions/:eventId/teamBuilder"
            element={
              <AdminRoute>
                <TeamBuilder />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/competitions/sync"
            element={
              <AdminRoute>
                <AdminSyncUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/competitions/:eventId/ascents"
            element={
              <AdminRoute>
                <CompetitionAscentEditor />
              </AdminRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/section/:sectionId"
            element={
              <ProtectedRoute>
                <Section />
              </ProtectedRoute>
            }
          />
          <Route
            path="/route/:routeId"
            element={
              <ProtectedRoute>
                <RoutePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/competition/:eventId"
            element={
              <ProtectedRoute>
                <Competition />
              </ProtectedRoute>
            }
          />
          <Route
            path="/competition/:eventId/team/:teamId"
            element={
              <ProtectedRoute>
                <TeamDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}
function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
