import { createContext, useState, useEffect, useCallback } from "react";
import { loginUser, logoutUser, registerUser, getMyProfile } from "../services/auth.service.js";
import { getToken, removeToken, getErrorMessage } from "../utils/helpers.js";

// ── Create Context ────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ── Auth Provider ─────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);  // initial profile fetch
  const [error,   setError]   = useState(null);

  // ── On App Load: fetch profile if token exists ──────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await getMyProfile();
        setUser(response.data);
      } catch {
        // Token invalid/expired — clean up
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await loginUser(credentials);
      setUser(response.data.user);
      return response.data; // { user, role, accessToken }
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await registerUser(userData);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // Even if API fails, clear local state
    } finally {
      setUser(null);
      removeToken();
    }
  }, []);

  // ── Update User (after profile edit) ────────────────────────────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  // ── Role Helpers ─────────────────────────────────────────────────────────────
  const isAdmin        = user?.role === "admin";
  const isHealthWorker = user?.role === "healthworker";
  const isPublic       = user?.role === "public";
  const isLoggedIn     = !!user;

  // ── Context Value ────────────────────────────────────────────────────────────
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    isHealthWorker,
    isPublic,
    isLoggedIn,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};