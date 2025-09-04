import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
import { Dashboard } from "./components/dashboard/Dashboard";
import Whiteboard from "./components/whiteboard/Whiteboard";
import WhiteboardList from "./components/whiteboard/WhiteboardList";
import { SocialFeed } from "./components/social/SocialFeed";
import { Navbar } from "./components/layout/Navbar";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { Toaster } from "./components/ui/sonner";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {user ? (
        <>
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/feed" element={<SocialFeed />} />
              <Route path="/whiteboard/:eventId" element={<Whiteboard />} />
              <Route path="/whiteboards" element={<WhiteboardList />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
          <Toaster />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
