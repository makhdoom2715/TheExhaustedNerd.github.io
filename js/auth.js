// js/auth.js
// DEBUG VERSION - shows errors on screen

(function () {
  const btn = document.getElementById("authBtn");
  if (!btn) return;

  // On-screen log box (visible on any device, no DevTools needed)
  const logBox = document.createElement("div");
  logBox.style.cssText = `
    position: fixed;
    left: 8px;
    right: 8px;
    bottom: 8px;
    max-height: 40vh;
    overflow-y: auto;
    background: #000;
    color: #0f0;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.5;
    padding: 10px;
    border: 1px solid #0f0;
    border-radius: 6px;
    z-index: 99999;
    white-space: pre-wrap;
    word-break: break-all;
  `;
  function log(msg) {
    const line = document.createElement("div");
    line.textContent = msg;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }
  document.body.appendChild(logBox);

  log("auth.js loaded");
  log("UA: " + navigator.userAgent);
  log("auth defined: " + (typeof auth !== "undefined"));
  log("googleProvider defined: " + (typeof googleProvider !== "undefined"));
  log("currentUser: " + (auth && auth.currentUser ? auth.currentUser.email : "null"));

  btn.textContent = "...";
  btn.disabled = true;

  if (typeof googleProvider !== "undefined" && googleProvider.setCustomParameters) {
    googleProvider.setCustomParameters({ prompt: "select_account" });
    log("set prompt:select_account");
  }

  if (typeof auth !== "undefined" && auth.getRedirectResult) {
    auth.getRedirectResult().then(function (result) {
      log("getRedirectResult ok, user: " + (result && result.user ? result.user.email : "none"));
    }).catch(function (e) {
      log("getRedirectResult error: " + (e && e.code ? e.code : e) + " / " + (e && e.message ? e.message : ""));
    });
  }

  auth.onAuthStateChanged(function (user) {
    log("onAuthStateChanged: " + (user ? user.email : "null"));
    btn.disabled = false;
    if (user) {
      const name = user.displayName ? user.displayName.split(" ")[0] : "User";
      btn.textContent = name + " \u25BE";
      btn.classList.add("signed-in");
      btn.onclick = function (e) {
        e.stopPropagation();
        if (confirm("Sign out?")) auth.signOut();
      };
    } else {
      btn.textContent = "Sign In";
      btn.classList.remove("signed-in");
      btn.onclick = async function () {
        log("--- Sign In clicked ---");
        btn.disabled = true;
        btn.textContent = "> connecting...";

        try {
          log("calling signInWithPopup...");
          const result = await auth.signInWithPopup(googleProvider);
          log("popup ok: " + result.user.email);
          btn.textContent = result.user.displayName ? result.user.displayName.split(" ")[0] + " \u25BE" : "User \u25BE";
        } catch (e) {
          log("popup failed: " + (e && e.code ? e.code : e));
          log("popup msg: " + (e && e.message ? e.message : ""));

          const fallbackCodes = [
            "auth/popup-blocked",
            "auth/popup-closed-by-user",
            "auth/cancelled-popup-request",
            "auth/operation-not-supported-in-this-environment",
            "auth/web-storage-unsupported",
            "auth/network-request-failed"
          ];

          if (e && fallbackCodes.indexOf(e.code) !== -1) {
            log("falling back to redirect...");
            btn.textContent = "> redirecting...";
            try {
              await auth.signInWithRedirect(googleProvider);
              log("redirect initiated (page will reload)");
            } catch (e2) {
              log("redirect failed: " + (e2 && e2.code ? e2.code : e2));
              log("redirect msg: " + (e2 && e2.message ? e2.message : ""));
              btn.textContent = "Sign In";
              btn.disabled = false;
            }
          } else {
            log("no fallback for this code, stopping");
            btn.textContent = "Sign In";
            btn.disabled = false;
          }
        }
      };
    }
  });
})();
