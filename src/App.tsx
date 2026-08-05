import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./style/App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import PersonsList from "./pages/PersonsList";
import PersonCreate from "./pages/PersonCreate";
import PersonDetail from "./pages/PersonDetail";
import PersonEdit from "./pages/PersonEdit";
import ExtraHoursList from "./pages/ExtraHoursList";
import ExtraHoursCreate from "./pages/ExtraHoursCreate";
import ExtraHoursEdit from "./pages/ExtraHoursEdit";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with shared layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />

          {/* Persons */}
          <Route path="/persons" element={<PersonsList />} />
          <Route path="/persons/new" element={<PersonCreate />} />
          <Route path="/persons/:id" element={<PersonDetail />} />
          <Route path="/persons/:id/edit" element={<PersonEdit />} />

          {/* Extra Hours */}
          <Route path="/extra-hours" element={<ExtraHoursList />} />
          <Route path="/extra-hours/new" element={<ExtraHoursCreate />} />
          <Route path="/extra-hours/:id/edit" element={<ExtraHoursEdit />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
