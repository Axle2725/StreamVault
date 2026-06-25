import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../auth/useAuth";
import "./Login.css";

const PARTICLE_COLOURS = [
  "rgba(176,77,255,",
  "rgba(204,0,24,",
  "rgba(139,32,216,",
];

function EyeOpenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const particlesRef = useRef<HTMLDivElement>(null);

  // Floating background particles, same effect as the landing page
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    for (let i = 0; i < 24; i++) {
      const el = document.createElement("div");
      el.className = "sv-particle";
      const size = Math.random() * 4 + 2;
      const col =
        PARTICLE_COLOURS[Math.floor(Math.random() * PARTICLE_COLOURS.length)];
      const opacity = (Math.random() * 0.5 + 0.3).toFixed(2);
      el.style.cssText = [
        `width:${size}px`,
        `height:${size}px`,
        `left:${(Math.random() * 100).toFixed(1)}%`,
        `bottom:${(Math.random() * 10 - 5).toFixed(1)}%`,
        `background:${col}${opacity})`,
        `animation-duration:${(Math.random() * 12 + 8).toFixed(1)}s`,
        `animation-delay:${(Math.random() * 10).toFixed(1)}s`,
      ].join(";");
      container.appendChild(el);
    }

    return () => {
      container.innerHTML = "";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await loginUser(email, password);
      login(res.data.accessToken, res.data.user);
      navigate("/home");
    } catch {
      setError(
        "We couldn't log you in. Check your email and password and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sv-auth-page">
      <div className="sv-aurora" />
      <div className="sv-grain" />
      <div className="sv-particles" ref={particlesRef} />

      <div className="sv-auth-topbar">
        <Link to="/" className="sv-auth-logo">
          StreamVault
        </Link>
      </div>

      <div className="sv-auth-center">
        <div className="sv-auth-card">
          <h1 className="sv-auth-card-title">Welcome Back</h1>
          <p className="sv-auth-card-sub">Log in to continue watching</p>

          <form className="sv-auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="sv-auth-error" role="alert">
                {error}
              </div>
            )}

            <div className="sv-auth-field">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="sv-auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="sv-auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="sv-auth-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="sv-auth-input sv-auth-input--has-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="sv-auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="sv-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging In…" : "Log In"}
            </button>
          </form>

          <div className="sv-auth-divider">
            <span>or</span>
          </div>

          <p className="sv-auth-switch">
            New to StreamVault?
            <Link to="/register" className="sv-auth-switch-link">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
