import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";
import "./Register.css";

const PARTICLE_COLOURS = [
  "rgba(176,77,255,",
  "rgba(204,0,24,",
  "rgba(139,32,216,",
];

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

// RFC-5322-inspired — catches the vast majority of invalid addresses
// while accepting all real-world valid ones.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Eye icons rendered as inline SVG so there's no icon-library dependency.
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

export default function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const particlesRef = useRef<HTMLDivElement>(null);

  // Floating background particles — same effect as the landing/login pages.
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

  const validate = (): string | null => {
    if (username.trim().length < MIN_USERNAME_LENGTH) {
      return `Username must be at least ${MIN_USERNAME_LENGTH} characters.`;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      return "Please enter a valid email address (e.g. you@example.com).";
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (password !== confirmPassword) {
      return "Passwords do not match. Please try again.";
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await registerUser(username.trim(), email.trim(), password);
      navigate("/login");
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;
      setError(
        serverMessage ??
          "We couldn't create your account. Please check your details and try again.",
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
          <h1 className="sv-auth-card-title">Create Your Account</h1>
          <p className="sv-auth-card-sub">
            Join StreamVault and start watching today
          </p>

          <form className="sv-auth-form" onSubmit={submit}>
            {error && (
              <div className="sv-auth-error" role="alert">
                {error}
              </div>
            )}

            {/* ── Username ─────────────────────────────────────────── */}
            <div className="sv-auth-field">
              <label htmlFor="register-username">Username</label>
              <input
                id="register-username"
                type="text"
                className="sv-auth-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                minLength={MIN_USERNAME_LENGTH}
                required
              />
            </div>

            {/* ── Email ────────────────────────────────────────────── */}
            <div className="sv-auth-field">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                className="sv-auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* ── Password ─────────────────────────────────────────── */}
            <div className="sv-auth-field">
              <label htmlFor="register-password">Password</label>
              <div className="sv-auth-input-wrapper">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className="sv-auth-input sv-auth-input--has-icon"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
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

            {/* ── Confirm Password ─────────────────────────────────── */}
            <div className="sv-auth-field">
              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>
              <div className="sv-auth-input-wrapper">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  className="sv-auth-input sv-auth-input--has-icon"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  required
                />
                <button
                  type="button"
                  className="sv-auth-eye-btn"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="sv-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account…" : "Create Account"}
            </button>
          </form>

          <div className="sv-auth-divider">
            <span>or</span>
          </div>

          <p className="sv-auth-switch">
            Already have an account?{" "}
            <Link to="/login" className="sv-auth-switch-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
