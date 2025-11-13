import { useState } from "react";
import axios from "axios";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL ;

  // Helper: set cookies
  const setCookie = (name, value, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; ${expires}; path=/; SameSite=Lax`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) return setError("Email is required");
    if (!password.trim()) return setError("Password is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Please enter a valid email");

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      if (token) {
        setCookie("auth_token", token, 7);
        setCookie("auth_user", JSON.stringify(user), 7);
      }

      setSuccess("✅ Login successful! Redirecting...");
      setEmail("");
      setPassword("");

      // Redirect based on role
      setTimeout(() => {
        if (user.role === "employer") {
          window.location.href = "/employer";
        } else {
          window.location.href = "/alljobs";
        }
      }, 1200);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Login</h1>
          <p>Welcome back to Recruitment App</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <a href="/register">Sign up here</a>
          </p>
          <p>
            <a href="/forgot-password">Forgot password?</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
