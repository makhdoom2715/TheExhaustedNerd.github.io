// js/auth.js
// Terminal-style sign in / sign out for the nav.

(function () {
  const btn = document.getElementById("authBtn");
  if (!btn) return;

  btn.textContent = "...";
  btn.disabled = true;

  // Force Google to always ask which account to use
  if (typeof googleProvider !== "undefined" && googleProvider.setCustomParameters) {
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }

  // Resolve a redirect sign-in if we just came back from one.
  if (typeof auth !== "undefined" && auth.getRedirectResult) {
    auth.getRedirectResult().catch(function (e) {
      if (e && e.code && e.code !== "auth/no-auth-event" && e.code !== "auth/argument-error") {
        console.error("Redirect sign-in failed:", e);
      }
    });
  }

  auth.onAuthStateChanged(function (user) {
    btn.disabled = false;
    if (user) {
      const name = user.displayName ? user.displayName.split(" ")[0] : "User";
      btn.textContent = name + " \u25BE";
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
        const steps = ["> connecting...", "> verifying...", "> opening portal..."];
        let i = 0;
        btn.disabled = true;
        const interval = setInterval(() => {
          btn.textContent = steps[i];
          i++;
          if (i >= steps.length) clearInterval(interval);
        }, 350);

        try {
          const result = await auth.signInWithPopup(googleProvider);
          clearInterval(interval);

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
          `;
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 3000);
        } catch (e) {
          clearInterval(interval);

          const fallbackCodes = [
            "auth/popup-blocked",
            "auth/popup-closed-by-user",
            "auth/cancelled-popup-request",
            "auth/operation-not-supported-in-this-environment",
            "auth/web-storage-unsupported",
            "auth/network-request-failed"
          ];

          if (e && fallbackCodes.indexOf(e.code) !== -1) {
            try {
              btn.textContent = "> redirecting...";
              await auth.signInWithRedirect(googleProvider);
            } catch (e2) {
              console.error("Sign-in redirect failed:", e2);
              btn.textContent = "Sign In";
              btn.disabled = false;
              alert("Sign-in failed: " + e2.message);
            }
          } else {
            console.error("Sign-in failed:", e);
            btn.textContent = "Sign In";
            btn.disabled = false;
            alert("Sign-in failed: " + e.message);
          }
        }
      };
    }
  });
})();
