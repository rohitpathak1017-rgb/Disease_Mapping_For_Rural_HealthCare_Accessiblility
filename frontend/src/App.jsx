import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./hooks/useAuth.js";

// ── Layout ────────────────────────────────────────────────────────────────────
import Layout          from "./components/Layout.jsx";
import ProtectedRoute  from "./components/ProtectedRoute.jsx";
import LoadingSpinner  from "./components/LoadingSpinner.jsx";

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
import PublicHome     from "./pages/public/PublicHome.jsx";
import VillageDetails from "./pages/public/VillageDetails.jsx";
import GiveFeedback   from "./pages/public/GiveFeedback.jsx";

// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  const { loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <Routes>

      {/* ── Auth Pages (No Layout — full screen forms) ───────────────────────── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Public Pages (Layout — Navbar only, no Sidebar) ─────────────────── */}
      <Route element={<Layout />}>
        <Route path="/"            element={<PublicHome />} />
        <Route path="/village/:id" element={<VillageDetails />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/feedback/:workerId" element={<GiveFeedback />} />
        </Route>
      </Route>

      {/* ── Admin Routes (ProtectedRoute + Layout + Sidebar) ────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard"     element={<AdminDashboard />} />
          <Route path="/admin/workers"       element={<ManageWorkers />} />
          <Route path="/admin/assign-worker" element={<AssignWorker />} />
          <Route path="/admin/villages"      element={<ManageVillages />} />
          <Route path="/admin/diseases"      element={<ManageDiseases />} />
        </Route>
      </Route>

      {/* ── Health Worker Routes (ProtectedRoute + Layout + Sidebar) ────────── */}
      <Route element={<ProtectedRoute allowedRoles={["healthworker"]} />}>
        <Route element={<Layout />}>
          <Route path="/worker/dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/report"    element={<DiseaseReportForm />} />
          <Route path="/worker/charts"    element={<DiseaseCharts />} />
          <Route path="/worker/camp"      element={<CampManagement />} />
          <Route path="/worker/feedback"  element={<ViewFeedback />} />
        </Route>
      </Route>

      {/* ── 404 ──────────────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
};

export default App;