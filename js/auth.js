// js/auth.js
// Terminal-style sign in / sign out for the nav, plus the profile pic menu.

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

  // =========================================================
  // PROFILE PIC + DROPDOWN MENU
  // =========================================================

  const DEFAULT_PIC = "assets/profile.png";
  const picLink = document.querySelector(".profile-pic-link");
  const picImg = picLink ? picLink.querySelector(".profile-pic") : null;

  // Convert the pic link into a menu trigger (no HTML changes needed)
  if (picLink) {
    picLink.setAttribute("href", "#");
    picLink.removeAttribute("target");
    picLink.removeAttribute("rel");
    picLink.style.cursor = "pointer";
  }

  let menu = null;

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function ensureMenu() {
    if (menu) return;
    menu = document.createElement("div");
    menu.id = "userMenu";
    menu.style.cssText = [
      "position: fixed",
      "min-width: 240px",
      "max-width: 280px",
      "background: #15151f",
      "border: 1px solid rgba(255,255,255,0.16)",
      "border-radius: 10px",
      "padding: 8px",
      "z-index: 9999",
      "display: none",
      "box-shadow: 0 12px 40px rgba(0,0,0,0.65)",
      "font-family: 'JetBrains Mono', monospace"
    ].join(";");
    document.body.appendChild(menu);

    document.addEventListener("click", function (e) {
      if (!menu || menu.style.display !== "block") return;
      if (menu.contains(e.target)) return;
      if (picLink && picLink.contains(e.target)) return;
      menu.style.display = "none";
    });

    window.addEventListener("resize", function () {
      if (menu && menu.style.display === "block") closeMenu();
    });
  }

  function openMenu() {
    ensureMenu();
    if (!picLink) return;
    const rect = picLink.getBoundingClientRect();
    menu.style.top = (rect.bottom + 10) + "px";
    menu.style.right = Math.max(12, window.innerWidth - rect.right) + "px";
    menu.style.display = "block";
  }

  function closeMenu() {
    if (menu) menu.style.display = "none";
  }

  function toggleMenu() {
    ensureMenu();
    if (menu.style.display === "block") closeMenu();
    else openMenu();
  }

  if (picLink) {
    picLink.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMenu();
    });
  }

  function menuRow(label, href) {
    return '<a href="' + href + '" class="um-link" style="display:block;padding:10px 12px;color:#8b8b9a;text-decoration:none;font-size:12px;letter-spacing:0.05em;border-radius:6px;">' +
      esc(label) + '</a>';
  }

  function statTile(val, label, color) {
    return '<div style="flex:1;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px 6px;text-align:center;">' +
      '<div style="font-size:14px;font-weight:700;color:' + color + ';">' + esc(String(val)) + '</div>' +
      '<div style="font-size:9px;color:#55555f;letter-spacing:0.1em;text-transform:uppercase;margin-top:2px;">' + esc(label) + '</div>' +
    '</div>';
  }

  function renderMenuContent(user) {
    if (!menu) return;

    if (!user) {
      menu.innerHTML =
        '<div style="padding:12px 12px 10px;font-size:12px;color:#8b8b9a;letter-spacing:0.05em;">' +
          '&gt; not signed in._' +
        '</div>' +
        '<div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:4px;padding-top:8px;">' +
          '<div style="font-size:11px;color:#55555f;padding:0 12px 8px;line-height:1.6;">Sign in to write lores, save stats, and appear on the leaderboard.</div>' +
        '</div>';
      return;
    }

    const name = user.displayName || "Anonymous";
    const email = user.email || "";
    const pic = user.photoURL || DEFAULT_PIC;

    menu.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:6px;">' +
        '<img src="' + esc(pic) + '" style="width:38px;height:38px;border-radius:50%;border:2px solid rgba(255,255,255,0.16);flex-shrink:0;" onerror="this.src=\'' + DEFAULT_PIC + '\'">' +
        '<div style="min-width:0;">' +
          '<div style="font-size:13px;font-weight:700;color:#e6e6e6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(name) + '</div>' +
          '<div style="font-size:10px;color:#55555f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + esc(email) + '</div>' +
        '</div>' +
      '</div>' +
      '<div id="userMenuStats" style="display:flex;gap:6px;padding:4px 12px 10px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:6px;">' +
        '<div style="flex:1;color:#55555f;font-size:11px;">Loading stats...</div>' +
      '</div>' +
      menuRow("My Profile", "profile.html?id=" + encodeURIComponent(user.uid)) +
      menuRow("My Lores", "my-lores.html") +
      menuRow("Submit a Lore", "write.html") +
      '<div style="border-top:1px solid rgba(255,255,255,0.08);margin-top:6px;padding-top:6px;">' +
        '<button id="userMenuSignOut" style="width:100%;background:transparent;border:none;text-align:left;padding:10px 12px;color:#ff6b6b;font-family:inherit;font-size:12px;cursor:pointer;letter-spacing:0.05em;border-radius:6px;">Sign Out</button>' +
      '</div>';

    menu.querySelectorAll(".um-link").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        el.style.color = "#ffb000";
        el.style.background = "rgba(255,176,0,0.08)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.color = "#8b8b9a";
        el.style.background = "transparent";
      });
    });

    const signOutBtn = document.getElementById("userMenuSignOut");
    if (signOutBtn) {
      signOutBtn.addEventListener("mouseenter", function () {
        signOutBtn.style.background = "rgba(255,107,107,0.1)";
      });
      signOutBtn.addEventListener("mouseleave", function () {
        signOutBtn.style.background = "transparent";
      });
      signOutBtn.addEventListener("click", function () {
        closeMenu();
        auth.signOut();
      });
    }

    // Pull streak and score from Firestore
    if (typeof db !== "undefined") {
      db.collection("users").doc(user.uid).get().then(function (doc) {
        const statsEl = document.getElementById("userMenuStats");
        if (!statsEl) return;
        if (doc.exists) {
          const d = doc.data() || {};
          const streak = d.streak || 0;
          const score = d.score || 0;
          statsEl.innerHTML =
            statTile(streak, "streak", "#ffd76b") +
            statTile(score, "score", "#00d4aa");
        } else {
          statsEl.innerHTML = '<div style="flex:1;color:#55555f;font-size:11px;">No stats yet.</div>';
        }
      }).catch(function () {
        const statsEl = document.getElementById("userMenuStats");
        if (statsEl) statsEl.innerHTML = '<div style="flex:1;color:#55555f;font-size:11px;">Could not load stats.</div>';
      });
    }
  }

  // =========================================================
  // AUTH STATE
  // =========================================================

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

      // Swap the nav avatar to the user's Google photo
      if (picImg) {
        picImg.src = user.photoURL || DEFAULT_PIC;
        picImg.onerror = function () { this.src = DEFAULT_PIC; };
      }

      renderMenuContent(user);
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

      // Reset the nav avatar to the default
      if (picImg) picImg.src = DEFAULT_PIC;

      closeMenu();
      renderMenuContent(null);
    }
  });
})();
