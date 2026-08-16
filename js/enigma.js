/* =========================================================
   THE EXHAUSTED NERD - enigma.js
   Puzzle 1 (The Architect's Mark): sequential hints costing
   1 Diamond each, a code checker, and a one-time reward.
   Puzzles 2-4 are static links to sealed vault pages.
   ========================================================= */

(function () {
  const CODE = "472988";
  const SOLVED_KEY = "ten_puzzle1_solved";
  const HINT_KEY = "ten_puzzle1_hints_unlocked"; // 0,1,2,3

  const puzzleToggle = document.getElementById("puzzle1Toggle");
  const puzzlePanel = document.getElementById("puzzle1Panel");
  if (!puzzleToggle) return; // not on this page

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
  const vaultRowStatus = document.getElementById("vaultRowStatus1");

  function getHintsUnlocked() {
    return parseInt(localStorage.getItem(HINT_KEY), 10) || 0;
  }
  function setHintsUnlocked(n) {
    localStorage.setItem(HINT_KEY, String(n));
  }

  function refreshHintButtons() {
    const unlocked = getHintsUnlocked();
    if (unlocked >= 1) { hint1Box.classList.add("show"); }
    if (unlocked >= 2) { hint2Box.classList.add("show"); }
    if (unlocked >= 3) { hint3Box.classList.add("show"); }

    hint1Btn.disabled = unlocked >= 1;
    hint2Btn.disabled = unlocked < 1 || unlocked >= 2;
    hint3Btn.disabled = unlocked < 2 || unlocked >= 3;
  }

  function unlockHint(index) {
    const unlocked = getHintsUnlocked();
    if (index !== unlocked + 1) return; // must unlock in order
    if (!TEN.spendDiamonds(1)) {
      vaultMsg.className = "vault-message error";
      vaultMsg.textContent = "Not enough diamonds. Solve roulette problems to earn more.";
      return;
    }
    setHintsUnlocked(index);
    refreshHintButtons();
  }

  hint1Btn.addEventListener("click", () => unlockHint(1));
  hint2Btn.addEventListener("click", () => unlockHint(2));
  hint3Btn.addEventListener("click", () => unlockHint(3));

  function markSolved() {
    localStorage.setItem(SOLVED_KEY, "1");
    if (vaultRowStatus) {
      vaultRowStatus.textContent = "UNLOCKED";
      vaultRowStatus.classList.remove("locked");
      vaultRowStatus.classList.add("unlocked");
    }
  }

  function checkSolvedState() {
    if (localStorage.getItem(SOLVED_KEY) === "1") {
      markSolved();
      rewardPanel.classList.add("show");
      vaultMsg.className = "vault-message success";
      vaultMsg.textContent = "Vault breached. 20 diamonds and 1 crown added.";
      codeInput.disabled = true;
      submitBtn.disabled = true;
    }
  }

  submitBtn.addEventListener("click", () => {
    const attempt = (codeInput.value || "").trim();
    if (attempt === CODE) {
      TEN.addDiamonds(20);
      TEN.addCrowns(1);
      markSolved();
      vaultMsg.className = "vault-message success";
      vaultMsg.textContent = "Vault breached. 20 diamonds and 1 crown added.";
      rewardPanel.classList.add("show");
      codeInput.disabled = true;
      submitBtn.disabled = true;
    } else {
      vaultMsg.className = "vault-message error";
      vaultMsg.textContent = "Incorrect. The vault does not forgive typos.";
    }
  });

  puzzleToggle.addEventListener("click", () => {
    puzzlePanel.classList.toggle("show");
  });

  refreshHintButtons();
  checkSolvedState();
})();
