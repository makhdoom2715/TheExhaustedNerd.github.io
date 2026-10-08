/* =========================================================
   THE ASHCOMBE FOOTNOTE - Game logic
   Session 1: Phone shell, home screen, app icons
   ========================================================= */

(function() {
  "use strict";

  // ---- CONFIG ----
  // Avatar initials for now. Swap to image paths later, e.g. "assets/alex.png"
  const AVATARS = {
    alex:     "A",
    maya:     "M",
    julian:   "J",
    samira:   "S",
    sterling: "D",
    silas:    "Si"
  };

  // ---- STATE ----
  let currentApp = null;
  let statusPanelOpen = false;

  // ---- DOM REFS ----
  const homeScreen = document.getElementById("homeScreen");
  const homeApps = document.getElementById("homeApps");
  const appView = document.getElementById("appView");
  const appTitle = document.getElementById("appTitle");
  const appContent = document.getElementById("appContent");
  const appBack = document.getElementById("appBack");
  const statusPanel = document.getElementById("statusPanel");
  const topbar = document.getElementById("topbar");
  const statusTime = document.getElementById("statusTime");
  const statusDate = document.getElementById("statusDate");

  // ---- APP DEFINITIONS ----
  const APPS = [
    {
      id: "chats",
      name: "Chats",
      icon: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
    },
    {
      id: "gallery",
      name: "Gallery",
      icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>'
    },
    {
      id: "diary",
      name: "Diary",
      icon: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
    },
    {
      id: "browser",
      name: "Browser",
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    },
    {
      id: "casebook",
      name: "Casebook",
      icon: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>'
    },
    {
      id: "settings",
      name: "Settings",
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
    },
    {
      id: "mail",
      name: "Mail",
      icon: '<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>'
    },
    {
      id: "files",
      name: "Files",
      icon: '<svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
    },
    {
      id: "locket",
      name: "Locket",
      icon: '<svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    },
    {
      id: "phone",
      name: "Phone",
      icon: '<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>'
    }
  ];

  // ---- RENDER APP ICONS ----
  function renderApps() {
    homeApps.innerHTML = "";
    APPS.forEach(function(app) {
      const btn = document.createElement("button");
      btn.className = "app-icon app-" + app.id;
      btn.setAttribute("aria-label", "Open " + app.name);
      btn.innerHTML =
        '<div class="app-icon-box">' + app.icon + "</div>" +
        '<span class="app-icon-label">' + app.name + "</span>";
      btn.addEventListener("click", function() {
        openApp(app.id);
      });
      homeApps.appendChild(btn);
    });
  }

  // ---- OPEN APP ----
  function openApp(appId) {
    const app = APPS.find(function(a) { return a.id === appId; });
    if (!app) return;

    currentApp = appId;
    appTitle.textContent = app.name;

    const placeholders = {
      chats:    "No messages yet. Samira will message you soon.",
      gallery:  "No photos yet. Maya's gallery is locked.",
      diary:    "No entries yet. Maya's diary is locked.",
      browser:  "URL bar coming soon.",
      casebook: "No clues logged yet.",
      settings: "Sound: OFF. Reset progress coming soon.",
      mail:     "No emails yet.",
      files:    "No files yet.",
      locket:   "No posts yet.",
      phone:    "Call log empty."
    };

    appContent.innerHTML = '<p class="app-placeholder">' +
      (placeholders[appId] || "This app is empty for now.") + "</p>";

    appView.classList.add("open");
    appView.style.display = "flex";
    setTimeout(function() {
      appView.style.transform = "translateX(0)";
    }, 10);
  }

  // ---- CLOSE APP ----
  function closeApp() {
    appView.style.transform = "translateX(100%)";
    setTimeout(function() {
      appView.classList.remove("open");
      appView.style.display = "none";
      currentApp = null;
    }, 300);
  }

  // ---- STATUS PANEL ----
  function toggleStatusPanel() {
    statusPanelOpen = !statusPanelOpen;
    if (statusPanelOpen) {
      statusPanel.classList.add("open");
      updateClock();
    } else {
      statusPanel.classList.remove("open");
    }
  }

  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const mins = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    statusTime.textContent = h12 + ":" + mins + " " + ampm;

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    statusDate.textContent = days[now.getDay()] + ", " + now.getDate() + " " + months[now.getMonth()];
  }

  // ---- INIT ----
  function init() {
    renderApps();
    updateClock();

    topbar.addEventListener("click", function(e) {
      e.stopPropagation();
      toggleStatusPanel();
    });

    document.addEventListener("click", function(e) {
      if (statusPanelOpen && !statusPanel.contains(e.target) && !topbar.contains(e.target)) {
        statusPanelOpen = false;
        statusPanel.classList.remove("open");
      }
    });

    appBack.addEventListener("click", closeApp);

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        if (currentApp) closeApp();
        else if (statusPanelOpen) toggleStatusPanel();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
