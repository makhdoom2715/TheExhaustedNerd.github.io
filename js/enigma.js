/* =========================================================
   THE EXHAUSTED NERD - enigma.js
   Puzzle 1: The Architect's Mark
   Puzzles 2-4: Add your codes below where it says ADD NEW CODES HERE
   ========================================================= */

(function () {

  /* -------------------------------------------------------
     STEP 1: ADD YOUR PUZZLE CODES HERE
     Just replace the placeholder with the real 6-digit code.
     When you generate a new puzzle, come here and change the number.
     ------------------------------------------------------- */
  const VAULT_CODES = {
    puzzle1: "472988",   // The Architect's Mark (already set)
    puzzle2: "000000",   // CHANGE THIS when you make Puzzle 2
    puzzle3: "000000",   // CHANGE THIS when you make Puzzle 3
    puzzle4: "000000",   // CHANGE THIS when you make Puzzle 4
  };

  /* -------------------------------------------------------
     STEP 2: ADD YOUR REWARD NAMES HERE
     This is what shows up when the player solves the puzzle.
     ------------------------------------------------------- */
  const VAULT_REWARDS = {
    puzzle1: { name: "IMO 1988 Problem 6", pdf: "#", video: "#" },
    puzzle2: { name: "IMO 1993 Problem 1", pdf: "#", video: "#" },
    puzzle3: { name: "Legendary Problem 3", pdf: "#", video: "#" },
    puzzle4: { name: "Legendary Problem 4", pdf: "#", video: "#" },
  };

  /* -------------------------------------------------------
     STEP 3: NOTHING ELSE TO CHANGE BELOW THIS LINE
     ------------------------------------------------------- */

  function getSolvedKey(id) { return "ten_" + id + "_solved"; }

  function isSolved(id) {
    return localStorage.getItem(getSolvedKey(id)) === "1";
  }

  function markSolved(id) {
    localStorage.setItem(getSolvedKey(id), "1");
  }

  function showReward(id, msgEl, rewardPanel) {
    const r = VAULT_REWARDS[id];
    if (!r) return;
    let html = '<p class="reward-title">Reward: ' + r.name + '</p>';
    html += '<a href="' + r.pdf + '" class="reward-link">[Problem PDF]</a>';
    html += '<a href="' + r.video + '" class="reward-link">[Solution Video - Not made yet]</a>';
    rewardPanel.innerHTML = html;
    rewardPanel.classList.add("show");
  }

  function updateRowStatus(id, statusText) {
    const el = document.getElementById("vaultRowStatus" + id.replace("puzzle", ""));
    if (el) {
      el.textContent = statusText;
      el.classList.remove("locked");
      el.classList.add(statusText === "UNLOCKED" ? "unlocked" : "locked");
    }
  }

  /* -------------------------------------------------------
     PUZZLE 1: The Architect's Mark (with hints)
     ------------------------------------------------------- */
  (function initPuzzle1() {
    const ID = "puzzle1";
    const CODE = VAULT_CODES[ID];
    const SOLVED_KEY = getSolvedKey(ID);
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
      if (isSolved(ID)) {
        updateRowStatus(ID, "UNLOCKED");
        if (rewardPanel) {
          showReward(ID, vaultMsg, rewardPanel);
        }
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
          if (typeof TEN !== "undefined") {
            TEN.addDiamonds(20);
            TEN.addCrowns(1);
          }
          markSolved(ID);
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
  })();

  /* -------------------------------------------------------
     PUZZLE 2, 3, 4: Simple code checkers (no hints)
     When you generate a puzzle, just change the code above.
     ------------------------------------------------------- */
  function initSimplePuzzle(id, inputId, btnId, msgId, panelId) {
    const CODE = VAULT_CODES[id];
    const SOLVED_KEY = getSolvedKey(id);

    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const msg = document.getElementById(msgId);
    const panel = document.getElementById(panelId);
    const toggle = document.getElementById(id + "Toggle");

    if (!input || !btn) return;

    function checkSolved() {
      if (isSolved(id)) {
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
        if (typeof TEN !== "undefined") {
          TEN.addDiamonds(20);
          TEN.addCrowns(1);
        }
        markSolved(id);
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
  }

  initSimplePuzzle("puzzle2", "p2code", "p2submit", "p2msg", "p2reward");
  initSimplePuzzle("puzzle3", "p3code", "p3submit", "p3msg", "p3reward");
  initSimplePuzzle("puzzle4", "p4code", "p4submit", "p4msg", "p4reward");

})();
