import React, { useEffect, useMemo, useRef, useState } from "react";
import { Routes, Route, useSearchParams } from "react-router-dom";

const API_BASE = "https://hightools-backend-production.up.railway.app";

/* ============== Google Font injector ============== */
function useGoogleFont(fontFamily) {
  useEffect(() => {
    if (!fontFamily) return;
    const id = "gf-" + fontFamily.replace(/\s+/g, "-").toLowerCase();
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    const fam = fontFamily.replace(/\s+/g, "+");
    link.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
  }, [fontFamily]);
}

/* ===================== Dashboard ===================== */
function Dashboard() {
  const [username, setUsername] = useState(localStorage.getItem("hc_username") || "hyghman");
  const [color, setColor] = useState(localStorage.getItem("hc_color") || "#ffffff");
  const [font, setFont] = useState(localStorage.getItem("hc_font") || "Poppins");
  const [goalEnabled, setGoalEnabled] = useState(localStorage.getItem("hc_goal_enabled") === "true");
  const [goal, setGoal] = useState(localStorage.getItem("hc_goal") || 100);
  const [theme, setTheme] = useState(localStorage.getItem("hc_theme") || "dark");

  const fonts = useMemo(
    () => [
      "Poppins",
      "Inter",
      "Bebas Neue",
      "Orbitron",
      "Montserrat",
      "Rubik",
      "Oswald",
      "Raleway",
      "Exo 2",
      "Work Sans",
    ],
    []
  );

  useGoogleFont(font);

  useEffect(() => {
    document.body.className = theme === "light" ? "light" : "";
    localStorage.setItem("hc_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("hc_username", username);
    localStorage.setItem("hc_color", color);
    localStorage.setItem("hc_font", font);
    localStorage.setItem("hc_goal", goal);
    localStorage.setItem("hc_goal_enabled", goalEnabled);
  }, [username, color, font, goal, goalEnabled]);

  const openOverlay = () => {
    const params = new URLSearchParams({
      user: username.trim(),
      color,
      font,
      goal: goalEnabled ? goal : 0,
    }).toString();
    window.open(`/overlay?${params}`, "_blank");
  };

  return (
    <div className="page page--dashboard">
      <div className="topbar">
        <h1 className="brand">HIGHCOUNT</h1>
        <button
          className="mode-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>

      <div className="panel glass">
        <div className="row">
          <label>Kick username</label>
          <input
            className="inp"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="ex: hyghman"
          />
        </div>

        <div className="row">
          <label>Counter color</label>
          <input
            className="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <input
            className="hex"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div className="row">
          <label>Font</label>
          <select
            className="select"
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            {fonts.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>
                {f}
              </option>
            ))}
          </select>

          <div className="font-preview" style={{ fontFamily: font }}>
            AaBbCc — Font Preview ({font})
          </div>
        </div>

        <div className="row">
          <label>Use Follow Goal?</label>
          <select
            className="select"
            value={goalEnabled ? "yes" : "no"}
            onChange={(e) => setGoalEnabled(e.target.value === "yes")}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {goalEnabled && (
          <div className="row">
            <label>Follow Goal</label>
            <input
              className="inp"
              type="number"
              min="1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        )}

        <button className="cta" onClick={openOverlay}>
          Open OBS Overlay
        </button>

        <p className="hint">
          Copy URL for OBS Browser Source →{" "}
          <code>?user=NAME&color=%23FFFFFF&font=Orbitron&goal=500</code>
        </p>
      </div>

      <footer className="credit">
        made by{" "}
        <a
          href="https://kick.com/highman-edits"
          target="_blank"
          rel="noopener noreferrer"
          className="author"
        >
          highman_edits
        </a>{" "}
        <img
          src="https://cdn.7tv.app/emote/01GR4G94K00003C5VKDM5EYK9S/4x.avif"
          alt="emote"
          className="emote"
        />{" "}
        | not affiliated with Kick.com
      </footer>
    </div>
  );
}

/* ====================== Overlay ====================== */
function Overlay() {
  const [params] = useSearchParams();
  const username = (params.get("user") || "hyghman").trim();
  const color = params.get("color") || "#FFFFFF";
  const font = params.get("font") || "Poppins";
  const goal = parseInt(params.get("goal") || "0", 10);

  const [count, setCount] = useState(0);
  const [animate, setAnimate] = useState(false);
  const lastCountRef = useRef(0);

  useGoogleFont(font);

  const animateTo = (from, to, duration = 800) => {
    const start = performance.now();
    setAnimate(true);
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(from + (to - from) * eased);
      setCount(val);
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(() => setAnimate(false), 400);
    };
    requestAnimationFrame(step);
  };

  const fetchFollowers = async () => {
    try {
      const res = await fetch(`${API_BASE}/user?username=${username}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "fetch error");
      const newCount = Number(data.followers_count || 0);
      if (newCount !== lastCountRef.current) {
        animateTo(lastCountRef.current || 0, newCount);
        lastCountRef.current = newCount;
      }
    } catch {
      // silent fail
    }
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--overlay-font", font);
    document.documentElement.style.setProperty("--overlay-color", color);
  }, [font, color]);

  useEffect(() => {
    fetchFollowers();
    const id = setInterval(fetchFollowers, 5000);
    return () => clearInterval(id);
  }, [username]);

  const progress = goal > 0 ? Math.min(100, (count / goal) * 100).toFixed(1) : 0;

  return (
    <div className="page page--overlay clean">
      <div
        className={`overlay-count ${animate ? "popUp" : ""}`}
        style={{
          color: color,
          fontFamily: font,
        }}
      >
        {count.toLocaleString()}
      </div>

      {goal > 0 && (
        <div className="goal-container">
          <div className="goal-text">
            {count} / {goal} followers ({progress}%)
          </div>
          <div className="goal-bar">
            <div
              className="goal-fill"
              style={{ width: `${progress}%`, background: color }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Router ===================== */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/overlay" element={<Overlay />} />
    </Routes>
  );
}
