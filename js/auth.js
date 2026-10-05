// js/auth.js
// Terminal-style sign in / sign out for the nav.

(function () {
  const btn = document.getElementById("authBtn");
  if (!btn) return;

  btn.textContent = "...";
  btn.disabled = true;

  auth.onAuthStateChanged(function (user) {
    btn.disabled = false;
    if (user) {
      const name = user.displayName ? user.displayName.split(" ")[0] : "User";
      btn.textContent = name + " ▾";
      btn.classList.add("signed-in");

      btn.onclick = function (e) {
        e.stopPropagation();
        if (confirm("Sign out?")) {
          auth.signOut();
        }
      };
    } else {
      btn.textContent = "Sign In";
      btn.classList.remove("signed-in");

      btn.onclick = async function () {
        // Terminal boot sequence before popup opens
        const steps = ["> connecting...", "> verifying...", "> opening portal..."];
        let i = 0;
        btn.disabled = true;
        const interval = setInterval(() => {
          btn.textContent = steps[i];
          i++;
          if (i >= steps.length) {
            clearInterval(interval);
            // Now open the Google popup
            auth.signInWithPopup(googleProvider)
              .then((result) => {
                // Success flash
                const flash = document.createElement("div");
                flash.textContent = "> WELCOME, " + (result.user.displayName || "USER").toUpperCase();
                flash.style.cssText = `
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  background: #0f0;
                  color: #000;
                  font-family: monospace;
                  font-size: 14px;
                  padding: 10px 20px;
                  border-radius: 4px;
                  z-index: 9999;
                  opacity: 1;
                  transition: opacity 1s;
                `;
                document.body.appendChild(flash);
                setTimeout(() => { flash.style.opacity = "0"; }, 2000);
                setTimeout(() => { flash.remove(); }, 3000);
              })
              .catch((e) => {
                console.error("Sign-in failed:", e);
                btn.textContent = "Sign In";
                btn.disabled = false;
                alert("Sign-in failed: " + e.message);
              });
          }
        }, 350);
      };
    }
  });
})();
