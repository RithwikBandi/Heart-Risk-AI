import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PredictionPage from "./pages/PredictionPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ResourcesPage from "./pages/ResourcesPage.jsx";
import CaseStudyPage from "./pages/CaseStudyPage.jsx";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const defaultAppPath = token ? "/app" : "/login";

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/case-study" element={<CaseStudyPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected app */}
      <Route path="/app" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/app/predict" element={<ProtectedRoute><AppLayout><PredictionPage /></AppLayout></ProtectedRoute>} />
      <Route path="/app/history" element={<ProtectedRoute><AppLayout><HistoryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/app/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
      <Route path="/app/admin" element={<ProtectedRoute><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={defaultAppPath} replace />} />
    </Routes>
  );
}

export default App;
