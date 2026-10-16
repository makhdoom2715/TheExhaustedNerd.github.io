/* =========================================================
   THE ASHCOMBE FOOTNOTE - Access gate
   Only allowlisted emails can see the game.
   Everyone else redirects to the coming soon page.
   ========================================================= */

(function() {
  "use strict";

  var ALLOWED_EMAILS = [
    "wisology2715@gmail.com",
    "makhdoomawais27150@gmail.com"
  ];

  var REDIRECT_URL = "where-is-maya.html";
  var SETTLE_TIMEOUT = 3000;

  // Hide the whole page immediately so nothing flashes if we redirect
  document.documentElement.style.visibility = "hidden";

  var decided = false;
  var lastUser = null;

  function allow() {
    decided = true;
    document.documentElement.style.visibility = "visible";
  }

  function deny() {
    decided = true;
    window.location.replace(REDIRECT_URL);
  }

  function decide(user) {
    if (decided) return;

    if (user && ALLOWED_EMAILS.indexOf(user.email) !== -1) {
      allow();
    } else {
      deny();
    }
  }

  function tryDecide(user) {
    if (decided) return;

    // If we already have a user, decide right away
    if (user) {
      lastUser = user;
      decide(user);
      return;
    }

    // If user is null, wait briefly. Firebase fires null first,
    // then the real user 100 to 500ms later.
    lastUser = user;
    setTimeout(function() {
      if (decided) return;
      decide(lastUser);
    }, 800);
  }

  // If Firebase is ready, listen for auth
  if (typeof auth !== "undefined" && auth.onAuthStateChanged) {
    auth.onAuthStateChanged(function(user) {
      tryDecide(user);
    });
  } else {
    // Firebase not loaded. Fail safe.
    setTimeout(function() {
      if (decided) return;
      decide(null);
    }, 500);
  }

  // Absolute fallback in case nothing fires
  setTimeout(function() {
    if (decided) return;
    decide(lastUser);
  }, SETTLE_TIMEOUT);

})();
