# The Exhausted Nerd - GitHub Pages setup

1. Create a new repository on GitHub (e.g. `the-exhausted-nerd`). Public repos get free Pages hosting.
2. Unzip this folder and upload every file and folder inside it to the repository root, keeping the same structure (`index.html` must sit at the top level, not inside a subfolder).
3. Replace `assets/profile.png` with your own circular photo if you want (keep the filename, or update the path in each HTML file's `<img src="assets/profile.png">`).
4. In the repo, go to **Settings > Pages**. Under "Build and deployment", set Source to **Deploy from a branch**, branch **main**, folder **/(root)**. Save.
5. GitHub gives you a URL like `https://yourusername.github.io/the-exhausted-nerd/` within a minute or two.
6. Update the two placeholder links once they exist for real: `https://drive.google.com/placeholder` (used across Resources) and `https://youtube.com/placeholder` (used across Resources). Find-and-replace works fine since there's no build step.

Everything (streaks, hearts, diamonds, spades, crowns) is stored per-visitor in their own browser via `localStorage`. There's no backend or database, so nobody's progress is visible to you or to each other; the Hall of Fame is the one thing you update by hand in `data/halloffame.json` after grading the weekly challenge.
