/* =========================================================
   THE ASHCOMBE FOOTNOTE - Browser data
   List of known URLs. Only unlocked sites load.
   Match is exact after trimming, stripping protocol, lowercase.
   ========================================================= */

window.BROWSER_DATA = {

  // Homepage shown when the Browser app opens
  homepage: "sites/sites-search.html",
  homepageUrl: "synapse.search",

  // Known sites
  sites: [

    // -------- DAY 1 FILLER (unlocked) --------
    {
      url: "weatheruk.com",
      name: "Weather UK",
      file: "sites/sites-weather.html",
      unlocked: true
    },
    {
      url: "findthecat.com",
      name: "Find the Cat",
      file: "sites/sites-find-the-cat.html",
      unlocked: true
    },
    {
      url: "mikutap.com",
      name: "Mikutap",
      file: "sites/sites-mikutap.html",
      unlocked: true
    },

    // -------- STORY SITES (locked until their episode) --------
    {
      url: "portal.fenwickcollege.edu/staff",
      name: "Fenwick College Secure Portal",
      file: "sites/sites-portal-staff.html",
      unlocked: false
    },
    {
      url: "ashcombechronicle.co.uk/archives",
      name: "The Ashcombe Chronicle Archives",
      file: "sites/sites-chronicle.html",
      unlocked: false
    },
    {
      url: "portal.fenwickcollege.edu/gala",
      name: "Fenwick Summer Gala 2026",
      file: "sites/sites-gala.html",
      unlocked: false
    },
    {
      url: "ashcombedirectory.co.uk",
      name: "Ashcombe & District Business Directory",
      file: "sites/sites-directory.html",
      unlocked: false
    }

  ]
};
