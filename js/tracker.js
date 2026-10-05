/* =========================================================
   THE EXHAUSTED NERD - tracker.js
   Handles currency (hearts/diamonds/spades/crowns), the daily
   streak, and score display.

   Storage:
   - localStorage is the source of truth for guests.
   - If a user is signed in, every write also goes to Firestore
     under users/{uid} (full stats) and scores/{uid} (leaderboard).
   - On sign-in, Firestore overwrites localStorage for that user.
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
    dailyState: "ten_daily_state"
  };

  let currentUser = null;

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

  /* ---------- Firestore sync ---------- */

  function firestoreReady() {
    return currentUser
      && window.db
      && typeof firebase !== "undefined"
      && firebase.firestore;
  }

  function syncToFirestore() {
    if (!firestoreReady()) return;
    const stats = getStats();
    const score = totalScore(stats);
    const name = currentUser.displayName || "Anonymous";
    const uid = currentUser.uid;

    const userDoc = {
      name: name,
      hearts: stats.hearts,
      diamonds: stats.diamonds,
      spades: stats.spades,
      crowns: stats.crowns,
      streak: stats.streak,
      score: score,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const scoreDoc = {
      name: name,
      score: score
    };

    window.db.collection("users").doc(uid).set(userDoc, { merge: true })
      .catch(function (e) { console.error("users sync failed:", e); });

    window.db.collection("scores").doc(uid).set(scoreDoc, { merge: true })
      .catch(function (e) { console.error("scores sync failed:", e); });
  }

  async function loadFromFirestore() {
    if (!window.db || !currentUser) return;
    try {
      const doc = await window.db.collection("users").doc(currentUser.uid).get();
      if (doc.exists) {
        const data = doc.data();
        if (typeof data.hearts === "number") setInt(KEYS.hearts, data.hearts);
        if (typeof data.diamonds === "number") setInt(KEYS.diamonds, data.diamonds);
        if (typeof data.spades === "number") setInt(KEYS.spades, data.spades);
        if (typeof data.crowns === "number") setInt(KEYS.crowns, data.crowns);
        if (typeof data.streak === "number") setInt(KEYS.streak, data.streak);
      } else {
        // First time we see this user. Seed their Firestore doc with local stats.
        syncToFirestore();
      }
    } catch (e) {
      console.error("Firestore load failed:", e);
    }
  }

  /* ---------- mutations ---------- */

  function addHearts(n) {
    setInt(KEYS.hearts, getInt(KEYS.hearts) + n);
    render();
    syncToFirestore();
  }
  function addDiamonds(n) {
    setInt(KEYS.diamonds, getInt(KEYS.diamonds) + n);
    render();
    syncToFirestore();
  }
  function addSpades(n) {
    setInt(KEYS.spades, getInt(KEYS.spades) + n);
    render();
    syncToFirestore();
  }
  function addCrowns(n) {
    setInt(KEYS.crowns, getInt(KEYS.crowns) + n);
    render();
    syncToFirestore();
  }

  function spendDiamonds(n) {
    const cur = getInt(KEYS.diamonds);
    if (cur < n) return false;
    setInt(KEYS.diamonds, cur - n);
    render();
    syncToFirestore();
    return true;
  }

  /* ---------- streak / daily ---------- */

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

  function markDaily(state) {
    const today = todayStr();
    localStorage.setItem(KEYS.dailyStateDate, today);
    localStorage.setItem(KEYS.dailyState, state);

    if (state === "solved") {
      const last = localStorage.getItem(KEYS.lastSolvedDate);
      let streak = getInt(KEYS.streak);

      if (last === today) {
        // already counted today
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
    syncToFirestore();
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

  /* ---------- render ---------- */

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
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  /* ---------- init ---------- */

  function init() {
    checkStreakBreak();
    render();

    // tracker.js loads before firebase.js, so poll until Firebase is ready.
    function attachAuth() {
      if (!window.auth || !window.db) {
        setTimeout(attachAuth, 100);
        return;
      }
      window.auth.onAuthStateChanged(async function (user) {
        currentUser = user;
        if (user) {
          await loadFromFirestore();
        }
        render();
      });
    }
    attachAuth();
  }

  document.addEventListener("DOMContentLoaded", init);

  return {
    getStats, totalScore,
    addHearts, addDiamonds, addSpades, addCrowns, spendDiamonds,
    getDailyState, markDaily, render
  };
})();
