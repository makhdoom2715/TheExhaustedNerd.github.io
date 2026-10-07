// js/nav.js
// Handles the mobile hamburger menu toggle.

(function () {
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  function close() {
    toggle.classList.remove("open");
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    var isOpen = toggle.classList.toggle("open");
    links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close when clicking a link
  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", close);
  });

  // Close when clicking outside
  document.addEventListener("click", function (e) {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      close();
    }
  });

  // Close if resizing back to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) close();
  });
})();
