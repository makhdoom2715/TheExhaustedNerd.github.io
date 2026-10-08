/* =========================================================
   THE ASHCOMBE FOOTNOTE - Game logic
   Session 2: Chats + Calls + Mail
   ========================================================= */

(function() {
  "use strict";

  // ---- SOUND ----
  var CLICK_SOUND_PATH = "assets/click.mp3";
  var audioContext = null;
  var clickBuffer = null;
  var soundReady = false;

  function initSound() {
    if (soundReady) return;
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: "interactive"
      });
      fetch(CLICK_SOUND_PATH)
        .then(function(res) { return res.arrayBuffer(); })
        .then(function(data) { return audioContext.decodeAudioData(data); })
        .then(function(buffer) {
          clickBuffer = buffer;
          soundReady = true;
        })
        .catch(function() {});
    } catch (e) {}
  }

  function playClick() {
    if (!soundReady || !audioContext || !clickBuffer) return;
    if (audioContext.state === "suspended") audioContext.resume();
    var source = audioContext.createBufferSource();
    source.buffer = clickBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  }

  // ---- STATE ----
  var currentApp = null;
  var currentThread = null;
  var currentMailId = null;
  var statusPanelOpen = false;

  // ---- DOM REFS ----
  var homeApps = document.getElementById("homeApps");
  var appView = document.getElementById("appView");
  var appTitle = document.getElementById("appTitle");
  var appContent = document.getElementById("appContent");
  var appBack = document.getElementById("appBack");
  var statusPanel = document.getElementById("statusPanel");
  var topbar = document.getElementById("topbar");
  var statusTime = document.getElementById("statusTime");
  var statusDate = document.getElementById("statusDate");

  // ---- APP DEFINITIONS ----
  var APPS = [
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

  // ---- ORDER OF CONTACTS ----
  var CONTACT_ORDER = [
    "samira",
    "mum",
    "dad",
    "julian",
    "sterling",
    "homies",
    "toby",
    "chloe",
    "benji",
    "henderson",
    "lily",
    "library",
    "pizza",
    "gran",
    "hale",
    "olympiad",
    "bioproject",
    "family",
    "unknown"
  ];

  // ---- CALL ICONS ----
  var CALL_ICONS = {
    incoming: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="7" x2="7" y2="17"/><polyline points="17 17 7 17 7 7"/></svg>',
    outgoing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>',
    missed:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="7" x2="17" y2="17"/><line x1="17" y1="7" x2="7" y2="17"/></svg>'
  };

  var HANDSET_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';

  // ---- HEADER HELPERS ----
  function getSpacer() {
    return appView.querySelector(".app-spacer");
  }

  function showMailBack() {
    appBack.style.display = "";
    var spacer = getSpacer();
    if (spacer) spacer.style.display = "";
    var closeBtn = document.getElementById("appClose");
    if (closeBtn) closeBtn.style.display = "none";
  }

  function showMailClose() {
    appBack.style.display = "none";
    var spacer = getSpacer();
    if (spacer) spacer.style.display = "none";

    var closeBtn = document.getElementById("appClose");
    if (!closeBtn) {
      closeBtn = document.createElement("button");
      closeBtn.className = "app-close";
      closeBtn.id = "appClose";
      closeBtn.setAttribute("aria-label", "Close email");
      closeBtn.textContent = "×";
      appBack.parentNode.appendChild(closeBtn);
      closeBtn.addEventListener("click", function() {
        playClick();
        renderMail();
      });
    }
    closeBtn.style.display = "";
  }

  // ---- RENDER APP ICONS ----
  function renderApps() {
    homeApps.innerHTML = "";
    for (var i = 0; i < APPS.length; i++) {
      (function(app) {
        var btn = document.createElement("button");
        btn.className = "app-icon app-" + app.id;
        btn.setAttribute("aria-label", "Open " + app.name);
        btn.innerHTML =
          '<div class="app-icon-box">' + app.icon + '</div>' +
          '<span class="app-icon-label">' + app.name + '</span>';
        btn.addEventListener("click", function() {
          playClick();
          openApp(app.id);
        });
        homeApps.appendChild(btn);
      })(APPS[i]);
    }
  }

  // ---- OPEN APP ----
  function openApp(appId) {
    var app = null;
    for (var i = 0; i < APPS.length; i++) {
      if (APPS[i].id === appId) { app = APPS[i]; break; }
    }
    if (!app) return;

    currentApp = appId;
    currentThread = null;
    currentMailId = null;

    // Reset header to default (back arrow visible, no close)
    appBack.style.display = "";
    var spacerReset = getSpacer();
    if (spacerReset) spacerReset.style.display = "";
    var closeReset = document.getElementById("appClose");
    if (closeReset) closeReset.style.display = "none";
    appView.classList.remove("mail-reading");

    appTitle.textContent = app.name;

    if (appId === "chats") {
      renderContactList();
    } else if (appId === "phone") {
      renderCalls();
    } else if (appId === "mail") {
      renderMail();
    } else {
      var placeholders = {
        gallery:  "No photos yet. Maya's gallery is locked.",
        diary:    "No entries yet. Maya's diary is locked.",
        browser:  "URL bar coming soon.",
        casebook: "No clues logged yet.",
        settings: "Sound: OFF. Reset progress coming soon.",
        files:    "No files yet.",
        locket:   "No posts yet."
      };
      appContent.classList.remove("chat-view");
      appContent.style.padding = "";
      appContent.innerHTML = '<p class="app-placeholder">' +
        (placeholders[appId] || "This app is empty for now.") + '</p>';
    }

    appView.className = "app-view app-" + appId;
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
      appView.className = "app-view";
      appContent.innerHTML = "";
      appContent.classList.remove("chat-view");
      appContent.style.padding = "";
      currentApp = null;
      currentThread = null;
      currentMailId = null;
      appBack.style.display = "";
      var spacerEnd = getSpacer();
      if (spacerEnd) spacerEnd.style.display = "";
      var closeEnd = document.getElementById("appClose");
      if (closeEnd) closeEnd.style.display = "none";
    }, 300);
  }

  // ---- RENDER CONTACT LIST ----
  function renderContactList() {
    appContent.classList.remove("chat-view");
    appContent.style.padding = "0";

    var html = '<div class="chat-list">';

    for (var i = 0; i < CONTACT_ORDER.length; i++) {
      var key = CONTACT_ORDER[i];
      var c = window.CHATS_DATA[key];
      if (!c) continue;

      var preview = c.preview || "";
      var badge = "";
      if (c.unreadCount > 0) {
        badge = '<span class="chat-badge">' + c.unreadCount + '</span>';
      }

      html += '<button class="chat-row" data-key="' + key + '">';
      html +=   '<span class="chat-avatar" style="background:' + c.avatarColor + '">' + c.avatarInitials + '</span>';
      html +=   '<span class="chat-row-body">';
      html +=     '<span class="chat-row-top">';
      html +=       '<span class="chat-row-name">' + c.name + '</span>';
      html +=       '<span class="chat-row-time">' + (c.time || "") + '</span>';
      html +=     '</span>';
      html +=     '<span class="chat-row-bottom">';
      html +=       '<span class="chat-row-preview">' + preview + '</span>';
      html +=       badge;
      html +=     '</span>';
      html +=   '</span>';
      html += '</button>';
    }

    html += '</div>';

    appContent.innerHTML = html;

    var rows = appContent.querySelectorAll(".chat-row");
    for (var j = 0; j < rows.length; j++) {
      (function(row) {
        row.addEventListener("click", function() {
          playClick();
          openThread(row.getAttribute("data-key"));
        });
      })(rows[j]);
    }
  }

  // ---- OPEN THREAD ----
  function openThread(key) {
    var c = window.CHATS_DATA[key];
    if (!c) return;

    currentThread = key;
    appContent.classList.add("chat-view");
    appContent.style.padding = "0";

    var html = "";

    html += '<div class="thread-header">';
    html +=   '<div class="thread-header-left">';
    html +=     '<span class="thread-avatar" style="background:' + c.avatarColor + '">' + c.avatarInitials + '</span>';
    html +=     '<div class="thread-header-text">';
    html +=       '<div class="thread-name">' + c.name + '</div>';
    if (c.bio) {
      html +=     '<div class="thread-bio">' + c.bio + '</div>';
    }
    html +=     '</div>';
    html +=   '</div>';
    html +=   '<button class="thread-close" id="threadClose" aria-label="Close thread">×</button>';
    html += '</div>';

    html += '<div class="thread-body" id="threadBody">';

    if (!c.messages || c.messages.length === 0) {
      var emptyMsg = c.corrupted ? c.corruptedMessage : "No messages.";
      html += '<div class="thread-empty">' + emptyMsg + '</div>';
    } else {
      for (var i = 0; i < c.messages.length; i++) {
        var m = c.messages[i];
        if (m.day) {
          html += '<div class="thread-day">' + m.day + '</div>';
          continue;
        }
        var isMaya = m.from === "maya";
        var side = isMaya ? "right" : "left";
        var senderLabel = "";
        if (!isMaya && m.name) {
          senderLabel = '<div class="thread-sender">' + m.name + '</div>';
        }
        html += '<div class="bubble-row ' + side + '">';
        html +=   '<div class="bubble">';
        html +=     senderLabel;
        html +=     '<div class="bubble-text">' + m.text + '</div>';
        html +=     '<div class="bubble-time">' + (m.time || "") + '</div>';
        html +=   '</div>';
        html += '</div>';
      }
    }

    html += '</div>';

    html += '<div class="thread-footer">' + c.name + ' is offline</div>';

    appContent.innerHTML = html;

    var closeBtn = document.getElementById("threadClose");
    if (closeBtn) {
      closeBtn.addEventListener("click", function() {
        playClick();
        renderContactList();
        currentThread = null;
      });
    }

    var body = document.getElementById("threadBody");
    if (body) body.scrollTop = body.scrollHeight;

    if (c.unreadCount > 0) {
      c.unreadCount = 0;
    }
  }

  // ---- RENDER CALLS ----
  function renderCalls() {
    appContent.classList.remove("chat-view");
    appContent.style.padding = "0";

    var calls = window.CALLS_DATA || [];

    var html = '<div class="call-list">';
    for (var i = 0; i < calls.length; i++) {
      var c = calls[i];
      var icon = CALL_ICONS[c.direction] || "";
      html += '<div class="call-row">';
      html +=   '<div class="call-icon ' + c.direction + '">' + icon + '</div>';
      html +=   '<div class="call-body">';
      html +=     '<div class="call-name">' + c.name + '</div>';
      html +=     '<div class="call-status">' + c.status + '</div>';
      html +=   '</div>';
      html +=   '<div class="call-time">' + c.time + '</div>';
      html +=   '<button class="call-handset" aria-label="Call back">' + HANDSET_ICON + '</button>';
      html += '</div>';
    }
    html += '</div>';

    appContent.innerHTML = html;

    var handsetBtns = appContent.querySelectorAll(".call-handset");
    for (var j = 0; j < handsetBtns.length; j++) {
      handsetBtns[j].addEventListener("click", function(e) {
        e.stopPropagation();
        playClick();
      });
    }
  }

  // ---- RENDER MAIL (inbox) ----
  function renderMail() {
    currentMailId = null;
    showMailBack();
    appView.classList.remove("mail-reading");

    appTitle.textContent = "Mail";
    appContent.classList.remove("chat-view");
    appContent.style.padding = "0";

    var emails = window.MAIL_DATA || [];

    var html = '<div class="mail-list">';
    html += '<div class="mail-inbox-label">INBOX</div>';

    for (var i = 0; i < emails.length; i++) {
      var e = emails[i];
      var initial = e.sender.charAt(0).toUpperCase();

      html += '<button class="mail-row" data-id="' + e.id + '">';
      html +=   '<span class="mail-avatar">' + initial + '</span>';
      html +=   '<span class="mail-row-body">';
      html +=     '<span class="mail-row-sender">' + e.sender + '</span>';
      html +=     '<span class="mail-row-subject">' + e.subject + '</span>';
      html +=   '</span>';
      html += '</button>';
    }

    html += '</div>';

    appContent.innerHTML = html;
    appContent.scrollTop = 0;

    var rows = appContent.querySelectorAll(".mail-row");
    for (var j = 0; j < rows.length; j++) {
      (function(row) {
        row.addEventListener("click", function() {
          playClick();
          openMailItem(row.getAttribute("data-id"));
        });
      })(rows[j]);
    }
  }

  // ---- OPEN EMAIL ----
  function openMailItem(id) {
    var emails = window.MAIL_DATA || [];
    var email = null;
    for (var i = 0; i < emails.length; i++) {
      if (emails[i].id === id) { email = emails[i]; break; }
    }
    if (!email) return;

    currentMailId = id;
    email.read = true;

    showMailClose();
    appView.classList.add("mail-reading");

    appTitle.textContent = "Mail";
    appContent.classList.remove("chat-view");
    appContent.style.padding = "0";

    var initial = email.sender.charAt(0).toUpperCase();

    var html = '<div class="mail-reading">';

    html += '<h1 class="mail-reading-subject">' + email.subject + '</h1>';

    html += '<div class="mail-reading-meta">';
    html +=   '<span class="mail-reading-avatar">' + initial + '</span>';
    html +=   '<div class="mail-reading-from">';
    html +=     '<div class="mail-reading-email">' + email.email + '</div>';
    html +=     '<div class="mail-reading-to">to me</div>';
    html +=   '</div>';
    html += '</div>';

    html += '<div class="mail-reading-body">';
    var paragraphs = email.body.split("\n\n");
    for (var p = 0; p < paragraphs.length; p++) {
      var lines = paragraphs[p].split("\n");
      html += '<p>';
      for (var l = 0; l < lines.length; l++) {
        if (l > 0) html += '<br>';
        html += lines[l];
      }
      html += '</p>';
    }
    html += '</div>';

    if (email.image && email.image.length > 0) {
      html += '<div class="mail-reading-image"><img src="' + email.image + '" alt=""></div>';
    }

    html += '</div>';

    appContent.innerHTML = html;
    appContent.scrollTop = 0;
  }

  // ---- STATUS PANEL ----
  function toggleStatusPanel() {
    playClick();
    statusPanelOpen = !statusPanelOpen;
    if (statusPanelOpen) {
      statusPanel.classList.add("open");
      updateClock();
    } else {
      statusPanel.classList.remove("open");
    }
  }

  function updateClock() {
    var now = new Date();
    var hours = now.getHours();
    var mins = String(now.getMinutes()).padStart(2, "0");
    var ampm = hours >= 12 ? "PM" : "AM";
    var h12 = hours % 12 || 12;
    statusTime.textContent = h12 + ":" + mins + " " + ampm;

    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    statusDate.textContent = days[now.getDay()] + ", " + now.getDate() + " " + months[now.getMonth()];
  }

  // ---- INIT ----
  function init() {
    initSound();
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

    appBack.addEventListener("click", function() {
      playClick();
      if (currentThread) {
        renderContactList();
        currentThread = null;
      } else {
        closeApp();
      }
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        if (currentThread) {
          renderContactList();
          currentThread = null;
        } else if (currentMailId) {
          renderMail();
        } else if (currentApp) {
          closeApp();
        } else if (statusPanelOpen) {
          toggleStatusPanel();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
