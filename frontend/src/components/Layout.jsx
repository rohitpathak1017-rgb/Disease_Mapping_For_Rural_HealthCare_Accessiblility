import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import useAuth from "../hooks/useAuth.js";

// ── Layout with Sidebar ───────────────────────────────────────────────────────
// Admin + Worker pages use this — has Navbar + Sidebar + main content
// ─────────────────────────────────────────────────────────────────────────────
const Layout = () => {
  const { isAdmin, isHealthWorker } = useAuth();
  const hasSidebar = isAdmin || isHealthWorker;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar — only for Admin and HealthWorker */}
        {hasSidebar && <Sidebar />}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;