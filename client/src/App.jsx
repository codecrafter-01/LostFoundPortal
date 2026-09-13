import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import "./App.css";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ReportLost from "./pages/ReportLost";
import ReportFound from "./pages/ReportFound";
import MyReports from "./pages/MyReports";
import EditReport from "./pages/EditReport";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>

      {/* ============================== */}
      {/* Navigation Bar */}
      {/* ============================== */}

      <Navbar />


      {/* ============================== */}
      {/* Application Routes */}
      {/* ============================== */}

      <Routes>

        {/* ============================== */}
        {/* PUBLIC ROUTES */}
        {/* ============================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/lost"
          element={<Lost />}
        />

        <Route
          path="/found"
          element={<Found />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ============================== */}
        {/* PROTECTED ROUTES */}
        {/* ============================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        <Route
          path="/report-lost"
          element={
            <ProtectedRoute>
              <ReportLost />
            </ProtectedRoute>
          }
        />


        <Route
          path="/report-found"
          element={
            <ProtectedRoute>
              <ReportFound />
            </ProtectedRoute>
          }
        />


        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          }
        />


        <Route
          path="/edit-report/:id"
          element={
            <ProtectedRoute>
              <EditReport />
            </ProtectedRoute>
          }
        />


        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />


        {/* ============================== */}
        {/* PROFILE ROUTE */}
        {/* ============================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;