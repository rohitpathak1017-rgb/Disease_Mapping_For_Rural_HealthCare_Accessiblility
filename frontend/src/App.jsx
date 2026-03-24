import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./hooks/useAuth.js";

// ── Auth Pages ────────────────────────────────────────────────────────────────
import Login    from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboard  from "./pages/admin/AdminDashboard.jsx";
import ManageWorkers   from "./pages/admin/ManageWorkers.jsx";
import AssignWorker    from "./pages/admin/AssignWorker.jsx";
import ManageVillages  from "./pages/admin/ManageVillages.jsx";
import ManageDiseases  from "./pages/admin/ManageDiseases.jsx";

// ── Health Worker Pages ───────────────────────────────────────────────────────
import WorkerDashboard   from "./pages/healthworker/WorkerDashboard.jsx";
import DiseaseReportForm from "./pages/healthworker/DiseaseReportForm.jsx";
import DiseaseCharts     from "./pages/healthworker/DiseaseCharts.jsx";
import CampManagement    from "./pages/healthworker/CampManagement.jsx";
import ViewFeedback      from "./pages/healthworker/ViewFeedback.jsx";

// ── Public Pages ──────────────────────────────────────────────────────────────
import PublicHome      from "./pages/public/PublicHome.jsx";
import VillageDetails  from "./pages/public/VillageDetails.jsx";
import GiveFeedback    from "./pages/public/GiveFeedback.jsx";

// ── Components ────────────────────────────────────────────────────────────────
import ProtectedRoute  from "./components/ProtectedRoute.jsx";
import LoadingSpinner  from "./components/LoadingSpinner.jsx";

// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  const { loading } = useAuth();

  // Wait for initial auth check before rendering routes
  if (loading) return <LoadingSpinner />;

  return (
    <Routes>

      {/* ── Public Routes (No login needed) ────────────────────────────────── */}
      <Route path="/"               element={<PublicHome />} />
      <Route path="/village/:id"    element={<VillageDetails />} />
      <Route path="/login"          element={<Login />} />
      <Route path="/register"       element={<Register />} />

      {/* ── Auth Required (any logged-in user) ─────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/feedback/:workerId" element={<GiveFeedback />} />
      </Route>

      {/* ── Admin Routes ───────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/dashboard"     element={<AdminDashboard />} />
        <Route path="/admin/workers"       element={<ManageWorkers />} />
        <Route path="/admin/assign-worker" element={<AssignWorker />} />
        <Route path="/admin/villages"      element={<ManageVillages />} />
        <Route path="/admin/diseases"      element={<ManageDiseases />} />
      </Route>

      {/* ── Health Worker Routes ────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["healthworker"]} />}>
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        <Route path="/worker/report"    element={<DiseaseReportForm />} />
        <Route path="/worker/charts"    element={<DiseaseCharts />} />
        <Route path="/worker/camp"      element={<CampManagement />} />
        <Route path="/worker/feedback"  element={<ViewFeedback />} />
      </Route>

      {/* ── 404 → Redirect to Home ──────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default App;