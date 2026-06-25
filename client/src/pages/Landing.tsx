import { useState, useEffect, useRef } from "react";
import "./Landing.css";

// ─────────────────────────────────────────────
// StreamVault Landing — Netflix-style consumer
// landing page. Only user-facing functionality
// is described here (no internal/developer
// features or tech-stack mentions). Log In and
// Sign Up are plain navigational links to their
// own routes — swap the <a> tags for your router's
// <Link> component (e.g. react-router-dom) if needed.
// ─────────────────────────────────────────────

interface Feature {
  icon: string;
  title: string;
  desc: string;
  red: boolean;
}

interface LandingProps {
  /** Route the "Log In" link points to. */
  loginHref?: string;
  /** Route the "Sign Up" / "Create Account" links point to. */
  registerHref?: string;
  /** Route the "Browse as Guest" links point to. */
  guestHref?: string;
}

// ─────────────────────────────────────────────
// Static data — user-centric features only
// ─────────────────────────────────────────────
const FEATURES: Feature[] = [
  {
    icon: "🎬",
    title: "Unlimited Movies & Shows",
    desc: "Dive into a constantly growing library of blockbuster movies, binge-worthy series, and StreamVault Originals — all included with your membership.",
    red: false,
  },
  {
    icon: "📺",
    title: "Smooth, Buffer-Free Playback",
    desc: "Picture quality automatically adjusts to your connection, so you get the best possible stream without the spinning wheel — all the way up to stunning 4K.",
    red: true,
  },
  {
    icon: "🔖",
    title: "Your List, Your Way",
    desc: "Save anything that catches your eye to My List and come back whenever you like — perfectly in sync across your phone, tablet, laptop, and TV.",
    red: false,
  },
  {
    icon: "👶",
    title: "Made for the Whole Family",
    desc: "Create a profile for everyone in the house, with kid-friendly viewing limits and content controls that keep family movie night stress-free.",
    red: true,
  },
  {
    icon: "⏱️",
    title: "Never Lose Your Spot",
    desc: "Start a show on the train, finish it on the couch. StreamVault remembers exactly where you left off, on every device.",
    red: false,
  },
  {
    icon: "📱",
    title: "Watch on Any Screen",
    desc: "Stream on your phone, tablet, laptop, game console, or smart TV — your shows go wherever you go.",
    red: true,
  },
];

// ─────────────────────────────────────────────
// Small icon components (inline SVG)
// ─────────────────────────────────────────────
function IconLogin() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function IconRegister() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function IconGuest() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Counter animation helper
// ─────────────────────────────────────────────
function animateCount(
  setter: (value: string) => void,
  target: number,
  suffix: string,
  duration: number,
): void {
  let current = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      setter(`${target}${suffix}`);
      clearInterval(timer);
    } else {
      setter(`${Math.floor(current)}${suffix}`);
    }
  }, 16);
}

