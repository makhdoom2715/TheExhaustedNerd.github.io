/* =========================================================
   THE EXHAUSTED NERD - arcade.js
   Puzzle 1: The Architect's Mark
   Puzzle 2: Simple code check
   Puzzle solved state: local cache + Firestore merge.
   Firestore is the source of truth for signed-in users.
   We only ever write TRUE values up, never false, so clearing
   local storage can never wipe a solved state.
   ========================================================= */

(function () {

  const VAULT_CODES = {
    puzzle1: "472988",
    puzzle2: "271500",
  };

  const VAULT_REWARDS = {
    puzzle1: {
      name: "IMO 1988 Problem 6",
      statement: "",
      video: "#"
    },
    puzzle2: {
      name: "IMO 1993 Problem 1",
      statement: "Let \\(f(x) = x^n + 5x^{n-1} + 3\\), where \\(n > 1\\) is an integer. Prove that \\(f(x)\\) cannot be expressed as the product of two nonconstant polynomials with integer coefficients.",
      video: "#"
    },
  };

  function getSolvedKey(id) { return "ten_" + id + "_solved"; }

  function isSolved(id) {
    return localStorage.getItem(getSolvedKey(id)) === "1";
  }

  function markSolved(id) {
    localStorage.setItem(getSolvedKey(id), "1");
    pushSolvedUp(id);
  }

  /* ---------- Firestore sync ---------- */

  let currentUser = null;
  let firestorePuzzles = {}; // cache of what Firestore says is solved
  const rechecks = [];

  function registerRecheck(fn) { rechecks.push(fn); }
  function runRechecks() {
    rechecks.forEach(function (fn) {
      try { fn(); } catch (e) { console.error("recheck failed:", e); }
    });
  }

  function getDb() {
    return (window.firebase && typeof window.firebase.firestore === "function")
      ? window.firebase.firestore()
      : null;
  }
  function getAuth() {
    return (window.firebase && typeof window.firebase.auth === "function")
      ? window.firebase.auth()
      : null;
  }

  // Called when this user just solved something. Push only this true up.
  function pushSolvedUp(id) {
    const db = getDb();
    if (!db || !currentUser) return;
    const field = "puzzles." + id;
    const update = {};
    update[field] = true;
    db.collection("users").doc(currentUser.uid).set(update, { merge: true })
      .catch(function (e) { console.error("puzzle push failed:", e); });
  }

  // On sign-in: pull Firestore first, then push any local truths up.
  // Never push false, so local clears cannot wipe Firestore.
  async function syncPuzzles() {
    const db = getDb();
    if (!db || !currentUser) return;

    // 1. Pull from Firestore
    try {
      const doc = await db.collection("users").doc(currentUser.uid).get();
      if (doc.exists) {
        const data = doc.data();
        if (data.puzzles && typeof data.puzzles === "object") {
          firestorePuzzles = data.puzzles;
          Object.keys(data.puzzles).forEach(function (pid) {
            if (data.puzzles[pid] === true) {
              localStorage.setItem(getSolvedKey(pid), "1");
            }
          });
        }
      }
    } catch (e) {
      console.error("puzzle pull failed:", e);
    }

    // 2. Push any local truths up (only true values)
    const merge = {};
    let hasLocal = false;
    Object.keys(VAULT_CODES).forEach(function (pid) {
      if (isSolved(pid)) {
        merge["puzzles." + pid] = true;
        hasLocal = true;
      }
    });
    if (hasLocal) {
      try {
        await db.collection("users").doc(currentUser.uid).set(merge, { merge: true });
      } catch (e) {
        console.error("puzzle merge-up failed:", e);
      }
    }
  }

  function attachAuth() {
    const authInst = getAuth();
    if (!authInst) {
      setTimeout(attachAuth, 100);
      return;
    }
    authInst.onAuthStateChanged(async function (user) {
      currentUser = user;
      if (user) {
        await syncPuzzles();
      } else {
        firestorePuzzles = {};
      }
      runRechecks();
    });
  }
  attachAuth();

  /* ---------- reward rendering ---------- */

  function showReward(id, msgEl, rewardPanel) {
    const r = VAULT_REWARDS[id];
    if (!r) return;

    let html = '<p class="reward-title">Reward: ' + r.name + '</p>';

    if (r.statement && r.statement.length > 0) {
      html += '<div class="reward-statement" style="max-height: 220px; overflow-y: auto; background: rgba(0,0,0,0.35); padding: 16px; border-radius: 8px; margin: 12px 0; font-size: 0.95rem; line-height: 1.6; border: 1px solid var(--border); color: var(--text);">';
      html += r.statement;
      html += '</div>';
    }

    const hasVideo = r.video && r.video !== "#" && r.video.length > 0;
    if (hasVideo) {
      html += '<div class="btn-row" style="margin-top: 10px;">';
      html += '<a href="' + r.video + '" class="btn btn-sm" target="_blank" rel="noopener">[Solution Video]</a>';
      html += '</div>';
    }

    rewardPanel.innerHTML = html;
    rewardPanel.classList.add("show");

    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([rewardPanel]).catch(function (err) {
        console.log("MathJax error:", err);
      });
    }
  }

  function updateRowStatus(id, statusText) {
    const num = id.replace("puzzle", "");
    const el = document.getElementById("vaultRowStatus" + num);
    if (el) {
      el.textContent = statusText;
      el.classList.remove("locked");
      el.classList.add(statusText === "UNLOCKED" ? "unlocked" : "locked");
    }
  }

  // Is this puzzle solved according to either local or Firestore?
  function solvedAnywhere(id) {
    return isSolved(id) || firestorePuzzles[id] === true;
  }

  /* -------------------------------------------------------
     PUZZLE 1: The Architect's Mark (with hints)
     ------------------------------------------------------- */
  (function initPuzzle1() {
    const ID = "puzzle1";
    const CODE = VAULT_CODES[ID];
    const HINT_KEY = "ten_puzzle1_hints_unlocked";

    const toggle = document.getElementById("puzzle1Toggle");
    const panel = document.getElementById("puzzle1Panel");
    if (!toggle) return;

    const hint1Btn = document.getElementById("hint1Btn");
    const hint2Btn = document.getElementById("hint2Btn");
    const hint3Btn = document.getElementById("hint3Btn");
    const hint1Box = document.getElementById("hint1Box");
    const hint2Box = document.getElementById("hint2Box");
    const hint3Box = document.getElementById("hint3Box");

    const codeInput = document.getElementById("vaultCodeInput");
    const submitBtn = document.getElementById("vaultSubmitBtn");
    const vaultMsg = document.getElementById("vaultMsg");
    const rewardPanel = document.getElementById("vaultRewardPanel");

    function getHints() { return parseInt(localStorage.getItem(HINT_KEY), 10) || 0; }
    function setHints(n) { localStorage.setItem(HINT_KEY, String(n)); }

    function refreshHints() {
      const u = getHints();
      if (u >= 1 && hint1Box) hint1Box.classList.add("show");
      if (u >= 2 && hint2Box) hint2Box.classList.add("show");
      if (u >= 3 && hint3Box) hint3Box.classList.add("show");
      if (hint1Btn) hint1Btn.disabled = u >= 1;
      if (hint2Btn) hint2Btn.disabled = u < 1 || u >= 2;
      if (hint3Btn) hint3Btn.disabled = u < 2 || u >= 3;
    }

    function unlockHint(idx) {
      const u = getHints();
      if (idx !== u + 1) return;
      if (typeof TEN !== "undefined" && !TEN.spendDiamonds(1)) {
        vaultMsg.className = "vault-message error";
        vaultMsg.textContent = "Not enough diamonds. Solve roulette problems to earn more.";
        return;
      }
      setHints(idx);
      refreshHints();
    }

    if (hint1Btn) hint1Btn.addEventListener("click", () => unlockHint(1));
    if (hint2Btn) hint2Btn.addEventListener("click", () => unlockHint(2));
    if (hint3Btn) hint3Btn.addEventListener("click", () => unlockHint(3));

    function checkSolved() {
      if (solvedAnywhere(ID)) {
        updateRowStatus(ID, "UNLOCKED");
        if (rewardPanel) showReward(ID, vaultMsg, rewardPanel);
        if (vaultMsg) {
          vaultMsg.className = "vault-message success";
          vaultMsg.textContent = "Vault breached. 20 diamonds and 1 crown added.";
        }
        if (codeInput) codeInput.disabled = true;
        if (submitBtn) submitBtn.disabled = true;
      }
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const attempt = (codeInput.value || "").trim();
        if (attempt === CODE) {
          if (!solvedAnywhere(ID)) {
            // First time solving. Grant reward.
            if (typeof TEN !== "undefined") {
              TEN.addDiamonds(20);
              TEN.addCrowns(1);
            }
            markSolved(ID);
          }
          updateRowStatus(ID, "UNLOCKED");
          if (vaultMsg) {
            vaultMsg.className = "vault-message success";
            vaultMsg.textContent = "Vault breached. 20 diamonds and 1 crown added.";
          }
          if (rewardPanel) showReward(ID, vaultMsg, rewardPanel);
          if (codeInput) codeInput.disabled = true;
          if (submitBtn) submitBtn.disabled = true;
        } else {
          if (vaultMsg) {
            vaultMsg.className = "vault-message error";
            vaultMsg.textContent = "Incorrect. The vault does not forgive typos.";
          }
        }
      });
    }

    if (toggle) {
      toggle.addEventListener("click", () => {
        panel.classList.toggle("show");
      });
    }

    refreshHints();
    checkSolved();
    registerRecheck(checkSolved);
  })();

  /* -------------------------------------------------------
     SIMPLE PUZZLES
     ------------------------------------------------------- */
  function initSimplePuzzle(id, inputId, btnId, msgId, panelId) {
    const CODE = VAULT_CODES[id];

    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const msg = document.getElementById(msgId);
    const panel = document.getElementById(panelId);
    const toggle = document.getElementById(id + "Toggle");

    if (!input || !btn) return;

    function checkSolved() {
      if (solvedAnywhere(id)) {
        updateRowStatus(id, "UNLOCKED");
        if (msg) {
          msg.className = "vault-message success";
          msg.textContent = "Vault breached. 20 diamonds and 1 crown added.";
        }
        if (panel) showReward(id, msg, panel);
        input.disabled = true;
        btn.disabled = true;
      }
    }

    btn.addEventListener("click", () => {
      const attempt = (input.value || "").trim();
      if (attempt === CODE) {
        if (!solvedAnywhere(id)) {
          if (typeof TEN !== "undefined") {
            TEN.addDiamonds(20);
            TEN.addCrowns(1);
          }
          markSolved(id);
        }
        updateRowStatus(id, "UNLOCKED");
        if (msg) {
          msg.className = "vault-message success";
          msg.textContent = "Vault breached. 20 diamonds and 1 crown added.";
        }
        if (panel) showReward(id, msg, panel);
        input.disabled = true;
        btn.disabled = true;
      } else {
        if (msg) {
          msg.className = "vault-message error";
          msg.textContent = "Incorrect. The vault does not forgive typos.";
        }
      }
    });

    if (toggle) {
      toggle.addEventListener("click", () => {
        const p = document.getElementById(id + "Panel");
        if (p) p.classList.toggle("show");
      });
    }

    checkSolved();
    registerRecheck(checkSolved);
  }

  initSimplePuzzle("puzzle2", "p2code", "p2submit", "p2msg", "p2reward");

})();
