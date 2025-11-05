import React, { useEffect, useRef, useState } from "react";
import "./App.css";

export default function Overlay() {
  const [followers, setFollowers] = useState(245);
  const [goal, setGoal] = useState(300);
  const [goalEnabled, setGoalEnabled] = useState(true);
  const [prevFollowers, setPrevFollowers] = useState(followers);
  const [goalReached, setGoalReached] = useState(false);
  const goalRef = useRef(null);

  // Simulare modificare follower count (test vizual)
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.random() > 0.6 ? 1 : Math.random() > 0.8 ? -1 : 0;
      if (change !== 0) {
        setPrevFollowers(followers);
        setFollowers((prev) => Math.max(0, prev + change));
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [followers]);

  // Pulse & goal logic
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
      setTimeout(() => goalRef.current.classList.remove("complete"), 800);
    } else if (followers < goal && goalReached) {
      setGoalReached(false);
    }
  }, [followers]);

  const progress = Math.min((followers / goal) * 100, 100);

  return (
    <div className="page page--overlay clean">
      {/* === Follower count box === */}
      <div className="overlay-box with-box">
        <div className="overlay-count">{followers}</div>
      </div>

      {/* === Goal Control === */}
      <div
        className="panel glass"
        style={{
          marginTop: "20px",
          width: "300px",
          padding: "1rem",
          fontSize: "0.9rem",
        }}
      >
        <div className="row">
          <label>Show Goal:</label>
          <input
            type="checkbox"
            checked={goalEnabled}
            onChange={() => setGoalEnabled(!goalEnabled)}
          />
        </div>

        {goalEnabled && (
          <div className="row">
            <label>Goal Value:</label>
            <input
              type="number"
              className="inp"
              value={goal}
              onChange={(e) => setGoal(parseInt(e.target.value || 0))}
            />
          </div>
        )}
      </div>

      {/* === Goal bar === */}
      {goalEnabled && (
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
      )}
    </div>
  );
}
