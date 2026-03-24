import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

// ── useAuth Hook ──────────────────────────────────────────────────────────────
// AuthContext ko consume karne ka shortcut
// Usage: const { user, login, logout, isAdmin } = useAuth();
// ─────────────────────────────────────────────────────────────────────────────
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;