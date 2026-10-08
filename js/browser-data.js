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
      url: "weather.co.uk/ashcombe",
      name: "Weather - Ashcombe",
      file: "sites/sites-weather.html",
      unlocked: true
    },
    {
      url: "ashcombelibrary.gov.uk",
      name: "Ashcombe Library",
      file: "sites/sites-library.html",
      unlocked: true
    },
    {
      url: "bbc.co.uk/news/local/ashcombe",
      name: "BBC News - Local - Ashcombe",
      file: "sites/sites-bbc.html",
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
