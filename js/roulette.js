/* =========================================================
   THE EXHAUSTED NERD - roulette.js
   Fetches data/problems.json, filters by topic/difficulty,
   renders a random pick with MathJax, and pays out on
   Attempted / Solved (per problem difficulty).
   ========================================================= */

(function () {
  let allProblems = [];
  let currentProblem = null;
  let currentResolved = false; // prevents double-award on one problem

  const topicSelect = document.getElementById("rouletteTopic");
  const difficultySelect = document.getElementById("rouletteDifficulty");
  const tryBtn = document.getElementById("rouletteTryBtn");
  const resultBox = document.getElementById("rouletteResult");

  if (!tryBtn) return; // roulette not on this page

  fetch("data/problems.json")
    .then(r => r.json())
    .then(data => { allProblems = data; })
    .catch(() => {
      resultBox.innerHTML = '<p class="roulette-placeholder">Could not load the problem set. Check your connection.</p>';
    });

  function rewardFor(difficulty) {
    if (difficulty === "Hard") return { type: "diamond", amount: 1 };
    if (difficulty === "IMO") return { type: "spade", amount: 1 };
    return { type: "heart", amount: 1 }; // Easy / Medium / IOQM
  }

  function payout(difficulty) {
    const r = rewardFor(difficulty);
    if (r.type === "heart") TEN.addHearts(r.amount);
    if (r.type === "diamond") TEN.addDiamonds(r.amount);
    if (r.type === "spade") TEN.addSpades(r.amount);
  }

  function renderProblem(problem) {
    currentProblem = problem;
    currentResolved = false;

    resultBox.innerHTML = `
      <div class="tag-row">
        <span class="tag">${problem.topic}</span>
        <span class="tag difficulty-${problem.difficulty}">${problem.difficulty}</span>
      </div>
      <div class="problem-name">${problem.name}</div>
      <div class="problem-text">\\(${problem.latex}\\)</div>
      <div class="btn-row mt-24">
        <button class="btn" id="attemptBtn">Attempted</button>
        <button class="btn btn-primary" id="solvedBtn">Solved</button>
        <button class="btn" id="skipBtn">Skip</button>
      </div>
      <p class="vault-message" id="rouletteMsg"></p>
    `;

    if (window.MathJax) {
      MathJax.typesetPromise([resultBox]).catch(() => {});
    }

    document.getElementById("attemptBtn").addEventListener("click", () => resolveProblem("attempted"));
    document.getElementById("solvedBtn").addEventListener("click", () => resolveProblem("solved"));
    document.getElementById("skipBtn").addEventListener("click", spin);
  }

  function resolveProblem(mode) {
    if (currentResolved) return;
    currentResolved = true;
    payout(currentProblem.difficulty);

    document.getElementById("attemptBtn").disabled = true;
    document.getElementById("solvedBtn").disabled = true;
    const msg = document.getElementById("rouletteMsg");
    msg.className = "vault-message success";
    msg.textContent = mode === "solved"
      ? "Logged as solved. Reward added."
      : "Logged as attempted. Reward added.";

    if (mode === "solved") fireConfetti();
  }

  function spin() {
    const topic = topicSelect.value;
    const difficulty = difficultySelect.value;

    let pool = allProblems.filter(p =>
      (topic === "Any" || p.topic === topic) &&
      (difficulty === "Any" || p.difficulty === difficulty)
    );

    if (pool.length === 0) {
      resultBox.innerHTML = '<p class="roulette-placeholder">No problems match that filter. Face different fate.</p>';
      return;
    }

    resultBox.classList.add("spinning");
    setTimeout(() => {
      resultBox.classList.remove("spinning");
      const pick = pool[Math.floor(Math.random() * pool.length)];
      renderProblem(pick);
    }, 350);
  }

  function fireConfetti() {
    const colors = ["#00d4aa", "#ffb000", "#00ff88", "#4dd2ff"];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = 1.6 + Math.random() * 1.2 + "s";
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3000);
    }
  }

  tryBtn.addEventListener("click", spin);
})();
