/* =========================================================
   THE EXHAUSTED NERD - tracker.js
   Handles currency (hearts/diamonds/spades/crowns), the daily
   streak, and score display. Everything lives in localStorage,
   client-side, no backend.
   ========================================================= */

const TEN = (function () {

  const KEYS = {
    hearts: "ten_hearts",
    diamonds: "ten_diamonds",
    spades: "ten_spades",
    crowns: "ten_crowns",
    streak: "ten_streak",
    lastSolvedDate: "ten_last_solved_date",
    bonus7: "ten_bonus7_awarded",
    bonus15: "ten_bonus15_awarded",
    bonus30: "ten_bonus30_awarded",
    dailyStateDate: "ten_daily_state_date",
    dailyState: "ten_daily_state" // "none" | "attempted" | "solved"
  };

  function getInt(key) {
    const v = parseInt(localStorage.getItem(key), 10);
    return Number.isFinite(v) ? v : 0;
  }
  function setInt(key, val) {
    localStorage.setItem(key, String(val));
  }

  function getStats() {
    return {
      hearts: getInt(KEYS.hearts),
      diamonds: getInt(KEYS.diamonds),
      spades: getInt(KEYS.spades),
      crowns: getInt(KEYS.crowns),
      streak: getInt(KEYS.streak)
    };
  }

  function totalScore(stats) {
    stats = stats || getStats();
    return stats.hearts * 1 + stats.diamonds * 5 + stats.spades * 10 + stats.crowns * 20;
  }

  function addHearts(n) { setInt(KEYS.hearts, getInt(KEYS.hearts) + n); render(); }
  function addDiamonds(n) { setInt(KEYS.diamonds, getInt(KEYS.diamonds) + n); render(); }
  function addSpades(n) { setInt(KEYS.spades, getInt(KEYS.spades) + n); render(); }
  function addCrowns(n) { setInt(KEYS.crowns, getInt(KEYS.crowns) + n); render(); }

  // returns true if the spend succeeded (enough balance), false otherwise
  function spendDiamonds(n) {
    const cur = getInt(KEYS.diamonds);
    if (cur < n) return false;
    setInt(KEYS.diamonds, cur - n);
    render();
    return true;
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }
  function yesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function getDailyState() {
    const stateDate = localStorage.getItem(KEYS.dailyStateDate);
    if (stateDate !== todayStr()) return "none";
    return localStorage.getItem(KEYS.dailyState) || "none";
  }

  // Call when the user marks the daily problem Attempted or Solved.
  // Only "solved" advances the streak + awards a Heart, matching the brief.
  function markDaily(state) {
    const today = todayStr();
    localStorage.setItem(KEYS.dailyStateDate, today);
    localStorage.setItem(KEYS.dailyState, state);

    if (state === "solved") {
      const last = localStorage.getItem(KEYS.lastSolvedDate);
      let streak = getInt(KEYS.streak);

      if (last === today) {
        // already counted today, no-op
      } else if (last === yesterdayStr()) {
        streak += 1;
      } else {
        streak = 1;
      }
      setInt(KEYS.streak, streak);
      localStorage.setItem(KEYS.lastSolvedDate, today);
      addHearts(1);
      checkStreakBonuses(streak);
    }
    render();
  }

  function checkStreakBonuses(streak) {
    if (streak >= 7 && !localStorage.getItem(KEYS.bonus7)) {
      addDiamonds(1);
      localStorage.setItem(KEYS.bonus7, "1");
    }
    if (streak >= 15 && !localStorage.getItem(KEYS.bonus15)) {
      addSpades(1);
      localStorage.setItem(KEYS.bonus15, "1");
    }
    if (streak >= 30 && !localStorage.getItem(KEYS.bonus30)) {
      addCrowns(1);
      localStorage.setItem(KEYS.bonus30, "1");
    }
  }

  // if a day was missed entirely, reset streak to 0 on next visit
  function checkStreakBreak() {
    const last = localStorage.getItem(KEYS.lastSolvedDate);
    if (!last) return;
    const today = todayStr();
    const yesterday = yesterdayStr();
    if (last !== today && last !== yesterday) {
      setInt(KEYS.streak, 0);
      localStorage.removeItem(KEYS.bonus7);
      localStorage.removeItem(KEYS.bonus15);
      localStorage.removeItem(KEYS.bonus30);
    }
  }

  function render() {
    const s = getStats();
    const score = totalScore(s);

    const map = {
      navStreak: s.streak,
      navScore: score,
      statStreak: s.streak,
      statHearts: s.hearts,
      statDiamonds: s.diamonds,
      statSpades: s.spades,
      statCrowns: s.crowns,
      statScore: score
    };
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  function init() {
    checkStreakBreak();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    getStats, totalScore,
    addHearts, addDiamonds, addSpades, addCrowns, spendDiamonds,
    getDailyState, markDaily, render
  };
})();