const PARTICLE_COLOURS = [
  "rgba(176,77,255,",
  "rgba(204,0,24,",
  "rgba(139,32,216,",
];

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function Landing({
  loginHref = "/login",
  registerHref = "/register",
  guestHref = "/browse",
}: LandingProps) {
  // Animated counter state
  const [showCount, setShowCount] = useState<string>("0K+");
  const [userCount, setUserCount] = useState<string>("0M+");
  const [deviceCount, setDeviceCount] = useState<string>("0+");

  // DOM refs
  const particlesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // ── Generate floating particles on mount ──
  useEffect(() => {
    const container = particlesRef.current;
    if (!container) return;

    for (let i = 0; i < 28; i++) {
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

  // ── Scroll-reveal via IntersectionObserver ──
  useEffect(() => {
    const reveals = document.querySelectorAll<HTMLElement>(".sv-reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("sv-visible"), i * 80);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    reveals.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ── Stats counter triggered by scroll ──
  useEffect(() => {
    const strip = statsRef.current;
    if (!strip) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animateCount(setShowCount, 50, "K+", 1200);
          animateCount(setUserCount, 12, "M+", 1400);
          animateCount(setDeviceCount, 15, "+", 1000);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(strip);
    return () => obs.disconnect();
  }, []);

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <>
      {/* ── Atmosphere layers ── */}
      <div className="sv-aurora" />
      <div className="sv-grain" />
      <div className="sv-particles" ref={particlesRef} />

      {/* ── Page content ── */}
      <div className="sv-page">
        {/* NAV */}
        <nav className="sv-nav">
          <div className="sv-nav-logo">StreamVault</div>
          <ul className="sv-nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#about">Why StreamVault</a>
            </li>
          </ul>
          <div className="sv-nav-cta">
            <a href={loginHref} className="sv-btn sv-btn-login">
              Log In
            </a>
            <a href={registerHref} className="sv-btn sv-btn-register">
              Sign Up
            </a>
          </div>
        </nav>

        {/* HERO */}
        <section className="sv-hero">
          <p className="sv-hero-eyebrow">The Future of Streaming Is Here</p>
          <h1 className="sv-hero-title">
            STREAM
            <br />
            VAULT
          </h1>
          <p className="sv-hero-tagline">
            Unlock a universe of content. Stream anything, anywhere — with
            intelligent recommendations, offline downloads, and cinematic 4K
            quality.
          </p>
          <div className="sv-divider-line" />
          <div className="sv-auth-group">
            <a href={loginHref} className="sv-btn sv-btn-login">
              <IconLogin /> Log In
            </a>
            <a href={registerHref} className="sv-btn sv-btn-register">
              <IconRegister /> Create Account
            </a>
            <a href={guestHref} className="sv-btn sv-btn-guest">
              <IconGuest /> Browse as Guest
            </a>
          </div>
          <div className="sv-scroll-hint">
            <div className="sv-scroll-mouse" />
            <span>Explore Features</span>
          </div>
        </section>

        {/* STATS */}
        <div className="sv-stats-strip" ref={statsRef}>
          <div className="sv-stats-inner">
            <div className="sv-stat">
              <div className="sv-stat-num">{showCount}</div>
              <div className="sv-stat-label">Titles Available</div>
            </div>
            <div className="sv-stat">
              <div className="sv-stat-num">{userCount}</div>
              <div className="sv-stat-label">Active Users</div>
            </div>
            <div className="sv-stat">
              <div className="sv-stat-num">4K</div>
              <div className="sv-stat-label">Max Resolution</div>
            </div>
            <div className="sv-stat">
              <div className="sv-stat-num">{deviceCount}</div>
              <div className="sv-stat-label">Supported Devices</div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section className="sv-features" id="features">
          <p className="sv-section-label sv-reveal">What's Inside the Vault</p>
          <h2 className="sv-section-title sv-reveal">
            Everything You Need,
            <br />
            Nothing You Don't
          </h2>
          <p className="sv-section-sub sv-reveal">
            From blockbuster hits to hidden gems, StreamVault brings every story
            you love to one screen — wherever you are.
          </p>
          <div className="sv-features-grid">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className={`sv-feature-card sv-reveal${feature.red ? " sv-red-accent" : ""}`}
              >
                <div
                  className={`sv-feature-icon ${feature.red ? "sv-icon-red" : "sv-icon-purple"}`}
                >
                  {feature.icon}
                </div>
                <div className="sv-feature-title">{feature.title}</div>
                <div className="sv-feature-desc">{feature.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="sv-footer-cta" id="about">
          <h2 className="sv-footer-cta-title sv-reveal">
            Ready to Start Watching?
          </h2>
          <p className="sv-footer-cta-sub sv-reveal">
            Join millions of viewers already streaming. Set up your account in
            under a minute.
          </p>
          <div className="sv-auth-group sv-reveal">
            <a href={registerHref} className="sv-btn sv-btn-register">
              Start Watching Free
            </a>
            <a href={guestHref} className="sv-btn sv-btn-guest">
              Explore First
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="sv-footer">
          <div className="sv-footer-logo">StreamVault</div>
          <div className="sv-footer-copy">
            © 2025 StreamVault. All rights reserved.
          </div>
        </footer>
      </div>
      {/* /sv-page */}
    </>
  );
}
