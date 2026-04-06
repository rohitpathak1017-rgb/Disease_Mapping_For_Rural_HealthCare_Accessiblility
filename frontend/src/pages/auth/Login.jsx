/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

const Login = () => {
  const { login, isAdmin, isHealthWorker } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Redirect back to where user came from, or role dashboard
  const from = location.state?.from?.pathname;

  const getRedirectPath = (role) => {
    if (from) return from;
    if (role === "admin")        return "/admin/dashboard";
    if (role === "healthworker") return "/worker/dashboard";
    return "/";
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const response = await login(formData);
      navigate(getRedirectPath(response.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="container1">
  <div className="container2">

    {/* Header */}
    <div className="container3">
      <div className="container4">
        <span className="container5">DM</span>
      </div>
      <h1 className="container6">Welcome Back</h1>
      <p className="container7">Sign in to Disease Mapping System</p>
    </div>

    {/* Error */}
    {error && (
      <div className="container8">
        {error}
      </div>
    )}

    {/* Form */}
    <form onSubmit={handleSubmit} className="container9">

      <div className="container10">
        <label className="container11"></label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter Email Address"
          className="container12"
        />
      </div>

      <div className="container13">
        <label className="container14"></label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter Password"
          className="container15"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="container16"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>

    {/* Footer */}
    <p className="container17">
      Don't have an account?{" "}
      <Link to="/register" className="container18">
        Register here
      </Link>
    </p>

  </div>
</div>
  );
};

export default Login;