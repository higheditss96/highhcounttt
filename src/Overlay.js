import React, { useEffect, useRef, useState } from "react";
import "./App.css";

export default function Overlay() {
  const [followers, setFollowers] = useState(97); // exemplu inițial
  const [goal, setGoal] = useState(100);
  const [goalReached, setGoalReached] = useState(false);
  const [prevFollowers, setPrevFollowers] = useState(97);
  const goalRef = useRef(null);

  // Simulare pentru test (auto-update random)
  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random() > 0.5 ? 1 : -1;
      setPrevFollowers(followers);
      setFollowers((prev) => Math.max(0, prev + random));
    }, 3000);
    return () => clearInterval(interval);
  }, [followers]);

  // Pulse verde/roșu + confetti când se atinge goal-ul
  useEffect(() => {
    if (!goalRef.current) return;

    if (followers > prevFollowers) {
      goalRef.current.classList.add("followPulse");
      setTimeout(() => goalRef.current.classList.remove("followPulse"), 600);
    } else if (followers < prevFollowers) {
      goalRef.current.classList.add("unfollowPulse");
      setTimeout(() => goalRef.current.classList.remove("unfollowPulse"), 600);
    }

    if (followers >= goal && !goalReached) {
      setGoalReached(true);
      goalRef.current.classList.add("complete");
      launchConfetti();
    }
  }, [followers]);

  const launchConfetti = () => {
    const container = document.createElement("div");
    container.classList.add("confetti");
    document.body.appendChild(container);

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("div");
      piece.classList.add("confetti-piece");
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.backgroundColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
      piece.style.animationDelay = Math.random() * 1 + "s";
      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  };

  const progress = Math.min((followers / goal) * 100, 100);

  return (
    <div className="page page--overlay clean">
      <div className="overlay-box with-box">
        <div className="overlay-count">{followers}</div>
      </div>

      <div className="goal-container">
        <div className="goal-text">
          {followers} / {goal} followers
        </div>
        <div className="goal-bar">
          <div
            className="goal-fill"
            ref={goalRef}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
